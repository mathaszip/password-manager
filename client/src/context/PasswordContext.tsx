import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { AuthContext } from "./AuthContext";
import {
  getPasswords as apiGetPasswords,
  addPassword as apiAddPassword,
  updatePassword as apiUpdatePassword,
  deletePassword as apiDeletePassword,
} from "../services/api";
import { encryptData, decryptData } from "../utils/encryption";

// Define the PasswordEntry interface to match the database field names
interface PasswordEntry {
  id: number;
  user_id: number;
  title: string;
  website?: string;
  username?: string;
  encrypted_password: string; // Snake case to match PostgreSQL
  iv: string;
  created_at: string;
  updated_at: string;
  // Add other fields that might be present
  encryptedPassword?: string; // Optional alias for compatibility
  [key: string]: any; // Index signature to allow string indexing
}

interface PasswordFormData {
  title: string;
  website?: string;
  username?: string;
  password: string;
}

interface PasswordContextType {
  passwords: PasswordEntry[];
  loading: boolean;
  fetchPasswords: () => Promise<void>;
  addPassword: (passwordData: PasswordFormData) => Promise<PasswordEntry>;
  updatePassword: (
    id: number,
    passwordData: Partial<PasswordFormData>
  ) => Promise<PasswordEntry>;
  deletePassword: (id: number) => Promise<boolean>;
  decryptPassword: (encryptedPassword: string, iv: string) => string | null;
}

interface PasswordProviderProps {
  children: ReactNode;
}

export const PasswordContext = createContext<PasswordContextType>({
  passwords: [],
  loading: true,
  fetchPasswords: async () => {},
  addPassword: async () => ({
    id: 0,
    user_id: 0, // Add this required field
    title: "",
    encrypted_password: "",
    iv: "",
    created_at: "",
    updated_at: "",
  }),
  updatePassword: async () => ({
    id: 0,
    user_id: 0, // Add this required field
    title: "",
    encrypted_password: "",
    iv: "",
    created_at: "",
    updated_at: "",
  }),
  deletePassword: async () => false,
  decryptPassword: () => null,
});

export const PasswordProvider = ({ children }: PasswordProviderProps) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getEncryptionKey } = useContext(AuthContext);

  // Fetch passwords when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPasswords();
    } else {
      setPasswords([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch all passwords
  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const res = await apiGetPasswords();

      console.log("Raw password data from server:", res.data);

      // Map the snake_case fields to our expected format if needed
      const formattedPasswords = res.data.map((p: any) => {
        // Copy the password object
        const passwordEntry: PasswordEntry = { ...p };

        // Add aliases for compatibility if needed
        if (p.encrypted_password && !p.encryptedPassword) {
          passwordEntry.encryptedPassword = p.encrypted_password;
        }

        return passwordEntry;
      });

      setPasswords(formattedPasswords);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching passwords:", error);
      setLoading(false);
    }
  };

  // Add a new password
  const addPassword = async (passwordData: any) => {
    try {
      const encryptionKey = getEncryptionKey();
      if (!encryptionKey) {
        throw new Error("Encryption key not available");
      }

      console.log(
        "Using encryption key:",
        encryptionKey.substring(0, 5) + "..."
      );

      // Encrypt the password
      const { encryptedData, iv } = encryptData(
        passwordData.password,
        encryptionKey
      );

      console.log("Encryption result:", {
        encryptedDataLength: encryptedData.length,
        ivLength: iv.length,
        encryptedDataSample: encryptedData.substring(0, 10) + "...",
        ivSample: iv.substring(0, 10) + "...",
      });

      // Create the password entry with encrypted data - use snake_case for PostgreSQL compatibility
      const passwordEntry = {
        title: passwordData.title,
        website: passwordData.website || "", // Ensure defined values
        username: passwordData.username || "",
        encrypted_password: encryptedData,
        iv: iv,
      };

      console.log("Sending to server:", passwordEntry);

      // Save to the server
      try {
        const res = await apiAddPassword(passwordEntry);

        console.log("Server response for add password:", {
          id: res.data.id,
          hasEncryptedPassword: !!res.data.encrypted_password,
          hasIv: !!res.data.iv,
        });

        // Update local state
        setPasswords([...passwords, res.data]);

        return res.data;
      } catch (err: any) {
        console.error("Server error:", err.response?.data || err.message);
        throw new Error(
          err.response?.data?.message || "Failed to add password to server"
        );
      }
    } catch (error) {
      console.error("Error adding password:", error);
      throw error;
    }
  };

  // Update a password
  const updatePassword = async (
    id: number,
    passwordData: Partial<PasswordFormData>
  ) => {
    try {
      const encryptionKey = getEncryptionKey();
      if (!encryptionKey) {
        throw new Error("Encryption key not available");
      }

      // Encrypt the password if it changed
      let passwordEntry: any = {
        title: passwordData.title,
        website: passwordData.website,
        username: passwordData.username,
      };

      if (passwordData.password) {
        const { encryptedData, iv } = encryptData(
          passwordData.password,
          encryptionKey
        );
        passwordEntry.encrypted_password = encryptedData;
        passwordEntry.iv = iv;
      }

      // Update on the server
      const res = await apiUpdatePassword(id, passwordEntry);

      // Update local state
      setPasswords(passwords.map((pw) => (pw.id === id ? res.data : pw)));

      return res.data;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  // Delete a password
  const deletePassword = async (id: number) => {
    try {
      await apiDeletePassword(id);

      // Update local state
      setPasswords(passwords.filter((pw) => pw.id !== id));

      return true;
    } catch (error) {
      console.error("Error deleting password:", error);
      throw error;
    }
  };

  // Decrypt a password
  const decryptPassword = (encryptedPassword: string, iv: string) => {
    try {
      const encryptionKey = getEncryptionKey();
      if (!encryptionKey) {
        console.error("Encryption key not available");
        return "Error: Encryption key not available";
      }

      if (!encryptedPassword) {
        console.error("Missing encrypted password data");
        return "Error: Missing password data";
      }

      if (!iv) {
        console.error("Missing IV data");
        return "Error: Missing initialization vector";
      }

      console.log("Decryption attempt with:", {
        encryptionKeyPrefix: encryptionKey.substring(0, 5) + "...",
        encryptedPasswordPrefix: encryptedPassword.substring(0, 10) + "...",
        ivPrefix: iv.substring(0, 10) + "...",
      });

      const decrypted = decryptData(encryptedPassword, iv, encryptionKey);

      if (!decrypted) {
        console.error("Decryption resulted in null or empty value");
        return "Error: Decryption failed";
      }

      return decrypted;
    } catch (error) {
      console.error("Error decrypting password:", error);
      return (
        "Error: Decryption failed - " +
        (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <PasswordContext.Provider
      value={{
        passwords,
        loading,
        fetchPasswords,
        addPassword,
        updatePassword,
        deletePassword,
        decryptPassword,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
};
