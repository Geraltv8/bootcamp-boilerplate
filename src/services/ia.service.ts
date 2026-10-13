import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Falta configurar la variable de entorno GEMINI_API_KEY");
}

export const genIA = new GoogleGenerativeAI(apiKey)
    .getGenerativeModel({ model: "gemini-3.1-flash-lite" });
