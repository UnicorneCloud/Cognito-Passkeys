// Hook for child components to get the auth object ...

import { useContext } from "react";
import { authContext } from "../contexts/AuthContext";

// ... and re-render when it changes.
export const useAuth = () => useContext(authContext);
