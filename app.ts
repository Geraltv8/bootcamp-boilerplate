import type { Application } from 'express';

import * as dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import express from 'express';
import { connectDB } from './src/config/database';

const auditMiddleware = require('./src/middlewares/auditoria.middleware').default;
const errorHandlerMiddleware = require('./src/middlewares/errorHandler.middleware').default;

import turnosRoutes from './src/modules/turnos/turnos.routes';
import pacientesRoutes from './src/modules/pacientes/pacientes.routes';
import recepcionRoutes from './src/modules/recepcion/recepcion.routes';

const app: Application = express();

connectDB();

app.use(express.json());
app.use(auditMiddleware);
app.use(cors());

app.use('/api/v1/turnos', turnosRoutes);
app.use('/api/v1/pacientes', pacientesRoutes);
app.use('/api/v1/recepcion', recepcionRoutes);

app.use(errorHandlerMiddleware);

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});