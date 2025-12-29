import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    message: 'Quiz API is running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
