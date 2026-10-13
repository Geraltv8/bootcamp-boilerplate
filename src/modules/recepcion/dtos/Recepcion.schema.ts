import { z } from 'zod';
import { crearPacienteSchema } from '../../pacientes/dtos/Paciente.schema.js';
import { Especialidad } from '../../turnos/types/TurnoEspecialidad.enum.js';
import { EstadoTurno } from '../../turnos/types/TurnoEstado.enum.js';

export const registrarIngresoSchema = z.object ({
    body: z.object({
        datosPaciente: crearPacienteSchema.shape.body,
        especialidad: z.enum(Especialidad),
        fechaTurno: z.iso.date({ message: "formato de fecha invaliudo" }),
        estado: z.enum(EstadoTurno).optional().default(EstadoTurno.PENDIENTE),
        observaciones: z.string().optional().default("")
    })
});

export type IRegistrarIngresoDTO = z.infer<typeof registrarIngresoSchema>['body'];