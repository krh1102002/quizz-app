import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Quiz from '../models/Quiz.js';

dotenv.config();

const verifyQuizData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const quizzes = await Quiz.find({});
    console.log(`Checking ${quizzes.length} quizzes...`);

    let issuesFound = 0;

    for (const quiz of quizzes) {
      if (!quiz.questions || quiz.questions.length === 0) {
        console.log(`⚠️ Quiz ${quiz._id} (${quiz.title}) has no questions.`);
        issuesFound++;
        continue;
      }

      quiz.questions.forEach((q, index) => {
        // Check if correctAnswer index is valid
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          console.error(`❌ Quiz ${quiz._id}: Question ${index} has invalid correctAnswer index ${q.correctAnswer}. Options length: ${q.options.length}`);
          issuesFound++;
        }

        // Check for duplicates in options (suspicious)
        const uniqueOptions = new Set(q.options);
        if (uniqueOptions.size !== q.options.length) {
             console.warn(`⚠️ Quiz ${quiz._id}: Question ${index} has duplicate options.`);
        }

        // Heuristic: Check if explanation mentions "Option X" or "(X)"
        // 0->A, 1->B, 2->C, 3->D
        const correctChar = String.fromCharCode(65 + q.correctAnswer); // A, B, C...
        const exp = q.explanation || '';
        
        const optionMentionMatch = exp.match(/(?:Option|Ans)\s*[:\-\s]?\s*([A-D])/i);
        if (optionMentionMatch) {
            const mentionedOption = optionMentionMatch[1].toUpperCase();
            if (mentionedOption !== correctChar) {
                 if (issuesFound < 10) {
                     const msg = `❌ Quiz ${quiz.title} (${quiz._id}): Q${index} mismatch.\n` +
                                 `   Correct Index: ${q.correctAnswer} -> ${correctChar}\n` +
                                 `   Explanation says: "${optionMentionMatch[0]}"\n` +
                                 `   Options: ${JSON.stringify(q.options)}\n` +
                                 `   Explanation Full: ${q.explanation}\n\n`;
                     console.error(msg);
                     fs.appendFileSync('validation_errors.log', msg);
                 }
                 issuesFound++;
            }
        }
      });
    }

    if (issuesFound === 0) {
      console.log('🎉 No data integrity issues found in Quizzes.');
    } else {
      console.log(`🛑 Found ${issuesFound} issues.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyQuizData();
