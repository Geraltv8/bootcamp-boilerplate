# 🚀 Guía de Instalación y Prueba de la API Salita Municipal- Grupo Room 1

## ⚙️ Pasos para Clonar e Instalar

### 1. Clonar el repositorio
Abre tu terminal y ejecuta:
```
git clone https://github.com/MarinaProg1/bootcamp-boilerplate.git
cd bootcamp-boilerplate
code .

```
Una vez clonado, con code . se abre en la interfaz de Visual Studio Code

### 2.Instalar dependencias
-Abrir una nueva terminal en Visual Studio Code y ejecuta:

```
npm install

```
-Crear el archivo .env
En la terminal ejecuta:
```
touch .env

```
-Define las variables necesarias según la configuración del proyecto. 
Puedes usar la siguiente estructura como ejemplo:
```
PORT=<NUMERO DE PUERTO>
ENTORNO= development
DATABASE_URL=mongodb://localhost:27017/<NOMBRE DE LA BASE DE DATOS>

```
### 3.Ejecución del Servidor
En la terminal ejecuta:

```
npm run dev
```
# 🧪 Cómo Probar los Endpoints
En Posman :
### POST <URL-BASE>/api/v1/pacientes
```
{
  "nombre": "María González",
  "dni": "28765432",
  "direccion": {
    "calle": "Belgrano",
    "numero": "456",
    "barrio": "Norte"
  },
  "email": "maria.gonzalez@hotmail.com",
  "telefono": {
    "tipo": "FIJO",
    "codigoArea": "3777",
    "numero": "4455667"
  },
  "obraSocial": {
    "nombre": "PAMI",
    "numeroAfiliado": "PAM987654"
  }
}
```
### POST <URL-BASE>/api/v1/especialidades
```
{
  "nombre": "Kinesiología",
  "descripcion": "Tratamiento y rehabilitación física mediante técnicas terapéuticas.",
  "categoria": "Terapéutica"
}
```
### POST <URL-BASE>/api/v1/medicos

```
{
  "nombre": "Ana Fernández",
  "matricula": "MP10004",
  "especialidad": "6a6e57e40b640089be6b7537", // Cambiar por un id de especialidad generada anteriormente
  "telefono": {
    "tipo": "CELULAR",
    "codigoArea": "341",
    "numero": "5234789"
  },
  "email": "ana.fernandez@hospital.com"
}
```
### POST <URL-BASE>/api/v1/consultorios
```
{
  "medico": "6a6e58b60b640089be6b753b",// Cambiar por un id de medico generado anteriormente
  "especialidad": "6a6e57e40b640089be6b7537",// Cambiar por un id de especialidad existente
  "horarios": {
    "dias": [
      "Martes",
      "Jueves",
      "Viernes"
    ],
    "horarioMañana": {
      "inicio": "09:00",
      "fin": "13:00"
    },
    "horarioTarde": {
      "inicio": "16:00",
      "fin": "20:00"
    }
  },
  "numeroConsultorio": "205",
  "direccion": "San Martín 850",
  "piso": "2",
  "telefono": {
    "codigoArea": "341",
    "numero": "5234789"
  },
  "email": "consultorio.ana@hospital.com"
}
```
### POST <URL-BASE>/api/v1/historias-clinicas

```
{
  "paciente": "6a6e57620b640089be6b7533",
  "medico": "6a6e58a90b640089be6b753a",
  "fecha": "2026-12-22T10:00:00.000Z",
  "antecedentes": {
    "alergias": [
      "Ibuprofeno"
    ],
    "enfermedadesCronicas": [
      "Diabetes tipo 2"
    ],
    "medicamentosHabituales": [
      "Metformina 850 mg"
    ],
    "cirugiasPrevias": [
      "Colecistectomía"
    ],
    "internacionesPrevias": [
      "2019 - Neumonía"
    ],
    "antecedentesFamiliares": [
      "Enfermedad cardiovascular"
    ],
    "vacunas": [
      "COVID-19",
      "Antitetánica"
    ],
    "habitos": {
      "tabaquismo": false,
      "alcohol": false,
      "actividadFisica": "Baja"
    },
    "otros": "Debe controlar glucemia periódicamente."
  },
  "motivoConsulta": "Dolor en el pecho.",
  "sintomas": [
    "Dolor torácico",
    "Fatiga"
  ],
  "diagnostico": "Angina estable.",
  "tratamiento": "Electrocardiograma, medicación y seguimiento por cardiología.",
  "observaciones": "Se solicita control dentro de los próximos 15 días."
}
```

