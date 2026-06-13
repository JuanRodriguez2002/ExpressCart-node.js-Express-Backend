import { Request, Response, NextFunction } from 'express';

export const isSupermarketAdmin = (req: Request, res: Response, next: NextFunction) => {
    // req.user ya viene lleno gracias al middleware 'authenticate' que probamos en Postman
    if (req.user && req.user.role === 'supermarket_admin') {
        next(); // Tiene permiso, continúa al controlador
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Supermercado.' });
    }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // 1. Verificar si el usuario pasó primero por el middleware de autenticación
        if (!req.user) {
            return res.status(401).json({ error: 'No autorizado. Inicie sesión primero.' });
        }

        // 2. Comprobar si el rol del usuario está dentro de los roles permitidos para esta ruta
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Acceso denegado. Tu rol de '${req.user.role}' no tiene permisos para realizar esta acción.` 
            });
        }

        // 3. Si todo está en orden, permitir que continúe al controlador
        next();
    };
};