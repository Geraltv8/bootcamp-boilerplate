import { Router } from 'express';
import { createConsultorio, deleteConsultorio, getConsultorios, updateConsultorio } from './consultorio.controller.js';
import { actualizarConsultorioSchema, crearConsultorioSchema, idConsultorioSchema, queryConsultoriosSchema } from './dtos/Consultorio.schema.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';

const router = Router();

router.get(
    '/',
    validarJWT,
    verificarRol(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN),
    validarSchema(queryConsultoriosSchema),
    getConsultorios,
);
router.post('/', validarJWT, verificarRol(Rol.ADMIN), validarSchema(crearConsultorioSchema), createConsultorio);
router.patch('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(actualizarConsultorioSchema), updateConsultorio);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(idConsultorioSchema), deleteConsultorio);

export default router;
