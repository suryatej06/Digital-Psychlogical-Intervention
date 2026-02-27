import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['audio', 'video', 'article'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for filtering
resourceSchema.index({ collegeId: 1, type: 1 });
resourceSchema.index({ collegeId: 1, category: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
