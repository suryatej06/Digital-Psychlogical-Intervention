import ChatSession from '../models/ChatSession.js';
import Message from '../models/Message.js';
import { getAIResponse } from '../services/aiService.js';
import {
  scanForRisk,
  calculateRiskScore,
  getCrisisResponse,
  exceedsRiskThreshold
} from '../services/riskDetection.js';

/**
 * Create or get active chat session
 */
export const getOrCreateSession = async (req, res, next) => {
  try {
    // Find active session for user
    let session = await ChatSession.findOne({
      userId: req.user.userId,
      status: 'active'
    });

    if (!session) {
      // Create new session
      session = await ChatSession.create({
        userId: req.user.userId,
        collegeId: req.user.collegeId,
        riskScore: 0
      });
    }

    // Get all messages for this session
    const messages = await Message.find({ sessionId: session._id })
      .sort({ createdAt: 1 });

    res.json({
      session: {
        id: session._id,
        riskScore: session.riskScore,
        isFlagged: session.isFlagged,
        status: session.status
      },
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

    // Get or create session
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

    // Scan for risk keywords
    const riskScan = scanForRisk(content);
    
    // Save user message
    const userMessage = await Message.create({
      sessionId: session._id,
      role: 'user',
      content: content.trim(),
      riskKeywords: riskScan.keywords
    });

    let aiResponse;
    let shouldFlag = false;

    // Handle crisis situation
    if (riskScan.level === 'crisis') {
      aiResponse = getCrisisResponse();
      shouldFlag = true;
      session.riskScore = 100; // Maximum risk score
    } else {
      // Get conversation history
      const history = await Message.find({ sessionId: session._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .reverse()
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get AI response
      aiResponse = await getAIResponse(content, history);

      // Update risk score
      session.riskScore = calculateRiskScore(content, session.riskScore);
    }

    // Check if risk threshold exceeded
    if (exceedsRiskThreshold(session.riskScore) || shouldFlag) {
      session.isFlagged = true;
      session.flagReason = shouldFlag 
        ? 'Crisis keywords detected' 
        : 'Risk score threshold exceeded';
    }

    await session.save();

    // Save AI response
    const assistantMessage = await Message.create({
      sessionId: session._id,
      role: 'assistant',
      content: aiResponse
    });

    res.json({
      message: assistantMessage,
      session: {
        id: session._id,
        riskScore: session.riskScore,
        isFlagged: session.isFlagged,
        suggestion: exceedsRiskThreshold(session.riskScore) 
          ? 'We recommend speaking with a counselor. Would you like to book a session?'
          : null
      }
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
          .limit(5); // Last 5 messages for preview

        return {
          id: session._id,
          riskScore: session.riskScore,
          isFlagged: session.isFlagged,
          status: session.status,
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
