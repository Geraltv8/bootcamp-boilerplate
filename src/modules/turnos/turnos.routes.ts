import { Router } from 'express';
import {
    actualizarEstadoTurno,
    cancelarTurno,
    createTurno,
    desactivarTurno,
    getDisponibilidad,
    getMisTurnos,
    getTurno,
    getTurnos,
} from './turnos.controller.js';
import {
    ActualizarEstadoTurnoSchema,
    CrearTurnoSchema,
    crearCancelacionSchema,
    idTurnoSchema,
    queryDisponibilidadSchema,
    queryTurnosSchema,
} from './dtos/turno.schema.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';

const router = Router();

router.get('/disponibilidad', validarSchema(queryDisponibilidadSchema), getDisponibilidad);
router.get('/me', validarJWT, verificarRol(Rol.PACIENTE), getMisTurnos);
router.get('/', validarJWT, verificarRol(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN), validarSchema(queryTurnosSchema), getTurnos);
router.get('/:id', validarJWT, verificarRol(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN), validarSchema(idTurnoSchema), getTurno);
router.post('/', validarJWT, verificarRol(Rol.PACIENTE), validarSchema(CrearTurnoSchema), createTurno);
router.patch('/:id/cancelacion', validarJWT, verificarRol(Rol.PACIENTE, Rol.RECEPCIONISTA, Rol.ADMIN), validarSchema(crearCancelacionSchema), cancelarTurno);
router.patch('/:id/estado', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(ActualizarEstadoTurnoSchema), actualizarEstadoTurno);
router.patch('/:id', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(ActualizarEstadoTurnoSchema), actualizarEstadoTurno);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(idTurnoSchema), desactivarTurno);

export default router;
