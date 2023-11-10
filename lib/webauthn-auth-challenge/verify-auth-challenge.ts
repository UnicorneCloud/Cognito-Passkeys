import { MetadataService } from "@simplewebauthn/server";
import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import { CognitoAuthService } from "./providers/cognito-provider";
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

  if (challengeAnswer.response.attestationObject) {
    // This is a registration
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

  // Is authentication or registration ?
  if (!challengeAnswer.response.attestationObject) {
    const authentication = await webAuthnProvider.verifyAuthenticationResponse(
      event,
      origin
    );

    if (authentication.newCredentialsValue) {
      await cognitoService.updateCustomAttribute(
        event.userName,
        "credentials",
        authentication.newCredentialsValue
      );
    }

    return authentication.event;
  }

  throw new Error("Unexpected auth challenge");
};
