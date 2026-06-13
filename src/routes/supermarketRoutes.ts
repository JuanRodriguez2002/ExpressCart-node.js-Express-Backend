import { Router } from 'express'
import { body, param } from 'express-validator'
import { SupermarketController } from '../controllers/SupermarketController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'
import { isSupermarketAdmin } from '../middleware/roleAuth' // <-- Asegúrate de importar el middleware de rol

const router = Router()

// Aplicamos el limiter a todas las rutas de este módulo
router.use(limiter)
// Forzamos la autenticación de JWT para interactuar con los supermercados
router.use(authenticate)

// ==========================================
// 📱 RUTAS DE LA APP DE CLIENTES
// ==========================================

router.get('/getall', 
    SupermarketController.getAll
)

router.get('/favorites', 
    SupermarketController.getFavoriteSupermarkets
)

router.get('/getById/:id',
    param('id')
        .isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    SupermarketController.getById
)

router.post('/toggleFavoriteSupermarket/:id/favorite',
    param('id')
        .isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    SupermarketController.toggleFavoriteSupermarket
)

// ==========================================
// 🏪 RUTAS CORPORATIVAS (App Supermercados)
// ==========================================

// Crear el establecimiento (Se dispara desde la app de supermercados al registrarse)
router.post('/createSupermarket',
    isSupermarketAdmin, // 🛡️ Candado: Solo entran usuarios con rol 'supermarket_admin'
    body('name')
        .notEmpty().withMessage('El nombre de la tienda es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder los 100 caracteres'),
    body('address')
        .notEmpty().withMessage('La dirección física es obligatoria'),
    handleInputErrors,
    SupermarketController.create
)

// Editar los datos de la sucursal
router.put('/updatesupermarket/:id',
    isSupermarketAdmin, // 🛡️ Candado corporativo
    param('id')
        .isInt().withMessage('ID de supermercado no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tienda no puede estar vacío'),
    body('address')
        .notEmpty().withMessage('La dirección no puede estar vacía'),
    handleInputErrors,
    SupermarketController.update
)

export default router