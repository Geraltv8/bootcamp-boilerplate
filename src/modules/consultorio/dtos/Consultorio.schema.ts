import { z } from 'zod';
const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'El ID debe ser un ObjectId válido');

export const crearConsultorioSchema = z.object({
    body: z.object({
        nombre: z.string().trim().min(2, 'El nombre del consultorio es obligatorio'),
        especialidad: z.string().trim().toLowerCase().min(2),
        piso: z.number().int().min(1, 'El piso debe ser mayor o igual a 1'),
        capacidad: z.number().int().min(1, 'La capacidad debe ser mayor a 0'),
        observaciones: z.string().max(250, 'Las observaciones no pueden superar los 250 caracteres').default(''),
    }),
});

export const queryConsultoriosSchema = z.object({
    query: z.object({
        especialidad: z.string().optional(),
        activo: z.enum(['true', 'false']).optional(),
    }),
});

export const actualizarConsultorioSchema = z.object({
    params: z.object({ id: idSchema }),
    body: z.object({
        nombre: z.string().trim().min(2).optional(),
        especialidad: z.string().trim().toLowerCase().min(2).optional(),
        piso: z.number().int().min(1).optional(),
        capacidad: z.number().int().min(1).optional(),
        observaciones: z.string().max(250).optional(),
        activo: z.boolean().optional(),
    }).refine((body) => Object.keys(body).length > 0, 'Debe enviar al menos un campo'),
});

export const idConsultorioSchema = z.object({ params: z.object({ id: idSchema }) });

export type ICrearConsultorioDTO = z.infer<typeof crearConsultorioSchema>['body'];
export type IQueryConsultorios = z.infer<typeof queryConsultoriosSchema>['query'];
export type IActualizarConsultorioDTO = z.infer<typeof actualizarConsultorioSchema>['body'];
