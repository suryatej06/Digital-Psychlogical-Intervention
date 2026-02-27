import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  riskKeywords: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for session messages
messageSchema.index({ sessionId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
