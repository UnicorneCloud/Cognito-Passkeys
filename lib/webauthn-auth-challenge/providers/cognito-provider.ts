/* eslint-disable @typescript-eslint/naming-convention */
import {
  CognitoIdentityProviderClient,
  AdminEnableUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { WebAuthnAuthenticator } from "../../common";

const client = new CognitoIdentityProviderClient({});

export class CognitoAuthService {
  public userPoolId: string;
  constructor(userPoolId: string) {
    this.userPoolId = userPoolId;
  }
  async updateCustomAttribute(
    username: string,
    customAttribute: string,
    value: string
  ) {
    console.log("updateCustomIdAttribute", customAttribute);
    const command = new AdminUpdateUserAttributesCommand({
      UserAttributes: [
        {
          Name: `custom:${customAttribute}`,
          Value: value,
        },
      ],
      UserPoolId: this.userPoolId,
      Username: username,
    });
    const response = await client.send(command);
    console.log("updateCustomIdAttribute response", response);
  }
}
