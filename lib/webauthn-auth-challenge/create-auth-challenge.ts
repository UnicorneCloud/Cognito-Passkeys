import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
} from "@simplewebauthn/server";
import { CreateAuthChallengeTriggerHandler } from "aws-lambda";
import { WebauthnProvider } from "./providers/webauthn-provider";

const RP_NAME = process.env.RP_NAME;
const DOMAIN_NAME = process.env.DOMAIN_NAME;

export const handler: CreateAuthChallengeTriggerHandler = (event, context) => {
  console.log("event", event);
  console.log("Context", context);
  const webAuthnProvider = new WebauthnProvider({
    rpId: DOMAIN_NAME as string,
    rpName: RP_NAME as string,
  });

  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};

  // Is the user currently have activationCode ?
  if (!!event.request.userAttributes["custom:activationCode"]) {
    return webAuthnProvider.generateRegistrationOptions(event);
  }
  if (
    !!event.request.userAttributes["custom:credentials"] ||
    event.userName === "usernameless"
  ) {
    return webAuthnProvider.generateAuthenticationOptions(event);
  }
  // If the user already has authenticators registered, then let's offer an assertion challenge along with our attestation challenge
  throw new Error("Unable to Create Auth Challenge");
};
