import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import Medico from './Medico.model';
import Usuario, { Rol } from '../auth/Usuario.model';
import Turno from '../turnos/Turno.model';
import { EstadoTurno } from '../turnos/types/TurnoEstado.enum';
import type { IActualizarMedicoDTO, ICrearMedicoDTO, IQueryMedicos } from './dtos/Medico.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';

const getMedicos = async (req: Request<unknown, unknown, unknown, IQueryMedicos>, res: Response) => {
    try {
        const { especialidad, activo, busqueda } = req.query;
        const filtro: Record<string, unknown> = {};

        if (especialidad) filtro.especialidades = especialidad;
        if (activo !== undefined) filtro.activo = activo === 'true';
        if (busqueda) {
            const busquedaEscapada = busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const coincidencia = new RegExp(busquedaEscapada, 'i');
            filtro.$or = [{ nombre: coincidencia }, { apellido: coincidencia }];
        }

        const medicos = await Medico.find(filtro).populate('usuarioId', 'email');
        return respuestaEstandar(res, 200, true, 'Médicos obtenidos exitosamente', medicos);
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : 'Error al obtener los médicos';
        return respuestaEstandar(res, 500, false, 'Error al obtener los médicos', mensaje);
    }
};

const getMedico = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const medico = await Medico.findById(req.params.id).populate('usuarioId', 'email');
        if (!medico) return respuestaEstandar(res, 404, false, 'Médico no encontrado');

        return respuestaEstandar(res, 200, true, 'Médico obtenido exitosamente', medico);
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : 'Error al obtener el médico';
        return respuestaEstandar(res, 500, false, 'Error al obtener el médico', mensaje);
    }
};

const createMedico = async (req: Request<unknown, unknown, ICrearMedicoDTO>, res: Response) => {
    try {
        const usuario = await Usuario.findById(req.body.usuarioId);
        if (!usuario || usuario.rol !== Rol.MEDICO) {
            return respuestaEstandar(res, 400, false, 'La cuenta indicada no existe o no tiene el rol de médico');
        }

        const medicoExistente = await Medico.findOne({
            $or: [{ matricula: req.body.matricula }, { usuarioId: req.body.usuarioId }],
        });
        if (medicoExistente) {
            return respuestaEstandar(res, 409, false, 'La matrícula o la cuenta de usuario ya están registradas');
        }

        const medico = await Medico.create(req.body);
        const medicoCompleto = await medico.populate('usuarioId', 'email');
        return respuestaEstandar(res, 201, true, 'Médico creado exitosamente', medicoCompleto);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'La matrícula o la cuenta de usuario ya están registradas');
        }

        const mensaje = error instanceof Error ? error.message : 'Error al crear el médico';
        return respuestaEstandar(res, 500, false, 'Error al crear el médico', mensaje);
    }
};

const updateMedico = async (
    req: Request<{ id: string }, unknown, IActualizarMedicoDTO>,
    res: Response,
) => {
    try {
        const esAdmin = req.usuario?.rol === Rol.ADMIN;
        const esMedico = req.usuario?.rol === Rol.MEDICO;
        const camposEnviados = Object.keys(req.body);

        if (!esAdmin && (!esMedico || camposEnviados.some((campo) => campo !== 'telefono'))) {
            return respuestaEstandar(res, 403, false, 'Los médicos solo pueden actualizar su propio teléfono');
        }

        if (esAdmin && req.body.usuarioId) {
            const usuario = await Usuario.findById(req.body.usuarioId);
            if (!usuario || usuario.rol !== Rol.MEDICO) {
                return respuestaEstandar(res, 400, false, 'La cuenta indicada no existe o no tiene el rol de médico');
            }

            const otroMedico = await Medico.findOne({
                usuarioId: req.body.usuarioId,
                _id: { $ne: req.params.id },
            });
            if (otroMedico) {
                return respuestaEstandar(res, 409, false, 'La cuenta de usuario ya está asignada a otro médico');
            }
        }

        const filtro = esAdmin
            ? { _id: req.params.id }
            : { _id: req.params.id, usuarioId: new Types.ObjectId(req.usuario?.id) };
        const datosActualizados: IActualizarMedicoDTO = esAdmin
            ? req.body
            : { telefono: req.body.telefono };

        const medico = await Medico.findOneAndUpdate(filtro, datosActualizados, {
            new: true,
            runValidators: true,
        }).populate('usuarioId', 'email');

        if (!medico) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
        return respuestaEstandar(res, 200, true, 'Médico actualizado exitosamente', medico);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
            return respuestaEstandar(res, 409, false, 'La matrícula o la cuenta de usuario ya están registradas');
        }

        const mensaje = error instanceof Error ? error.message : 'Error al actualizar el médico';
        return respuestaEstandar(res, 400, false, 'Error al actualizar el médico', mensaje);
    }
};

const deleteMedico = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const medico = await Medico.findById(req.params.id);
        if (!medico) return respuestaEstandar(res, 404, false, 'Médico no encontrado');

        const turnoPendiente = await Turno.exists({
            medicoId: medico._id,
            estado: EstadoTurno.PENDIENTE,
            fechaTurno: { $gt: new Date() },
            activo: true,
        });

        if (turnoPendiente) {
            return respuestaEstandar(
                res,
                400,
                false,
                'No se puede desactivar el médico mientras tenga turnos pendientes futuros; reasigne o cancele los turnos primero',
            );
        }

        medico.activo = false;
        await medico.save();
        return respuestaEstandar(res, 200, true, 'Médico desactivado exitosamente', medico);
    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : 'Error al desactivar el médico';
        return respuestaEstandar(res, 400, false, 'Error al desactivar el médico', mensaje);
    }
};

export { getMedicos, getMedico, createMedico, updateMedico, deleteMedico };
