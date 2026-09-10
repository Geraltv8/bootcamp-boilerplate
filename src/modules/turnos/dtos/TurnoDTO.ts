export interface ICrearTurnoDTO {
    paciente: string;
    especialidad: string;
    fechaTurno: string | Date;
}

export interface IQueryUrgencia {
    urgencia?: string;
}