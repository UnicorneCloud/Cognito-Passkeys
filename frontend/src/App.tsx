import "./App.css";
import { Link, useLocation } from "react-router-dom";
import ReactJson from "react-json-view";
import { Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import LogoUnicorne from "./assets/logo-unicorne.png";
import { useEffect, useRef } from "react";

function App() {
  const { responseDebug, error } = useAuth();

  const location = useLocation();
  const snackBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (snackBarRef.current && error) {
      snackBarRef.current.className = "show";
      setTimeout(() => {
        if (snackBarRef.current) {
          snackBarRef.current.className = snackBarRef.current.className.replace(
            "show",
            ""
          );
        }
      }, 5500);
    }
  }, [error, snackBarRef]);

  return (
    <>
      {error && (
        <div id="snackbar" ref={snackBarRef} className="show">
          {error.message}
        </div>
      )}
      <h1>Passwordless authentication with Cognito</h1>
      <h2>FIDO2 WebAuthn Passkey authentication</h2>
      <nav>
        <Link to="">Signup</Link>
        <Link to="activation">Activation</Link>
        <Link to="login">Login</Link>
        <Link to="authenticated">Authenticated</Link>
      </nav>
      <div className="content">
        <div className="section">
          <Outlet />
          {responseDebug && !location.pathname.includes("authenticated") && (
            <>
              <hr />

              <ReactJson
                src={responseDebug}
                style={{ maxWidth: "100%", overflow: "auto" }}
              />
            </>
          )}
        </div>
        <img
          className="logoUnicorne"
          src={LogoUnicorne}
          alt="Logo de Unicorne"
        />
      </div>
    </>
  );
}

export default App;
