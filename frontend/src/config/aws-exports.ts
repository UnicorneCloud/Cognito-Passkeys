import { AuthOptions } from "@aws-amplify/auth/lib-esm/types";

const awsConfig: AuthOptions = {
  region: "ca-central-1",
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
};

export default awsConfig;
