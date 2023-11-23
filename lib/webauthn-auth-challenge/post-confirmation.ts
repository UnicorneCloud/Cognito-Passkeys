import { PostConfirmationTriggerHandler } from "aws-lambda";
import { nanoid } from "nanoid";
import { CognitoAuthService } from "./providers/cognito-provider";
import { AwsSesEmailSender } from "./providers/ses-provider";
const DOMAIN_NAME = process.env.DOMAIN_NAME;

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const cognitoService = new CognitoAuthService(event.userPoolId);
  const code = nanoid();
  await cognitoService.updateCustomAttribute(
    event.userName,
    "activationCode",
    code
  );

  const url = `https://${DOMAIN_NAME}/activation?activationCode=${code}&email=${encodeURIComponent(
    event.userName
  )}`;
  await AwsSesEmailSender.sendActivationEmail(event.userName, url);

  return event;
};
