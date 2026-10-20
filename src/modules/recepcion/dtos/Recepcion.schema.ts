import { z } from 'zod';
import { crearPacienteSchema } from '../../pacientes/dtos/Paciente.schema.js';
import { Especialidad } from '../../turnos/types/TurnoEspecialidad.enum.js';
import { EstadoTurno } from '../../turnos/types/TurnoEstado.enum.js';

export const registrarIngresoSchema = z.object({
    body: z.object({
        datosPaciente: crearPacienteSchema.shape.body,
        especialidad: z.enum(Especialidad, { message: 'Especialidad no válida' }),
        fechaTurno: z.coerce.date({ message: 'Formato de fecha inválido' }),
        estado: z.enum(EstadoTurno, { message: 'Estado de turno no válido' }).optional().default(EstadoTurno.PENDIENTE),
        observaciones: z.string().optional().default(''),
    }),
});

export type IRegistrarIngresoDTO = z.infer<typeof registrarIngresoSchema>['body'];