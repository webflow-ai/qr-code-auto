const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

// Derive a 32-byte key from the env variable
function getKey() {
    const rawKey = process.env.ENCRYPTION_KEY;
    if (!rawKey) {
        throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }
    // Pad or truncate to exactly 32 bytes
    return Buffer.from(rawKey.padEnd(KEY_LENGTH, '0').slice(0, KEY_LENGTH), 'utf8');
}

/**
 * Encrypts a plaintext string using AES-256-CBC
 * @param {string} text - The plaintext to encrypt
 * @returns {string} - iv:encryptedData (hex encoded)
 */
function encrypt(text) {
    if (!text) return null;
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-CBC encrypted string
 * @param {string} encryptedText - iv:encryptedData (hex encoded)
 * @returns {string} - The decrypted plaintext
 */
function decrypt(encryptedText) {
    if (!encryptedText) return null;
    try {
        const key = getKey();
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted) throw new Error('Invalid encrypted format');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        console.error('Decryption error:', err.message);
        return null;
    }
}

/**
 * Masks an Aadhaar number for display: XXXX-XXXX-1234
 * @param {string} aadhaar - The plaintext Aadhaar number (12 digits)
 * @returns {string} - Masked Aadhaar
 */
function maskAadhaar(aadhaar) {
    if (!aadhaar) return 'XXXX-XXXX-XXXX';
    const digits = String(aadhaar).replace(/\D/g, '');
    if (digits.length < 4) return 'XXXX-XXXX-XXXX';
    const lastFour = digits.slice(-4);
    return `XXXX-XXXX-${lastFour}`;
}

module.exports = { encrypt, decrypt, maskAadhaar };
