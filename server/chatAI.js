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
You provide tactical intelligence to the commander based on live system data, AND you help new users understand how the SpiderSense emergency dispatch system works.

If someone asks what this website is or how to use it, explain that SpiderSense is a live Marvel-themed emergency dispatch platform:
- Citizens can report incidents.
- Commanders can view incidents on a live map and use AI auto-dispatch to assign the best heroes based on distance, battery, and specialization.
- Heroes (like Iron Man) can log in, view their assignments, and update their status (En-route, On-scene, etc.).

LIVE SYSTEM DATA:
Active Incidents: ${JSON.stringify(contextData.incidents.map(i => ({ title: i.title, type: i.type, severity: i.severity, status: i.status })))}
Heroes Status: ${JSON.stringify(contextData.heroes.map(h => ({ callSign: h.callSign, type: h.type, status: h.status, battery: h.battery })))}

Answer the user's question accurately using only this real-time data or the platform explanation. Keep responses concise, professional, and slightly witty.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.3
      }
    });

    let safeHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    // Gemini API requires chat history to begin with a 'user' message
    if (safeHistory.length > 0 && safeHistory[0].role === 'model') {
      safeHistory = safeHistory.slice(1);
    }

    const chat = model.startChat({
      history: safeHistory
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error("AI Chat Error:", err);
    return "MOCK AI INTEL: I cannot connect to the intelligence mainframe (API Key Invalid or Missing). However, my local scanners show " + contextData.incidents.length + " active incidents and " + contextData.heroes.length + " heroes registered.";
  }
}
