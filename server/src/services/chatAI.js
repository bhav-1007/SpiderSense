import { genAI, GEMINI_MODEL } from '../config/gemini.js';

/**
 * generateChatResponse
 * Calls Gemini with chat history and live system context to produce a
 * J.A.R.V.I.S-style tactical response.
 *
 * @param {string} message     - The user's latest message
 * @param {Array}  history     - Previous messages [{ role, content }]
 * @param {Object} contextData - { incidents: [], heroes: [] }
 * @returns {string} The AI's text response
 */
export async function generateChatResponse(message, history, contextData) {
  // ── Mock mode (no Gemini key) ─────────────────────────────────────────────
  if (!genAI) {
    return (
      "MOCK AI INTEL: I'm currently running in Mock Mode because a valid Gemini API key is missing. " +
      `I can see there are ${contextData.incidents.length} active incidents, but I cannot provide deep analysis.`
    );
  }

  const systemInstruction = `You are J.A.R.V.I.S, the AI tactical assistant for SpiderSense Avengers Command.
You provide tactical intelligence to the commander based on live system data, AND you help new users understand how the SpiderSense emergency dispatch system works.

If someone asks what this website is or how to use it, explain that SpiderSense is a live Marvel-themed emergency dispatch platform:
- Citizens can report incidents.
- Commanders can view incidents on a live map and use AI auto-dispatch to assign the best heroes based on distance, battery, and specialization.
- Heroes (like Iron Man) can log in, view their assignments, and update their status (En-route, On-scene, etc.).

LIVE SYSTEM DATA:
Active Incidents: ${JSON.stringify(
    contextData.incidents.map((i) => ({
      title: i.title,
      type: i.type,
      severity: i.severity,
      status: i.status,
    }))
  )}
Heroes Status: ${JSON.stringify(
    contextData.heroes.map((h) => ({
      callSign: h.callSign,
      type: h.type,
      status: h.status,
      battery: h.battery,
    }))
  )}

You are free to answer ANY general question the user asks (trivia, tech, Marvel lore, casual chat, etc.).
Always keep responses concise, helpful, and slightly witty in the style of J.A.R.V.I.S.`;

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
      generationConfig: { temperature: 0.3 },
    });

    // Gemini requires history to start with a 'user' turn
    let safeHistory = history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    if (safeHistory.length > 0 && safeHistory[0].role === 'model') {
      safeHistory = safeHistory.slice(1);
    }

    const chat = model.startChat({ history: safeHistory });
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error('❌  AI Chat Error:', err.message);
    return (
      'MOCK AI INTEL: I cannot connect to the intelligence mainframe (API key invalid or missing). ' +
      `My local scanners show ${contextData.incidents.length} active incidents and ${contextData.heroes.length} heroes registered.`
    );
  }
}
