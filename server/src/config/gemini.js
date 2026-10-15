import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Checks whether a valid Gemini API key is configured.
 * The key is considered valid if it is set and not the placeholder string.
 */
const hasKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here';

export const genAI = hasKey ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// FIX: "gemini-3.8-flash" is not a real model name — the correct name is "gemini-1.5-flash"
// (or "gemini-2.0-flash" if you are on a newer SDK version).
// Using "gemini-1.5-flash" as the safe, widely-available default.
export const GEMINI_MODEL = 'gemini-1.5-flash';
