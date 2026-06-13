import { Request, Response } from 'express';
import UserContact from '../models/UserContact';

export class UserContactController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const contacts = await UserContact.findAll({ where: { userId } });
            return res.status(200).json(contacts);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener los contactos' });
        }
    };

    static create = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const { phoneNumber, type } = req.body;

            const contact = await UserContact.create({
                phoneNumber,
                type,
                userId
            });

            return res.status(201).json({ message: 'Contacto agregado con éxito', contact });
        } catch (error) {
            return res.status(500).json({ error: 'Error al guardar el contacto' });
        }
    };

    static update = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);
            const { phoneNumber, type } = req.body;

            const contact = await UserContact.findOne({ where: { id, userId } });
            if (!contact) {
                return res.status(404).json({ error: 'Contacto no encontrado' });
            }

            await contact.update({ phoneNumber, type });
            return res.status(200).json({ message: 'Contacto actualizado', contact });
        } catch (error) {
            return res.status(500).json({ error: 'Error al actualizar el contacto' });
        }
    };

    static delete = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id as string, 10);

            const contact = await UserContact.findOne({ where: { id, userId } });
            if (!contact) {
                return res.status(404).json({ error: 'Contacto no encontrado' });
            }

            await contact.destroy();
            return res.status(200).json({ message: 'Contacto eliminado correctamente' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar el contacto' });
        }
    };
}