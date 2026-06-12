import { Router } from 'express'
import { body, param } from 'express-validator'
import { SupermarketController } from '../controllers/SupermarketController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

// Aplicamos el limiter a todas las rutas de este módulo
router.use(limiter)
// Forzamos la autenticación de JWT para interactuar con los supermercados
router.use(authenticate)

router.get('/', 
    SupermarketController.getAllSupermarkets
)

router.get('/:id',
    param('id')
        .isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    SupermarketController.getSupermarketById
)

router.get('/favorites', 
    SupermarketController.getFavoriteSupermarkets
)

router.post('/:id/favorite',
    param('id')
        .isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    SupermarketController.toggleFavoriteSupermarket
)

export default router