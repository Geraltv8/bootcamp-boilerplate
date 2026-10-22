import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.DATABASE_URL_ATLAS || process.env.MONGO_URI;

const resetDatabase = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('Configurá DATABASE_URL_ATLAS para indicar la base de datos que se va a limpiar.');
        }

        await mongoose.connect(MONGO_URI);
        console.log('☢️ ADVERTENCIA: Borrando TODA la base de datos...');
        
        await mongoose.connection.dropDatabase();
        
        console.log('✅ Base de datos eliminada. Entorno limpio.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al limpiar:', error);
        process.exit(1);
    }
};

resetDatabase();