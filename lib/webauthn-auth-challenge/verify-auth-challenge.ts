import { MetadataService } from "@simplewebauthn/server";
import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { CognitoAuthService, CognitoUser } from "./providers/cognito-provider";
import { WebauthnProvider } from "./providers/webauthn-provider";

const DOMAIN_NAME = process.env.DOMAIN_NAME;
const origin = `https://${DOMAIN_NAME}`;
const RP_NAME = process.env.RP_NAME;

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
  event
) => {
  console.log(event);
  const cognitoService = new CognitoAuthService(event.userPoolId);
  const webAuthnProvider = new WebauthnProvider({
    rpId: DOMAIN_NAME as string,
    rpName: RP_NAME as string,
  });

  await MetadataService.initialize({
    verificationMode: "permissive",
  });

  const { challengeAnswer, activationCode } = JSON.parse(
    event.request.challengeAnswer
  );
  if (
    !!event.request.userAttributes["custom:activationCode"] &&
    event.request.userAttributes["custom:activationCode"] !== activationCode
  ) {
    throw new Error("Authentication code mismatch");
  }

  // This is a registration (creation of passkey)
  if (challengeAnswer.response.attestationObject) {
    const authentication = await webAuthnProvider.verifyRegistrationResponse(
      event,
      origin
    );

    if (authentication.newCredentialsValue) {
      await cognitoService.updateCustomAttribute(
        event.userName,
        "credentials",
        authentication.newCredentialsValue
      );

      // Set activationCode as empty cause we don't need it anymore
      await cognitoService.updateCustomAttribute(
        event.userName,
        "activationCode",
        ""
      );
    }

    return authentication.event;
  }

  // Is it authentication (validation of a passkey)
  if (!challengeAnswer.response.attestationObject) {
    let user: CognitoUser;
    let userName = event.userName;
    // If we try a usernameless authentication
    // WARNING: This actually not work at all
    if (event.userName === "usernameless") {
      // Get cognito user by reading username from the challenge answer
      const { challengeAnswer } = JSON.parse(event.request.challengeAnswer);
      user = await cognitoService.getUser(challengeAnswer.response.userHandle);

      // Complete credentials data (existing passkeys) which can is normally filled by cognito
      // If we are not in a usernameless authentication.
      // This will allow to verify that the passkey is correctly registered to this user in our system.
      event.request.userAttributes["custom:credentials"] =
        user["custom:credentials"];
      // Also override userName
      userName = user.username;
      event.userName = user.username;
    }

    // Verify authentication response
    const { newCredentialsValue, event: resultEvent } =
      await webAuthnProvider.verifyAuthenticationResponse(event, origin);

    // Update old credentials (typically incrementing "counter" field)

    if (newCredentialsValue) {
      await cognitoService.updateCustomAttribute(
        userName,
        "credentials",
        newCredentialsValue
      );
    }

    return resultEvent;
  }

  throw new Error("Unexpected auth challenge");
};
