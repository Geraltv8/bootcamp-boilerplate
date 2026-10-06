import { Router } from 'express';
import { validarJWT } from '../../middlewares/validarJWT.middleware';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { verificarRol } from '../../middlewares/verificarRol.middleware';
import { Rol } from '../auth/Usuario.model';
import {
    actualizarMedicoSchema,
    crearMedicoSchema,
    idMedicoSchema,
    queryMedicosSchema,
} from './dtos/Medico.schema';
import { createMedico, deleteMedico, getMedico, getMedicos, updateMedico } from './medicos.controller';

const router = Router();

router.use(validarJWT);
router.get('/', verificarRol(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.MEDICO), validarSchema(queryMedicosSchema), getMedicos);
router.get('/:id', verificarRol(Rol.RECEPCIONISTA, Rol.ADMIN, Rol.MEDICO), validarSchema(idMedicoSchema), getMedico);
router.post('/', verificarRol(Rol.ADMIN), validarSchema(crearMedicoSchema), createMedico);
router.patch('/:id', verificarRol(Rol.ADMIN, Rol.MEDICO), validarSchema(actualizarMedicoSchema), updateMedico);
router.delete('/:id', verificarRol(Rol.ADMIN), validarSchema(idMedicoSchema), deleteMedico);

export default router;
