import express from 'express';
import Quiz from '../models/Quiz.js';
import Topic from '../models/Topic.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { difficulty, limit = 20 } = req.query;
    const filter = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    
    const quizzes = await Quiz.find(filter)
      .populate('topic', 'name icon color')
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(quizzes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/random
// @desc    Get a random quiz
// @access  Public
router.get('/random', async (req, res) => {
  try {
    const count = await Quiz.countDocuments({ isActive: true });
    const random = Math.floor(Math.random() * count);
    
    const quiz = await Quiz.findOne({ isActive: true })
      .skip(random)
      .populate('topic', 'name icon color');
    
    if (!quiz) {
      return res.status(404).json({ error: 'No quizzes found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/topic/:topicId
// @desc    Get quizzes by topic
// @access  Public
router.get('/topic/:topicId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      topic: req.params.topicId, 
      isActive: true 
    })
      .populate('topic', 'name icon color')
      .populate('subtopic', 'name')
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/subtopic/:subtopicId
// @desc    Get quizzes by subtopic
// @access  Public
router.get('/subtopic/:subtopicId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      subtopic: req.params.subtopicId, 
      isActive: true 
    })
      .populate('topic', 'name icon color')
      .populate('subtopic', 'name')
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz with questions
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('topic', 'name icon color');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/:id/admin
// @desc    Get single quiz with all data (including correct answers)
// @access  Admin only
router.get('/:id/admin', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('topic', 'name icon color')
      .populate('createdBy', 'name email');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/quizzes/admin/all
// @desc    Get all quizzes for admin (including inactive)
// @access  Admin only
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('topic', 'name icon color')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/quizzes
// @desc    Create a quiz
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, topic, questions, difficulty, timeLimit } = req.body;
    
    // Verify topic exists
    const topicExists = await Topic.findById(topic);
    if (!topicExists) {
      return res.status(400).json({ error: 'Invalid topic' });
    }
    
    const quiz = await Quiz.create({
      title,
      description,
      topic,
      questions,
      difficulty,
      timeLimit,
      createdBy: req.user._id
    });
    
    // Update topic quiz count
    await Topic.findByIdAndUpdate(topic, { $inc: { quizCount: 1 } });
    
    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('topic', 'name icon color');
    
    res.status(201).json(populatedQuiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, topic, questions, difficulty, timeLimit, isActive } = req.body;
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description, topic, questions, difficulty, timeLimit, isActive },
      { new: true, runValidators: true }
    ).populate('topic', 'name icon color');
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Update topic quiz count
    await Topic.findByIdAndUpdate(quiz.topic, { $inc: { quizCount: -1 } });
    
    await Quiz.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
