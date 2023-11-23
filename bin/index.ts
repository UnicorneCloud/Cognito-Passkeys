#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WebAuthnCognitoStack } from "../lib/webauthn-cognito-stack";
import { WebsiteStack } from "../lib/website-stack";
import { ApiStack } from "../lib/api-stack";

const app = new cdk.App();

const baseDomainName = app.node.tryGetContext("domainName");
const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  baseDomainName,
  domainName: `passkeys.${baseDomainName}`,
};

new WebsiteStack(app, "webauthn-website-stack", props);

const { userPool } = new WebAuthnCognitoStack(app, "webauthn-cognito-stack", {
  ...props,
});

new ApiStack(app, "webauthn-api-stack", { ...props, userPool });
