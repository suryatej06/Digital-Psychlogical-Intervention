import OpenAI from 'openai';

/**
 * AI Service for chatbot interactions
 * Uses OpenAI API or falls back to mock responses
 */

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

// Initialize OpenAI client if API key is provided
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Get AI response for user message
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages in format [{role: 'user'|'assistant', content: string}]
 * @returns {Promise<string>} AI response
 */
export const getAIResponse = async (userMessage, conversationHistory = []) => {
  // If OpenAI is not configured, return mock response
  if (!openai) {
    return getMockResponse(userMessage);
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to mock response on error
    return getMockResponse(userMessage);
  }
};

/**
 * Mock AI response when OpenAI API is not available
 */
const getMockResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
    return "I understand that anxiety can be really overwhelming. Have you tried any breathing exercises or mindfulness techniques? Remember, it's okay to feel this way, and seeking support is a sign of strength.";
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    return "I'm sorry you're feeling this way. Your feelings are valid. Sometimes talking to someone you trust or a professional counselor can help. Would you like to explore some resources or book a counseling session?";
  }
  
  if (lowerMessage.includes('stress') || lowerMessage.includes('stressed')) {
    return "Stress can be really challenging to manage. Have you tried breaking down what's causing the stress into smaller, manageable pieces? Sometimes taking things one step at a time can help.";
  }
  
  return "Thank you for sharing. I'm here to listen and support you. If you're going through a difficult time, remember that professional help is available. Would you like to explore our resources or speak with a counselor?";
};
