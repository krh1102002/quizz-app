


const API_URL = 'http://localhost:5000/api';
let TOKEN = '';

async function login() {
  console.log('1. Logging in...');
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@quiz.com', password: 'user123' })
  });
  
  if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
  const data = await res.json();
  TOKEN = data.token;
  console.log('✅ Login successful. Token obtained.');
}

async function getQuiz() {
  console.log('2. Fetching a quiz...');
  // Fetch specific quiz we repaired: 'Number System - Full Test' or just any active one
  const res = await fetch(`${API_URL}/quizzes`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  const quizzes = await res.json();
  if (quizzes.length === 0) throw new Error('No quizzes found');
  
  // Find a quiz with questions
  const quizMeta = quizzes.find(q => q.questions && q.questions.length > 0) || quizzes[0];
  
  // Get full details including questions
  const detailRes = await fetch(`${API_URL}/quizzes/${quizMeta._id}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const quiz = await detailRes.json();
  console.log(`✅ Got Quiz: ${quiz.title} (${quiz.questions.length} questions)`);
  return quiz;
}

async function submitQuiz(quiz) {
  console.log('3. Submitting answers...');
  
  const answers = quiz.questions.map((q, index) => {
    // We assume the stored correctAnswer is now correct (after repair)
    return {
      selectedOption: q.correctAnswer,
      questionIndex: index
    };
  });
  
  const payload = {
    quizId: quiz._id,
    answers: answers,
    timeTaken: 100
  };

  const res = await fetch(`${API_URL}/attempts`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  console.log('4. API Response:', JSON.stringify(result, null, 2));

  if (result.attempt.score === result.attempt.totalPoints) {
    console.log('🎉 SUCCESS: API calculated 100% score.');
  } else {
    console.error('❌ FAILURE: info mismatch.');
    console.error(`Expected: ${result.attempt.totalPoints}, Got: ${result.attempt.score}`);
    
    // Debug where we lost points
    result.attempt.answers.forEach((ans, i) => {
        if (!ans.isCorrect) {
            console.error(`   Q${i} marked wrong. Sent: ${answers[i].selectedOption}, Correct was: ?`);
        }
    });
  }
}

async function run() {
  try {
    await login();
    const quiz = await getQuiz();
    await submitQuiz(quiz);
  } catch (e) {
    console.error('Test Failed:', e);
  }
}

run();
