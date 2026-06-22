import { Request, Response } from 'express';
import { getIO } from '../config/io';
import Order from '../models/Order';
import Supermarket from '../models/Supermarket';
import Address from '../models/Address';
import User from '../models/User';
import UserContact from '../models/UserContact';

export class DeliveryController {

    // 🛵 1. Ver pedidos "en proceso" que están listos en los súper y no tienen repartidor
    static getAvailableOrders = async (req: Request, res: Response) => {
        try {
            const orders = await Order.findAll({
                where: {
                    status: 'en proceso',
                    deliveryId: null // Libres
                },
                include: [
                    { model: Supermarket, attributes: ['name', 'logo'] },
                    { model: Address, attributes: ['fullAddress', 'references'] }
                ],
                order: [['updatedAt', 'ASC']] // Las que tengan más tiempo esperando primero
            });

            return res.status(200).json(orders);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener pedidos disponibles' });
        }
    };

    // 🛵 2. Repartidor acepta el viaje (Se auto-asigna la orden)
    static acceptOrder = async (req: Request, res: Response) => {
        try {
            const deliveryId = req.user.id;
            const orderId = parseInt(req.params.id as string, 10);

            const order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ error: 'El pedido no existe' });
            }

            if (order.status !== 'en proceso' || order.deliveryId !== null) {
                return res.status(400).json({ error: 'Este pedido ya fue tomado por otro repartidor o no está listo' });
            }

            const driverInfo = await User.findByPk(deliveryId, { attributes: ['name'] });
            const driverName = driverInfo ? driverInfo.name : 'Un repartidor';
            // Asignamos el repartidor
            await order.update({ deliveryId });
            getIO().to(`user_${order.userId}`).emit('order_status_updated', {
                orderId: order.id,
                status: 'en proceso', // El estado sigue en proceso, pero ahora tiene chofer asignado
                message: `🛵 ¡Tu pedido ya tiene repartidor! ${driverName} ha aceptado tu orden y va al supermercado por ella.`
            });

            return res.status(200).json({
                message: '¡Pedido asignado! Pasa por el supermercado a recogerlo.',
                order
            });
        } catch (error) {
            return res.status(500).json({ error: 'Error al aceptar el pedido' });
        }
    };

    // 🛵 3. Cambiar estado a "en camino" (Cuando lo recoge en el Súper)
    static startDelivery = async (req: Request, res: Response) => {
        try {
            const deliveryId = req.user.id;
            const orderId = parseInt(req.params.id as string, 10);

            const order = await Order.findOne({ where: { id: orderId, deliveryId } });
            if (!order) {
                return res.status(404).json({ error: 'Pedido no encontrado o no estás asignado a él' });
            }

            if (order.status !== 'en proceso') {
                return res.status(400).json({ error: 'El pedido debe estar en proceso antes de salir en camino' });
            }

            await order.update({ status: 'en camino' });
            getIO().to(`user_${order.userId}`).emit('order_status_updated', {
                orderId: order.id,
                status: 'en camino',
                message: `🛵 ¡Tu pedido va en camino! El repartidor salió hacia tu dirección.`
            });

            return res.status(200).json({ message: 'El pedido ya va en camino a la casa del cliente' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al iniciar la ruta' });
        }
    };

    // 🛵 4. Cambiar estado a "completada" (Entrega exitosa)
    static completeDelivery = async (req: Request, res: Response) => {
        try {
            const deliveryId = req.user.id;
            const orderId = parseInt(req.params.id as string, 10);

            const order = await Order.findOne({ where: { id: orderId, deliveryId } });
            if (!order) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            if (order.status !== 'en camino') {
                return res.status(400).json({ error: 'No puedes completar un pedido que no esté en camino' });
            }

            await order.update({ status: 'completada' });
            getIO().to(`user_${order.userId}`).emit('order_status_updated', {
                orderId: order.id,
                status: 'completada',
                message: `🏁 ¡Tu pedido ha sido entregado! Gracias por comprar.`
            });

            return res.status(200).json({ message: '¡Entrega completada con éxito! Buen trabajo.' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al completar la entrega' });
        }
    };

    // 🛵 5. Ver las órdenes asignadas actualmente al repartidor (Su ruta activa)
    static getMyRoute = async (req: Request, res: Response) => {
        try {
            const deliveryId = req.user.id;
            const activeOrders = await Order.findAll({
                where: {
                    deliveryId,
                    status: ['en proceso', 'en camino'] // Lo que tiene pendiente de entrega
                },
                include: [
                    { model: Supermarket, attributes: ['name'] },
                    { model: Address, attributes: ['fullAddress', 'references'] },
                    {
                        model: User,
                        attributes: ['name'],
                        include: [{ model: UserContact, attributes: ['phoneNumber'] }]
                    }
                ]
            });
            return res.status(200).json(activeOrders);
        } catch (error) {
            return res.status(500).json({ error: 'Error al cargar tu ruta' });
        }
    };
}