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
      'Ratio and Proportion', 'Partnership', 'Permutation and Combination'
    ]
  },
  'Logical Reasoning': {
    icon: '🧩',
    color: '#10b981',
    subtopics: [
      'Number Series', 'Analogies', 'Matching Definitions',
      'Seating Arrangement', 'Coding & Decoding', 'Blood Relation',
      'Direction Sense', 'Statement and Assumption', 'Statement and Conclusion',
      'Letter and Symbol Series', 'Calendar', 'Clocks', 'Races'
    ]
  },
  'Data Interpretation': {
    icon: '📊',
    color: '#ec4899',
    subtopics: ['Table Charts', 'Pie Charts', 'Bar Charts', 'Line Charts']
  }
};

const FORMULAS_DATA = {
  'Number System': [
    {
      title: 'Entities: Basic Symbols',
      content: '\\text{D: Dividend (Number to be divided)}\n\\text{d: Divisor (Number that divides)}\n\\text{q: Quotient (Result of division)}\n\\text{r: Remainder (Leftover after division)}',
      example: 'In 17 ÷ 3 = 5 R 2, D=17, d=3, q=5, r=2.'
    },
    {
      title: 'Division Algorithm',
      content: '\\text{Dividend = (Divisor } \\times \\text{ Quotient) + Remainder}\n\\text{D = (d } \\times \\text{ q) + r, where } 0 \\le r < d',
      example: '17 = (3 \\times 5) + 2'
    },
    {
      title: 'Series & Progressions',
      content: '\\text{a: First term, d: Common difference, n: Total terms, } L: \\text{Last term.}\n\\text{1. Sum of n natural numbers: } \\frac{n(n+1)}{2}\n\\text{2. nth term (AP): } a + (n-1)d\n\\text{3. Sum of AP: } \\frac{n}{2}[2a + (n-1)d]',
      example: 'Sum of 1-100: (100 * 101) / 2 = 5050.'
    }
  ],
  'HCF & LCM': [
    {
      title: 'Core Entities',
      content: '\\text{HCF: Highest Common Factor (Greatest number dividing all).}\n\\text{LCM: Least Common Multiple (Smallest number divisible by all).}',
      example: 'For 12 and 18: HCF=6, LCM=36.'
    },
    {
      title: 'Fundamental Property',
      content: '\\text{Product of two numbers = HCF } \\times \\text{ LCM}\n\\text{A } \\times \\text{ B = HCF(A,B) } \\times \\text{ LCM(A,B)}',
      example: '12 \\times 18 = 216; 6 \\times 36 = 216.'
    },
    {
      title: 'Fractions HCF/LCM',
      content: '\\text{HCF of Fractions = } \\frac{\\text{HCF of Numerators}}{\\text{LCM of Denominators}}\n\\text{LCM of Fractions = } \\frac{\\text{LCM of Numerators}}{\\text{HCF of Denominators}}',
      example: 'LCM of 1/2 and 3/4 = LCM(1,3)/HCF(2,4) = 3/2 = 1.5.'
    }
  ],
  'Percentage': [
    {
      title: 'Percentage Entities',
      content: '\\text{X: Part, Y: Whole, P: Percentage.}\n\\text{1. X is what \\% of Y: } (X/Y) \\times 100\n\\text{2. \\% Change: } \\frac{\\text{Final - Initial}}{\\text{Initial}} \\times 100',
      example: '40 is 80% of 50.'
    },
    {
      title: 'Successive & Commodity',
      content: '\\text{1. Net Change: } (a + b + \\frac{ab}{100})\\%\n\\text{2. Price Rise: If price up } R\\%, \\text{ consumption reduction to keep same spending } = (\\frac{R}{100+R} \\times 100)\\%',
      example: 'Price up 25%, reduce consumption by (25/125)*100 = 20%.'
    }
  ],
  'Profit and Loss': [
    {
      title: 'Trading Entities',
      content: '\\text{CP: Cost Price, SP: Selling Price, MP: Marked Price.}\n\\text{Profit = SP - CP, Loss = CP - SP (if positive).}',
      example: 'Buy 100, sell 120 -> Profit 20.'
    },
    {
      title: 'Ratios & Percentages',
      content: '\\text{1. Profit\\% = } (Profit/CP) \\times 100\n\\text{2. Loss\\% = } (Loss/CP) \\times 100\n\\text{Pro-Tip: Profit/Loss is ALWAYS on CP unless stated.}',
      example: 'Cost 200, Profit 50 -> Profit% = 25%.'
    },
    {
      title: 'Discount & False Weight',
      content: '\\text{1. Discount = MP - SP}\n\\text{2. Discount\\% = } (Discount/MP) \\times 100\n\\text{3. False Weight Gain\\% = } \\frac{\\text{Error}}{\\text{True Weight - Error}} \\times 100',
      example: '900g instead of 1kg -> Error=100. Gain=(100/900)*100 = 11.11%.'
    }
  ],
  'Average': [
    {
      title: 'Average Entities',
      content: '\\text{S: Sum of all values, n: Number of values.}\n\\text{Average = S / n}\n\\text{Sum = Average } \\times \\text{ n}',
      example: 'Avg of 10, 20, 30 = 60/3 = 20.'
    },
    {
      title: 'Speed Averages',
      content: '\\text{If distance is equal (x and y speeds): } \\text{Avg Speed} = \\frac{2xy}{x+y}\n\\text{If three equal distances (x, y, z): } \\text{Avg Speed} = \\frac{3xyz}{xy+yz+zx}',
      example: 'Go 40kmph, return 60kmph. Avg = (2*40*60)/(40+60) = 48kmph.'
    }
  ],
  'Ages': [
    {
      title: 'Time Vectors',
      content: '\\text{x: Current Age.}\n\\text{n years ago: } x - n\n\\text{n years hence: } x + n',
      example: 'A is 20. 5 yrs ago he was 15; 5 yrs later he will be 25.'
    },
    {
      title: 'Ratio Logic',
      content: '\\text{If ratio of ages is A:B, then ages are Ax and Bx.}\n\\text{Pro-Tip: The difference between ages of two people remains CONSTANT forever.}',
      example: 'Father and Son diff 25 yrs. After 10 yrs, diff is still 25.'
    }
  ],
  'Chain Rule': [
    {
      title: 'Work Variance Entities',
      content: '\\text{M: Men, D: Days, T: Time per day, W: Work, C: Consumption/Salary.}\n\\text{General Formula: } \\frac{M_1 D_1 T_1}{W_1} = \\frac{M_2 D_2 T_2}{W_2}',
      example: '10 men, 5 days, 8 hrs to build 1 wall. How many men for 2 walls in 4 days at 10 hrs?'
    }
  ],
  'Time & Work': [
    {
      title: 'Efficiency Entities',
      content: '\\text{W: Total units of work (often assumed as 1).}\n\\text{t: Time taken by individual.}\n\\text{Rate (1-day work) = 1 / t}',
      example: 'A in 10 days. A\'s 1-day work = 0.1 units.'
    },
    {
      title: 'Combined Work',
      content: '\\text{A in x days, B in y days. Both together in: } \\frac{xy}{x+y} \\text{ days.}\n\\text{A, B, C together: } \\frac{xyz}{xy+yz+zx} \\text{ days.}',
      example: 'A=10, B=15. Together = (10*15)/(10+15) = 150/25 = 6 days.'
    }
  ],
  'Pipes & Cistern': [
    {
      title: 'Flow Rate Entities',
      content: '\\text{Inlet: Filling pipe (+ work).}\n\\text{Outlet/Leak: Emptying pipe (- work).}\n\\text{Net Work per hour = } \\frac{1}{FillingTime} - \\frac{1}{EmptyTime}',
      example: 'Inlet 4h, Outlet 6h. Net = 1/4 - 1/6 = 1/12 (Fills in 12h).'
    }
  ],
  'Time & Distance': [
    {
      title: 'Motion Entities',
      content: '\\text{D: Distance, S: Speed, T: Time.}\n\\text{D = S } \\times \\text{ T}\n\\text{Pro-Tip: 1 km/hr = 5/18 m/s; 1 m/s = 18/5 km/hr.}',
      example: '90 km/hr = 90 * (5/18) = 25 m/s.'
    },
    {
      title: 'Relative Speed',
      content: '\\text{Opposite Direction: } S_1 + S_2\n\\text{Same Direction: } |S_1 - S_2|\n\\text{Meeting Time = } \\frac{\\text{Initial Distance}}{\\text{Relative Speed}}',
      example: 'A at 40, B at 60 opposite. Rel Speed = 100.'
    }
  ],
  'Boats & Streams': [
    {
      title: 'Velocity Entities',
      content: '\\text{u: Speed of boat in still water.}\n\\text{v: Speed of stream/current.}\n\\text{Downstream (D) = u + v}\n\\text{Upstream (U) = u - v}',
      example: 'Boat 10, Stream 2. D=12, U=8.'
    },
    {
      title: 'Inverse Entities',
      content: '\\text{Still Water Speed (u) = } \\frac{D + U}{2}\n\\text{Stream Speed (v) = } \\frac{D - U}{2}',
      example: 'D=15, U=5. Boat = 20/2 = 10.'
    }
  ],
  'Problems on Trains': [
    {
      title: 'Train Distance Entities',
      content: '\\text{L: Length of train, O: Length of object (bridge, platform).}\n\\text{Time to cross pole/point: } L / Speed\n\\text{Time to cross platform: } (L + O) / Speed',
      example: '200m train crosses 300m bridge. Distance = 500m.'
    }
  ],
  'Mixture & Alligation': [
    {
      title: 'Alligation Entities',
      content: '\\text{C: Cheaper rate, D: Dearer/Costly rate, M: Mean/Mixture rate.}\n\\text{Ratio (Cheaper:Dearer) = } \\frac{D - M}{M - C}',
      example: 'Rice at $20 and $30 mixed for $24. Ratio = (30-24):(24-20) = 6:4 = 3:2.'
    }
  ],
  'Simple Interest': [
    {
      title: 'SI Entities',
      content: '\\text{P: Principal, R: Rate per annum, T: Time in years.}\n\\text{SI = } \\frac{P \\times R \\times T}{100}\n\\text{Amount (A) = P + SI}',
      example: '$1000 at 10% for 2 years. SI = 200.'
    }
  ],
  'Compound Interest': [
    {
      title: 'CI Entities',
      content: '\\text{P: Principal, R: Rate, n: Time (years).}\n\\text{Amount (A) = } P(1 + \\frac{R}{100})^n\n\\text{CI = A - P}',
      example: '$1000 at 10% for 2 years. A = 1000 * 1.21 = 1210.'
    },
    {
      title: 'Frequency Variants',
      content: '\\text{Half-yearly: } R \\to R/2, n \\to 2n\n\\text{Quarterly: } R \\to R/4, n \\to 4n',
      example: '10% annually is effectively 5% twice a year.'
    }
  ],
  'Area': [
    {
      title: '2D Polygon Entities',
      content: '\\text{a: Side, L: Length, W: Width, r: Radius.}\n\\text{Square Area = } a^2\n\\text{Rectangle Area = } L \\times W\n\\text{Circle Area = } \\pi r^2',
      example: 'Square side 5, Area 25.'
    },
    {
      title: 'Triangle Area',
      content: '\\text{Base (b) \\& Height (h): } 0.5 \\times b \\times h\n\\text{Heron\'s: } \\sqrt{s(s-a)(s-b)(s-c)} \\text{ where } s = \\text{semi-perimeter.}',
      example: '3-4-5 triangle. s=6. Area = sqrt(6*3*2*1) = 6.'
    }
  ],
  'Volume & Surface Area': [
    {
      title: '3D Geometric Entities',
      content: '\\text{a: Side, r: Radius, h: Height.}\n\\text{Cube Vol = } a^3\n\\text{Sphere Vol = } \\frac{4}{3} \\pi r^3\n\\text{Cylinder Vol = } \\pi r^2 h',
      example: 'Sphere r=3, Vol = 36π.'
    }
  ],
  'Ratio and Proportion': [
    {
      title: 'Relationship Entities',
      content: '\\text{Ratio: a:b (Equality of fractions).}\n\\text{Proportion: a:b = c:d (Equality of ratios).} \\implies ad = bc',
      example: '2:3 = 4:6 because 2*6 = 3*4.'
    }
  ],
  'Partnership': [
    {
      title: 'Investment Entities',
      content: '\\text{C: Capital invested, T: Time period.}\n\\text{Profit Ratio: } (C_1 \\times T_1) : (C_2 \\times T_2)',
      example: 'A invests 500 for 12m, B invests 1000 for 6m. Ratio = 6000:6000 = 1:1.'
    }
  ],
  'Permutation and Combination': [
    {
      title: 'Entities & Factorials',
      content: '\\text{n: Total items, r: Items selected/arranged.}\n\\text{n! = } n \\times (n-1) \\times ... \\times 1',
      example: '5! = 120.'
    },
    {
      title: 'Arrangement vs Selection',
      content: '\\text{Permutation (Order matters): } ^n P_r = \\frac{n!}{(n-r)!}\n\\text{Combination (Order doesn\'t matter): } ^n C_r = \\frac{n!}{r!(n-r)!}',
      example: 'Ways to pick 2 from 3: ^3 C_2 = 3. Ways to arrange 2 from 3: ^3 P_2 = 6.'
    }
  ],
  'Direction Sense': [
    {
      title: 'Pythagoras Entity',
      content: '\\text{H: Hypotenuse (Shortest Distance), P: Perpendicular, B: Base.}\n\\text{H = } \\sqrt{P^2 + B^2}',
      example: 'Go 3m North, then 4m East. Distance = 5m.'
    }
  ],
  'Clocks': [
    {
      title: 'Time-Angle Entities',
      content: '\\text{H: Hour, M: Minutes.}\n\\text{Angle (}\\theta\\text{) = } |30H - \\frac{11}{2}M|',
      example: 'At 4:00 (H=4, M=0), Angle = 120 degrees.'
    }
  ],
  'Calendar': [
    {
      title: 'Day Mapping Entities',
      content: '\\text{Odd Days: Remainder when total days divided by 7.}\n\\text{Ordinary Year: 1 Odd Day. Leap Year: 2 Odd Days.}',
      example: '100 years have 5 odd days.'
    }
  ],
  'Races': [
    {
      title: 'Competitive Entities',
      content: '\\text{"A beats B by x meters" means when A is at finish (L), B is at (L-x).}\n\\text{"A beats B by t seconds" means B takes t sec more to finish.}',
      example: 'In 100m race, A beats B by 10m. A runs 100, B runs 90.'
    }
  ],
  'Blood Relation': [
    {
      title: 'Standard Notations',
      content: '\\text{Square: Male (+), Circle: Female (-).}\n\\text{Single Line: Siblings, Double Line: Spouses.}\n\\text{Vertical Line: Generation gap.}',
      example: 'A+ --- B- (Marriage), A+ | C+ (Father-Son)'
    }
  ],
  'Number Series': [
    {
      title: 'Logic Patterns',
      content: '\\text{Check: Difference, Ratio, Squares/Cubes, Alternating, Fibonacci.}\n\\text{Common Rule: } T_n = T_{n-1} + (n \\times k)',
      example: '2, 5, 10, 17... (x^2 + 1)'
    }
  ],
  'Coding & Decoding': [
    {
      title: 'Alphabet Positions',
      content: '\\text{EJOTY Rule: E=5, J=10, O=15, T=20, Y=25.}\n\\text{Opposite Letters (Sum 27): A-Z, B-Y, C-X, etc.}',
      example: 'If CAT=24 (3+1+20), then DOG=26 (4+15+7)'
    }
  ]
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
      
      // Match formulas by partial name or direct match
      let formulas = FORMULAS_DATA[subtopicName] || [];
      if (formulas.length === 0) {
         // Try mapping logical ones
         if (subtopicName.includes('Interest')) formulas = FORMULAS_DATA['Simple & Compound Interest'];
         if (subtopicName.includes('Work') || subtopicName.includes('Cistern') || subtopicName.includes('Rule')) formulas = FORMULAS_DATA['Time, Work & Pipes'];
         if (subtopicName.includes('Distance') || subtopicName.includes('Train') || subtopicName.includes('Boats')) formulas = FORMULAS_DATA['Speed, Time & Distance'];
         if (subtopicName.includes('Area') || subtopicName.includes('Volume')) formulas = FORMULAS_DATA['Mensuration (Area & Volume)'];
         if (subtopicName.match(/Ratio|Partnership/)) formulas = FORMULAS_DATA['Ratio, Proportion & Partnership'];
         if (subtopicName.match(/Direction|Clock|Calendar/)) formulas = FORMULAS_DATA['Logical Reasoning'];
      }

      if (!subtopic) {
        subtopic = await Subtopic.create({
          name: subtopicName,
          topic: topic._id,
          description: `Questions on ${subtopicName}`,
          formulas: formulas
        });
        console.log(`    ✅ Created subtopic: ${subtopicName}`);
      } else {
        // Update formulas
        subtopic.formulas = formulas;
        await subtopic.save();
        console.log(`    ✅ Updated formulas for: ${subtopicName}`);
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
  console.log(`\n🎲 Creating ${count} Mixed Random Quizzes (Multi-Subtopic Sampling)...`);
  
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

  // Get all existing subtopics and their questions
  const subtopics = await Subtopic.find({}).populate('topic');
  const allQuizzes = await Quiz.find({});
  
  // Group questions by subtopic for balanced sampling
  const subtopicPools = {};
  allQuizzes.forEach(q => {
    const key = q.subtopic.toString();
    if (!subtopicPools[key]) subtopicPools[key] = [];
    subtopicPools[key].push(...q.questions);
  });

  const availableSubtopics = Object.keys(subtopicPools);
  if (availableSubtopics.length === 0) {
    console.log('  ⚠️ No questions found for mixed quizzes');
    return;
  }

  for (let i = 1; i <= count; i++) {
    let selected = [];
    
    // Attempt to pick 2-3 questions from EACH subtopic to ensure real "Mixed" experience
    // Targeting 40 questions total
    let subtopicIdx = 0;
    while (selected.length < 40) {
       const subId = availableSubtopics[subtopicIdx % availableSubtopics.length];
       const pool = subtopicPools[subId];
       if (pool.length > 0) {
          const randomQ = pool[Math.floor(Math.random() * pool.length)];
          // Avoid exact string duplicates in this quiz
          if (!selected.find(s => s.question === randomQ.question)) {
             selected.push(randomQ);
          }
       }
       subtopicIdx++;
       // Safety break
       if (subtopicIdx > 1000) break;
    }

    // Shuffle final selection
    selected = selected.sort(() => 0.5 - Math.random());

    await Quiz.create({
      title: `Mega Mock Test - ${i}`,
      description: `Balanced mixed 40 questions from ${availableSubtopics.length} different topics.`,
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

// Function to create a SINGLE quiz that includes at least one question from EVERY subtopic
async function createGrandSyllabusQuiz() {
  console.log(`\n🏆 Creating "Grand Syllabus Final Quiz" (All Subtopics Included)...`);
  
  let mixedTopic = await Topic.findOne({ name: 'Mixed Aptitude' });
  let mixedSubtopic = await Subtopic.findOne({ name: 'Mock Tests', topic: mixedTopic._id });

  const allQuizzes = await Quiz.find({});
  const subtopicPools = {};
  allQuizzes.forEach(q => {
    const key = q.subtopic.toString();
    if (!subtopicPools[key]) subtopicPools[key] = [];
    subtopicPools[key].push(...q.questions);
  });

  const availableSubtopics = Object.keys(subtopicPools);
  let selected = [];

  // Pick exactly 2 questions from EVERY subtopic to ensure 100% coverage
  console.log(`  🔍 Sampling from ${availableSubtopics.length} subtopics...`);
  
  for (const subId of availableSubtopics) {
    const pool = subtopicPools[subId];
    if (pool.length >= 2) {
      // Pick 2 random questions
      const shuffled = pool.sort(() => 0.5 - Math.random());
      selected.push(shuffled[0], shuffled[1]);
    } else if (pool.length > 0) {
      selected.push(pool[0]);
    }
  }

  // Shuffle the final set
  selected = selected.sort(() => 0.5 - Math.random());

  await Quiz.create({
    title: `Grand Syllabus Mega Quiz`,
    description: `A massive quiz featuring 2 questions from EVERY single subtopic (${availableSubtopics.length} topics total).`,
    topic: mixedTopic._id,
    subtopic: mixedSubtopic._id,
    questions: selected,
    difficulty: 'hard',
    timeLimit: selected.length * 75, // approx 1.25 min per question
    quizType: 'mock'
  });

  console.log(`  ✅ Successfully created Grand Syllabus Mega Quiz with ${selected.length} questions.`);
  await Subtopic.findByIdAndUpdate(mixedSubtopic._id, { $inc: { quizCount: 1 } });
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
    { file: 'permutation_and_combination.md', topic: 'Quantitative Aptitude', subtopic: 'Permutation and Combination' },
    
    // Logical Reasoning
    { file: 'logical_reasoning_number_series.md', topic: 'Logical Reasoning', subtopic: 'Number Series' },
    { file: 'logical_reasoning_analogies.md', topic: 'Logical Reasoning', subtopic: 'Analogies' },
    { file: 'logical_reasoning_matching_definitions.md', topic: 'Logical Reasoning', subtopic: 'Matching Definitions' },
    { file: 'logical_reasoning_seating_arrangement.md', topic: 'Logical Reasoning', subtopic: 'Seating Arrangement' },
    { file: 'logical_reasoning_coding_decoding.md', topic: 'Logical Reasoning', subtopic: 'Coding & Decoding' },
    { file: 'logical_reasoning_blood_relation.md', topic: 'Logical Reasoning', subtopic: 'Blood Relation' },
    { file: 'logical_reasoning_direction_sense.md', topic: 'Logical Reasoning', subtopic: 'Direction Sense' },
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
  
  // Create the specific Grand Syllabus Quiz requested by user
  await createGrandSyllabusQuiz();
  
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
