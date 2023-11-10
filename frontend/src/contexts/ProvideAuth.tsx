import { ReactElement } from "react";
import { useProvideAuth } from "../hooks/useProvideAuth";
import { authContext } from "./AuthContext";

export const ProvideAuth = ({
  children,
}: {
  children: ReactElement;
}): JSX.Element => {
  const currentAuth = useProvideAuth();
  return (
    <authContext.Provider value={currentAuth}>{children}</authContext.Provider>
  );
};
