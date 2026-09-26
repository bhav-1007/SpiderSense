import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here';
const genAI = hasKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function suggestHeroesForIncident(incident, availableHeroes) {
  if (availableHeroes.length === 0) {
    return null; // Fallback to manual
  }
  
  if (!genAI) {
    console.warn("AI Auto-Dispatch using MOCK mode: GEMINI_API_KEY is missing from server/.env");
    
    // Manual heuristic mock
    const sorted = [...availableHeroes].map(u => {
      let score = 100;
      if (u.type === incident.type) score += 50;
      score += (u.battery / 100) * 10;
      if (u.location && incident.location) {
        const dx = u.location.lng - incident.location.lng;
        const dy = u.location.lat - incident.location.lat;
        score -= Math.sqrt(dx*dx + dy*dy) * 500;
      }
      return { ...u, _score: score };
    }).sort((a, b) => b._score - a._score);
    
    return {
      recommendedUnitIds: [sorted[0].id],
      confidence: 0.95,
      reasoning: "MOCK AI: Assigned optimal match based on proximity and specialty."
    };
  }

  const prompt = `You are the SpiderSense AI Dispatcher.
We have an incident:
Type: ${incident.type}
Severity: ${incident.severity}
Title: ${incident.title}
Location: ${incident.location.label} (Lat: ${incident.location.lat}, Lng: ${incident.location.lng})

Available Heroes:
${availableHeroes.map(h => `- ${h.id}: ${h.callSign} (Type: ${h.type}, Members: ${h.members}, Battery: ${h.battery}%, Lat: ${h.location.lat}, Lng: ${h.location.lng})`).join('\n')}

Based on the incident type, severity, and distance (using lat/lng) from the heroes, choose the best hero(es) to assign.
Match types if possible (e.g. fire to fire/rescue, medical to medical, security to tactical/air).
Return ONLY valid JSON matching this schema exactly (do not wrap in markdown or backticks):
{
  "recommendedUnitIds": ["string"],
  "confidence": number,
  "reasoning": "string"
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    let rawOutput = result.response.text();
    
    // Defensive parsing
    rawOutput = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(rawOutput);
    if (!parsed.recommendedUnitIds || !Array.isArray(parsed.recommendedUnitIds)) {
      throw new Error("Invalid schema");
    }
    
    // Filter to ensure they are actually in availableHeroes
    const validIds = parsed.recommendedUnitIds.filter(id => availableHeroes.some(h => h.id === id));
    if (validIds.length === 0) throw new Error("No valid heroes returned");

    return {
      recommendedUnitIds: validIds,
      confidence: parsed.confidence || 0,
      reasoning: parsed.reasoning || "AI assigned optimal match based on proximity and specialty."
    };
  } catch (err) {
    console.error("AI Assignment Error:", err.message);
    return null;
  }
}
