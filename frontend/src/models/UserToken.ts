import { CognitoIdToken } from "amazon-cognito-identity-js";

export class UserToken {
  userId: string;

  email: string;

  sub: string;

  iss: string;

  cognitoUsername: string;

  originJti: string;

  aud: string;

  eventId: string;

  tokenUse: string;

  authTime: number;

  exp: number;

  iat: number;

  jti: string;

  constructor(token: CognitoIdToken) {
    this.userId = token.payload.userId;
    this.email = token.payload.email;
    this.sub = token.payload.sub;
    this.iss = token.payload.iss;
    this.cognitoUsername = token.payload["cognito:username"];
    this.originJti = token.payload.origin_jti;
    this.aud = token.payload.aud;
    this.eventId = token.payload.event_id;
    this.tokenUse = token.payload.token_use;
    this.authTime = token.payload.auth_time;
    this.exp = token.payload.exp;
    this.iat = token.payload.iat;
    this.jti = token.payload.jti;
  }
}
