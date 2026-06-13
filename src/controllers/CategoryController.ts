import { Request, Response } from 'express';
import Category from '../models/Category';
import Supermarket from '../models/Supermarket';

export class CategoryController {

    // ====================================================
    // 📱 APP DE CLIENTES (Público)
    // ====================================================

    // Obtener las categorías de un supermercado específico
    static getCategoriesBySupermarket = async (req: Request, res: Response) => {
        try {
            const supermarketId = parseInt(req.params.supermarketId as string, 10);

            const categories = await Category.findAll({
                where: { supermarketId },
                attributes: ['id', 'name']
            });

            return res.status(200).json(categories);
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al obtener las categorías' });
        }
    };

    // ====================================================
    // 🏪 APP DE SUPERMERCADOS (Operaciones de Administración)
    // ====================================================

    // Crear una nueva categoría
    static createCategory = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const { name, supermarketId } = req.body;

            // 1. Validar que el supermercado exista
            const supermarket = await Supermarket.findByPk(supermarketId);
            if (!supermarket) {
                return res.status(404).json({ error: 'El supermercado especificado no existe' });
            }

            // 2. 🛡️ Candado Multi-tenant: Validar que el admin logueado sea el dueño de ese supermercado
            if (supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No eres el dueño de este establecimiento.' });
            }

            // 3. Crear la categoría
            const category = await Category.create({
                name,
                supermarketId
            });

            return res.status(201).json({
                message: 'Categoría creada con éxito',
                category
            });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al crear la categoría' });
        }
    };

    // Actualizar una categoría existente
    static updateCategory = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { name } = req.body;

            const category = await Category.findByPk(id, { include: [Supermarket] });
            if (!category) {
                return res.status(404).json({ error: 'La categoría no existe' });
            }

            // 🛡️ Validar propiedad del negocio
            if (category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes permisos sobre esta categoría.' });
            }

            await category.update({ name });

            return res.status(200).json({
                message: 'Categoría actualizada con éxito',
                category
            });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al actualizar la categoría' });
        }
    };

    // Eliminar una categoría
    static deleteCategory = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const id = parseInt(req.params.id as string, 10);

            const category = await Category.findByPk(id, { include: [Supermarket] });
            if (!category) {
                return res.status(404).json({ error: 'La categoría no existe' });
            }

            // 🛡️ Validar propiedad del negocio
            if (category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes permisos para eliminar esta categoría.' });
            }

            // Nota: Al eliminar la categoría, dependiendo de tu BD, los productos asociados podrían quedar huérfanos o borrarse en cascada.
            await category.destroy();

            return res.status(200).json({ message: 'Categoría eliminada correctamente' });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al intentar eliminar la categoría' });
        }
    };
}