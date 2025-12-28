import express from 'express';
import Attempt from '../models/Attempt.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/attempts
// @desc    Submit a quiz attempt
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    
    // Get quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Calculate score
    let score = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question && answer.selectedOption === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;
      
      return {
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
        pointsEarned
      };
    });
    
    const percentage = Math.round((score / quiz.totalPoints) * 100);
    
    // Create attempt
    const attempt = await Attempt.create({
      user: req.user._id,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      timeTaken
    });
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalQuizzesTaken: 1, totalScore: score }
    });
    
    // Populate and return
    const populatedAttempt = await Attempt.findById(attempt._id)
      .populate('quiz', 'title questions');
    
    res.status(201).json({
      attempt: populatedAttempt,
      correctAnswers: quiz.questions.map(q => ({
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/attempts/user
// @desc    Get user's attempts
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('quiz', 'title topic difficulty')
      .populate({
        path: 'quiz',
        populate: { path: 'topic', select: 'name icon' }
      })
      .sort({ createdAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/attempts/stats
// @desc    Get user's statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id });
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0,
      totalPoints: attempts.reduce((sum, a) => sum + a.score, 0),
      bestScore: attempts.length > 0 
        ? Math.max(...attempts.map(a => a.percentage))
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/attempts/:id
// @desc    Get single attempt
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('quiz', 'title questions topic')
      .populate({
        path: 'quiz',
        populate: { path: 'topic', select: 'name icon' }
      });
    
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
