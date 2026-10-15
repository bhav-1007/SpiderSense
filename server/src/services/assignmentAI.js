import { genAI, GEMINI_MODEL } from '../config/gemini.js';

/**
 * suggestHeroesForIncident
 * Calls Gemini to pick the best available heroes for a new incident.
 * Falls back to a simple proximity-and-type heuristic if the API key is missing.
 *
 * @param {Object} incident        - The incident document (plain object)
 * @param {Array}  availableHeroes - Array of hero documents (plain objects)
 * @returns {{ recommendedUnitIds: string[], confidence: number, reasoning: string } | null}
 */
export async function suggestHeroesForIncident(incident, availableHeroes) {
  if (availableHeroes.length === 0) {
    return null; // No heroes available — let commander assign manually
  }

  // ── Mock / fallback mode (no Gemini key) ──────────────────────────────────
  if (!genAI) {
    console.warn('⚠️  AI Auto-Dispatch using MOCK mode: GEMINI_API_KEY is missing.');

    const sorted = [...availableHeroes]
      .map((u) => {
        let score = 100;
        if (u.type === incident.type) score += 50;
        score += (u.battery / 100) * 10;
        if (u.location && incident.location) {
          const dx = u.location.lng - incident.location.lng;
          const dy = u.location.lat - incident.location.lat;
          score -= Math.sqrt(dx * dx + dy * dy) * 500;
        }
        return { ...u, _score: score };
      })
      .sort((a, b) => b._score - a._score);

    return {
      recommendedUnitIds: [sorted[0].id],
      confidence: 0.95,
      reasoning: 'MOCK AI: Assigned optimal match based on proximity and specialty.',
    };
  }

  // ── Live Gemini call ──────────────────────────────────────────────────────
  const prompt = `You are the SpiderSense AI Dispatcher.
We have an incident:
Type: ${incident.type}
Severity: ${incident.severity}
Title: ${incident.title}
Location: ${incident.location.label} (Lat: ${incident.location.lat}, Lng: ${incident.location.lng})

Available Heroes:
${availableHeroes
  .map(
    (h) =>
      `- ${h.id}: ${h.callSign} (Type: ${h.type}, Members: ${h.members}, Battery: ${h.battery}%, Lat: ${h.location.lat}, Lng: ${h.location.lng})`
  )
  .join('\n')}

Based on the incident type, severity, and distance from the heroes, choose the best hero(es) to assign.
Match types if possible (e.g. fire → fire/rescue, medical → medical, security → tactical/air).
Return ONLY valid JSON matching this schema exactly (do not wrap in markdown or backticks):
{
  "recommendedUnitIds": ["string"],
  "confidence": number,
  "reasoning": "string"
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    let rawOutput = result.response.text();

    // Defensive cleanup in case the model wraps output in markdown fences
    rawOutput = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawOutput);
    if (!parsed.recommendedUnitIds || !Array.isArray(parsed.recommendedUnitIds)) {
      throw new Error('Invalid response schema from Gemini');
    }

    // Only keep IDs that actually exist in availableHeroes
    const validIds = parsed.recommendedUnitIds.filter((id) =>
      availableHeroes.some((h) => h.id === id)
    );
    if (validIds.length === 0) throw new Error('Gemini returned no valid hero IDs');

    return {
      recommendedUnitIds: validIds,
      confidence: parsed.confidence || 0,
      reasoning:
        parsed.reasoning || 'AI assigned optimal match based on proximity and specialty.',
    };
  } catch (err) {
    console.error('❌  AI Assignment Error:', err.message);
    return null; // Graceful fallback — incident will be left as "unassigned"
  }
}
