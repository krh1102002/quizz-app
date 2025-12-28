import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Topic from './models/Topic.js';
import Subtopic from './models/Subtopic.js';
import Quiz from './models/Quiz.js';

dotenv.config();

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const formatMoney = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// --- ROBUST GENERATORS ---
const generators = {
  // --- QUANTITATIVE ---
  'Percentages': (count) => generateUnique([
    () => {
      const x = randomInt(10, 50) * 10;
      const y = randomInt(100, 1000);
      const ans = Math.round((x / 100) * y);
      return { q: `What is ${x}% of ${y}?`, opts: [ans, ans+10, ans-5, ans+25], correct: 0, exp: `${x}% of ${y} = ${ans}` };
    },
    () => {
      const a = randomInt(20, 100);
      const b = randomInt(200, 500);
      return { q: `${a} is what % of ${b}?`, opts: [`${((a/b)*100).toFixed(1)}%`, '10%', '25%', '50%'], correct: 0, exp: `(${a}/${b})*100` };
    }
  ], count),

  'Profit & Loss': (count) => generateUnique([
    () => {
      const cp = randomInt(100, 500)*10;
      const p = randomInt(10, 30); 
      const sp = Math.round(cp * (1 + p/100));
      return { q: `CP = ${cp}, Profit = ${p}%. Find SP.`, opts: [sp, sp+50, sp-20, cp+p], correct: 0, exp: `SP = CP * (1+${p}/100)` };
    }
  ], count),

  'Simple Interest': (count) => generateUnique([
    () => {
      const p = randomInt(10, 100) * 1000;
      const r = randomInt(5, 15);
      const t = randomInt(2, 5);
      const si = (p*r*t)/100;
      return { q: `P = ${p}, R = ${r}%, T = ${t} years. Find SI.`, opts: [si, si+200, si+500, si-100], correct: 0, exp: `SI = PTR/100` };
    }
  ], count),
  
  'Averages': (count) => generateUnique([
    () => {
       const n = randomInt(5, 12);
       const nums = Array.from({length: n}, () => randomInt(10, 99));
       const sum = nums.reduce((a,b)=>a+b,0);
       const avg = (sum/n).toFixed(2);
       return { q: `Average of ${nums.join(', ')}?`, opts: [avg, (parseFloat(avg)+2).toFixed(2), (parseFloat(avg)-1).toFixed(2), '50'], correct: 0, exp: `Sum=${sum}, Count=${n}` };
    }
  ], count),
  
  'Ratio & Proportion': (count) => generateUnique([
    () => {
      const a = randomInt(2, 9);
      const b = randomInt(3, 11);
      const x = randomInt(10, 50) * a;
      const y = (x/a)*b;
      return { q: `Two numbers are in ratio ${a}:${b}. If first is ${x}, find second.`, opts: [y, y+5, y-2, y*2], correct: 0, exp: `${x}/x = ${a}/${b} => x = ${y}` };
    }
  ], count),

  'Numbers': (count) => generateUnique([
    () => {
      const a = randomInt(10, 50);
      const b = randomInt(10, 50);
      return { q: `What is the HCF of ${a*randomInt(2,5)} and ${a*randomInt(6,9)}?`, opts: [a, a+1, 1, 2], correct: 0, exp: `Common factor is ${a}` };
    }
  ], count),

  // --- LOGICAL ---
  'Number Series': (count) => generateUnique([
    () => {
       const start = randomInt(1, 20);
       const diff = randomInt(2, 5);
       const ser = Array.from({length:5}, (_,i) => start + i*diff);
       return { q: `Next in: ${ser.slice(0,4).join(', ')}?`, opts: [ser[4], ser[4]+1, ser[4]-1, ser[4]+diff], correct: 0, exp: `AP with +${diff}` };
    }
  ], count),

  'Coding-Decoding': (count) => generateUnique([
    () => {
      const word = randomChoice(['CAT', 'DOG', 'PEN', 'MAP', 'EAT']);
      const coded = word.split('').map(c => String.fromCharCode(c.charCodeAt(0)+1)).join('');
      return { q: `If ${word} = ${coded}, how is BAT coded?`, opts: ['CBU', 'CAT', 'DOG', 'ABC'], correct: 0, exp: '+1 char shift' };
    }
  ], count),

  // --- STATIC POOLS ---
  'Blood Relations': (count) => getFromPool([
     {q: 'Pointing to a man, a woman said "His mother is the only daughter of my mother". How is the woman related to the man?', opts: ['Mother', 'Sister', 'Aunt', 'Grandmother'], correct: 0, exp: 'The woman is the mother.'},
     {q: 'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. Then, how is A related to D?', opts: ['Granddaughter', 'Daughter', 'Aunt', 'Sister'], correct: 0, exp: 'A is C\'s daughter, so D\'s granddaughter.'},
     {q: 'A is father of B and C. B is the son of A. But C is not the son of A. How is C related to A?', opts: ['Daughter', 'Son', 'Wife', 'Father'], correct: 0, exp: 'C is the daughter.'},
     {q: 'P is the brother of Q and R. S is R\'s mother. T is P\'s father. Which of the following statements cannot be definitely true?', opts: ['T is Q\'s father', 'S is P\'s mother', 'P is S\'s son', 'Q is T\'s son'], correct: 3, exp: 'Q\'s gender is unknown.'}
  ], count),

  'Direction Sense': (count) => getFromPool([
     {q: 'A man walks 5 km toward South and then turns to the right. After walking 3 km he turns to the left and walks 5 km. Now in which direction is he from the starting place?', opts: ['West', 'South', 'North-East', 'South-West'], correct: 3, exp: 'South-West direction.'},
     {q: 'One morning Udai and Vishal were talking to each other face to face at a crossing. If Vishal\'s shadow was exactly to the left of Udai, which direction was Udai facing?', opts: ['North', 'East', 'West', 'South'], correct: 0, exp: 'North.'}
  ], count),

  'Verbal': (count) => getFromPool([
    {q: 'Synonym of ABANDON', opts: ['Leave', 'Keep', 'Start', 'Join'], correct: 0, exp: 'Leave'},
    {q: 'Antonym of ANCIENT', opts: ['Modern', 'Old', 'Past', 'History'], correct: 0, exp: 'Modern'},
    {q: 'One who knows everything', opts: ['Omniscient', 'Omnipotent', 'Omnipresent', 'Optimist'], correct: 0, exp: 'Omniscient'},
    {q: 'A place where birds are kept', opts: ['Aviary', 'Apiary', 'Zoo', 'Aquarium'], correct: 0, exp: 'Aviary'},
    {q: 'Idiom: To break the ice', opts: ['To start conversation', 'To cool down', 'To break something', 'To get angry'], correct: 0, exp: 'Start conversation'},
    {q: 'Find the correctly spelt word', opts: ['Embarrassment', 'Embarrasment', 'Embarassment', 'Embarasment'], correct: 0, exp: 'Double r, double s.'}
  ], count),

  'DI': (count) => getFromPool([
    {q: 'Which chart uses slices to show proportions?', opts: ['Pie Chart', 'Bar Graph', 'Line Graph', 'Table'], correct: 0, exp: 'Pie Chart'},
    {q: 'In a bar graph, the height of bar represents?', opts: ['Value/Frequency', 'Time', 'Width', 'Nothing'], correct: 0, exp: 'Value'},
    {q: 'X-axis is usually?', opts: ['Horizontal', 'Vertical', 'Diagonal', 'Circular'], correct: 0, exp: 'Horizontal'},
    {q: 'Data shows sales: 2020(100), 2021(150). Growth %?', opts: ['50%', '33%', '100%', '25%'], correct: 0, exp: '(50/100)*100 = 50%'}
  ], count),

  'Generic': (count, subtopic) => generateUnique([
    () => {
       const a = randomInt(10, 100); 
       const b = randomInt(10, 100);
       return { q: `${subtopic}: If x = ${a} and y = ${b}, calc x+y?`, opts: [a+b, a-b, a*b, a/b], correct: 0, exp: 'Addition' }; 
    }
  ], count)
};

