import { CredentialDeviceType } from "@simplewebauthn/server/script/deps";
import { AuthenticatorTransport } from "@simplewebauthn/typescript-types";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";

export const defaultLambdaProps: NodejsFunctionProps = {
  runtime: lambda.Runtime.NODEJS_18_X, // Inline source not allowed for nodejs14.x
  memorySize: 1769,
  timeout: Duration.seconds(5),
  environment: {
    RP_NAME: "webauthn unicorne demo",
  },
  bundling: {
    minify: true,
    keepNames: true, // Otherwise, will break exception names returned by the api.
  },
};

export type WebAuthnAuthenticator = {
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
  transports?: AuthenticatorTransport[];
};

export const convertObjectIntoUint8Array = (object: object): Uint8Array => {
  return new Uint8Array(Object.values(object));
};
