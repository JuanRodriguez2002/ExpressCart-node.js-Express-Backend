import { Request, Response } from 'express';
import Address from '../models/Address';

export class AddressController {
    // Obtener todas las direcciones del usuario logueado
    static getAll = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const addresses = await Address.findAll({ where: { userId } });
            return res.status(200).json(addresses);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener las direcciones' });
        }
    };

    // Crear una nueva dirección
    static create = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const { fullAddress, references, isDefault } = req.body;

            // Si es marcada como predeterminada, quitamos el default a las anteriores
            if (isDefault) {
                await Address.update({ isDefault: false }, { where: { userId } });
            }

            const address = await Address.create({
                fullAddress,
                references,
                isDefault: isDefault || false,
                userId
            });

            return res.status(201).json({ message: 'Dirección guardada exitosamente', address });
        } catch (error) {
            return res.status(500).json({ error: 'Error al registrar la dirección' });
        }
    };

    // Actualizar una dirección
    static update = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { fullAddress, references, isDefault } = req.body;

            const address = await Address.findOne({ where: { id, userId } });
            if (!address) {
                return res.status(404).json({ error: 'Dirección no encontrada' });
            }

            if (isDefault) {
                await Address.update({ isDefault: false }, { where: { userId } });
            }

            await address.update({ fullAddress, references, isDefault });
            return res.status(200).json({ message: 'Dirección actualizada con éxito', address });
        } catch (error) {
            return res.status(500).json({ error: 'Error al actualizar la dirección' });
        }
    };

    // Eliminar una dirección
    static delete = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);

            const address = await Address.findOne({ where: { id, userId } });
            if (!address) {
                return res.status(404).json({ error: 'Dirección no encontrada o no te pertenece' });
            }

            await address.destroy();
            return res.status(200).json({ message: 'Dirección eliminada correctamente' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar la dirección' });
        }
    };
}