import {
  aws_cognito as cognito,
  aws_lambda_nodejs as lambda,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { defaultLambdaProps } from "./common";
import { UserPoolOperation } from "aws-cdk-lib/aws-cognito";
import { generateBasicLambdaRole } from "./constructs/iam-roles";

type WebAuthnCognitoStackProps = StackProps & {
  domainName: string;
};
export class WebAuthnCognitoStack extends Stack {
  public userPool: cognito.UserPool;
  constructor(scope: Construct, id: string, props: WebAuthnCognitoStackProps) {
    super(scope, id, props);
    const lambdaRole = generateBasicLambdaRole(this, "cognito");

    const lambdaProps = {
      ...defaultLambdaProps,
      environment: {
        ...defaultLambdaProps.environment,
        DOMAIN_NAME: props.domainName,
      },
    };

    this.userPool = new cognito.UserPool(this, "webauthn-cognito-user-pool", {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      signInCaseSensitive: false,
      customAttributes: {
        credentials: new cognito.StringAttribute({
          mutable: true,
        }),
        activationCode: new cognito.StringAttribute({
          mutable: true,
        }),
      },
      passwordPolicy: {
        requireSymbols: false,
        requireUppercase: false,
        requireLowercase: false,
      },
    });

    new cognito.UserPoolClient(this, "webauthn-cognito-user-pool-client", {
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      preventUserExistenceErrors: true,
      userPool: this.userPool,
      authFlows: {
        adminUserPassword: false,
        userSrp: false,
        userPassword: false,
        custom: true,
      },
      disableOAuth: true,
    });

    const createAuthChallengeLambda = new lambda.NodejsFunction(
      this,
      "webauthn-create-auth-challenge",
      {
        ...lambdaProps,
        entry: "./lib/webauthn-auth-challenge/create-auth-challenge.ts",
      }
    );

    const defineAuthChallengeLambda = new lambda.NodejsFunction(
      this,
      "webauthn-define-auth-challenge",
      {
        ...lambdaProps,
        entry: "./lib/webauthn-auth-challenge/define-auth-challenge.ts",
      }
    );

    const verifyAuthChallengeLambda = new lambda.NodejsFunction(
      this,
      "webauthn-verify-auth-challenge",
      {
        ...lambdaProps,
        entry: "./lib/webauthn-auth-challenge/verify-auth-challenge.ts",
        role: lambdaRole.writeRole,
      }
    );

    const preSignupLamda = new lambda.NodejsFunction(
      this,
      "webauthn-pre-signup",
      {
        ...lambdaProps,
        entry: "./lib/webauthn-auth-challenge/pre-signup.ts",
      }
    );

    const postConfirmationLambda = new lambda.NodejsFunction(
      this,
      "webauthn-post-confirmation",
      {
        ...lambdaProps,
        role: lambdaRole.writeRole,
        entry: "./lib/webauthn-auth-challenge/post-confirmation.ts",
      }
    );

    this.userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, preSignupLamda);
    this.userPool.addTrigger(
      UserPoolOperation.POST_CONFIRMATION,
      postConfirmationLambda
    );

    this.userPool.addTrigger(
      UserPoolOperation.CREATE_AUTH_CHALLENGE,
      createAuthChallengeLambda
    );
    this.userPool.addTrigger(
      UserPoolOperation.DEFINE_AUTH_CHALLENGE,
      defineAuthChallengeLambda
    );
    this.userPool.addTrigger(
      UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE,
      verifyAuthChallengeLambda
    );
  }
}
