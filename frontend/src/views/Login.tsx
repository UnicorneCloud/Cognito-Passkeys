import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const handleLogin = async () => {
    await login(email);
  };

  const handleUsernamelessLogin = async () => {
    await login("usernameless");
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
          autoComplete="username webauthn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button onClick={handleLogin}>Login</button>
      <hr />
      <p>Or login with usernameless authentication</p>
      <button onClick={handleUsernamelessLogin}>Login</button>
    </div>
  );
}

export default Login;
