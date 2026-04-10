import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TIMEOUT_MS = 25000;

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const INTENSITY_SET = new Set(['Neutral', 'Anxious', 'Distressed', 'Crisis']);
const UI_SET = new Set(['breathing_tool', 'grounding_tool']);

function buildJsonSystemPrompt(alreadySuggestedTools = []) {
  const already =
    Array.isArray(alreadySuggestedTools) && alreadySuggestedTools.length > 0
      ? `Already suggested UI tools this session (do NOT set suggested_ui to any of these again unless the user clearly asks to repeat that specific exercise): ${JSON.stringify(alreadySuggestedTools)}.`
      : 'No UI tools have been suggested yet in this session.';
  return `You are a supportive mental health assistant. Your role is to:
- Provide empathetic and understanding responses
- Listen actively and validate feelings
- Offer general support and coping strategies
- Encourage professional help when distress is severe
- NEVER diagnose conditions
- NEVER provide medical advice
- NEVER prescribe medications
- Always prioritize user safety and well-being

You MUST respond with valid JSON only — no markdown, no code fences.
The JSON object must have exactly these keys:
- "reply" (string): your message to the user, warm and non-judgmental
- "intensity" (string): exactly one of "Neutral", "Anxious", "Distressed", "Crisis"
  - Use "Crisis" only if the user expresses imminent self-harm, suicide intent, or immediate danger
- "suggested_ui" (string or null): exactly one of "breathing_tool", "grounding_tool", or null
  - Suggest "breathing_tool" when anxiety, panic, or rapid breathing themes dominate
  - Suggest "grounding_tool" when dissociation, overwhelm, or "can't focus" themes dominate
  - Otherwise null

${already}

If the user would benefit from a tool but it is in the already-suggested list, set suggested_ui to null unless they explicitly ask for that exercise again.`;
}

export function normalizeAIJsonPayload(raw, alreadySuggestedTools = []) {
  const tools = new Set(
    Array.isArray(alreadySuggestedTools) ? alreadySuggestedTools : []
  );
  let reply =
    typeof raw?.reply === 'string' && raw.reply.trim()
      ? raw.reply.trim()
      : 'Thank you for sharing. I am here with you.';
  let intensity = INTENSITY_SET.has(raw?.intensity) ? raw.intensity : 'Neutral';
  let suggested_ui = raw?.suggested_ui;
  if (suggested_ui !== null && suggested_ui !== undefined && suggested_ui !== '') {
    if (!UI_SET.has(suggested_ui)) suggested_ui = null;
  } else {
    suggested_ui = null;
  }
  if (suggested_ui && tools.has(suggested_ui)) suggested_ui = null;
  return { reply, intensity, suggested_ui };
}

export const getMockResponseJSON = (userMessage, alreadySuggestedTools = []) => {
  const m = (userMessage || '').toLowerCase();
  const suggestedList = Array.isArray(alreadySuggestedTools)
    ? alreadySuggestedTools
    : [];

  const crisis =
    m.includes('suicide') ||
    m.includes('kill myself') ||
    m.includes('end my life') ||
    m.includes('harm myself') ||
    m.includes('hurt myself') ||
    m.includes('self harm') ||
    m.includes('want to die');
  if (crisis) {
    return normalizeAIJsonPayload(
      {
        reply:
          "I'm really concerned about what you've shared. Your safety matters most. Please reach out now: 988 (US), Crisis Text Line: text HOME to 741741, or local emergency services. You're not alone.",
        intensity: 'Crisis',
        suggested_ui: null,
      },
      suggestedList
    );
  }

  if (m.includes('anxious') || m.includes('anxiety') || m.includes('panic')) {
    return normalizeAIJsonPayload(
      {
        reply:
          "I hear how intense anxiety can feel. You're not weak for feeling this way. A slow breathing rhythm can help settle your nervous system — we can walk through it together if you like.",
        intensity: 'Anxious',
        suggested_ui: 'breathing_tool',
      },
      suggestedList
    );
  }

  if (
    m.includes('dissociat') ||
    m.includes("can't focus") ||
    m.includes('cant focus') ||
    m.includes('numb') ||
    m.includes('overwhelm') ||
    m.includes('flooded')
  ) {
    return normalizeAIJsonPayload(
      {
        reply:
          "When everything feels like too much, grounding can help you reconnect with the present. We'll go gently — you set the pace.",
        intensity: 'Distressed',
        suggested_ui: 'grounding_tool',
      },
      suggestedList
    );
  }

  if (m.includes('sad') || m.includes('depressed') || m.includes('hopeless')) {
    return normalizeAIJsonPayload(
      {
        reply:
          "I'm sorry you're carrying this. What you're feeling is valid. If it ever feels unbearable, reaching out to a counselor or crisis line is a brave step — I'm here to listen too.",
        intensity: 'Distressed',
        suggested_ui: null,
      },
      suggestedList
    );
  }

  if (m.includes('stress') || m.includes('stressed')) {
    return normalizeAIJsonPayload(
      {
        reply:
          'Stress can pile up quietly. Breaking things into smaller steps and naming one thing that helps, even tiny, can make a difference. What feels most pressing right now?',
        intensity: 'Anxious',
        suggested_ui: null,
      },
      suggestedList
    );
  }

  return normalizeAIJsonPayload(
    {
      reply:
        "Thank you for sharing. I'm here to listen and support you. Professional help is available when you're ready — would you like to explore resources or talk through what's on your mind?",
      intensity: 'Neutral',
      suggested_ui: null,
    },
    suggestedList
  );
};

