import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "react-router-dom";

function Activation() {
  const { activateAccount } = useAuth();
  const [searchParams] = useSearchParams();

  const handleActivateAccount = async () => {
    await activateAccount(
      searchParams.get("email") as string,
      searchParams.get("activationCode") as string
    );
  };

  return (
    <div>
      <h3>2: Confirm your account</h3>
      <p>
        Confirm your account with email + activation code, then register a
        passkey.
        <pre>{searchParams.get("activationCode")}</pre>
      </p>

      <button onClick={handleActivateAccount}>Activate account</button>
    </div>
  );
}

export default Activation;
