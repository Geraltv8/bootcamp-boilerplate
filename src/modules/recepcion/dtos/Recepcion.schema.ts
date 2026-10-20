import { z } from 'zod';
const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'El ID debe ser un ObjectId válido');

export const registrarIngresoSchema = z.object({
    body: z.object({
        dni: z.string().trim().regex(/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'),
        especialidadId: idSchema,
        medicoId: idSchema.optional(),
        consultorioId: idSchema.optional(),
        fechaHoraInicio: z.iso.datetime({ offset: true, message: 'Debe incluir fecha, hora y zona horaria' }),
    }),
});

export const buscarPacienteSchema = z.object({
    query: z.object({
        dni: z.string().trim().regex(/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'),
    }),
});

export type IRegistrarIngresoDTO = z.infer<typeof registrarIngresoSchema>['body'];