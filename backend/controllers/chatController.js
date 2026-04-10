import ChatSession from '../models/ChatSession.js';
import Message from '../models/Message.js';
import { getAIResponseJSON, getMockResponseJSON } from '../services/aiService.js';
import {
  scanForRisk,
  calculateRiskScore,
  getCrisisResponse,
  exceedsRiskThreshold
} from '../services/riskDetection.js';

function sessionPayload(session, extra = {}) {
  return {
    id: session._id,
    riskScore: session.riskScore,
    isFlagged: session.isFlagged,
    status: session.status,
    sessionIntensity: session.sessionIntensity || 'Neutral',
    ...extra
  };
}

/**
 * Create or get active chat session
 */
export const getOrCreateSession = async (req, res, next) => {
  try {
    let session = await ChatSession.findOne({
      userId: req.user.userId,
      status: 'active'
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.userId,
        collegeId: req.user.collegeId,
        riskScore: 0
      });
    }

    const messages = await Message.find({ sessionId: session._id })
      .sort({ createdAt: 1 });

    res.json({
      session: sessionPayload(session),
      messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send message to chatbot
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let session = await ChatSession.findOne({
      userId: req.user.userId,
      status: 'active'
    });

    if (!session) {
      session = await ChatSession.create({
        userId: req.user.userId,
        collegeId: req.user.collegeId,
        riskScore: 0
      });
    }

    const riskScan = scanForRisk(content);

    const priorRaw = await Message.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const history = priorRaw.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const userMessage = await Message.create({
      sessionId: session._id,
      role: 'user',
      content: content.trim(),
      riskKeywords: riskScan.keywords
    });

    let replyText;
    let intensity = 'Neutral';
    let suggested_ui = null;

    if (riskScan.level === 'crisis') {
      replyText = getCrisisResponse();
      intensity = 'Crisis';
      suggested_ui = null;
      session.riskScore = 100;
      session.sessionIntensity = 'Crisis';
      session.isFlagged = true;
      session.flagReason = 'Crisis keywords detected';
    } else {
      session.riskScore = calculateRiskScore(content, session.riskScore);

      const fromSession = session.suggestedToolsThisSession || [];
      const fromHistory = priorRaw
        .filter((m) => m.role === 'assistant' && m.suggestedUi)
        .map((m) => m.suggestedUi);
      const alreadySuggestedTools = [...new Set([...fromSession, ...fromHistory])].filter(Boolean);

      let parsed;
      try {
        parsed = await getAIResponseJSON(
          content.trim(),
          history,
          alreadySuggestedTools
        );
      } catch {
        parsed = getMockResponseJSON(content.trim(), alreadySuggestedTools);
      }

      replyText = parsed.reply;
      intensity = parsed.intensity;
      suggested_ui = parsed.suggested_ui;
      session.sessionIntensity = intensity;

      if (intensity === 'Crisis') {
        session.isFlagged = true;
        session.riskScore = 100;
        if (!session.flagReason) {
          session.flagReason = 'AI assessed crisis intensity';
        } else if (!session.flagReason.includes('AI assessed crisis')) {
          session.flagReason = `${session.flagReason}; AI assessed crisis intensity`;
        }
      }

      const toolsSoFar = session.suggestedToolsThisSession || [];
      if (suggested_ui && !toolsSoFar.includes(suggested_ui)) {
        session.suggestedToolsThisSession = [...toolsSoFar, suggested_ui];
      }

      if (exceedsRiskThreshold(session.riskScore)) {
        session.isFlagged = true;
        if (!session.flagReason) {
          session.flagReason = 'Risk score threshold exceeded';
        }
      }
    }

    await session.save();

    const assistantMessage = await Message.create({
      sessionId: session._id,
      role: 'assistant',
      content: replyText,
      suggestedUi: suggested_ui,
      intensity
    });

    const suggestion = exceedsRiskThreshold(session.riskScore)
      ? 'We recommend speaking with a counselor. Would you like to book a session?'
      : null;

    res.json({
      message: assistantMessage,
      intensity,
      suggested_ui,
      session: sessionPayload(session, { suggestion })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Close chat session
 */
export const closeSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.status = 'closed';
    await session.save();

    res.json({ message: 'Session closed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user.userId
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await Message.find({ sessionId: session._id })
          .sort({ createdAt: 1 })
          .limit(5);

        return {
          id: session._id,
          riskScore: session.riskScore,
          isFlagged: session.isFlagged,
          status: session.status,
          sessionIntensity: session.sessionIntensity || 'Neutral',
          createdAt: session.createdAt,
          messageCount: await Message.countDocuments({ sessionId: session._id }),
          preview: messages
        };
      })
    );

    res.json({ sessions: sessionsWithMessages });
  } catch (error) {
    next(error);
  }
};