function getFromPool(pool, count) {
  const res = [];
  while(res.length < count) {
    res.push(...pool); // Repeat pool if needed
  }
  return res.slice(0, count).map(q => ({
     question: q.q + (res.length > pool.length ? ` (Var ${Math.floor(Math.random()*100)})` : ''), 
     options: q.opts.sort(()=>0.5-Math.random()),
     correctAnswer: 0, // After sort, need logic to find correct. Wait, getFromPool simple logic:
     // Ideally we check where the correct one went.
     // Simplified:
     points: 10,
     explanation: q.exp
  })).map(q => {
     // Fix correct answer index
     const correctTxt = pool.find(p => p.q === q.question.split(' (Var')[0]).opts[pool.find(p => p.q === q.question.split(' (Var')[0]).correct];
     const idx = q.options.indexOf(correctTxt);
     return {...q, correctAnswer: idx >= 0 ? idx : 0};
  });
}

function generateUnique(typeGenerators, count) {
    // ... [Same Logic as before] ...
    const result = [];
    const generated = new Set();
    let attempts = 0;
    while (result.length < count && attempts < count * 20) {
      attempts++;
      const gen = randomChoice(typeGenerators);
      const data = gen();
      if (!generated.has(data.q)) {
        generated.add(data.q);
        const correctVal = data.opts[data.correct];
        const allOpts = [...data.opts].sort(() => 0.5 - Math.random());
        const newCorrect = allOpts.indexOf(correctVal);
        result.push({
          question: data.q, options: allOpts.map(String), correctAnswer: newCorrect, explanation: data.exp, points: 10
        });
      }
    }
    while(result.length < count) {
       const r = result[0] || { question: 'Fallback', options:['A','B'], correctAnswer:0, points:10, explanation:'None' };
       result.push({...r, question: `${r.question} (Copy ${result.length})`}); 
    }
    return result;
}

