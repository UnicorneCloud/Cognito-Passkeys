import {
  DefineAuthChallengeTriggerHandler,
  DefineAuthChallengeTriggerEvent,
} from "aws-lambda";

export const handler: DefineAuthChallengeTriggerHandler = (
  event: DefineAuthChallengeTriggerEvent
) => {
  console.log(event);
  if (
    event.request.session.length &&
    event.request.session.slice(-1)[0].challengeName === "CUSTOM_CHALLENGE" &&
    event.request.session.slice(-1)[0].challengeResult === true
  ) {
    // Authenticator validated
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else if (!event.request.session.length) {
    // Initial auth request, start custom challenge flow
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  } else {
    // Authenticator failed the attestation or assertion challenges
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }

  return Promise.resolve(event);
};
