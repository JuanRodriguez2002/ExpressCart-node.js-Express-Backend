import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export const initSocket = (server: HTTPServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: '*', // En producción pon la URL de tu frontend/app
            methods: ['GET', 'POST', 'PATCH']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Dispositivo conectado al WebSocket: ${socket.id}`);

        // El frontend (app móvil) se unirá a una sala exclusiva con su ID de usuario
        socket.on('join_room', (userId: string) => {
            socket.join(`user_${userId}`);
            console.log(`👤 Usuario ${userId} se unió a su sala privada de notificaciones.`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Dispositivo desconectado: ${socket.id}`);
        });
    });

    return io;
};

// Esta función nos permitirá emitir eventos desde cualquier controlador (OrderController, DeliveryController, etc.)
export const getIO = (): SocketServer => {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado.');
    }
    return io;
};