import { Router } from 'express';
import { body, param } from 'express-validator';
import { CategoryController } from '../controllers/CategoryController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { isSupermarketAdmin } from '../middleware/roleAuth';
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate); // Todo este módulo requiere login previo

// 📱 RUTA DE CLIENTE: Listar pasillos/categorías de un súper específico
router.get('/supermarket/:supermarketId',
    param('supermarketId').isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    CategoryController.getCategoriesBySupermarket
);

// 🏪 RUTAS CORPORATIVAS: Gestión de Categorías
router.post('/create',
    isSupermarketAdmin,
    body('name').notEmpty().withMessage('El nombre de la categoría es obligatorio'),
    body('supermarketId').isInt().withMessage('El ID del supermercado debe ser un número válido'),
    handleInputErrors,
    CategoryController.createCategory
);

router.put('/updateCategory/:id',
    isSupermarketAdmin,
    param('id').isInt().withMessage('ID de categoría no válido'),
    body('name').notEmpty().withMessage('El nombre de la categoría no puede estar vacío'),
    handleInputErrors,
    CategoryController.updateCategory
);

router.delete('/deleteCategory/:id',
    isSupermarketAdmin,
    param('id').isInt().withMessage('ID de categoría no válido'),
    handleInputErrors,
    CategoryController.deleteCategory
);

export default router;