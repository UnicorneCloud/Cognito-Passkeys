import { createContext } from "react";
import { useProvideAuth } from "../hooks/useProvideAuth";

export const authContext = createContext<ReturnType<typeof useProvideAuth>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any
);
