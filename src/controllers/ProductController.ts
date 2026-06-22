// src/controllers/ProductController.ts
import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Supermarket from '../models/Supermarket';

export class ProductController {

    // ====================================================
    // 📱 APP DE CLIENTES (Público)
    // ====================================================

    static getProductsBySupermarketAndCategory = async (req: Request, res: Response) => {
        try {
            const supermarketId = parseInt(req.params.supermarketId as string, 10);
            const categoryId = parseInt(req.params.categoryId as string, 10);

            const supermarketExists = await Supermarket.findByPk(supermarketId);
            if (!supermarketExists) {
                return res.status(404).json({ error: 'El supermercado no existe' });
            }

            const categoryExists = await Category.findOne({
                where: { id: categoryId, supermarketId }
            });
            if (!categoryExists) {
                return res.status(404).json({ error: 'La categoría no existe en este supermercado' });
            }

            // Agregamos 'unitType' a los atributos devueltos
            const products = await Product.findAll({
                where: { categoryId },
                attributes: ['id', 'name', 'price', 'description', 'image', 'stock', 'unitType']
            });

            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al obtener la lista de productos' });
        }
    };

    // ====================================================
    // 🏪 APP DE SUPERMERCADOS (Operaciones de Administración)
    // ====================================================

    static createProduct = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            // Recuperamos el unitType enviado desde el panel de administración
            const { name, price, description, image, stock, unitType, categoryId } = req.body;

            const category = await Category.findByPk(categoryId, { include: [Supermarket] });
            if (!category) {
                return res.status(404).json({ error: 'La categoría seleccionada no existe' });
            }

            if (category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. Esta categoría pertenece a otro establecimiento.' });
            }

            const product = await Product.create({
                name,
                price,
                description,
                image,
                stock,
                unitType, // Almacenado de forma nativa
                categoryId
            });

            return res.status(201).json({
                message: 'Producto creado exitosamente en tu catálogo',
                product
            });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al registrar el producto' });
        }
    };

    static updateProduct = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { name, price, description, image, stock, unitType, categoryId } = req.body;

            const product = await Product.findByPk(id, {
                include: [{
                    model: Category,
                    include: [Supermarket]
                }]
            });

            if (!product) {
                return res.status(404).json({ error: 'El producto no existe' });
            }

            if (product.category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes permisos sobre este producto.' });
            }

            if (categoryId && categoryId !== product.categoryId) {
                const newCategory = await Category.findByPk(categoryId, { include: [Supermarket] });
                if (!newCategory || newCategory.supermarket.userId !== adminId) {
                    return res.status(400).json({ error: 'La nueva categoría no es válida o no te pertenece' });
                }
            }

            // Actualizamos los datos incluyendo el tipo de unidad
            await product.update({ name, price, description, image, stock, unitType, categoryId });

            return res.status(200).json({
                message: 'Producto actualizado con éxito',
                product
            });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al actualizar el producto' });
        }
    };

    static deleteProduct = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const id = parseInt(req.params.id as string, 10);

            const product = await Product.findByPk(id, {
                include: [{
                    model: Category,
                    include: [Supermarket]
                }]
            });

            if (!product) {
                return res.status(404).json({ error: 'El producto no existe' });
            }

            if (product.category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes permisos para eliminar este producto.' });
            }

            await product.destroy();
            return res.status(200).json({ message: 'Producto eliminado correctamente del inventario' });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al intentar eliminar el producto' });
        }
    };
}