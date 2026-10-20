import { Router } from 'express';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';
import { actualizarAgendaSchema, crearAgendaSchema, listarAgendasSchema } from './dtos/Agenda.schema.js';
import { createAgenda, deleteAgenda, getAgendas, updateAgenda } from './agendas.controller.js';

const router = Router();

router.use(validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA));
router.get('/medicos/:medicoId/agendas', validarSchema(listarAgendasSchema), getAgendas);
router.post('/medicos/:medicoId/agendas', verificarRol(Rol.ADMIN), validarSchema(crearAgendaSchema), createAgenda);
router.patch('/:id', verificarRol(Rol.ADMIN), validarSchema(actualizarAgendaSchema), updateAgenda);
router.delete('/:id', verificarRol(Rol.ADMIN), validarSchema(actualizarAgendaSchema.pick({ params: true })), deleteAgenda);

export default router;
