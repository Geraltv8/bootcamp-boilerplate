import { z } from 'zod';
import { Especialidad } from '../types/TurnoEspecialidad.enum.js';
import { EstadoTurno } from '../types/TurnoEstado.enum.js';

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'El ID debe ser un ObjectId válido');

export const CrearTurnoSchema = z.object({
    body: z.object({
        paciente: z.string().min(1, 'El ID del paciente es obligatorio'),
        medicoId: idSchema.optional(),
        especialidad: z.enum(Especialidad, { message: 'Especialidad no válida' }),
        estado: z.enum(EstadoTurno, { message: 'Estado de turno no válido' }).optional().default(EstadoTurno.PENDIENTE),
        fechaTurno: z.coerce.date({ message: 'Formato de fecha inválido' }),
        observaciones: z.string().max(500, 'Las observaciones no pueden superar los 500 caracteres').optional().default(''),
    }),
});

export const ActualizarEstadoTurnoSchema = z.object({
    params: z.object({ id: idSchema }),
    body: z.object({
        estado: z.enum(EstadoTurno, { message: 'Estado de turno no válido' }),
    }),
});

export const queryUrgenciaSchema = z.object({
    query: z.object({
        urgencia: z.enum(['true', 'false']).optional(),
    }),
});

export type CrearTurnoDTO = z.infer<typeof CrearTurnoSchema>['body'];
export type IQueryUrgencia = z.infer<typeof queryUrgenciaSchema>['query'];