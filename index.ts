import 'dotenv/config';
import app from './app.js'
import { connectDB } from './src/config/database.js';

const PORT: string | number = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`===============================================`);
        console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
        console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
        console.log(`===============================================`);
    });
});
