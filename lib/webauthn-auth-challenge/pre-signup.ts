import { PreSignUpTriggerHandler } from "aws-lambda";

export const handler: PreSignUpTriggerHandler = (event) => {
  event.response.autoConfirmUser = true;

  if (event.request.userAttributes.email) {
    event.response.autoVerifyEmail = true;
  }
  return Promise.resolve(event);
};
