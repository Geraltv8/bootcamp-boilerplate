import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import Usuario, { Rol } from '../modules/auth/Usuario.model.js';
import Especialidad from '../modules/especialidades/Especialidad.model.js';
import Consultorio from '../modules/consultorio/Consultorio.model.js';
import Paciente from '../modules/pacientes/Paciente.model.js';
import Medico from '../modules/medicos/Medico.model.js';
import Turno from '../modules/turnos/Turno.model.js';
import { TipoTelefono } from '../modules/pacientes/types/PacienteTelefono.enum.js';
import { ObraSocial } from '../modules/pacientes/types/PacienteObraSocial.enum.js';
import { EstadoTurno } from '../modules/turnos/types/TurnoEstado.enum.js';

const MONGO_URI = process.env.DATABASE_URL_ATLAS || process.env.MONGO_URI;

const seedDatabase = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('Configurá DATABASE_URL_ATLAS para indicar la base de datos del seed.');
        }

        console.log('⏳ Conectando a la base de datos...');
        await mongoose.connect(MONGO_URI);
        
        console.log('🧹 Limpiando todas las colecciones...');
        await Turno.deleteMany({});
        await Paciente.deleteMany({});
        await Medico.deleteMany({});
        await Consultorio.deleteMany({});
        await Especialidad.deleteMany({});
        await Usuario.deleteMany({});

        console.log('👤 1. Creando Usuarios (Staff)...');
        const password = await bcrypt.hash('hashedpassword123', 10);
        const admin = await Usuario.create({ email: 'admin@salita.gov.ar', password, rol: Rol.ADMIN });
        const recepcionista = await Usuario.create({ email: 'recepcion@salita.gov.ar', password, rol: Rol.RECEPCIONISTA });
        const userMedico1 = await Usuario.create({ email: 'roberto.gomez@salita.gov.ar', password, rol: Rol.MEDICO });
        const userMedico2 = await Usuario.create({ email: 'silvia.perez@salita.gov.ar', password, rol: Rol.MEDICO });

        console.log('⚕️ 2. Creando Especialidades...');
        const espPediatria = await Especialidad.create({ codigo: 'PED', nombre: 'PEDIATRIA', descripcion: 'Atención integral del niño' });
        const espOdontologia = await Especialidad.create({ codigo: 'ODO', nombre: 'ODONTOLOGIA', descripcion: 'Salud bucal' });

        console.log('🏥 3. Creando Consultorios...');
        const consPediatria = await Consultorio.create({
            nombre: 'Consultorio 1 - Goya',
            especialidad: 'pediatria',
            piso: 1,
            capacidad: 2,
            observaciones: 'Equipado con balanza pediátrica'
        });
        const consOdontologia = await Consultorio.create({
            nombre: 'Consultorio 2 - Goya',
            especialidad: 'odontologia',
            piso: 1,
            capacidad: 1,
            observaciones: 'Sillón odontológico nuevo'
        });

        console.log('👨‍⚕️ 4. Creando Médicos...');
        const medico1 = await Medico.create({
            usuarioId: userMedico1._id,
            nombre: 'Roberto',
            apellido: 'Gómez',
            matricula: 'MP12345',
            especialidades: ['PEDIATRIA'],
            telefono: '3777123456'
        });
        const medico2 = await Medico.create({
            usuarioId: userMedico2._id,
            nombre: 'Silvia',
            apellido: 'Pérez',
            matricula: 'MP98765',
            especialidades: ['ODONTOLOGIA'],
            telefono: '3777654321'
        });

        console.log('🤕 5. Creando Pacientes...');
        const paciente1 = await Paciente.create({
            nombre: 'JUAN CARLOS',
            dni: '12345678',
            email: 'juan.carlos@email.com',
            direccion: { calle: 'San Martín', numero: '4675656', barrio: 'Centro' },
            telefono: { tipo: TipoTelefono.CELULAR, codigoArea: '3777', numero: '5551235' },
            obraSocial: { nombre: ObraSocial.OSDE, numeroAfiliado: '12345-01' }
        }) as unknown as { _id: mongoose.Types.ObjectId };
        const paciente2 = await Paciente.create({
            nombre: 'MARIA LOPEZ',
            dni: '87654321',
            email: 'maria.lopez@email.com',
            direccion: { calle: 'Belgrano', numero: '1028760', barrio: 'Sur' },
            telefono: { tipo: TipoTelefono.CELULAR, codigoArea: '3777', numero: '5559875' },
            obraSocial: { nombre: ObraSocial.NINGUNA }
        }) as unknown as { _id: mongoose.Types.ObjectId };

        console.log('📅 6. Generando Turnos (Fechas futuras para pasar validación)...');
        
        // Creamos turnos para mañana a las 10:00 y 11:30
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        const turno1Fecha = new Date(mañana.setHours(10, 0, 0, 0));
        const turno2Fecha = new Date(mañana.setHours(11, 30, 0, 0));

        await Turno.insertMany([
            {
                paciente: paciente1._id,
                medicoId: medico1._id,
                consultorioId: consPediatria._id,
                creadoPor: recepcionista._id,
                especialidad: 'PEDIATRIA',
                fechaTurno: turno1Fecha,
                estado: EstadoTurno.PENDIENTE,
                observaciones: 'Control de niño sano'
            },
            {
                paciente: paciente2._id,
                medicoId: medico2._id,
                consultorioId: consOdontologia._id,
                creadoPor: admin._id, // Turno creado por un admin
                especialidad: 'ODONTOLOGIA',
                fechaTurno: turno2Fecha,
                estado: EstadoTurno.PENDIENTE,
                observaciones: 'Dolor en molar inferior'
            }
        ]);

        console.log('✅ Base de datos poblada masivamente con éxito. Todo enlazado.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error crítico al poblar la base de datos:');
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();