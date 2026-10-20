import Especialidad from './Especialidad.model.js';
import Consultorio from '../consultorio/Consultorio.model.js';

const especialidadesIniciales = [
    { codigo: 'cardiologia', nombre: 'Cardiología' },
    { codigo: 'pediatria', nombre: 'Pediatría' },
    { codigo: 'dermatologia', nombre: 'Dermatología' },
    { codigo: 'neurologia', nombre: 'Neurología' },
    { codigo: 'clinica', nombre: 'Clínica' },
    { codigo: 'ginecologia', nombre: 'Ginecología' },
    { codigo: 'traumatologia', nombre: 'Traumatología' },
];

export const inicializarCatalogoEspecialidades = async (): Promise<void> => {
    await Especialidad.bulkWrite(
        especialidadesIniciales.map((especialidad) => ({
            updateOne: {
                filter: { codigo: especialidad.codigo },
                update: { $setOnInsert: especialidad },
                upsert: true,
            },
        })),
    );

    await Consultorio.bulkWrite(
        especialidadesIniciales.map((especialidad) => ({
            updateMany: {
                filter: { especialidad: especialidad.codigo.toUpperCase() },
                update: { $set: { especialidad: especialidad.codigo } },
            },
        })),
    );
};
