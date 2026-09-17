import { z } from 'zod';
import { ObraSocial } from '../types/PacienteObraSocial.enum';
import { TipoTelefono } from '../types/PacienteTelefono.enum';

export const direccionSchema = z.object({
    calle: z.string(),
    numero: z.string(),
    piso: z.string().optional().default(""),
    departamento: z.string().optional().default(""),
    barrio: z.string().optional().default("")
});

export const queryPacientesSchema = z.object ({
    query: z.object({
        obraSocial: z.string().optional(),
        dni: z.string().optional()
    })
});

export const crearPacienteSchema = z.object({
    body: z.object({
        nombre: z.string().min(2, "el nombre es obligatorio"),
        dni: z.string().min(7, "DNI invalido"),
        direccion: direccionSchema,
        email: z.email('Email invalido'),
        telefono: z.object({
            tipo: z.enum(TipoTelefono).optional().default(TipoTelefono.CELULAR),
            codigoArea: z.string(),
            numero: z.string()
        }),
        obraSocial: z.object({
            nombre: z.enum(ObraSocial),
            numeroAfiliado: z.string().optional().default("")
        }),
        historialMedico: z.object({
            fecha: z.iso.date({ message: "formato de fecha invalido" }),
            diagnostico: z.string(),
            tratamiento: z.string(),
            medico: z.string()
        })
    })
});

export type ICrearPacienteDTO = z.infer<typeof crearPacienteSchema>['body'];
export type IQueryPacientes = z.infer<typeof queryPacientesSchema>['query'];