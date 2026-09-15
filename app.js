"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv/config');
const cors = require('cors');
const express = require('express');
const connectDB = require('./src/config/database').default;
const auditMiddleware = require('./src/middlewares/auditoria.middleware').default;
const errorHandlerMiddleware = require('./src/middlewares/errorHandler.middleware').default;
const turnosRoutes = require('./src/routes/turnos.routes').default;
const pacientesRoutes = require('./src/modules/pacientes/pacientes.routes').default;
const recepcionRoutes = require('./src/modules/recepcion/recepcion.routes').default;
const app = express();
connectDB();
app.use(express.json());
app.use(auditMiddleware);
app.use(cors());
app.use('/api/v1/turnos', turnosRoutes);
app.use('/api/v1/pacientes', pacientesRoutes);
app.use('/api/v1/recepcion', recepcionRoutes);
app.use(errorHandlerMiddleware);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});
//# sourceMappingURL=app.js.map