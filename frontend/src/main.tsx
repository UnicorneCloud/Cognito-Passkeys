import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ProvideAuth } from "./contexts/ProvideAuth.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./views/Signup.tsx";
import Login from "./views/Login.tsx";
import Activation from "./views/Activation.tsx";
import Authenticated from "./views/Authenticated.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "activation",
        element: <Activation />,
      },
      {
        path: "authenticated",
        element: <Authenticated />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ProvideAuth>
      <RouterProvider router={router} />
    </ProvideAuth>
  </React.StrictMode>
);