/**
 * @param {string} userMessage
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @param {string[]} alreadySuggestedTools
 * @returns {Promise<{reply: string, intensity: string, suggested_ui: string|null}>}
 */
export const getAIResponseJSON = async (
  userMessage,
  conversationHistory = [],
  alreadySuggestedTools = []
) => {
  if (!process.env.GEMINI_API_KEY) {
    return getMockResponseJSON(userMessage, alreadySuggestedTools);
  }

  const systemInstruction = buildJsonSystemPrompt(alreadySuggestedTools);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const contents = [];
  for (const msg of conversationHistory) {
    if (!msg?.content) continue;
    const role = msg.role === 'assistant' ? 'model' : 'user';
    contents.push({ role, parts: [{ text: String(msg.content) }] });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const run = model.generateContent({ contents });
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), GEMINI_TIMEOUT_MS)
    );
    const result = await Promise.race([run, timeout]);
    const text = result.response?.text?.();
    if (!text) {
      return getMockResponseJSON(userMessage, alreadySuggestedTools);
    }
    const parsed = JSON.parse(text);
    return normalizeAIJsonPayload(parsed, alreadySuggestedTools);
  } catch (err) {
    console.error('Gemini JSON error:', err?.message || err);
    return getMockResponseJSON(userMessage, alreadySuggestedTools);
  }
};

/**
 * @param {Array<{type: string, severity: string, score: number|null}>} scores
 * @returns {Promise<string>}
 */
export const generateResourceTip = async (scores) => {
  if (!openai) return generateMockTip(scores);

  const summary = scores.map((s) => `${s.type}: ${s.severity}`).join(', ');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 80,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You write one warm, supportive sentence for a student mental health platform. ' +
            "You are given the student's current severity levels from recent screenings. " +
            'Acknowledge how they might be feeling and gently encourage them to explore the resources below. ' +
            'Never mention specific scores, numbers, or clinical terms. Never be alarming. ' +
            'Keep it under 35 words. Plain English.',
        },
        { role: 'user', content: `Student screening results: ${summary}. Write the tip.` },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || generateMockTip(scores);
  } catch (err) {
    console.error('generateResourceTip error:', err.message);
    return generateMockTip(scores);
  }
};

const generateMockTip = (scores) => {
  const order = ['Severe', 'Moderately Severe', 'Moderate', 'Mild', 'Minimal'];
  const highest = scores.reduce((best, s) => {
    const rank = order.indexOf(s.severity);
    const bestRank = order.indexOf(best?.severity || '');
    return rank !== -1 && (bestRank === -1 || rank < bestRank) ? s : best;
  }, null);

  const tips = {
    Severe:
      "It sounds like things have been really tough lately. These resources are here for you — take it one step at a time.",
    'Moderately Severe':
      "You've been carrying a lot recently. We've surfaced some resources that other students have found helpful.",
    Moderate:
      "Based on your recent check-in, we've brought some relevant resources to the top for you.",
    Mild:
      "Here are some resources curated to match where you're at right now. No pressure — explore what feels right.",
    Minimal: "You're doing well. These resources are here whenever you want to learn more.",
  };

  return (highest && tips[highest.severity]) || 'Here are some resources that might be helpful today.';
};
