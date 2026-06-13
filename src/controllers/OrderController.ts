import { Request, Response } from "express";
import { getIO } from '../config/io';
import { db } from "../config/db"; // Asegúrate de importar tu instancia configurada de Sequelize
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import Product from "../models/Product";
import Address from "../models/Address";
import PaymentMethod from "../models/PaymentMethod";
import UserContact from "../models/UserContact";
import Supermarket from "../models/Supermarket";
import User from "../models/User";

export class OrderController {
  // ====================================================
  // 🛒 FLUJO DE COMPRA (Clientes)
  // ====================================================

  static createOrder = async (req: Request, res: Response) => {
    // Iniciamos una transacción gestionada
    const t = await db.transaction();

    try {
      const userId = req.user.id;
      const {
        supermarketId,
        addressId,
        paymentMethodId,
        products, // Array de objetos: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }]
      } = req.body;

      // 1. Validaciones básicas de existencia de datos de entrega y pago
      const address = await Address.findOne({
        where: { id: addressId, userId },
        transaction: t,
      });
      if (!address) {
        await t.rollback();
        return res
          .status(404)
          .json({
            error:
              "La dirección de envío seleccionada no es válida o no te pertenece",
          });
      }

      const paymentMethod = await PaymentMethod.findOne({
        where: { id: paymentMethodId, userId },
        transaction: t,
      });
      if (!paymentMethod) {
        await t.rollback();
        return res
          .status(404)
          .json({
            error:
              "El método de pago seleccionado no es válido o no te pertenece",
          });
      }

      if (!products || products.length === 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "El carrito de compras no puede estar vacío" });
      }

      let calculatedTotal = 0;
      const productsToUpdate = [];
      const orderProductsData = [];

      // 2. Procesar y verificar stock y precios reales de cada producto
      for (const item of products) {
        const dbProduct = await Product.findByPk(item.id, { transaction: t });

        if (!dbProduct) {
          await t.rollback();
          return res
            .status(404)
            .json({
              error: `El producto con ID ${item.id} no existe en el catálogo`,
            });
        }

        // Verificar que pertenezca al supermercado seleccionado indirectamente mediante su categoría
        // (Opcional, pero ideal para blindar consistencia si las categorías están asociadas al supermercado)

        // Validar Stock disponible
        if (dbProduct.stock < item.quantity) {
          await t.rollback();
          return res
            .status(400)
            .json({
              error: `Stock insuficiente para: ${dbProduct.name}. Disponibles: ${dbProduct.stock}`,
            });
        }

        // Acumular total del pedido
        const subtotal = Number(dbProduct.price) * item.quantity;
        calculatedTotal += subtotal;

        // Preparar datos para actualización de stock diferida
        productsToUpdate.push({
          productInstance: dbProduct,
          newStock: dbProduct.stock - item.quantity,
        });

        // Preparar datos para la tabla intermedia
        orderProductsData.push({
          productId: dbProduct.id,
          quantity: item.quantity,
          priceAtPurchase: dbProduct.price,
        });
      }

      // 3. Crear la Orden Maestro con el estado inicial "activa"
      const order = await Order.create(
        {
          total: calculatedTotal,
          status: "activa",
          userId,
          supermarketId,
          addressId,
          paymentMethodId,
        },
        { transaction: t },
      );

      // 4. Poblar la tabla pivote de productos vinculados e inyectar el orderId
      const bulkOrderProducts = orderProductsData.map((p) => ({
        ...p,
        orderId: order.id,
      }));
      await OrderProduct.bulkCreate(bulkOrderProducts, { transaction: t });

      // 5. Descontar el stock real del inventario comercial
      for (const item of productsToUpdate) {
        await item.productInstance.update(
          { stock: item.newStock },
          { transaction: t },
        );
      }

      // Si todo salió a pedir de boca, consolidamos los cambios en MySQL
      await t.commit();

