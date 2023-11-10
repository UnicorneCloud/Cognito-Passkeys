#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WebAuthnCognitoStack } from "../lib/webauthn-cognito-stack";
import { WebsiteStack } from "../lib/website-stack";
import { ApiStack } from "../lib/api-stack";

const app = new cdk.App();

const websiteStack = new WebsiteStack(app, "webauthn-website-stack");

const { userPool } = new WebAuthnCognitoStack(app, "webauthn-cognito-stack", {
  domainName: websiteStack.cloudFrontWebDistribution.domainName,
});

new ApiStack(app, "webauthn-api-stack", { userPool });
