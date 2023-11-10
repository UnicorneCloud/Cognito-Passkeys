import {
  StackProps,
  RemovalPolicy,
  aws_cloudfront as cloudfront,
  aws_s3 as s3,
  Stack,
  aws_s3_deployment,
} from "aws-cdk-lib";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export class WebsiteStack extends Stack {
  public readonly websiteBucket: s3.Bucket;
  public readonly cloudFrontWebDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
        defaultRootObject: "index.html",
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

    new aws_s3_deployment.BucketDeployment(this, "Deployment", {
      sources: [aws_s3_deployment.Source.asset("./frontend/dist")],
      destinationBucket: this.websiteBucket,
    });
  }
}
