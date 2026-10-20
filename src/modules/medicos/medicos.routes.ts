import { Router } from 'express';
import { validarJWT } from '../../middlewares/validarJWT.middleware.js';
import { validarSchema } from '../../middlewares/validarDatos.middleware.js';
import { verificarRol } from '../../middlewares/verificarRol.middleware.js';
import { Rol } from '../auth/Usuario.model.js';
import {
    actualizarMedicoSchema,
    crearMedicoSchema,
    idMedicoSchema,
    queryMedicosSchema,
} from './dtos/Medico.schema.js';
import { createMedico, deleteMedico, getMedico, getMedicos, updateMedico } from './medicos.controller.js';

const router = Router();

router.use(validarJWT);
router.get('/', verificarRol(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.MEDICO, Rol.PACIENTE), validarSchema(queryMedicosSchema), getMedicos);
router.get('/:id', verificarRol(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.MEDICO, Rol.PACIENTE), validarSchema(idMedicoSchema), getMedico);
router.post('/', verificarRol(Rol.ADMIN), validarSchema(crearMedicoSchema), createMedico);
router.patch('/:id', verificarRol(Rol.ADMIN, Rol.MEDICO), validarSchema(actualizarMedicoSchema), updateMedico);
router.delete('/:id', verificarRol(Rol.ADMIN), validarSchema(idMedicoSchema), deleteMedico);

export default router;
