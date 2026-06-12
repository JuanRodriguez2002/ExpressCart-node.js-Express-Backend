import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { isSupermarketAdmin } from '../middleware/roleAuth';
//import { SupermarketProductController } from '../controllers/SupermarketProductController';

const router = Router();

// Todas estas rutas requieren estar logueado Y ser administrador de un supermercado
router.use(authenticate);
router.use(isSupermarketAdmin);
    
// Endpoints listos para la segunda App:
router.post('/products', SupermarketProductController.createProduct);      // Crear producto
router.put('/products/:id', SupermarketProductController.updateProduct);   // Editar producto
router.delete('/products/:id', SupermarketProductController.deleteProduct); // Eliminar producto (o borrado lógico)
router.get('/orders', SupermarketProductController.getStoreOrders);        // Ver pedidos que le hicieron a SU tienda

export default router;