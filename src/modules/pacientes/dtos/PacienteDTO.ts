import { ObraSocial } from '../types/PacienteObraSocial.enum';
import { TipoTelefono } from '../types/PacienteTelefono.enum';
import type { IDireccion, IHistorialMedico } from '../types/Paciente.interface';

export interface ICrearPacienteDTO {
    nombre: string;
    dni: string;
    direccion: IDireccion;
    email: string;
    telefono: {
        tipo?: TipoTelefono;
        codigoArea: string;
        numero: string;
    };
    obraSocial: {
        nombre: ObraSocial;
        numeroAfiliado?: string;
    };
    historialMedico: IHistorialMedico;
}

export interface IQueryPacientes {
    obraSocial?: string;
    dni?: string;
}