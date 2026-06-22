import { Router } from 'express';
import { body, param } from 'express-validator';
import { AddressController } from '../controllers/AddressController';
import { PaymentMethodController } from '../controllers/PaymentMethodController';
import { UserContactController } from '../controllers/UserContactController';
import { handleInputErrors } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { limiter } from '../config/limiter';

const router = Router();

router.use(limiter);
router.use(authenticate); // Obligatorio estar autenticado

// ====================================================
// 📍 SUBMÓDULO: DIRECCIONES
// ====================================================
router.get('/addresses', AddressController.getAll);

router.post('/addresses/create',
    body('fullAddress').notEmpty().withMessage('La dirección completa es obligatoria'),
    handleInputErrors,
    AddressController.create
);

router.put('/addresses/update/:id',
    param('id').isInt().withMessage('ID no válido'),
    body('fullAddress').optional().notEmpty().withMessage('La dirección no puede estar vacía'),
    handleInputErrors,
    AddressController.update
);

router.delete('/addresses/delete/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    AddressController.delete
);

// ====================================================
// 💳 SUBMÓDULO: MÉTODOS DE PAGO
// ====================================================
router.get('/payments', PaymentMethodController.getAll);

router.post('/payments/create',
    body('provider').notEmpty().withMessage('El proveedor (Ej: Efectivo, Tarjeta) es obligatorio'),
    handleInputErrors,
    PaymentMethodController.create
);

router.put('/payments/update/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    PaymentMethodController.update
);

router.delete('/payments/delete/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    PaymentMethodController.delete
);

// ====================================================
// 📞 SUBMÓDULO: CONTACTOS DE USUARIO
// ====================================================
router.get('/contacts', UserContactController.getAll);

router.post('/contacts/create',
    body('phoneNumber').notEmpty().withMessage('El número de teléfono es obligatorio'),
    body('type').notEmpty().withMessage('El tipo de contacto (Ej: WhatsApp) es requerido'),
    handleInputErrors,
    UserContactController.create
);

router.put('/contacts/update/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    UserContactController.update
);

router.delete('/contacts/delete/:id',
    param('id').isInt().withMessage('ID no válido'),
    handleInputErrors,
    UserContactController.delete
);

export default router;