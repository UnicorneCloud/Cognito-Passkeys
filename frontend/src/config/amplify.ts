import { Auth } from "@aws-amplify/auth/lib-esm/Auth";
import awsConfig from "./aws-exports";

Auth.configure(awsConfig);

export default Auth;
