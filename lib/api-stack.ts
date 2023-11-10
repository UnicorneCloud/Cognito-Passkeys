import {
  Duration,
  Stack,
  StackProps,
  aws_cognito as cognito,
  aws_lambda_nodejs as lambda,
  aws_apigateway as apigateway,
  aws_s3 as s3,
} from "aws-cdk-lib";

import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import {
  CognitoUserPoolsAuthorizer,
  Cors,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { generateBasicLambdaRole } from "./constructs/iam-roles";

export type DefaultLambdaProps = Partial<NodejsFunctionProps>;
export type ApiStackProps = StackProps & {
  userPool: cognito.IUserPool;
};

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { userPool } = props;
    const { readRole } = generateBasicLambdaRole(this, `webauthn-api`);

    const api = new RestApi(this, "webauthn-api", {
      defaultCorsPreflightOptions: {
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
      },
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "webauthn-user-pool-authorizer",
      {
        cognitoUserPools: [userPool],
        identitySource: "method.request.header.Authorization",
      }
    );

    // GET /
    const getExampleLambda = new lambda.NodejsFunction(
      this,
      "webauthn-get-example",
      {
        entry: "./src/api/routes/get-example.ts",
        role: readRole,
      }
    );

    const getExample = new apigateway.LambdaIntegration(getExampleLambda);
    api.root.addMethod(s3.HttpMethods.GET, getExample, {
      authorizer: authorizer,
    });
  }
}
