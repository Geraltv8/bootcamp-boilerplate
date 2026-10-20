import { Router } from 'express';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';
import {
    actualizarEspecialidadSchema,
    crearEspecialidadSchema,
    idEspecialidadSchema,
    queryEspecialidadesSchema,
} from './dtos/Especialidad.schema.js';
import {
    createEspecialidad,
    deleteEspecialidad,
    getEspecialidad,
    getEspecialidades,
    updateEspecialidad,
} from './especialidades.controller.js';
import type { IQueryEspecialidades } from './dtos/Especialidad.schema.js';

const router = Router();

router.get(
    '/',
    validarJWT,
    verificarRol(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN),
    validarSchema(queryEspecialidadesSchema),
    getEspecialidades,
);
router.get('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(idEspecialidadSchema), getEspecialidad);
router.post('/', validarJWT, verificarRol(Rol.ADMIN), validarSchema(crearEspecialidadSchema), createEspecialidad);
router.patch('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(actualizarEspecialidadSchema), updateEspecialidad);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(idEspecialidadSchema), deleteEspecialidad);

export default router;
