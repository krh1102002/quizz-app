import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Subtopic from '../models/Subtopic.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const quizCount = await Quiz.countDocuments();
  const subtopicCount = await Subtopic.countDocuments();
  
  // Count total distinct questions across all quizzes
  const allQuizzes = await Quiz.find({}, 'questions');
  let totalUniqueQs = 0;
  // This is a bit complex to find unique across sets, but let's just count total referenced
  allQuizzes.forEach(q => {
    totalUniqueQs += q.questions.length;
  });

  console.log(`--- DB STATUS ---`);
  console.log(`Subtopics: ${subtopicCount}`);
  console.log(`Total Quizzes: ${quizCount}`);
  
  const grandQuiz = await Quiz.findOne({ title: 'Grand Syllabus Mega Quiz' });
  if (grandQuiz) {
    console.log(`✅ Grand Syllabus Mega Quiz: FOUND (${grandQuiz.questions.length} questions)`);
  } else {
    console.log(`❌ Grand Syllabus Mega Quiz: NOT FOUND`);
  }
  
  await mongoose.connection.close();
}

verify().catch(console.error);
