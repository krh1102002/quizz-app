import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Topic from '../models/Topic.js';
import Subtopic from '../models/Subtopic.js';
import { parseMarkdownQuestions, findDuplicates } from './question_parser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing database
async function clearDatabase() {
  console.log('\n🧹 Clearing existing database...');
  try {
    const quizResult = await Quiz.deleteMany({});
    const subtopicResult = await Subtopic.deleteMany({});
    const topicResult = await Topic.deleteMany({});
    console.log(`  ✅ Deleted ${quizResult.deletedCount} quizzes`);
    console.log(`  ✅ Deleted ${subtopicResult.deletedCount} subtopics`);
    console.log(`  ✅ Deleted ${topicResult.deletedCount} topics`);
  } catch (error) {
    console.error('  ❌ Error clearing database:', error.message);
  }
}

// Topic and Subtopic definitions
const TOPIC_STRUCTURE = {
  'Quantitative Aptitude': {
    icon: '🔢',
    color: '#6366f1',
    subtopics: [
      'Number System', 'HCF & LCM', 'Percentage', 'Profit and Loss', 'Average',
      'Ages', 'Chain Rule', 'Time & Work', 'Pipes & Cistern', 'Time & Distance',
      'Boats & Streams', 'Problems on Trains', 'Mixture & Alligation',
      'Simple Interest', 'Compound Interest', 'Area', 'Volume & Surface Area',
      'Ratio and Proportion', 'Partnership'
    ]
  },
  'Logical Reasoning': {
    icon: '🧩',
    color: '#10b981',
    subtopics: [
      'Number Series', 'Analogies', 'Matching Definitions',
      'Seating Arrangement', 'Coding & Decoding', 'Blood Relation',
      'Statement and Assumption', 'Statement and Conclusion',
      'Letter and Symbol Series', 'Calendar', 'Clocks', 'Races'
    ]
  },
  'Data Interpretation': {
    icon: '📊',
    color: '#ec4899',
    subtopics: ['Table Charts', 'Pie Charts', 'Bar Charts', 'Line Charts']
  }
};

// Create topics and subtopics in database
async function setupTopicsAndSubtopics() {
  console.log('\n📚 Setting up topics and subtopics...');
  
  for (const [topicName, topicData] of Object.entries(TOPIC_STRUCTURE)) {
    // Create or update topic
    let topic = await Topic.findOne({ name: topicName });
    if (!topic) {
      topic = await Topic.create({
        name: topicName,
        icon: topicData.icon,
        color: topicData.color,
        description: `Questions related to ${topicName}`
      });
      console.log(`  ✅ Created topic: ${topicName}`);
    }
    
    // Create subtopics
    for (const subtopicName of topicData.subtopics) {
      let subtopic = await Subtopic.findOne({ name: subtopicName, topic: topic._id });
      if (!subtopic) {
        subtopic = await Subtopic.create({
          name: subtopicName,
          topic: topic._id,
          description: `Questions on ${subtopicName}`
        });
        console.log(`    ✅ Created subtopic: ${subtopicName}`);
      }
    }
  }
}

