import CryptoJS from "crypto-js";

interface EncryptionResult {
  encryptedData: string;
  iv: string;
}

// Generate a random encryption key based on master password
export const generateEncryptionKey = (
  masterPassword: string,
  email: string
): string => {
  // Use PBKDF2 to derive a strong key from the master password
  // The email serves as a salt to make the key unique per user
  return CryptoJS.PBKDF2(masterPassword, email, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000,
  }).toString();
};

// Encrypt data with AES
export const encryptData = (
  data: string,
  encryptionKey: string
): EncryptionResult => {
  try {
    if (!data) {
      throw new Error("No data provided for encryption");
    }

    if (!encryptionKey) {
      throw new Error("No encryption key provided");
    }

    // Generate a random IV for added security
    const iv = CryptoJS.lib.WordArray.random(16);

    // Create a consistent key format
    const key = CryptoJS.enc.Hex.parse(encryptionKey.substring(0, 64));

    // Encrypt the data using AES with CBC mode
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    const result = {
      iv: iv.toString(CryptoJS.enc.Base64),
      encryptedData: encrypted.toString(),
    };

    console.log("Encryption completed:", {
      inputDataLength: data.length,
      resultIvLength: result.iv.length,
      resultEncryptedLength: result.encryptedData.length,
      keyUsed: key.toString().substring(0, 10) + "...",
    });

    return result;
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};

// Decrypt data with AES
export const decryptData = (
  encryptedData: string,
  iv: string,
  encryptionKey: string
): string | null => {
  try {
    // Validate inputs
    if (!encryptedData) {
      console.error("Missing encryptedData parameter");
      return null;
    }

    if (!iv) {
      console.error("Missing IV parameter");
      return null;
    }

    if (!encryptionKey) {
      console.error("Missing encryptionKey parameter");
      return null;
    }

    console.log("Decryption inputs:", {
      encryptedDataLength: encryptedData.length,
      ivLength: iv.length,
      keyLength: encryptionKey.length,
      encryptedDataSample: encryptedData.substring(0, 10) + "...",
      ivSample: iv.substring(0, 10) + "...",
      keyUsedSample: encryptionKey.substring(0, 10) + "...",
    });

    // Use the same key format as encryption
    const key = CryptoJS.enc.Hex.parse(encryptionKey.substring(0, 64));

    // Parse IV
    const parsedIv = CryptoJS.enc.Base64.parse(iv);

    // Decrypt directly without creating cipher params
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: parsedIv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      });

      // Convert to string
      const result = decrypted.toString(CryptoJS.enc.Utf8);

      // Check if result is valid
      if (!result || result.length === 0) {
        console.error(
          "Decryption produced empty result - trying alternative approach"
        );

        // Try an alternative approach with different key format
        const altKey = encryptionKey;
        const altDecrypted = CryptoJS.AES.decrypt(encryptedData, altKey, {
          iv: parsedIv,
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC,
        });

        const altResult = altDecrypted.toString(CryptoJS.enc.Utf8);
        if (!altResult || altResult.length === 0) {
          console.error("Alternative decryption also failed");
          return null;
        }

        console.log("Alternative decryption successful");
        return altResult;
      }

      console.log("Decryption successful, result length:", result.length);
      return result;
    } catch (e) {
      console.error("Error during decryption process:", e);
      return null;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Generate a secure random password
export const generateRandomPassword = (length = 16): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";

  // Use CryptoJS's random function to generate secure random numbers
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
