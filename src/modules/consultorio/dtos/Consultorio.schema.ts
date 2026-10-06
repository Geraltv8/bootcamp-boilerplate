import { z } from 'zod';
import { EspecialidadConsultorio } from '../types/EspecialidadConsultorio.enum';

export const crearConsultorioSchema = z.object({
    body: z.object({
        nombre: z.string().trim().min(2, 'El nombre del consultorio es obligatorio'),
        especialidad: z.enum(EspecialidadConsultorio),
        piso: z.number().int().min(1, 'El piso debe ser mayor o igual a 1'),
        capacidad: z.number().int().min(1, 'La capacidad debe ser mayor a 0'),
        observaciones: z.string().max(250, 'Las observaciones no pueden superar los 250 caracteres').default(''),
        activo: z.boolean().default(true),
    }),
});

export const queryConsultoriosSchema = z.object({
    query: z.object({
        especialidad: z.string().optional(),
        activo: z.string().optional(),
    }),
});

export type ICrearConsultorioDTO = z.infer<typeof crearConsultorioSchema>['body'];
export type IQueryConsultorios = z.infer<typeof queryConsultoriosSchema>['query'];