// Upload questions from a markdown file
async function uploadQuestionsFromFile(filePath, topicName, subtopicName) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);
  
  // Find topic and subtopic
  const topic = await Topic.findOne({ name: topicName });
  if (!topic) {
    console.error(`  ❌ Topic not found: ${topicName}`);
    return;
  }
  
  const subtopic = await Subtopic.findOne({ name: subtopicName, topic: topic._id });
  if (!subtopic) {
    console.error(`  ❌ Subtopic not found: ${subtopicName}`);
    return;
  }
  
  // Parse questions
  let questions = parseMarkdownQuestions(filePath);
  
  if (questions.length === 0) {
    console.log(`  ⚠️  No questions found in file`);
    return;
  }

  // Remove exact duplicates within the set
  const initialCount = questions.length;
  const uniqueQuestions = [];
  const questionTexts = new Set();

  for (const q of questions) {
    if (!questionTexts.has(q.question)) {
      questionTexts.add(q.question);
      uniqueQuestions.push(q);
    }
  }
  
  questions = uniqueQuestions;
  if (questions.length < initialCount) {
    console.log(`  ⚠️  Removed ${initialCount - questions.length} duplicate questions`);
  }

  console.log(`  📝 Uploading ${questions.length} questions`);
  
  // Split questions into specific types
  let remainingQuestions = [...questions];

  // 1. Create Topic-wise Short (15 questions, 20 mins)
  if (remainingQuestions.length >= 15) {
    const shortQuestions = remainingQuestions.splice(0, 15);
    await Quiz.create({
      title: `${subtopicName} - Short Practice`,
      description: `Fast-paced 15 questions to test your speed on ${subtopicName}`,
      topic: topic._id,
      subtopic: subtopic._id,
      questions: shortQuestions,
      difficulty: 'medium',
      timeLimit: 1200, // 20 minutes
      quizType: 'short'
    });
    console.log(`  ✅ Created Short Practice (15 questions)`);
    await Subtopic.findByIdAndUpdate(subtopic._id, { $inc: { quizCount: 1 } });
  }

  // 2. Create Topic-wise Long (40 questions, 50 mins)
  if (remainingQuestions.length >= 40) {
    const longQuestions = remainingQuestions.splice(0, 40);
    await Quiz.create({
      title: `${subtopicName} - Full Test`,
      description: `Comprehensive 40 questions full test on ${subtopicName}`,
      topic: topic._id,
      subtopic: subtopic._id,
      questions: longQuestions,
      difficulty: 'hard',
      timeLimit: 3000, // 50 minutes
      quizType: 'long'
    });
    console.log(`  ✅ Created Full Test (40 questions)`);
    await Subtopic.findByIdAndUpdate(subtopic._id, { $inc: { quizCount: 1 } });
  }

  // 3. Remaining questions into Practice Sets (25 each)
  const questionsPerSet = 25;
  const numSets = Math.ceil(remainingQuestions.length / questionsPerSet);
  
  for (let i = 0; i < numSets; i++) {
    const startIdx = i * questionsPerSet;
    const endIdx = Math.min(startIdx + questionsPerSet, remainingQuestions.length);
    const quizQuestions = remainingQuestions.slice(startIdx, endIdx);
    if (quizQuestions.length === 0) continue;

    const quizTitle = `${subtopicName} - Practice Set ${i + 1}`;
    
    await Quiz.create({
      title: quizTitle,
      description: `Practice questions ${i + 1} for ${subtopicName}`,
      topic: topic._id,
      subtopic: subtopic._id,
      questions: quizQuestions,
      difficulty: 'medium',
      timeLimit: quizQuestions.length * 60,
      quizType: 'short'
    });
    
    console.log(`  ✅ Created ${quizTitle} (${quizQuestions.length} questions)`);
    await Subtopic.findByIdAndUpdate(subtopic._id, { $inc: { quizCount: 1 } });
  }
  
  return { topic, subtopic, questionsCount: questions.length };
}

// Function to create mixed random quizzes across all topics
async function createMixedQuizzes(count = 5) {
  console.log(`\n🎲 Creating ${count} Mixed Random Quizzes...`);
  
  // Get a "Mixed" topic if it exists, or create one
  let mixedTopic = await Topic.findOne({ name: 'Mixed Aptitude' });
  if (!mixedTopic) {
    mixedTopic = await Topic.create({
      name: 'Mixed Aptitude',
      icon: '🎲',
      color: '#f59e0b',
      description: 'Mixed questions from all topics'
    });
  }

  let mixedSubtopic = await Subtopic.findOne({ name: 'Mock Tests', topic: mixedTopic._id });
  if (!mixedSubtopic) {
    mixedSubtopic = await Subtopic.create({
      name: 'Mock Tests',
      topic: mixedTopic._id,
      description: 'Full length mixed mock tests'
    });
  }

  // Get all quizzes to sample questions
  const allQuizzes = await Quiz.find({}).select('questions');
  let allPool = [];
  allQuizzes.forEach(q => {
    allPool.push(...q.questions);
  });

  if (allPool.length < 40) {
    console.log('  ⚠️ Not enough questions for mixed quizzes');
    return;
  }

  for (let i = 1; i <= count; i++) {
    // Shuffle and pick 40
    const shuffled = allPool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 40);

    await Quiz.create({
      title: `Mega Mock Test - ${i}`,
      description: `Randomly mixed 40 questions from all topics. Test your overall aptitude!`,
      topic: mixedTopic._id,
      subtopic: mixedSubtopic._id,
      questions: selected,
      difficulty: 'hard',
      timeLimit: 3000, // 50 minutes
      quizType: 'mock'
    });
    console.log(`  ✅ Created Mega Mock Test - ${i}`);
    await Subtopic.findByIdAndUpdate(mixedSubtopic._id, { $inc: { quizCount: 1 } });
  }
}

