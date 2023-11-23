/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Auth from "../config/amplify";
import { nanoid } from "nanoid";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const generatePassword = (): string => nanoid();

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const useProvideAuth = () => {
  const [userToken, setUserToken] = useState<CognitoUserSession | null>(null);

  const [responseDebug, setResponseDebug] = useState<object>();

  const [error, setError] = useState<any>(null);

  const signUp = async (email: string): Promise<void> => {
    setError(null);
    try {
      await Auth.signUp({
        username: email,
        attributes: {
          email,
        },
        password: generatePassword(),
      });
    } catch (error) {
      setError(error);

      throw error;
    }
  };

  const activateAccount = async (
    email: string,
    activationCode: string
  ): Promise<void> => {
    setError(null);
    try {
      const cognitoUser = await Auth.signIn(email, "", {
        activationCode,
      });

      if (cognitoUser.authenticationFlowType === "CUSTOM_AUTH") {
        const opts = JSON.parse(
          cognitoUser.challengeParam.attestationChallenge
        );
        setResponseDebug(opts);
        const attResp = await startRegistration(opts);

        setResponseDebug({
          ...attResp,
          response: {
            ...attResp.response,
            clientDataJSON: JSON.parse(atob(attResp.response.clientDataJSON)),
          },
        });

        await Auth.sendCustomChallengeAnswer(
          cognitoUser,
          JSON.stringify({
            challengeAnswer: attResp,
            activationCode,
          })
        );

        // Now logged !
        const session = await Auth.currentSession();
        setUserToken(session);
      }
    } catch (error) {
      setError(error);

      throw error;
    }
  };

  const login = async (email: string): Promise<void> => {
    setError(null);
    try {
      const cognitoUser = await Auth.signIn({
        username: email,
        password: "",
      });

      if (cognitoUser.authenticationFlowType === "CUSTOM_AUTH") {
        const opts = JSON.parse(cognitoUser.challengeParam.assertionChallenge);
        setResponseDebug(opts);
        const attResp = await startAuthentication(opts);
        setResponseDebug({
          ...attResp,
          response: {
            ...attResp.response,
            clientDataJSON: JSON.parse(atob(attResp.response.clientDataJSON)),
          },
        });

        await Auth.sendCustomChallengeAnswer(
          cognitoUser,
          JSON.stringify({
            challengeAnswer: attResp,
          })
        );

        const session = await Auth.currentSession();
        setUserToken(session);
      }
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await Auth.signOut();
    setUserToken(null);
  };

  return {
    userToken,
    signUp,
    login,
    logout,
    activateAccount,
    responseDebug,
    error,
  };
};
