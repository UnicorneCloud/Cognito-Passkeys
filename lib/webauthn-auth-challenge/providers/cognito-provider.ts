/* eslint-disable @typescript-eslint/naming-convention */
import {
  CognitoIdentityProviderClient,
  AdminEnableUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminEnableUserCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { WebAuthnAuthenticator } from "../../common";

const client = new CognitoIdentityProviderClient({});

export type CognitoUser = {
  username: string;
  ["custom:credentials"]: string;
  ["custom:activationCode"]: string;
};
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

  async getUser(usename: string): Promise<CognitoUser> {
    console.log("getUser", usename);
    const input: AdminEnableUserCommandInput = {
      Username: usename,
      UserPoolId: this.userPoolId,
    };
    const command = new AdminGetUserCommand(input);
    const response = await client.send(command);
    console.log("getUser response", response);
    return {
      username: response.Username as string,
      ["custom:credentials"]: response.UserAttributes?.find(
        (attr) => attr.Name === "custom:credentials"
      )?.Value as string,
      ["custom:activationCode"]: response.UserAttributes?.find(
        (attr) => attr.Name === "custom:activationCode"
      )?.Value as string,
    };
  }
}
