import { describe, it, mock } from "node:test";
import assert from "node:assert";
import { marcarAtendido } from "./turnos.controller.js";
import TurnoModel from "./Turno.model.js";
import { EstadoTurno } from "./types/TurnoEstado.enum.js";

describe('Controlador: MarcarAtendido', () => {

    it('Debe retornar 200 y actualizar el turno si existe', async () => {
        const req = { params: { id: 'turno-123' } } as any;
        const res = {
            status: mock.fn(() => res),
            json: mock.fn()
        } as any;
    
        const turnoFalso = { id: 'turno-123', estado: EstadoTurno.ATENDIDO };

        mock.method(TurnoModel, 'findByIdAndUpdate', async () => turnoFalso);

        await marcarAtendido(req, res);

        assert.strictEqual(res.status.mock.calls[0].arguments[0], 200);
        assert.strictEqual(res.json.mock.calls[0].arguments[0].ok, true);
        assert.deepStrictEqual(res.json.mock.calls[0].arguments[0].data, turnoFalso);

        
    });
});