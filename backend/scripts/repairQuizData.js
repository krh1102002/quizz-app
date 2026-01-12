import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from '../models/Quiz.js';

dotenv.config();

const repairQuizData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const quizzes = await Quiz.find({});
    console.log(`Checking ${quizzes.length} quizzes...`);

    let totalFixed = 0;

    for (const quiz of quizzes) {
      if (!quiz.questions || quiz.questions.length === 0) continue;

      let quizModified = false;

      quiz.questions.forEach((q, index) => {
        const exp = q.explanation || '';
        // Match "Option A", "Ans: A", "Correct option: A", "Answer: (A)"
        // Be careful not to match random text. The patterns seen in logs are "option: A", "Option B", "Correct option: A".
        // Leading case insensitive "Option", "Ans", "Answer", followed by optional separators, then A-D.
        const optionMentionMatch = exp.match(/(?:Option|Ans|Answer|Correct option|Correct Option)\s*[:\-\s]?\s*\(?([A-D])\)?/i);

        if (optionMentionMatch) {
            const mentionedChar = optionMentionMatch[1].toUpperCase();
            const correctIndexFromExp = mentionedChar.charCodeAt(0) - 65;

            if (q.correctAnswer !== correctIndexFromExp) {
                 console.log(`🛠️ Fixing Quiz ${quiz.title} Q${index}:`);
                 console.log(`   Explanation: "${optionMentionMatch[0]}" -> Index ${correctIndexFromExp} (${mentionedChar})`);
                 console.log(`   Old Index: ${q.correctAnswer}`);
                 
                 q.correctAnswer = correctIndexFromExp;
                 quizModified = true;
                 totalFixed++;
            }
        }
      });

      if (quizModified) {
        await quiz.save();
        console.log(`💾 Saved Quiz ${quiz._id}`);
      }
    }

    console.log(`\n🎉 Repair Complete. Fixed ${totalFixed} questions.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

repairQuizData();
