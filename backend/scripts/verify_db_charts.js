import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const sample = await Quiz.findOne({ 'questions.chartData': { $ne: null } });
  
  if (sample) {
      console.log('✅ Found Quiz with Chart Data!');
      console.log('Title:', sample.title);
      const qWithChart = sample.questions.find(q => q.chartData);
      console.log('Question:', qWithChart.question);
      console.log('Chart Type:', qWithChart.chartType);
      console.log('Chart Data (first 2 entries):', qWithChart.chartData.slice(0, 2));
  } else {
      console.log('❌ No questions with chart data found in database.');
  }
  
  mongoose.connection.close();
}

verify();
