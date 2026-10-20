import type { Request, Response } from 'express';
import Paciente from '../pacientes/Paciente.model.js';
import type { IRegistrarIngresoDTO } from './dtos/Recepcion.schema.js';
import { crearReserva } from '../turnos/services/turnos.service.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';

const buscarPaciente = async (req: Request<unknown, unknown, unknown, { dni: string }>, res: Response) => {
    try {
        const paciente = await Paciente.findOne({ dni: req.query.dni, activo: true })
            .select('nombre dni telefono');
        if (!paciente) return respuestaEstandar(res, 404, false, 'No se encontró un paciente con ese DNI');
        return respuestaEstandar(res, 200, true, 'Paciente encontrado', paciente);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al buscar paciente', obtenerMensajeError(error));
    }
};

const registrarIngreso = async (req: Request<unknown, unknown, IRegistrarIngresoDTO>, res: Response) => {
    try {
        const paciente = await Paciente.findOne({ dni: req.body.dni, activo: true });
        if (!paciente) return respuestaEstandar(res, 404, false, 'No se encontró un paciente con ese DNI');

        const turno = await crearReserva({
            pacienteId: String(paciente._id),
            especialidadId: req.body.especialidadId,
            fecha: req.body.fechaHoraInicio.slice(0, 10),
            fechaHoraInicio: new Date(req.body.fechaHoraInicio),
            ...(req.body.medicoId ? { medicoId: req.body.medicoId } : {}),
            ...(req.body.consultorioId ? { consultorioId: req.body.consultorioId } : {}),
            ...(req.usuario?.id ? { creadoPor: req.usuario.id } : {}),
        });
        return respuestaEstandar(res, 201, true, 'Turno registrado por recepción', turno);
    } catch (error: unknown) {
        const codigoError = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        const esConflicto = error instanceof RangeError || codigoError === 11000 || codigoError === 112 || codigoError === 251;
        return respuestaEstandar(
            res,
            esConflicto ? 409 : 500,
            false,
            esConflicto ? 'No se pudo reservar el turno' : 'Error interno del servidor',
            obtenerMensajeError(error),
        );
    }
};

export { buscarPaciente, registrarIngreso };