      return res.status(201).json({
        message: "¡Pedido generado con éxito!",
        orderId: order.id,
        total: calculatedTotal,
        status: order.status,
      });
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res
        .status(500)
        .json({ error: "Hubo un error crítico al procesar tu pedido" });
    }
  };

  // ====================================================
  // 📈 HISTORIALES Y MONITOREO
  // ====================================================

  // Ver órdenes del cliente autenticado
  static getClientHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { status } = req.query; // Captura ?status=activa o ?status=completada

      // Construimos la condición base: siempre deben ser las órdenes de este usuario
      const whereCondition: any = { userId };

      // Si el cliente pasa un filtro de estado por la URL, se lo agregamos a la consulta
      if (status) {
        whereCondition.status = status.toString();
      }

      const orders = await Order.findAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]], // Las más recientes primero
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price"],
            through: { attributes: ["quantity", "priceAtPurchase"] }, // Datos de la tabla intermedia
          },
          {
            model: Address,
            attributes: ["fullAddress", "references"],
          },
          {
            model: PaymentMethod,
            attributes: ["provider"],
          },
        ],
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error al obtener el historial del cliente" });
    }
  };

  // Ver órdenes destinadas al Supermercado administrador logueado
  static getSupermarketHistory = async (req: Request, res: Response) => {
    try {
      // Nota: Asumo que en tu middleware de autenticación, si el usuario es un administrador
      // de supermercado, guardas su id de negocio en req.user.supermarketId
      const supermarketId = req.user.id;
      const { status } = req.query;

      if (!supermarketId) {
        return res
          .status(403)
          .json({ error: "No tienes un supermercado asociado a esta cuenta" });
      }

      const whereCondition: any = { supermarketId };

      if (status) {
        whereCondition.status = status.toString();
      }

      const orders = await Order.findAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]], // Las nuevas arriba para que las despachen rápido
        include: [
          {
            model: Product,
            attributes: ["id", "name"],
            through: { attributes: ["quantity", "priceAtPurchase"] },
          },
          {
            model: Address,
            attributes: ["fullAddress", "references"],
          },
          {
            model: User,
            attributes: ["id", "name", "email"],
            include: [
              {
                model: UserContact,
                attributes: ["phoneNumber", "type"],
              },
            ],
          },
        ],
      });

      return res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Error al obtener el historial del supermercado" });
    }
  };

  // ====================================================
  // ⚙️ GESTIÓN DE ESTADOS (Cambiar Status de Orden)
  // ====================================================

  static updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { status } = req.body; // 'activa' | 'en proceso' | 'completada' | 'cancelada'
      const userRole = req.user.role;
      const userId = req.user.id;

      const order = await Order.findByPk(id, { include: [Supermarket] });
      if (!order) {
        return res.status(404).json({ error: "El pedido no existe" });
      }

      // 🛡️ Reglas de Validación de Negocio para el cambio de Estado
      if (userRole === "client") {
        // Un cliente normal SOLO puede cancelar su propia orden si todavía está "activa"
        if (order.userId !== userId) {
          return res.status(403).json({ error: "Acceso denegado" });
        }
        if (status !== "cancelada") {
          return res
            .status(400)
            .json({
              error:
                "Como cliente únicamente tienes autorización para cancelar el pedido",
            });
        }
        if (order.status !== "activa") {
          return res
            .status(400)
            .json({
              error:
                "No puedes cancelar el pedido porque ya entró en proceso de despacho",
            });
        }
      }

      if (userRole === "supermarket_admin") {
        // El administrador de la tienda controla los estados operativos de sus órdenes asignadas
        if (order.supermarket.userId !== userId) {
          return res
            .status(403)
            .json({
              error: "Este pedido pertenece a otro supermercado corporativo",
            });
        }
      }

      // Aplicamos la actualización del Enum de estado
      await order.update({ status });
      const io = getIO();
      io.to(`user_${order.userId}`).emit('order_status_updated', {
          orderId: order.id,
          status: status,
          message: `¡Tu pedido ha sido aceptado y ya está en proceso de preparación!`
      });
      return res.status(200).json({
        message: `El pedido cambió exitosamente al estado: ${status}`,
        orderId: order.id,
        currentStatus: order.status,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Hubo un error al actualizar el estado del pedido" });
    }
  };

  // ====================================================
  // ⚙️ obtener orden por id
  // ====================================================

  static getOrderById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const userId = req.user.id;
      const userRole = req.user.role;
      const supermarketId = req.user.id; // ID del súper asociado al admin corporativo

      // Buscamos la orden con absolutamente toda su radiografía de datos
      const order = await Order.findByPk(id, {
        include: [
          {
            model: Product,
            attributes: ["id", "name", "image", "description"],
            through: { attributes: ["quantity", "priceAtPurchase"] }, // Precios históricos congelados
          },
          {
            model: Address,
            attributes: ["id", "fullAddress", "references", "isDefault"],
          },
          {
            model: PaymentMethod,
            attributes: ["id", "provider", "lastFourDigits"],
          },
          {
            model: Supermarket,
            attributes: ["id", "name", "logo"],
          },
          {
            // Triangulación para sacar los datos de contacto del comprador
            model: User,
            attributes: ["id", "name", "email"],
            include: [
              {
                model: UserContact,
                attributes: ["phoneNumber", "type"],
              },
            ],
          },
        ],
      });

      if (!order) {
        return res
          .status(404)
          .json({ error: "El pedido solicitado no existe" });
      }

      // 🛡️ CONTROL DE SEGURIDAD MULTI-TENANT:
      if (userRole === "client" && order.userId !== userId) {
        // Un cliente no puede ver facturas de otros clientes
        return res
          .status(403)
          .json({
            error: "Acceso denegado. No tienes permisos para ver este pedido.",
          });
      }

      if (
        userRole === "supermarket_admin" &&
        order.supermarketId !== supermarketId
      ) {
        // Un administrador de supermercado no puede husmear pedidos de la competencia
        return res
          .status(403)
          .json({
            error: "Acceso denegado. Este pedido pertenece a otra sucursal.",
          });
      }

      // Si pasó los candados, despachamos el detalle completo
      return res.status(200).json(order);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Hubo un error al recuperar el detalle de la orden" });
    }
  };
}
