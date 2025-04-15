import { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister } from "../services/api";
import { generateEncryptionKey } from "../utils/encryption";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getEncryptionKey: () => string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  register: async () => false,
  login: async () => false,
  logout: () => {},
  getEncryptionKey: () => null,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const email = localStorage.getItem("userEmail");

    if (token && userId && email) {
      setUser({ id: userId, email });
    }

    setLoading(false);
  }, []);

  // Register a new user
  const register = async (email: string, password: string) => {
    try {
      const res = await apiRegister(email, password);

      // Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userEmail", email);

      // Generate encryption key from master password
      const key = generateEncryptionKey(password, email);
      setEncryptionKey(key);

      // Store encryption key in session storage (not localStorage for security)
      // This ensures the key is lost when browser is closed
      sessionStorage.setItem("encryptionKey", key);

      setUser({ id: res.data.userId, email });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);

      // Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userEmail", email);

      // Generate encryption key from master password
      const key = generateEncryptionKey(password, email);
      console.log(
        "Generated key on login (first 10 chars):",
        key.substring(0, 10)
      );
      setEncryptionKey(key);

      // Store encryption key in session storage
      sessionStorage.setItem("encryptionKey", key);

      setUser({ id: res.data.userId, email });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("encryptionKey");

    setUser(null);
    setEncryptionKey(null);
  };

  // Get encryption key (restore from session storage if needed)
  const getEncryptionKey = () => {
    if (encryptionKey) {
      console.log("Using in-memory encryption key");
      return encryptionKey;
    }

    const storedKey = sessionStorage.getItem("encryptionKey");
    if (storedKey) {
      console.log("Using stored encryption key from session");
      setEncryptionKey(storedKey);
      return storedKey;
    }

    console.error("No encryption key available");
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getEncryptionKey,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
