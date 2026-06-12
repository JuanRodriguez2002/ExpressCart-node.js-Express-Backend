import { Router } from 'express'
import { param } from 'express-validator'
import { ProductController } from '../controllers/ProductController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)
router.use(authenticate)

router.get('/supermarket/:supermarketId',
    param('supermarketId')
        .isInt().withMessage('ID de supermercado no válido'),
    handleInputErrors,
    ProductController.getProductsBySupermarket
)

router.get('/category/:categoryId',
    param('categoryId')
        .isInt().withMessage('ID de categoría no válido'),
    handleInputErrors,
    ProductController.getProductsByCategory
)

router.get('/:id',
    param('id')
        .isInt().withMessage('ID de producto no válido'),
    handleInputErrors,
    ProductController.getProductById
)

export default router