import { Router } from 'express';
import { createPaciente, deletePaciente, getPacientes } from './pacientes.controller.js';
import { crearPacienteSchema } from './dtos/Paciente.schema.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';
import { getPacienteMe } from './pacientes.controller.js';
import { queryPacientesSchema, idPacienteSchema } from './dtos/Paciente.schema.js';

const router = Router();

router.get('/me', validarJWT, verificarRol(Rol.PACIENTE), getPacienteMe);
router.get('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(queryPacientesSchema), getPacientes);
router.post('/', validarJWT, verificarRol(Rol.ADMIN, Rol.RECEPCIONISTA), validarSchema(crearPacienteSchema), createPaciente);
router.delete('/:id', validarJWT, verificarRol(Rol.ADMIN), validarSchema(idPacienteSchema), deletePaciente);

export default router;