import { Router } from 'express'
import { body, param } from 'express-validator'
import { OrderController } from '../controllers/OrderController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)
router.use(authenticate)

router.post('/',
    body('supermarketId')
        .isInt().withMessage('El ID del supermercado es requerido y debe ser numérico'),
    body('addressId')
        .isInt().withMessage('La dirección de envío es requerida'),
    body('paymentMethodId')
        .isInt().withMessage('El método de pago es requerido'),
    body('products')
        .isArray({ min: 1 }).withMessage('El pedido debe contener al menos un producto'),
    body('products.*.productId')
        .isInt().withMessage('Cada producto debe tener un ID válido'),
    body('products.*.quantity')
        .isInt({ min: 1 }).withMessage('La cantidad mínima de un producto debe ser 1'),
    handleInputErrors,
    OrderController.createOrder
)

router.get('/history', 
    OrderController.getOrderHistory
)

router.get('/:id',
    param('id')
        .isInt().withMessage('ID de factura no válido'),
    handleInputErrors,
    OrderController.getOrderById
)

router.put('/:id/status',
    param('id')
        .isInt().withMessage('ID de pedido no válido'),
    body('status')
        .isIn(['activa', 'en proceso', 'completada', 'cancelada'])
        .withMessage('El estado proporcionado no es válido'),
    handleInputErrors,
    OrderController.updateOrderStatus
)

export default router