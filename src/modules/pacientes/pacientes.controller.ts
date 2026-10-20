import type { Request, Response } from 'express';
import Paciente from './Paciente.model.js';
import type { ICrearPacienteDTO, IQueryPacientes } from './dtos/Paciente.schema.js';
import { respuestaEstandar } from '../../utils/respuestaEstandar.js';
import { obtenerMensajeError } from '../../utils/obtenerMensajeError.js';

const getPacientes = async (
    req: Request<unknown, unknown, unknown, IQueryPacientes>,
    res: Response,
) => {
    try {
        const { obraSocial, dni } = req.query;
        const filtro: Record<string, string> = {};

        if (obraSocial) filtro['obraSocial.nombre'] = obraSocial.toUpperCase();
        if (dni) filtro.dni = dni;

        const pacientes = await Paciente.find(filtro);
        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos ', pacientes);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', obtenerMensajeError(error));
    }
};

const createPaciente = async (
    req: Request<unknown, unknown, ICrearPacienteDTO>,
    res: Response,
) => {
    try {
        const nuevoPaciente = await Paciente.create(req.body);
        return respuestaEstandar(res, 201, true, 'Paciente creado exitosamente', nuevoPaciente);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al crear el paciente', obtenerMensajeError(error));
    }
};

const deletePaciente = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const pacienteBorrado = await Paciente.findByIdAndDelete(req.params.id);

        if (!pacienteBorrado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente eliminado correctamente', pacienteBorrado);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el paciente', obtenerMensajeError(error));
    }
};

export { getPacientes, createPaciente, deletePaciente };