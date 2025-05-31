import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export class CryptoUtil {
    private static getKeyBytes(): Buffer {
        const encryptionKey = process.env.ENCRYPTION_KEY;

        if (!encryptionKey) {
            throw new Error('ENCRYPTION_KEY is missing in .env file');
        }

        return crypto.createHash('sha256').update(encryptionKey, 'utf8').digest(); // 32-byte key
    }

    static encrypt(plainText: string): string {
        const key = this.getKeyBytes();
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
        return combined.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    static decrypt(cipherText: string): string {
        const key = this.getKeyBytes();

        let base64 = cipherText
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const combined = Buffer.from(base64, 'base64');
        const iv = combined.subarray(0, 16);
        const encrypted = combined.subarray(16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
