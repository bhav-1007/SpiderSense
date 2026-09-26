import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here';
const genAI = hasKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function generateChatResponse(message, history, contextData) {
  if (!genAI) {
    return "MOCK AI INTEL: I'm currently running in Mock Mode because a valid Gemini API key is missing. I can see there are " + contextData.incidents.length + " active incidents, but I cannot provide deep analysis.";
  }

  const systemInstruction = `You are J.A.R.V.I.S, the AI tactical assistant for SpiderSense Avengers Command. 
You provide tactical intelligence to the commander based on live system data. Keep responses concise, professional, and slightly witty, fitting the Marvel universe.

LIVE SYSTEM DATA:
Active Incidents: ${JSON.stringify(contextData.incidents.map(i => ({ title: i.title, type: i.type, severity: i.severity, status: i.status })))}
Heroes Status: ${JSON.stringify(contextData.heroes.map(h => ({ callSign: h.callSign, type: h.type, status: h.status, battery: h.battery })))}

Answer the user's question accurately using only this real-time data. If asked to predict or calculate something complex, use logical reasoning based on the data provided.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.3
      }
    });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error("AI Chat Error:", err);
    return "Error communicating with intelligence mainframe. Please check API keys.";
  }
}
