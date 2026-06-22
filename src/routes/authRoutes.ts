import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('email')
        .isEmail().withMessage('Email is not valid'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 8 characters long'),

    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token')
        .isLength({ min: 6, max: 6 })
        .notEmpty().withMessage('Token is not valid'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('Email is not valid'),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.login
)


router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('Email is not valid'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .isLength({ min: 6, max: 6 })
        .notEmpty().withMessage('Token is not valid'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .isLength({ min: 6, max: 6 })
        .notEmpty().withMessage('Token is not valid'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('Current password is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('new Password must be at least 8 characters long'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.checkPassword
)

//ruta de supermercados para app dedicada alos supermercados
router.post('/create-supermarket-account',
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('E-mail no válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe ser de al menos 8 caracteres'),
    handleInputErrors,
    AuthController.createAccountSupermarket
);


export default router