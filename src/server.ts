import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import {db} from './config/db'
import authRouter from './routes/authRoutes'

async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.green.bold('Conexión a la base de datos exitosa'))
    }
    catch (error) {
        console.error(colors.red.bold('Error al conectar a la base de datos'))
    }
}

connectDB()
const app = express()

app.use(morgan('dev'))

app.use(express.json())


app.use('/api/auth', authRouter)
export default app