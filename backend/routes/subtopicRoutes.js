import express from 'express';
import Subtopic from '../models/Subtopic.js';
import Topic from '../models/Topic.js';
import Quiz from '../models/Quiz.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/subtopics
// @desc    Get all subtopics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { topicId } = req.query;
    const filter = { isActive: true };
    if (topicId) filter.topic = topicId;
    
    const subtopics = await Subtopic.find(filter)
      .populate('topic', 'name icon color')
      .sort({ name: 1 });
    res.json(subtopics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/subtopics/by-topic/:topicId
// @desc    Get subtopics for a specific topic
// @access  Public
router.get('/by-topic/:topicId', async (req, res) => {
  try {
    const subtopics = await Subtopic.find({ 
      topic: req.params.topicId, 
      isActive: true 
    }).sort({ name: 1 });
    res.json(subtopics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/subtopics/:id
// @desc    Get single subtopic with quizzes
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subtopic = await Subtopic.findById(req.params.id)
      .populate('topic', 'name icon color');
    
    if (!subtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    
    // Get quizzes for this subtopic
    const quizzes = await Quiz.find({ subtopic: req.params.id, isActive: true })
      .select('-questions.correctAnswer -questions.explanation')
      .sort({ createdAt: -1 });
    
    res.json({ subtopic, quizzes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/subtopics
// @desc    Create a subtopic
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, topic, icon } = req.body;
    
    // Verify topic exists
    const topicExists = await Topic.findById(topic);
    if (!topicExists) {
      return res.status(400).json({ error: 'Invalid topic' });
    }
    
    const subtopic = await Subtopic.create({
      name,
      description,
      topic,
      icon
    });
    
    const populated = await Subtopic.findById(subtopic._id)
      .populate('topic', 'name icon color');
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/subtopics/:id
// @desc    Update a subtopic
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, isActive } = req.body;
    
    const subtopic = await Subtopic.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    ).populate('topic', 'name icon color');
    
    if (!subtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    
    res.json(subtopic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/subtopics/:id
// @desc    Delete a subtopic
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const subtopic = await Subtopic.findByIdAndDelete(req.params.id);
    
    if (!subtopic) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    
    res.json({ message: 'Subtopic deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
