import { Sequelize} from 'sequelize-typescript'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en el archivo .env');
}
export const db = new Sequelize(process.env.DATABASE_URL, {
    models: [__dirname + '/../models/**/*'],
    logging: false,
    
    // 1. OBLIGA A SEQUELIZE-TYPESCRIPT A CONECTARSE AL ESQUEMA PUBLIC
    schema: 'public', 

    dialectOptions: {
        ssl: {
            require: true,                   // Supabase exige SSL
            rejectUnauthorized: false        // Permite la conexión desde tu PC local
        },
        // 2. EL TRUCO: Inyecta el camino de búsqueda en la sesión de la URL
        options: '-c search_path=public' 
    }
});