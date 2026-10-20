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
        if (req.usuario?.rol === 'RECEPCIONISTA' && !dni) {
            return respuestaEstandar(res, 400, false, 'La recepción debe buscar pacientes por DNI');
        }
        const filtro: Record<string, unknown> = { activo: true };

        if (obraSocial) filtro['obraSocial.nombre'] = obraSocial.toUpperCase();
        if (dni) filtro.dni = dni;
        if (req.usuario?.rol === 'ADMIN' && req.query.dni) filtro.dni = req.query.dni;

        const pacientes = await Paciente.find(filtro);
        const respuesta = req.usuario?.rol === 'RECEPCIONISTA'
            ? pacientes.map((paciente) => ({
                id: paciente._id,
                nombre: paciente.nombre,
                dni: paciente.dni,
                telefono: paciente.telefono,
            }))
            : pacientes;
        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos ', respuesta);
    } catch (error: unknown) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', obtenerMensajeError(error));
    }
};

const getPacienteMe = async (req: Request, res: Response) => {
    try {
        const paciente = await Paciente.findById(req.usuario?.id);
        if (!paciente || !paciente.activo) return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        return respuestaEstandar(res, 200, true, 'Perfil obtenido exitosamente', paciente);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al obtener el perfil', obtenerMensajeError(error));
    }
};

const createPaciente = async (
    req: Request<unknown, unknown, ICrearPacienteDTO>,
    res: Response,
) => {
    try {
        const nuevoPaciente = await Paciente.create({ ...req.body, activo: true });
        return respuestaEstandar(res, 201, true, 'Paciente creado exitosamente', nuevoPaciente);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'El DNI o correo ya están registrados');
        }
        return respuestaEstandar(res, 500, false, 'Error al crear el paciente', obtenerMensajeError(error));
    }
};

const deletePaciente = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const pacienteBorrado = await Paciente.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });

        if (!pacienteBorrado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente dado de baja correctamente', pacienteBorrado);
    } catch (error: unknown) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el paciente', obtenerMensajeError(error));
    }
};

export { getPacientes, getPacienteMe, createPaciente, deletePaciente };