import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildApiUrl, clearAuthToken, getAuthToken, setAuthToken, setUnauthorizedCallback } from "../../services/api";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "fairplay-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function validateAuthOnLoad() {
      setIsLoading(true);
      const token = getAuthToken();
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!token || stored !== "true") {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(buildApiUrl("/incidents"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          clearAuthToken();
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    void validateAuthOnLoad();

    setUnauthorizedCallback(() => {
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const valid = email.trim().length > 0 && password.trim().length > 0;

    if (!valid) return { success: false, message: "Please enter both email and password." };

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = "Login failed. Please check your credentials.";

        try {
          const errorData = (await response.json()) as { message?: string };
          if (errorData?.message) {
            message = errorData.message;
          }
        } catch {
          // Keep default message when error body cannot be parsed.
        }

        return { success: false, message };
      }

      const data = (await response.json()) as { token?: string };

      if (!data.token) {
        return { success: false, message: "Login response did not include a token." };
      }

      setAuthToken(data.token);
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return {
        success: false,
        message: "Unable to reach auth service. Please verify the backend is running.",
      };
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}