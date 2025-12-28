import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: 0
  },
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 1
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  chartType: {
    type: String,
    enum: ['pie', 'bar', 'line', 'table', null],
    default: null
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic is required']
  },
  subtopic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subtopic'
  },
  quizType: {
    type: String,
    enum: ['short', 'long', 'mock'],
    default: 'short'  // short = 15Q/20min, long = 40Q/50min, mock = mixed
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(v) {
        return v.length >= 1;
      },
      message: 'Quiz must have at least 1 question'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number,
    default: 300,
    min: 60
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  attemptsCount: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
