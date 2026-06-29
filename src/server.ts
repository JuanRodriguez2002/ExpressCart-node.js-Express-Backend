import express from 'express' 
import { createServer } from 'http'; // Nativo de Node
import { initSocket } from './config/io';
import colors from 'colors'
import morgan from 'morgan'
import {db} from './config/db'
import authRouter from './routes/authRoutes'
import SupermarketRoutes from './routes/supermarketRoutes'
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import profileRoutes from './routes/profileRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import { decryptPayload } from './middleware/decryptPayload';

async function connectDB() {
    try {
        await db.authenticate()
        await db.sync()
        console.log(colors.green.bold('Conexión a la base de datos exitosa'))
    }
    catch (error) {
        console.error(colors.red.bold('Error al conectar a la base de datos'))
    }
}

connectDB()
const app = express()


app.set('trust proxy', 1);

const httpServer = createServer(app);
initSocket(httpServer);


app.use(morgan('dev'))

app.use(express.json())
app.use(decryptPayload);

app.use('/api/auth', authRouter)
app.use('/api/supermarkets', SupermarketRoutes)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/favorites', favoriteRoutes)


const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app