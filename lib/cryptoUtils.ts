// lib/cryptoUtils.ts
import crypto from 'crypto';

// Define the encryption algorithm and key 
const ENCRYPTION_KEY_BASE64 = 'b2M2F2Gg5HTTYKfGtp6e6NL3PvA2Z4f1zK8X5YX2yWg='; 
if (!ENCRYPTION_KEY_BASE64) {
  throw new Error('ENCRYPTION_KEY environment variable is not set');
}

const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_BASE64, 'base64');

// Ensure the key length is 32 bytes for AES-256
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('Invalid encryption key length');
}

const ALGORITHM = 'aes-256-gcm';

// Function to encrypt data
export const encryptData = (data: string): string => {
  if (!data) {
    throw new Error('No data provided for encryption');
  }
 

  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64'); 

  const tag = cipher.getAuthTag().toString('base64'); // Get the authentication tag
  return `${iv.toString('base64')}:${encrypted}:${tag}`;
};

// Function to decrypt data
export const decryptData = (encryptedData: string): string => {
  if (!encryptedData) {
    throw new Error('No encrypted data provided for decryption');
  }

  const [ivBase64, encryptedBase64, tagBase64] = encryptedData.split(':');
  if (!ivBase64 || !encryptedBase64 || !tagBase64) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
