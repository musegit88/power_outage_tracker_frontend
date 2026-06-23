import api, { type User } from "@/services/api";
import tokenService from "@/services/tokenService";
import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "@/contexts/authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists and is valid
        if (tokenService.isAuthenticated()) {
          // Try to fetch fresh user data
          const userData = await api.getProfile();
          setUser(userData);
        } else {
          // Clear invalid/expired auth data
          tokenService.clearAuth();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        tokenService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // isAuthenticated
  const isAuthenticated = tokenService.isAuthenticated();

  //   Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await api.login(email, password);
      setUser(userData.response.user);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  //   Register function
  const register = async (
    name: string,
    email: string,
    phoneNumber: string,
    password: string,
    consents: {
      consentType: string;
      accepted: boolean;
    }[],
  ) => {
    setIsLoading(true);
    try {
      const userData = await api.register(
        name,
        email,
        phoneNumber,
        password,
        consents,
      );
      setUser(userData.response.user);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
