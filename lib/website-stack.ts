import {
  StackProps,
  RemovalPolicy,
  aws_cloudfront as cloudfront,
  aws_s3 as s3,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_certificatemanager as acm,
  Stack,
  aws_s3_deployment,
} from "aws-cdk-lib";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export type WebsiteStackProps = StackProps & {
  baseDomainName: string;
  domainName: string;
};

export class WebsiteStack extends Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly cloudFrontWebDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const { baseDomainName, domainName } = props;
    const hostedZone = route53.HostedZone.fromLookup(
      this,
      `-webauthn-hosted-zone-${baseDomainName}`,
      {
        domainName: baseDomainName,
      }
    );

    const certificate = new acm.DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName: baseDomainName,
        subjectAlternativeNames: [domainName],
        hostedZone: hostedZone,
        region: "us-east-1", // Cloudfront only checks this region for certificates.
      }
    );

    // S3 Bucket
    this.websiteBucket = new s3.Bucket(this, "webauthn-static-website-bucket", {
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Bucket policy
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "webauthn-origin-access-identity"
    );
    this.websiteBucket.grantRead(originAccessIdentity);

    const cloudfrontOrigin = new S3Origin(this.websiteBucket, {
      originAccessIdentity: originAccessIdentity,
    });

    this.cloudFrontWebDistribution = new cloudfront.Distribution(
      this,
      "webauthn-static-site-distribution",
      {
        certificate: certificate,
        defaultRootObject: "index.html",
        domainNames: [domainName],
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        defaultBehavior: {
          origin: cloudfrontOrigin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        additionalBehaviors: {
          "/index.html": {
            origin: cloudfrontOrigin,
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            viewerProtocolPolicy:
              cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          },
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    new route53.ARecord(this, "webauthn-a-record", {
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.cloudFrontWebDistribution)
      ),
      zone: hostedZone,
    });

    new aws_s3_deployment.BucketDeployment(this, "Deployment", {
      sources: [aws_s3_deployment.Source.asset("./frontend/dist")],
      destinationBucket: this.websiteBucket,
    });
  }
}
