import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Paciente from '../pacientes/Paciente.model.js';
import Turno from '../turnos/Turno.model.js';
import type { IRegistrarIngresoDTO } from './dtos/Recepcion.schema.js';
import { EstadoTurno } from '../turnos/types/TurnoEstado.enum.js';

import { respuestaEstandar } from '../../utils/respuestaEstandar.js';

const registrarIngreso = async (req: Request<unknown, unknown, IRegistrarIngresoDTO>, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { datosPaciente, especialidad, fechaTurno, estado, observaciones } = req.body;

        const [nuevoPaciente] = await Paciente.create([datosPaciente], { session });
        if (!nuevoPaciente) throw new Error('No se pudo crear el paciente');
        

        const [nuevoTurno] = await Turno.create([{
            paciente: nuevoPaciente._id,
            especialidad,
            fechaTurno,
            estado: estado || EstadoTurno.PENDIENTE,
            observaciones,
        }], { session });

        if (!nuevoTurno) {
            throw new Error('No se pudo crear el turno');
        }

        await session.commitTransaction();
        session.endSession();

        const turnoCompleto = await Turno.findById(nuevoTurno._id).populate('paciente');

        return respuestaEstandar(res, 201, true, 'ingreso paciente nuevo', turnoCompleto);
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();

        return respuestaEstandar(res, 400, false, 'transaccion abortada', error.message);
    }
};

export { registrarIngreso };