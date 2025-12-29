import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subtopic name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Parent topic is required']
  },
  icon: {
    type: String,
    default: '📝'
  },
  quizCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  formulas: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    example: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Compound index for unique subtopic names within a topic
subtopicSchema.index({ name: 1, topic: 1 }, { unique: true });

const Subtopic = mongoose.model('Subtopic', subtopicSchema);
export default Subtopic;
