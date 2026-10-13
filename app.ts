import type { Application } from 'express';

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDB } from './src/config/database.js';

import auditMiddleware from './src/middlewares/auditoria.middleware.js';
import errorHandlerMiddleware from './src/middlewares/errorHandler.middleware.js';

import turnosRoutes from './src/modules/turnos/turnos.routes.js';
import pacientesRoutes from './src/modules/pacientes/pacientes.routes.js';
import recepcionRoutes from './src/modules/recepcion/recepcion.routes.js';
import consultorioRoutes from './src/modules/consultorio/consultorio.routes.js';
import medicosRoutes from './src/modules/medicos/medicos.routes.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import iaRoutes from './src/modules/ia/ia.routes.js';

const app: Application = express();

connectDB();

app.use(express.json());
app.use(auditMiddleware);
app.use(cors());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/turnos', turnosRoutes);
app.use('/api/v1/pacientes', pacientesRoutes);
app.use('/api/v1/recepcion', recepcionRoutes);
app.use('/api/v1/consultorio', consultorioRoutes);
app.use('/api/v1/medicos', medicosRoutes);
app.use('/api/v1/ia', iaRoutes);

app.use(errorHandlerMiddleware);

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});