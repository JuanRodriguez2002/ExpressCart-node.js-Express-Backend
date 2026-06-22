import { Request, Response } from "express";
import Supermarket from "../models/Supermarket";
import UserFavoriteSupermarket from "../models/UserFavoriteSupermarket";
import User from "../models/User";

export class SupermarketController {
  // ====================================================
  // 📱 ENDPOINTS PARA LA APP DE CLIENTES (Públicos)
  // ====================================================

  // Obtener todos los supermercados registrados
  static getAll = async (req: Request, res: Response) => {
    try {
      const supermarkets = await Supermarket.findAll({
        attributes: ["id", "name", "logo", "address"],
      });
      return res.status(200).json(supermarkets);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al obtener los supermercados" });
    }
  };

  // Obtener el detalle de un supermercado por su ID
  static getById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const supermarket = await Supermarket.findByPk(id);

      if (!supermarket) {
        return res.status(404).json({ error: "Supermercado no encontrado" });
      }

      return res.status(200).json(supermarket);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al buscar el supermercado" });
    }
  };

  static getFavoriteSupermarkets = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Buscamos al usuario e incluimos sus favoritos usando su alias explícito
        const userWithFavorites = await User.findByPk(userId, {
            include: [{
                model: Supermarket,
                as: 'favoriteSupermarkets', // <-- ¡Esto le dice a Sequelize cuál de las dos relaciones usar!
                attributes: ['id', 'name', 'logo', 'address'],
                through: { attributes: [] } 
            }]
        });

        if (!userWithFavorites) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json(userWithFavorites.favoriteSupermarkets || []);
        
    } catch (error) {
        console.error(error)
      return res
        .status(500)
        .json({ error: "Hubo un error al obtener tus favoritos" });
        
    }
  };

  // Agregar o quitar un supermercado de favoritos (Toggle)
  static toggleFavoriteSupermarket = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const supermarketId = parseInt(req.params.id as string, 10);

      // 1. Verificar que el supermercado realmente exista en la app
      const supermarket = await Supermarket.findByPk(supermarketId);
      if (!supermarket) {
        return res.status(404).json({ error: "El supermercado no existe" });
      }

      // 2. Revisar si ya está en la lista de favoritos de ese usuario
      const favoriteExists = await UserFavoriteSupermarket.findOne({
        where: { userId, supermarketId },
      });

      if (favoriteExists) {
        // Si existe, el usuario le dio click para quitarlo
        await favoriteExists.destroy();
        return res.status(200).json({
          message: "Supermercado eliminado de tus favoritos",
          isFavorite: false,
        });
      } else {
        // Si no existe, el usuario lo está agregando
        await UserFavoriteSupermarket.create({ userId, supermarketId });
        return res.status(201).json({
          message: "Supermercado añadido a tus favoritos",
          isFavorite: true,
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al procesar la acción de favoritos" });
    }
  };

  // ====================================================
  // 🏪 ENDPOINTS PARA LA APP DE SUPERMERCADOS (Protegidos)
  // ====================================================

  // Registrar el establecimiento comercial
  static create = async (req: Request, res: Response) => {
    try {
      const { name, address, logo } = req.body;

      // El id del usuario logueado viene inyectado desde tu middleware de auth
      const adminId = req.user.id;

      // Candado preventivo: Evitar que un mismo administrador registre más de una tienda
      const supermarketExists = await Supermarket.findOne({
        where: { userId: adminId },
      });
      if (supermarketExists) {
        return res
          .status(400)
          .json({
            error:
              "Este usuario ya tiene un supermercado asignado en el sistema",
          });
      }

      // Crear el supermercado amarrándolo a su dueño corporativo
      const supermarket = await Supermarket.create({
        name,
        address,
        logo,
        userId: adminId,
      });

      return res.status(201).json({
        message: "Establecimiento registrado con éxito en ExpressCart Business",
        supermarket,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al registrar el supermercado" });
    }
  };

  // Actualizar los datos comerciales de la sucursal
  static update = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const adminId = req.user.id;
      const { name, address, logo } = req.body;

      const supermarket = await Supermarket.findByPk(id);

      if (!supermarket) {
        return res.status(404).json({ error: "Supermercado no encontrado" });
      }

      // 🛡️ CONTROL MULTI-TENANT: Solo el dueño de esta sucursal puede editarla
      if (supermarket.userId !== adminId) {
        return res
          .status(403)
          .json({
            error:
              "Acceso denegado. No tienes permisos sobre este establecimiento.",
          });
      }

      // Aplicamos los cambios
      await supermarket.update({ name, address, logo });

      return res.status(200).json({
        message: "Datos del supermercado actualizados correctamente",
        supermarket,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al actualizar el supermercado" });
    }
  };
}
