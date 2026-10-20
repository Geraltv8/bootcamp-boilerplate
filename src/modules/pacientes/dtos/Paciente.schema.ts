import { z } from 'zod';
import { ObraSocial } from '../types/PacienteObraSocial.enum.js';
import { TipoTelefono } from '../types/PacienteTelefono.enum.js';

export const direccionSchema = z.object({
    calle: z.string().default('Sin información'),
    numero: z.string().default('S/N'),
    piso: z.string().optional().default(''),
    departamento: z.string().optional().default(''),
    barrio: z.string().optional().default('Sin información'),
});

export const queryPacientesSchema = z.object({
    query: z.object({
        obraSocial: z.string().optional(),
        dni: z.string().optional(),
    }),
});

export const crearPacienteSchema = z.object({
    body: z.object({
        nombre: z.string().min(2, 'El nombre es obligatorio'),
        dni: z.string().min(7, 'DNI inválido'),
        direccion: direccionSchema,
        email: z.string().email('Email inválido'),
        telefono: z.object({
            tipo: z.enum(TipoTelefono).optional().default(TipoTelefono.CELULAR),
            codigoArea: z.string().default('11'),
            numero: z.string().min(7, 'El número de teléfono no es válido'),
        }),
        obraSocial: z.object({
            nombre: z.enum(ObraSocial),
            numeroAfiliado: z.string().optional().default(''),
        }),
        historialMedico: z.object({
            fecha: z.coerce.date({ message: 'Formato de fecha inválido' }),
            diagnostico: z.string().min(1, 'El diagnóstico es obligatorio'),
            tratamiento: z.string().min(1, 'El tratamiento es obligatorio'),
            medico: z.string().min(1, 'El nombre del médico es obligatorio'),
        }),
    }),
});

export type ICrearPacienteDTO = z.infer<typeof crearPacienteSchema>['body'];
export type IQueryPacientes = z.infer<typeof queryPacientesSchema>['query'];