import { Schema, model, Document } from 'mongoose';

export enum Rol {
    ADMIN = 'ADMIN',
    RECEPCIONISTA = 'RECEPCIONISTA'
}

export interface IUsuario extends Document {
    email: string;
    user: string;
    password: string;
    rol: Rol;
    activo: boolean;
}


const usuarioSchema = new Schema<IUsuario>({
    email: { type: String, required: true, unique: true },
    user: { type: String, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: Object.values(Rol), default: Rol.RECEPCIONISTA },
    activo: {type: Boolean, default: true }
})

export default model<IUsuario>('Usuario', usuarioSchema);