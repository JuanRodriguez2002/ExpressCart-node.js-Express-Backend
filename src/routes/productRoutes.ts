// src/routes/productRoutes.ts
import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProductController } from '../controllers/ProductController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { isSupermarketAdmin } from '../middleware/roleAuth';
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate);

// 📱 RUTA DE CLIENTE
router.get('/supermarket/:supermarketId/category/:categoryId',
    [
        param('supermarketId').isInt().withMessage('ID de supermercado no válido').toInt(),
        param('categoryId').isInt().withMessage('ID de categoría no válido').toInt()
    ],
    handleInputErrors,
    ProductController.getProductsBySupermarketAndCategory
);

// 🏪 RUTAS CORPORATIVAS (Mantenimiento)
router.post('/createProduct',
    isSupermarketAdmin,
    [
        body('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
        body('price').isDecimal().withMessage('El precio debe ser un número decimal válido'),
        // CAMBIO: Ahora es isFloat para permitir que registren, por ejemplo, 150.50 libras de papas
        body('stock').isFloat({ min: 0 }).withMessage('El stock debe ser un número decimal o entero mayor o igual a 0'),
        // NUEVA VALIDACIÓN: Solo acepta los valores configurados en el ENUM estándar
        body('unitType').isIn(['ud', 'lb']).withMessage('El tipo de unidad debe ser "ud" (Unidad) o "lb" (Libra)'),
        body('categoryId').isInt().withMessage('La categoría es obligatoria')
    ],
    handleInputErrors,
    ProductController.createProduct
);

router.put('/updateProduct/:id',
    isSupermarketAdmin,
    [
        param('id').isInt().withMessage('ID de producto no válido'),
        body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('price').optional().isDecimal().withMessage('El precio debe ser un número válido'),
        body('stock').optional().isFloat({ min: 0 }).withMessage('El stock debe ser un número válido'),
        body('unitType').optional().isIn(['ud', 'lb']).withMessage('Tipo de unidad no válido'),
    ],
    handleInputErrors,
    ProductController.updateProduct
);

router.delete('/deleteProduct/:id',
    isSupermarketAdmin,
    param('id').isInt().withMessage('ID de producto no válido'),
    handleInputErrors,
    ProductController.deleteProduct
);

export default router;