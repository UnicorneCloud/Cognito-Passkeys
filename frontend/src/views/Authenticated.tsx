import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;
function Activation() {
  const { userToken } = useAuth();

  const [response, setResponse] = useState<{ message: string }>({
    message: "",
  });

  const getData = useCallback(async () => {
    const token = userToken?.getIdToken().getJwtToken();
    const response = await fetch(`${API_URL}/`, {
      method: "GET",
      headers: {
        ["Authorization"]: `${token}`,
      },
    }).then((response) => response.json());

    setResponse(response);
  }, [userToken]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h3>This should be an authenticated view</h3>
      <p>
        If you can read the message below, it means you have a valid id token.
      </p>
      <pre>{response?.message}</pre>
    </div>
  );
}

export default Activation;
