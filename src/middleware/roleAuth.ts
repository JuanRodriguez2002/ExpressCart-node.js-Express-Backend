import { Request, Response, NextFunction } from 'express';

export const isSupermarketAdmin = (req: Request, res: Response, next: NextFunction) => {
    // req.user ya viene lleno gracias al middleware 'authenticate' que probamos en Postman
    if (req.user && req.user.role === 'supermarket_admin') {
        next(); // Tiene permiso, continúa al controlador
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Supermercado.' });
    }
};