// backend/services/aiService.js  — full replacement
// Keeps your original getAIResponse intact, adds generateResourceTip below.

import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a supportive mental health assistant. Your role is to:
- Provide empathetic and understanding responses
- Listen actively and validate feelings
- Offer general support and coping strategies
- Encourage professional help when distress is severe
- NEVER diagnose conditions
- NEVER provide medical advice
- NEVER prescribe medications
- Always prioritize user safety and well-being

Be warm, compassionate, and non-judgmental.`;

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Original chat function (unchanged) ───────────────────────────────────────
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  if (!openai) return getMockResponse(userMessage);

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return getMockResponse(userMessage);
  }
};

const getMockResponse = (userMessage) => {
  const m = userMessage.toLowerCase();
  if (m.includes('anxious') || m.includes('anxiety'))
    return "I understand that anxiety can be really overwhelming. Have you tried any breathing exercises or mindfulness techniques? Remember, it's okay to feel this way, and seeking support is a sign of strength.";
  if (m.includes('sad') || m.includes('depressed'))
    return "I'm sorry you're feeling this way. Your feelings are valid. Sometimes talking to someone you trust or a professional counselor can help. Would you like to explore some resources or book a counseling session?";
  if (m.includes('stress') || m.includes('stressed'))
    return "Stress can be really challenging to manage. Have you tried breaking down what's causing the stress into smaller, manageable pieces? Sometimes taking things one step at a time can help.";
  return "Thank you for sharing. I'm here to listen and support you. If you're going through a difficult time, remember that professional help is available. Would you like to explore our resources or speak with a counselor?";
};

// ─── NEW: Resource tip generator ──────────────────────────────────────────────

/**
 * Generates a short personalised tip for the resource page based on
 * the student's latest PHQ-9 / GAD-7 severity levels.
 *
 * @param {Array<{type: string, severity: string, score: number|null}>} scores
 * @returns {Promise<string>}
 */
export const generateResourceTip = async (scores) => {
  if (!openai) return generateMockTip(scores);

  const summary = scores.map(s => `${s.type}: ${s.severity}`).join(', ');

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
            'You are given the student\'s current severity levels from recent screenings. ' +
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
    Severe: "It sounds like things have been really tough lately. These resources are here for you — take it one step at a time.",
    'Moderately Severe': "You've been carrying a lot recently. We've surfaced some resources that other students have found helpful.",
    Moderate: "Based on your recent check-in, we've brought some relevant resources to the top for you.",
    Mild: "Here are some resources curated to match where you're at right now. No pressure — explore what feels right.",
    Minimal: "You're doing well. These resources are here whenever you want to learn more.",
  };

  return (highest && tips[highest.severity]) || "Here are some resources that might be helpful today.";
};