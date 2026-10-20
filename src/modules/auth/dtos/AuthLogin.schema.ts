import { z } from 'zod';

export const loginPersonalSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Email inválido'),
        password: z.string().min(1, 'La contraseña es obligatoria'),
    }),
});

export const loginCiudadanoSchema = z.object({
    body: z.object({
        dni: z.string().trim().regex(/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'),
        telefono: z.string()
            .trim()
            .regex(/^[0-9+()\s.-]{7,20}$/, 'El teléfono no es válido')
            .refine((telefono) => {
                const digitos = telefono.replace(/\D/g, '').length;
                return digitos >= 7 && digitos <= 15;
            }, 'El teléfono debe tener entre 7 y 15 dígitos'),
    }),
});

export const registrarUsuarioSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Email inválido'),
        user: z.string().trim().min(2).optional(),
        password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
        rol: z.enum(['ADMIN', 'RECEPCIONISTA', 'MEDICO']),
    }),
});

export type ILoginPersonalDTO = z.infer<typeof loginPersonalSchema>['body'];
export type ILoginCiudadanoDTO = z.infer<typeof loginCiudadanoSchema>['body'];
export type IRegistrarUsuarioDTO = z.infer<typeof registrarUsuarioSchema>['body'];
