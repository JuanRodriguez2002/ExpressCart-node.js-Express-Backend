import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProductController } from '../controllers/ProductController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { isSupermarketAdmin } from '../middleware/roleAuth';
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate); // Todo el flujo requiere login previo

// 📱 RUTA DE CLIENTE: Listar catálogo completo de una tienda por su ID
router.get('/supermarket/:supermarketId',
    param('supermarketId').isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    ProductController.getProductsBySupermarket
);

// 🏪 RUTAS CORPORATIVAS: Gestión de Inventario
router.post('/createProduct',
    isSupermarketAdmin,
    body('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
    body('price').isDecimal().withMessage('El precio debe ser un número decimal válido'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('categoryId').isInt().withMessage('La categoría es obligatoria'),
    handleInputErrors,
    ProductController.createProduct
);

router.put('/updateProduct/:id',
    isSupermarketAdmin,
    param('id').isInt().withMessage('ID de producto no válido'),
    body('name').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('price').optional().isDecimal().withMessage('El precio debe ser un número válido'),
    body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número válido'),
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