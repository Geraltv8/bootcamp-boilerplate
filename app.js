const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('ventanilla de sala municipal Abierta!');
});

app.get('/informacion', (req, res) => {
    res.send('Aqui se ve la informacion de contacto')
});

app.get('/contacto', (req, res) => {
    res.send(
        `Datos de contacto:
        Teléfono: 3777-234566
        Email: contacto@empresa.com
        Dirección: Calle San Martín 123
        Web: www.empresa.com`
    );
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});