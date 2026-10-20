import { z } from 'zod';

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'El ID debe ser un ObjectId válido');
const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm');

const camposAgenda = {
    diaSemana: z.number().int().min(0).max(6),
    horaInicio: horaSchema,
    horaFin: horaSchema,
    duracionMinutos: z.number().int().positive().max(1440),
};

const validarBloque = (agenda: { horaInicio: string; horaFin: string; duracionMinutos: number }) => {
    const [horaInicio, minutoInicio] = agenda.horaInicio.split(':').map(Number);
    const [horaFin, minutoFin] = agenda.horaFin.split(':').map(Number);
    const minutosInicio = (horaInicio ?? 0) * 60 + (minutoInicio ?? 0);
    const minutosFin = (horaFin ?? 0) * 60 + (minutoFin ?? 0);
    return minutosInicio < minutosFin && agenda.duracionMinutos <= minutosFin - minutosInicio;
};

export const crearAgendaSchema = z.object({
    params: z.object({ medicoId: idSchema }),
    body: z.object(camposAgenda).refine(validarBloque, {
        message: 'El inicio debe preceder al fin y la duración no puede superar el bloque disponible',
        path: ['horaFin'],
    }),
});

export const actualizarAgendaSchema = z.object({
    params: z.object({ id: idSchema }),
    body: z.object({
        diaSemana: camposAgenda.diaSemana.optional(),
        horaInicio: camposAgenda.horaInicio.optional(),
        horaFin: camposAgenda.horaFin.optional(),
        duracionMinutos: camposAgenda.duracionMinutos.optional(),
        activo: z.boolean().optional(),
    }).refine((body) => Object.keys(body).length > 0, 'Debe enviar al menos un campo'),
});

export const listarAgendasSchema = z.object({
    params: z.object({ medicoId: idSchema }),
    query: z.object({ incluirInactivas: z.enum(['true', 'false']).optional() }),
});

export type ICrearAgendaDTO = z.infer<typeof crearAgendaSchema>['body'];
export type IActualizarAgendaDTO = z.infer<typeof actualizarAgendaSchema>['body'];