// Main upload function
async function uploadAllQuestions() {
  await connectDB();
  
  // Clear DB first
  await clearDatabase();
  
  // Re-setup structural elements
  await setupTopicsAndSubtopics();
  
  const questionFilesDir = path.join(__dirname, '../../');
  
  // Map of files to topic/subtopic
  const fileMapping = [
    // [Previously existing mappings...]
    { file: 'number system.md', topic: 'Quantitative Aptitude', subtopic: 'Number System' },
    { file: 'hcf.md', topic: 'Quantitative Aptitude', subtopic: 'HCF & LCM' },
    { file: 'percentage.md', topic: 'Quantitative Aptitude', subtopic: 'Percentage' },
    { file: 'ages.md', topic: 'Quantitative Aptitude', subtopic: 'Ages' },
    { file: 'avg.md', topic: 'Quantitative Aptitude', subtopic: 'Average' },
    { file: 'profit_and_loss.md', topic: 'Quantitative Aptitude', subtopic: 'Profit and Loss' },
    { file: 'chain_rule.md', topic: 'Quantitative Aptitude', subtopic: 'Chain Rule' },
    { file: 'time_and_work.md', topic: 'Quantitative Aptitude', subtopic: 'Time & Work' },
    { file: 'pipes_and_cistern.md', topic: 'Quantitative Aptitude', subtopic: 'Pipes & Cistern' },
    { file: 'time_and_distance.md', topic: 'Quantitative Aptitude', subtopic: 'Time & Distance' },
    { file: 'boats_and_streams.md', topic: 'Quantitative Aptitude', subtopic: 'Boats & Streams' },
    { file: 'problems_on_trains.md', topic: 'Quantitative Aptitude', subtopic: 'Problems on Trains' },
    { file: 'mixture_and_alligation.md', topic: 'Quantitative Aptitude', subtopic: 'Mixture & Alligation' },
    { file: 'simple_interest.md', topic: 'Quantitative Aptitude', subtopic: 'Simple Interest' },
    { file: 'compound_interest.md', topic: 'Quantitative Aptitude', subtopic: 'Compound Interest' },
    { file: 'area.md', topic: 'Quantitative Aptitude', subtopic: 'Area' },
    { file: 'volume_and_surface_area.md', topic: 'Quantitative Aptitude', subtopic: 'Volume & Surface Area' },
    { file: 'ratio_and_proportion.md', topic: 'Quantitative Aptitude', subtopic: 'Ratio and Proportion' },
    { file: 'partnership.md', topic: 'Quantitative Aptitude', subtopic: 'Partnership' },
    
    // Logical Reasoning
    { file: 'logical_reasoning_number_series.md', topic: 'Logical Reasoning', subtopic: 'Number Series' },
    { file: 'logical_reasoning_analogies.md', topic: 'Logical Reasoning', subtopic: 'Analogies' },
    { file: 'logical_reasoning_matching_definitions.md', topic: 'Logical Reasoning', subtopic: 'Matching Definitions' },
    { file: 'logical_reasoning_seating_arrangement.md', topic: 'Logical Reasoning', subtopic: 'Seating Arrangement' },
    { file: 'logical_reasoning_coding_decoding.md', topic: 'Logical Reasoning', subtopic: 'Coding & Decoding' },
    { file: 'logical_reasoning_blood_relation.md', topic: 'Logical Reasoning', subtopic: 'Blood Relation' },
    { file: 'logical_reasoning_statement_assumption.md', topic: 'Logical Reasoning', subtopic: 'Statement and Assumption' },
    { file: 'logical_reasoning_statement_conclusion.md', topic: 'Logical Reasoning', subtopic: 'Statement and Conclusion' },
    { file: 'logical_reasoning_letter_symbol_series.md', topic: 'Logical Reasoning', subtopic: 'Letter and Symbol Series' },
    { file: 'logical_reasoning_calendar.md', topic: 'Logical Reasoning', subtopic: 'Calendar' },
    { file: 'logical_reasoning_clocks.md', topic: 'Logical Reasoning', subtopic: 'Clocks' },
    { file: 'logical_reasoning_races.md', topic: 'Logical Reasoning', subtopic: 'Races' },

    // Data Interpretation
    { file: 'data_interpretation_table_charts.md', topic: 'Data Interpretation', subtopic: 'Table Charts' },
    { file: 'data_interpretation_pie_charts.md', topic: 'Data Interpretation', subtopic: 'Pie Charts' },
    { file: 'data_interpretation_bar_charts.md', topic: 'Data Interpretation', subtopic: 'Bar Charts' },
    { file: 'data_interpretation_line_charts.md', topic: 'Data Interpretation', subtopic: 'Line Charts' },
  ];
  
  let totalQuestions = 0;
  let successfulFiles = 0;
  
  for (const mapping of fileMapping) {
    const filePath = path.join(questionFilesDir, mapping.file);
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const result = await uploadQuestionsFromFile(filePath, mapping.topic, mapping.subtopic);
      if (result) {
        totalQuestions += result.questionsCount;
        successfulFiles++;
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${mapping.file}:`, error.message);
    }
  }

  // Create Mixed Random Quizzes after all questions are in DB
  await createMixedQuizzes(50);
  
  const totalQuizzes = await Quiz.countDocuments();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Standardized Quizzes Generation Complete!`);
  console.log(`   Files processed: ${successfulFiles}/${fileMapping.length}`);
  console.log(`   Total questions: ${totalQuestions}`);
  console.log(`   Total quizzes created: ${totalQuizzes}`);
  console.log(`${'='.repeat(60)}\n`);
  
  mongoose.connection.close();
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  uploadAllQuestions().catch(console.error);
}

export { uploadAllQuestions, uploadQuestionsFromFile, setupTopicsAndSubtopics, clearDatabase };
