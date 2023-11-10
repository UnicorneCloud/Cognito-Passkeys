import { Construct } from "constructs";
import { aws_iam as iam } from "aws-cdk-lib";

export interface ILambdaRole {
  readRole: iam.Role;
  writeRole: iam.Role;
}

export function generateBasicLambdaRole(
  scope: Construct,
  ressourceName: string
): ILambdaRole {
  const readRole = new iam.Role(scope, `${ressourceName}-lambda-role-read`, {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  });

  const writeRole = new iam.Role(scope, `${ressourceName}-lambda-role-write`, {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
  });

  const lambdaBasicPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
    "service-role/AWSLambdaBasicExecutionRole"
  );
  readRole.addManagedPolicy(lambdaBasicPolicy);
  writeRole.addManagedPolicy(lambdaBasicPolicy);

  const cognitoIdpPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["cognito-idp:AdminUpdateUserAttributes"],
    resources: ["*"],
  });
  writeRole.addToPolicy(cognitoIdpPolicy);

  const sesPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ["ses:SendEmail"],
    resources: ["*"],
  });
  writeRole.addToPolicy(sesPolicy);

  return {
    readRole,
    writeRole,
  };
}
