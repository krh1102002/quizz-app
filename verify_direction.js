import mongoose from 'mongoose';
import Quiz from './backend/models/Quiz.js';
import Subtopic from './backend/models/Subtopic.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, './backend/.env') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
  
  const subtopic = await Subtopic.findOne({ name: 'Direction Sense' });
  if (subtopic) {
    const quizzes = await Quiz.find({ subtopic: subtopic._id });
    console.log(`✅ Direction Sense found with ${quizzes.length} quizzes.`);
    quizzes.forEach(q => console.log(`   - ${q.title} (${q.questions.length} questions)`));
  } else {
    console.log('❌ Direction Sense subtopic not found.');
  }
  
  await mongoose.connection.close();
}

verify();
