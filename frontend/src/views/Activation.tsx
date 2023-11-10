import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "react-router-dom";

function Activation() {
  const { activateAccount } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");

  const handleActivateAccount = async () => {
    await activateAccount(email, searchParams.get("activationCode") as string);
  };

  return (
    <div>
      <h3>2: Confirm your account</h3>
      <p>
        Confirm your account with email + activation code, then register a
        passkey.
        <pre>{searchParams.get("activationCode")}</pre>
      </p>
      <div>
        <label htmlFor="activationEmail">Email:</label>
        <input
          id="activationEmail"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button onClick={handleActivateAccount}>Activate account</button>
    </div>
  );
}

export default Activation;
