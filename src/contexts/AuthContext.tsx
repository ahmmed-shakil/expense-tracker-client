import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { authApi } from "../utils/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthAction {
  type: "SET_LOADING" | "SET_USER" | "LOGOUT";
  payload?: any;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Check if auth is marked as invalid in the API layer
      if ((window as any).authInvalid) {
        console.log("Auth marked as invalid, skipping check");
        dispatch({ type: "LOGOUT" });
        return;
      }

      const response = await authApi.me();
      if (response.success && response.data) {
        dispatch({ type: "SET_USER", payload: response.data });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error: any) {
      console.log("Auth check failed:", error.message);
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Reset auth state before login
      authApi.resetAuthState();

      const response = await authApi.login(email, password);
      if (response.success && response.data?.user) {
        dispatch({ type: "SET_USER", payload: response.data.user });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register(email, password, name);
      if (response.success && response.data?.user) {
        dispatch({ type: "SET_USER", payload: response.data.user });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    let mounted = true;

    const performAuthCheck = async () => {
      if (mounted) {
        await checkAuth();
      }
    };

    // Only check auth on initial mount
    performAuthCheck();

    // Listen for automatic logout events from API interceptor
    const handleAutoLogout = () => {
      console.log("Auto logout triggered");
      if (mounted) {
        dispatch({ type: "LOGOUT" });
      }
    };

    window.addEventListener("auth:logout", handleAutoLogout);

    return () => {
      mounted = false;
      window.removeEventListener("auth:logout", handleAutoLogout);
    };
  }, []); // Empty dependency array to only run once

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
