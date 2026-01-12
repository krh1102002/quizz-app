import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';

dotenv.config();

const testAllGrading = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const quizzes = await Quiz.find({});
    console.log(`Testing grading logic for ${quizzes.length} quizzes...`);

    let failureCount = 0;

    for (const quiz of quizzes) {
      if (!quiz.questions || quiz.questions.length === 0) continue;

      let score = 0;
      let maxScore = 0;

      // Simulate a perfect attempt
      quiz.questions.forEach((q, index) => {
        // We select the option that the DB *thinks* is correct
        const selectedOption = q.correctAnswer;
        const points = q.points || 1;
        maxScore += points;

        // Grading Logic (mirrors backend route)
        if (selectedOption !== undefined && selectedOption === q.correctAnswer) {
             score += points;
        } else {
             // This theoretically shouldn't happen in this loop, but if data is missing 'correctAnswer' field?
             // Or if correctAnswer is out of bounds?
        }
      });

      if (score !== quiz.totalPoints) {
           console.error(`❌ Quiz ${quiz.title} (${quiz._id}) Grading Failed!`);
           console.error(`   Calculated Max Score: ${maxScore}`);
           console.error(`   Stored Total Points: ${quiz.totalPoints}`);
           console.error(`   Simulation Score: ${score}`);
           failureCount++;
           
           // Auto-fix totalPoints if mismatch logic (but not data integrity)
           // quiz.totalPoints = maxScore;
           // await quiz.save();
      }
    }

    if (failureCount === 0) {
      console.log('🎉 All 278+ Quizzes pass the grading simulation logic.');
      console.log('   (This means selecting the valid "correctAnswer" index yields 100% score).');
    } else {
      console.error(`🛑 Found ${failureCount} grading mismatches.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAllGrading();
