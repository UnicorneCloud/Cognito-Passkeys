import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Signup() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const handleSignUp = async () => {
    setShowSuccessMessage(false);
    await signUp(email);
    setShowSuccessMessage(true);
  };

  return (
    <div>
      <h3>1: Signup</h3>
      <p>Signup with your email</p>
      <div>
        <label htmlFor="signupEmail">Email:</label>
        <input
          id="signupEmail"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button onClick={handleSignUp}>Signup</button>
      {showSuccessMessage && (
        <p>
          Activez votre compte en cliquant sur le lien reçu dans vos courriels.
        </p>
      )}
    </div>
  );
}

export default Signup;
