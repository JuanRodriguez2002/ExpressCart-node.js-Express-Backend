import { Router } from 'express';
import { param } from 'express-validator';
import { DeliveryController } from '../controllers/DeliveryController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roleAuth'; // Asegura filtrar por rol 'driver'
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate);
router.use(authorizeRoles('driver')); // Filtro masivo de protección para choferes/motoristas

// Endpoints del Repartidor
router.get('/available', DeliveryController.getAvailableOrders);
router.get('/my-route', DeliveryController.getMyRoute);

router.patch('/accept/:id',
    param('id').isInt().withMessage('ID de orden inválido'),
    handleInputErrors,
    DeliveryController.acceptOrder
);

router.patch('/start/:id',
    param('id').isInt().withMessage('ID de orden inválido'),
    handleInputErrors,
    DeliveryController.startDelivery
);

router.patch('/complete/:id',
    param('id').isInt().withMessage('ID de orden inválido'),
    handleInputErrors,
    DeliveryController.completeDelivery
);

export default router;