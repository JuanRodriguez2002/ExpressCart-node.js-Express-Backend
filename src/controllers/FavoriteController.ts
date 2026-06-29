import { Request, Response } from "express";
import UserFavoriteSupermarket from "../models/UserFavoriteSupermarket";
import Supermarket from "../models/Supermarket";

export class FavoriteController {
  // 1. Agregar un supermercado a favoritos
  static addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { supermarketId } = req.body;
      const userId = req.user.id; // Obtenido desde tu middleware de autenticación (JWT)

      if (!supermarketId) {
        res.status(400).json({ error: "El id del supermercado es requerido" });
        return;
      }

      // Verificar si el supermercado existe
      const supermarketExists = await Supermarket.findByPk(supermarketId);
      if (!supermarketExists) {
        res.status(404).json({ error: "El supermercado no existe" });
        return;
      }

      // Verificar si ya está en favoritos para evitar duplicados
      const alreadyFavorite = await UserFavoriteSupermarket.findOne({
        where: { userId, supermarketId },
      });

      if (alreadyFavorite) {
        res
          .status(400)
          .json({ message: "Este supermercado ya está en tus favoritos" });
        return;
      }

      // Crear el registro de favorito
      await UserFavoriteSupermarket.create({ userId, supermarketId });

      res
        .status(201)
        .json({ message: "Supermercado agregado a favoritos correctamente" });
    } catch (error) {
      console.error("Error al agregar favorito:", error);
      res.status(500).json({ error: "Hubo un error en el servidor" });
    }
  };

  // 2. Eliminar un supermercado de favoritos
  static removeFavorite = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { supermarketId } = req.params;
      const userId = req.user.id;

      const favorite = await UserFavoriteSupermarket.findOne({
        where: { userId, supermarketId: Number(supermarketId) },
      });

      if (!favorite) {
        res
          .status(404)
          .json({ error: "El supermercado no estaba en tus favoritos" });
        return;
      }

      // Eliminar el registro
      await favorite.destroy();

      res
        .status(200)
        .json({ message: "Supermercado eliminado de favoritos correctamente" });
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      res.status(500).json({ error: "Hubo un error en el servidor" });
    }
  };

  // 3. Obtener la lista de supermercados favoritos del usuario
  static getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;

      const favorites = await UserFavoriteSupermarket.findAll({
        where: { userId },
        include: [
          {
            model: Supermarket,
            attributes: ['id', 'name', 'logo', 'address']
          },
        ],
      });

      // 🔥 Extramos la propiedad 'supermarket' de manera segura como objeto plano
      const favoriteSupermarkets = favorites.map((fav) => {
        const plainFav = fav.get({ plain: true }) as any;
        return plainFav.supermarket;
      });

      // Retornamos el arreglo limpio
      res.status(200).json(favoriteSupermarkets);
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      res.status(500).json({ error: "Hubo un error en el servidor" });
    }
  };
}

export default FavoriteController;
