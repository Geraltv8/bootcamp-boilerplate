import { z } from 'zod';
import { Especialidad } from '../../turnos/types/TurnoEspecialidad.enum';

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'El ID debe ser un ObjectId válido');

const medicoBodyFields = {
    usuarioId: idSchema,
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
    matricula: z.string().trim().regex(/^[a-zA-Z0-9]+$/, 'La matrícula debe ser alfanumérica'),
    especialidades: z.array(z.enum(Especialidad)).min(1, 'Debe indicar al menos una especialidad'),
    telefono: z.string().trim(),
};

export const crearMedicoSchema = z.object({
    body: z.object(medicoBodyFields),
});

export const actualizarMedicoSchema = z.object({
    params: z.object({ id: idSchema }),
    body: z.object({
        ...medicoBodyFields,
        usuarioId: idSchema.optional(),
        nombre: medicoBodyFields.nombre.optional(),
        apellido: medicoBodyFields.apellido.optional(),
        matricula: medicoBodyFields.matricula.optional(),
        especialidades: medicoBodyFields.especialidades.optional(),
        telefono: medicoBodyFields.telefono.optional(),
    }).refine((body) => Object.keys(body).length > 0, 'Debe enviar al menos un campo para actualizar'),
});

export const idMedicoSchema = z.object({
    params: z.object({ id: idSchema }),
});

export const queryMedicosSchema = z.object({
    query: z.object({
        especialidad: z.enum(Especialidad).optional(),
        activo: z.enum(['true', 'false']).optional(),
        busqueda: z.string().trim().min(1).optional(),
    }),
});

export type ICrearMedicoDTO = z.infer<typeof crearMedicoSchema>['body'];
export type IActualizarMedicoDTO = z.infer<typeof actualizarMedicoSchema>['body'];
export type IQueryMedicos = z.infer<typeof queryMedicosSchema>['query'];
