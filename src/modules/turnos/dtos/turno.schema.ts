import { z } from 'zod';
import { Especialidad } from '../types/TurnoEspecialidad.enum';
import { EstadoTurno } from '../types/TurnoEstado.enum';

export const CrearTurnoSchema = z.object({
    body: z.object({
        paciente: z.string({ error: "El ID del paciente es obligatorio"}).min(1, "El ID del paciente es obligatorio"),
        especialidad: z.enum(Especialidad, {
            error:  "Especialidad no valida" 
        }),
        EstadoTurno: z.enum(EstadoTurno, {
            error: "Estado de turno no valido"
        }),
        fechaTurno: z.iso.date({ message: "formato de fecha invaliudo" })
    })
});

export type CrearTurnoDTO = z.infer<typeof CrearTurnoSchema>['body']

export interface IQueryUrgencia {
    urgencia?: string;
}