import { Router } from 'express';
import { body, param } from 'express-validator';
import { OrderController } from '../controllers/OrderController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { isSupermarketAdmin } from '../middleware/roleAuth';
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate);

// 📱 RUTAS DE CLIENTES
router.post('/checkout',
    body('supermarketId').isInt().withMessage('Selecciona un supermercado válido'),
    body('addressId').isInt().withMessage('La dirección de entrega es obligatoria'),
    body('paymentMethodId').isInt().withMessage('El método de pago es requerido'),
    body('products').isArray({ min: 1 }).withMessage('Debes incluir al menos un producto en el pedido'),
    body('products.*.id').isInt().withMessage('ID de producto no válido'),
    body('products.*.quantity').isFloat({ min: 0.01 }).withMessage('La cantidad debe ser un número mayor a 0 (admite decimales para libras)'),
    handleInputErrors,
    OrderController.createOrder
);

router.get('/client/history', OrderController.getClientHistory);

// 🏪 RUTAS CORPORATIVAS (Supermercados)
router.get('/supermarket/history', isSupermarketAdmin, OrderController.getSupermarketHistory);

// 🔄 RUTA HÍBRIDA: Cambio de estados (Permite clientes o admins bajo reglas del controlador)
router.patch('/update-status/:id',
    param('id').isInt().withMessage('ID de orden no válido'),
    body('status').isIn(['activa', 'en proceso', 'completada', 'cancelada']).withMessage('Estado de orden no válido'),
    handleInputErrors,
    OrderController.updateOrderStatus
);

router.get('/:id',
    param('id').isInt().withMessage('ID de orden no válido'),
    handleInputErrors,
    OrderController.getOrderById
);

export default router;