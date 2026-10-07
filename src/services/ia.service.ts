import { GoogleGenerativeAI } from "@google/generative-ai";

const genIA = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const modeloGemini = genIA.getGenerativeModel({ model: "gemini-1.5-flash" });
