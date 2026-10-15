import { Hero, Incident } from '../models/index.js';
import { generateChatResponse } from '../services/chatAI.js';

/**
 * chat
 * POST /api/chat
 * Body: { message: string, history: [{ role, content }] }
 * Fetches live system context and sends it to the AI chatbot.
 */
export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message field is required' });
    }

    // Fetch live context for the AI (only active incidents)
    const [incidents, heroes] = await Promise.all([
      Incident.find({ status: { $ne: 'resolved' } }).lean(),
      Hero.find({}).lean(),
    ]);

    const contextData = { incidents, heroes };
    const aiResponse  = await generateChatResponse(message, history, contextData);

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat service failed' });
  }
}
