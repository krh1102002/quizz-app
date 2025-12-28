import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update quiz statistics after attempt
attemptSchema.post('save', async function() {
  const Quiz = mongoose.model('Quiz');
  const quiz = await Quiz.findById(this.quiz);
  
  if (quiz) {
    const Attempt = mongoose.model('Attempt');
    const attempts = await Attempt.find({ quiz: this.quiz });
    
    quiz.attemptsCount = attempts.length;
    quiz.averageScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
    await quiz.save();
  }
});

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
