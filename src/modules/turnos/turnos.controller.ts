import type { Request, Response } from 'express';
import { EstadoTurno } from './types/TurnoEstado.enum';
import Turno from './Turno.model';
import type { CrearTurnoDTO, IQueryUrgencia } from './dtos/turno.schema';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { ITurno } from './types/Turno.interface';

const getTurnos = async (req: Request<unknown, unknown, unknown, { id?: string}>, res: Response) => {
    try {
        const { id } = req.query;
    
        if (id) {
            const turnos = await Turno.findById(id).populate('paciente');
            if (!turnos) return respuestaEstandar(res, 404, false, 'Turno no encontrado');
            return respuestaEstandar<ITurno>(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
        }
           
        const turnos = await Turno.find({activo: true}).populate('paciente');
        
        return respuestaEstandar(res, 200, true, 'Turnos obtenidos exitosamente', turnos);
    } catch (error: any) {
         return respuestaEstandar(res, 500, false, 'Error interno del servidor', error.message);
    }
};

const createTurno = async (req: Request<unknown, unknown, CrearTurnoDTO, IQueryUrgencia>, res: Response) => {
    try {

        const esUrgente = req.query.urgencia === 'true';

        const datosDelTurno = {
            ...req.body,
            estado: esUrgente ? EstadoTurno.ATENDIDO : EstadoTurno.PENDIENTE,
            observaciones: esUrgente ? 'ingreso por guardia medica' : ""
        };

        if (esUrgente) console.log("🚨 ALERTA: registrado un turno de urgencia");
        

        const nuevoTurno = await Turno.create(datosDelTurno);
        return respuestaEstandar(res, 201, true, 'Turno creado exitosamente', nuevoTurno);

    } catch (error: any) {

        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map((err: any) => err.message);
            return respuestaEstandar(res, 400, false, 'Error de validación', errores);
    }

    return respuestaEstandar(res, 500, false, 'Error interno del servidor', error.message);
  };
};

const deleteTurno = async (req: Request<{ id: string}>, res: Response) => {
    try {

        const { id } = req.params;

        const turnoBorrado = await Turno.findByIdAndUpdate(
            id, 
            { activo: false, estado: EstadoTurno.CANCELADO },
            { new: true }
        );

        if (!turnoBorrado) {
            return respuestaEstandar(res, 404, false, 'Turno no encontrado con ID ${id}');
        }
        
        return respuestaEstandar(res, 200, true, 'Turno eliminado exitosamente', turnoBorrado);
    } catch (error: any) {
        console.error('Error al eliminar el turno:', error);
        return respuestaEstandar(res, 400, false, 'ID con formato invalido', error.message);
    }
};

const marcarAtendido = async (req: Request<{ id: string}>, res: Response) => {
    try {
        const { id } = req.params;

        const turnoActualizado = await Turno.findByIdAndUpdate(
            id,
            { estado: EstadoTurno.ATENDIDO },
            { new: true }
        );

        if (!turnoActualizado) return respuestaEstandar(res, 404, false, 'turno no encontrado', id);
        return respuestaEstandar(res, 200, true, 'turno actualizado', turnoActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error de servidor', error.message);
    }
};

export { getTurnos, createTurno, deleteTurno, marcarAtendido };