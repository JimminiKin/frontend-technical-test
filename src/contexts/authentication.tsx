import { jwtDecode } from "jwt-decode";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AUTH_TOKEN_KEY = 'auth_token';

export type AuthenticationState =
  | {
      isAuthenticated: true;
      token: string;
      userId: string;
    }
  | {
      isAuthenticated: false;
    };

export type Authentication = {
  state: AuthenticationState;
  authenticate: (token: string) => void;
  signout: () => void;
};

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined,
);

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthenticationState>(() => {
    // Try to get the token from localStorage on initial load
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (savedToken) {
      try {
        // Check if token is expired
        const decoded = jwtDecode<{ id: string; exp: number }>(savedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp > currentTime) {
          return {
            isAuthenticated: true,
            token: savedToken,
            userId: decoded.id,
          };
        } else {
          // Token is expired, remove it
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    return { isAuthenticated: false };
  });

  const authenticate = useCallback(
    (token: string) => {
      try {
        const decoded = jwtDecode<{ id: string; exp: number }>(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp > currentTime) {
          // Save token to localStorage
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          
          setState({
            isAuthenticated: true,
            token,
            userId: decoded.id,
          });
        } else {
          throw new Error("Token is expired");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        signout();
      }
    },
    [setState],
  );

  const signout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setState({ isAuthenticated: false });
  }, [setState]);

  // Check token expiration periodically
  useEffect(() => {
    if (state.isAuthenticated) {
      const authenticatedState = state as { isAuthenticated: true; token: string; userId: string };
      const checkTokenExpiration = () => {
        try {
          const decoded = jwtDecode<{ exp: number }>(authenticatedState.token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp && decoded.exp <= currentTime) {
            signout();
          }
        } catch (error) {
          signout();
        }
      };

      const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [state, signout]);

  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout],
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider",
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error("User is not authenticated");
  }
  return state.token;
}
