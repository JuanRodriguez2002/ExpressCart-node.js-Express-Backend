import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Supermarket from '../models/Supermarket';

export class ProductController {

    // ====================================================
    // 📱 APP DE CLIENTES (Público)
    // ====================================================

    // Listar productos filtrados por Supermercado (Agrupados por Categoría)
    static getProductsBySupermarket = async (req: Request, res: Response) => {
        try {
            const supermarketId = parseInt(req.params.supermarketId as string, 10);

            // Verificamos que el supermercado exista
            const supermarketExists = await Supermarket.findByPk(supermarketId);
            if (!supermarketExists) {
                return res.status(404).json({ error: 'El supermercado no existe' });
            }

            // Traemos las categorías de ese supermercado con sus respectivos productos
            const catalog = await Category.findAll({
                where: { supermarketId },
                attributes: ['id', 'name'],
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'price', 'description', 'image', 'stock']
                }]
            });

            return res.status(200).json(catalog);
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al obtener el catálogo de productos' });
        }
    };

    // ====================================================
    // 🏪 APP DE SUPERMERCADOS (Operaciones de Administración)
    // ====================================================

    // Crear un nuevo producto
    static createProduct = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const { name, price, description, image, stock, categoryId } = req.body;

            // 1. Validar que la categoría exista e incluir su supermercado
            const category = await Category.findByPk(categoryId, { include: [Supermarket] });
            if (!category) {
                return res.status(404).json({ error: 'La categoría seleccionada no existe' });
            }

            // 2. Candado de seguridad: Validar que el administrador sea dueño del supermercado de esa categoría
            if (category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. Esta categoría pertenece a otro establecimiento.' });
            }

            // 3. Crear el producto
            const product = await Product.create({
                name,
                price,
                description,
                image,
                stock,
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

    // Actualizar un producto existente
    static updateProduct = async (req: Request, res: Response) => {
        try {
            const adminId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { name, price, description, image, stock, categoryId } = req.body;

            // 1. Buscar el producto e incluir la categoría y el supermercado para validar pertenencia
            const product = await Product.findByPk(id, {
                include: [{
                    model: Category,
                    include: [Supermarket]
                }]
            });

            if (!product) {
                return res.status(404).json({ error: 'El producto no existe' });
            }

            // 2. Validar que el admin logueado sea el dueño del negocio
            if (product.category.supermarket.userId !== adminId) {
                return res.status(403).json({ error: 'Acceso denegado. No tienes permisos sobre este producto.' });
            }

            // 3. Si intentan cambiar el producto de categoría, validamos que la nueva categoría también sea suya
            if (categoryId && categoryId !== product.categoryId) {
                const newCategory = await Category.findByPk(categoryId, { include: [Supermarket] });
                if (!newCategory || newCategory.supermarket.userId !== adminId) {
                    return res.status(400).json({ error: 'La nueva categoría no es válida o no te pertenece' });
                }
            }

            // 4. Actualizar los datos
            await product.update({ name, price, description, image, stock, categoryId });

            return res.status(200).json({
                message: 'Producto actualizado con éxito',
                product
            });
        } catch (error) {
            return res.status(500).json({ error: 'Hubo un error al actualizar el producto' });
        }
    };

    // Eliminar un producto
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

            // 🛡️ Seguridad: Evitar que borren productos ajenos
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