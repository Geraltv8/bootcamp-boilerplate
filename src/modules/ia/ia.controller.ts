import type { Request, Response } from 'express';
import { modeloGemini } from '../../services/ia.service';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { z } from 'zod';

const esquemaRespuestaIA = z.object({
    resumenCorto: z.string(),
    gravedad: z.enum(['ALTA', 'MEDIA', 'BAJA']),
    medicamentosMencionados: z.array(z.string())
});

export const analizarHistorial = async (req: Request, res: Response) => {
    try {
        // Asumimos que validaron el req.body con Zod antes
        const { notasDelMedico } = req.body; 

        // 2. El Prompt: Le inyectamos la estructura que queremos
        const prompt = `
        Eres un asistente médico experto. Analiza las siguientes notas desordenadas:
        "${notasDelMedico}"
        
        Devuelve ÚNICAMENTE un objeto JSON válido, sin formato Markdown, sin comillas invertidas, con esta estructura exacta:
        {
          "resumenCorto": "string",
          "gravedad": "ALTA" | "MEDIA" | "BAJA",
          "medicamentosMencionados": ["medicamento1", "medicamento2"]
        }
        `;

        // 3. Pegada a la IA
        const resultado = await modeloGemini.generateContent(prompt);
        const textoCrudo = resultado.response.text(); // Viene como string (esperemos que sea JSON)

        // 4. Transformación y Validación Isomórfica
        const objetoParseado = JSON.parse(textoCrudo);
        
        // ¡Si Gemini alucinó, Zod tira error y no rompemos nuestra Base de Datos!
        const datosLimpios = esquemaRespuestaIA.parse(objetoParseado);

        return respuestaEstandar(res, 200, true, "Análisis de IA completado", datosLimpios);

    } catch (error: any) {
        return respuestaEstandar(res, 500, false, "Fallo al procesar IA", error.message);
    }
};