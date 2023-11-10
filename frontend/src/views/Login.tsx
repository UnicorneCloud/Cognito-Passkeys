import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const handleLogin = async () => {
    await login(email);
  };

  return (
    <div>
      <h3>3: Login</h3>
      <p>Login to your account by using a previously registered passkey</p>
      <div>
        <label htmlFor="loginEmail">Email:</label>
        <input
          id="loginEmail"
          type="text"
          value={email}
          autoComplete="userName webauthn"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
