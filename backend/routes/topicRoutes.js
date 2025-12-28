import express from 'express';
import Topic from '../models/Topic.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/topics
// @desc    Get all topics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true }).sort({ name: 1 });
    res.json(topics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/topics/:id
// @desc    Get single topic
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/topics
// @desc    Create a topic
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    
    const topic = await Topic.create({
      name,
      description,
      icon,
      color
    });
    
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/topics/:id
// @desc    Update a topic
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body;
    
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, color, isActive },
      { new: true, runValidators: true }
    );
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/topics/:id
// @desc    Delete a topic
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
