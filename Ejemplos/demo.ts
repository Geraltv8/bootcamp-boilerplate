function calcularTotalTS(precio: number, impuesto: number): number {
    return precio + impuesto;
};

const totalTS = calcularTotalTS(100, 5);
console.log(totalTS);


const pacienteTS = { nombre: "juan", obraSocial: "OSDE" };

console.log(pacienteTS.obraSocial);