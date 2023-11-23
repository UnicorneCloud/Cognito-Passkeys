import {
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  CreateAuthChallengeTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from "aws-lambda";
import {
  WebAuthnAuthenticator,
  convertObjectIntoUint8Array,
} from "../../common";
import base64url from "base64url";
import { CognitoUser } from "./cognito-provider";

export type WebauthnProviderProps = {
  rpName: string;
  rpId: string;
};

const TIMEOUT = 10 * 60 * 1000; // 10 minutes

export class WebauthnProvider {
  public rpName: string;
  public rpId: string;
  constructor({ rpName, rpId }: WebauthnProviderProps) {
    this.rpName = rpName;
    this.rpId = rpId;
  }

  private parseAuthenticators(
    event:
      | CreateAuthChallengeTriggerEvent
      | VerifyAuthChallengeResponseTriggerEvent
  ): WebAuthnAuthenticator[] | undefined {
    if (!event.request.userAttributes["custom:credentials"]) {
      return undefined;
    }

    const cognitoAuthenticatorCreds: WebAuthnAuthenticator[] = JSON.parse(
      event.request.userAttributes["custom:credentials"]
    );

    return cognitoAuthenticatorCreds.map((authenticator) => {
      return {
        credentialID: convertObjectIntoUint8Array(authenticator.credentialID), // JSON.parse does not recursively resolve ArrayBuffers
        credentialPublicKey: convertObjectIntoUint8Array(
          authenticator.credentialPublicKey
        ), // JSON.parse does not recursively resolve ArrayBuffers
        counter: authenticator.counter,
        transports: authenticator.transports ?? [],
      };
    });
  }

  async generateRegistrationOptions(event: CreateAuthChallengeTriggerEvent) {
    const authenticators = this.parseAuthenticators(event);

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userID: event.userName,
      userDisplayName: event.userName,
      userName: event.userName,
      timeout: TIMEOUT,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      // Support the two most common algorithms: ES256, and RS256
      supportedAlgorithmIDs: [-7, -257],
      // Exclude already added credentials
      excludeCredentials: authenticators?.map((authenticator) => ({
        id: authenticator.credentialID,
        type: "public-key",
        transports: authenticator.transports,
      })),
    });

    event.response.publicChallengeParameters["attestationChallenge"] =
      JSON.stringify(options);
    event.response.privateChallengeParameters["attestationChallenge"] =
      options.challenge;

    return event;
  }

  async generateAuthenticationOptions(event: CreateAuthChallengeTriggerEvent) {
    // Parse the list of stored authenticators from the Cognito user.
    let authenticators: WebAuthnAuthenticator[] | undefined = undefined;
    if (event.request.userAttributes["custom:credentials"]) {
      authenticators = this.parseAuthenticators(event);
    }

    const options = await generateAuthenticationOptions({
      timeout: TIMEOUT,
      // Require users to use a previously-registered authenticator
      allowCredentials: authenticators?.map((authenticator) => ({
        id: authenticator.credentialID,
        type: "public-key",
        transports: authenticator.transports,
      })),
      userVerification: "preferred",
      rpID: this.rpId,
    });

    event.response.publicChallengeParameters = {
      assertionChallenge: JSON.stringify(options),
    };

    event.response.privateChallengeParameters = {
      assertionChallenge: options.challenge,
    };

    return event;
  }

  async verifyAuthenticationResponse(
    event: VerifyAuthChallengeResponseTriggerEvent,
    origin: string
  ) {
    const { challengeAnswer } = JSON.parse(event.request.challengeAnswer);

    // Find current used authenticator by compare rawId
    const authenticators = this.parseAuthenticators(event);

    if (!authenticators || !authenticators.length) {
      // Do no throw really this error, this is for demo purpose
      throw new Error("No authenticator registered to this account");
    }
    let authenticator =
      authenticators.find(
        ({ credentialID }) =>
          Buffer.compare(
            credentialID,
            base64url.toBuffer(challengeAnswer.rawId)
          ) === 0
      ) || authenticators[0];

    const data = {
      response: challengeAnswer,
      expectedChallenge:
        event.request.privateChallengeParameters.assertionChallenge,
      expectedOrigin: origin,
      expectedRPID: this.rpId,
      authenticator,
      requireUserVerification: true,
    };

    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse(data);

    if (verification.verified) {
      const { authenticationInfo } = verification;
      console.log(
        "🚀 ~ file: webauthn-provider.ts:152 ~ WebauthnProvider ~ authenticationInfo:",
        authenticationInfo
      );

      const { newCounter } = authenticationInfo;
      authenticator.counter = newCounter;

      const newCredentialsValue = JSON.stringify(
        authenticators.map(
          (authenticator) =>
            [authenticator].find(
              (updatedAuthenticator) =>
                Buffer.compare(
                  updatedAuthenticator.credentialID,
                  authenticator.credentialID
                ) === 0
            ) || authenticator
        )
      );

      event.response.answerCorrect = true;

      return {
        event,
        challengeAnswer,
        newCredentialsValue,
      };
    } else {
      event.response.answerCorrect = false;
      return {
        event,
      };
    }
  }

  async verifyRegistrationResponse(
    event: VerifyAuthChallengeResponseTriggerEvent,
    origin: string
  ) {
    const { challengeAnswer } = JSON.parse(event.request.challengeAnswer);
    // Find current used authenticated by compare rawId
    const authenticators = this.parseAuthenticators(event) ?? [];

    const data = {
      response: challengeAnswer,
      expectedChallenge:
        event.request.privateChallengeParameters.attestationChallenge,
      expectedOrigin: origin,
      expectedRPID: this.rpId,
      requireUserVerification: true,
    };

    let verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse(data);

    // Can register new authenticator?
    if (verification.verified) {
      const { registrationInfo } = verification;
      const newAuthenticator = {
        credentialID: registrationInfo?.credentialID,
        credentialPublicKey: registrationInfo?.credentialPublicKey,
        counter: registrationInfo?.counter || 0,
      };

      event.response.answerCorrect = true;
      return {
        event,
        newCredentialsValue: JSON.stringify([
          ...authenticators,
          newAuthenticator,
        ]),
      };
    } else {
      event.response.answerCorrect = false;
      return { event };
    }
  }
}
