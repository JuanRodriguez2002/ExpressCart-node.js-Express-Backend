import { Request, Response, NextFunction } from 'express';
import { decryptData } from '../utils/crypto';

export const decryptPayload = (req: Request, res: Response, next: NextFunction) => {
    // Si la petición tiene cuerpo y viene un campo "payload" encriptado
    if (req.body && req.body.payload) {
        const decrypted = decryptData(req.body.payload);
        
        if (!decrypted) {
            return res.status(400).json({ error: 'Payload corrupto o error de cifrado.' });
        }
        
        // 🔥 MAGIA: Reemplazamos el body por los datos ya limpios y desencriptados
        req.body = decrypted;
    }
    
    next();
};