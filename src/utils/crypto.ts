import CryptoJS from 'crypto-js';

// Usa una palabra secreta segura. En producción, esto irá en tu archivo .env
const SECRET_KEY = process.env.CRYPTO_SECRET || 'MiClaveUltraSecretaDeConstanza123';

// 🔐 Encriptar data (para cuando mandes info al frontend)
export const encryptData = (data: any): string => {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
};

// 🔓 Desencriptar data (para cuando recibas info del frontend)
export const decryptData = (cipherText: string): any => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        
        // Si es un JSON, lo parseamos; si no, devolvemos el texto plano
        return JSON.parse(decryptedString);
    } catch (error) {
        return null; // Retorna null si intentan mandar basura o una clave incorrecta
    }
};