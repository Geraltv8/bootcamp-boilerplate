import { Router } from 'express';
import { registrarIngreso } from './recepcion.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { registrarIngresoSchema } from './dtos/Recepcion.schema';

const router = Router();

router.post('/', validarSchema(registrarIngresoSchema), registrarIngreso);

export default router;