import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';

dotenv.config();

const getTestQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const quiz = await Quiz.findOne({ isActive: true });
    if (!quiz) { 
        console.log('Quiz not found'); 
        process.exit(1);
    }
    
    console.log('QUIZ_ID:', quiz._id);
    console.log('TITLE:', quiz.title);
    
    // Print 0-based indices for the agent
    const answers = quiz.questions.map(q => q.correctAnswer);
    console.log('ANSWERS:', JSON.stringify(answers));
    
    // Also print text for verification if needed
    // const options = quiz.questions.map(q => q.options[q.correctAnswer]);
    // console.log('OPTION_TEXTS:', JSON.stringify(options));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getTestQuiz();
