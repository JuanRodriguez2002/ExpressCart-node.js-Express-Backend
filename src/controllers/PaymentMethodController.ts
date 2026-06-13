import { Request, Response } from 'express';
import PaymentMethod from '../models/PaymentMethod';

export class PaymentMethodController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const methods = await PaymentMethod.findAll({ where: { userId } });
            return res.status(200).json(methods);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener los métodos de pago' });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const { provider, lastFourDigits, paymentToken } = req.body;

            const paymentMethod = await PaymentMethod.create({
                provider,
                lastFourDigits,
                paymentToken,
                userId
            });

            return res.status(201).json({ message: 'Método de pago registrado', paymentMethod });
        } catch (error) {
            return res.status(500).json({ error: 'Error al registrar el método de pago' });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { provider, lastFourDigits } = req.body;

            const method = await PaymentMethod.findOne({ where: { id, userId } });
            if (!method) {
                return res.status(404).json({ error: 'Método de pago no encontrado' });
            }

            await method.update({ provider, lastFourDigits });
            return res.status(200).json({ message: 'Método de pago actualizado', method });
        } catch (error) {
            return res.status(500).json({ error: 'Error al actualizar el método de pago' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);

            const method = await PaymentMethod.findOne({ where: { id, userId } });
            if (!method) {
                return res.status(404).json({ error: 'Método de pago no encontrado' });
            }

            await method.destroy();
            return res.status(200).json({ message: 'Método de pago eliminado' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar el método de pago' });
        }
    };
}