// MAIN SEED
const seedDatabase = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected');
      await Promise.all([User.deleteMany({}), Topic.deleteMany({}), Subtopic.deleteMany({}), Quiz.deleteMany({})]);
      const admin = await User.create({ name: 'Admin', email: 'admin@quiz.com', password: 'admin123', role: 'admin' });
      await User.create({ name: 'User', email: 'user@quiz.com', password: 'user123', role: 'user' });
  
      const topics = [
        {
          name: 'Quantitative Aptitude', icon: '🔢', color: '#6366f1',
          subtopics: [
             'Number System', 'HCF & LCM', 'Decimal Fraction', 'Simplification', 'Square Root & Cube Root', 
             'Average', 'Problems on Numbers', 'Problems on Ages', 'Surds & Indices', 'Percentage', 
             'Profit & Loss', 'Ratio & Proportion', 'Partnership', 'Chain Rule', 'Time & Work', 
             'Pipes & Cistern', 'Time & Distance', 'Boats & Streams', 'Problems on Trains', 
             'Mixture & Alligation', 'Simple Interest', 'Compound Interest', 'Area', 'Volume & Surface Area'
          ]
        },
        {
          name: 'Logical Reasoning', icon: '🧩', color: '#8b5cf6',
          subtopics: [
            'Number Series', 'Verbal Classification', 'Analogies', 'Matching Definitions', 'Logical Games',
            'Statement and Assumption', 'Statement and Conclusion', 'Cause and Effect', 'Logical Deduction',
            'Letter and Symbol Series', 'Essential Part', 'Artificial Language', 'Making Judgments',
            'Analyzing Arguments', 'Course of Action'
          ]
        },
        {
          name: 'Verbal Ability', icon: '📝', color: '#ec4899',
          subtopics: [
            'Spotting Errors', 'Antonyms', 'Spellings', 'Ordering of Words', 'Sentence Correction',
            'Ordering of Sentences', 'Closet Test', 'One Word Substitutes', 'Change of Voice',
            'Verbal Analogies', 'Synonyms', 'Selecting Words', 'Sentence Formation', 'Completing Statements'
          ]
        },
        {
          name: 'Data Interpretation', icon: '📊', color: '#14b8a6',
          subtopics: [
            'Table Charts', 'Pie Charts', 'Bar Charts', 'Line Charts'
          ]
        },
        {
          name: 'Mixed Aptitude', icon: '🎲', color: '#f59e0b', subtopics: ['Mock Tests']
        }
      ];
  
      let totalQuizzes = 0;
  
      for (const t of topics) {
        const topic = await Topic.create({ name: t.name, icon: t.icon, color: t.color });
        console.log(`Processing ${t.name}...`);
        
        let topicQuizCount = 0;
  
        for (const sName of t.subtopics) {
          const subtopic = await Subtopic.create({ name: sName, topic: topic._id });
  
          if (t.name === 'Mixed Aptitude') {
             // Create Mock Tests
             for(let i=1; i<=5; i++) {
               const qs = [...generators['Percentages'](10), ...generators['Profit & Loss'](10)].sort(()=>0.5-Math.random()).slice(0, 20);
               await Quiz.create({
                 title: `Mock Test ${i}`, description: 'Mixed', topic: topic._id, subtopic: subtopic._id,
                 questions: qs, quizType: 'short', timeLimit: 1200, createdBy: admin._id
               });
               topicQuizCount++; totalQuizzes++;
             }
             await Subtopic.findByIdAndUpdate(subtopic._id, { quizCount: 5 });
             continue;
          }
  
          // GENERATOR SELECTION LOGIC
          let genFunc;
          if (t.name === 'Quantitative Aptitude') {
             if (sName.includes('Percentage')) genFunc = generators['Percentages'];
             else if (sName.includes('Profit')) genFunc = generators['Profit & Loss'];
             else if (sName.includes('Interest')) genFunc = generators['Simple Interest'];
             else if (sName.includes('Average')) genFunc = generators['Averages'];
             else if (sName.includes('Ratio')) genFunc = generators['Ratio & Proportion'];
             else if (sName.includes('Number')) genFunc = generators['Numbers'];
             else genFunc = (c) => generators['Generic'](c, sName);
          } 
          else if (t.name === 'Logical Reasoning') {
             if (sName.includes('Series')) genFunc = generators['Number Series'];
             else if (sName.includes('Coding')) genFunc = generators['Coding-Decoding'];
             else genFunc = (c) => generators['Blood Relations'](c); // Fallback to Blood/Logic Pool
          }
          else if (t.name === 'Verbal Ability') {
             genFunc = (c) => generators['Verbal'](c); // Use Verbal Pool
          }
          else if (t.name === 'Data Interpretation') {
             genFunc = (c) => generators['DI'](c); // Use DI Pool
          }
          else {
             genFunc = (c) => generators['Generic'](c, sName);
          }
  
          // CREATE QUIZZES
          for (let i = 1; i <= 10; i++) {
             const isLong = i % 3 === 0;
             const qCount = isLong ? 40 : 15;
             const qs = genFunc(qCount);
             
             await Quiz.create({
               title: `${sName} ${i}`, description: `Practice ${i}`, topic: topic._id, subtopic: subtopic._id,
               questions: qs, quizType: isLong ? 'long' : 'short', timeLimit: isLong ? 3000 : 1200, createdBy: admin._id
             });
             topicQuizCount++; totalQuizzes++;
          }
          await Subtopic.findByIdAndUpdate(subtopic._id, { quizCount: 10 });
        }
        await Topic.findByIdAndUpdate(topic._id, { quizCount: topicQuizCount });
      }
  
      console.log(`\n🎉 Done! ${totalQuizzes} quizzes created.`);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  };
  
  seedDatabase();
