import type { ICrearPacienteDTO } from '../../pacientes/dtos/PacienteDTO';
import { Especialidad } from '../../turnos/types/TurnoEspecialidad.enum';
import { EstadoTurno } from '../../turnos/types/TurnoEstado.enum';

export interface IRegistrarIngresoDTO {
    datosPaciente: ICrearPacienteDTO;
    especialidad: Especialidad;
    fechaTurno: string | Date;
    estado?: EstadoTurno;
    observaciones?: string;
}