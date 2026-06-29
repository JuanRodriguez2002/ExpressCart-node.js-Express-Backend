import { Router } from 'express';
import FavoriteController from '../controllers/FavoriteController';
import { authenticate } from '../middleware/auth'; // Tu middleware de protección de rutas JWT

const router = Router();

// Todas las rutas de favoritos requieren que el usuario esté autenticado
router.use(authenticate);

router.get('/', FavoriteController.getFavorites);          // GET /api/favorites
router.post('/', FavoriteController.addFavorite);          // POST /api/favorites (enviar supermarketId en el body)
router.delete('/:supermarketId', FavoriteController.removeFavorite); // DELETE /api/favorites/3

export default router;