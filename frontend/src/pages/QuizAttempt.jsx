import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { quizzesAPI, attemptsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChartViewer from '../components/ChartViewer';
import './QuizAttempt.css';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMixedQuiz, setIsMixedQuiz] = useState(false);

  useEffect(() => {
    // Check if mixed quiz from RandomQuiz page
    if (location.state?.mixedQuiz) {
      const mixedQuiz = location.state.mixedQuiz;
      setQuiz(mixedQuiz);
      setTimeLeft(mixedQuiz.timeLimit);
      setAnswers(new Array(mixedQuiz.questions.length).fill({ selectedOption: -1 }));
      setIsMixedQuiz(true);
      setLoading(false);
      return;
    }

    // Regular quiz fetch
    if (quizId && quizId !== 'mixed') {
      quizzesAPI.getOne(quizId)
        .then(data => {
          setQuiz(data);
          setTimeLeft(data.timeLimit);
          setAnswers(new Array(data.questions.length).fill({ selectedOption: -1 }));
        })
        .catch(err => {
          console.error(err);
          navigate('/quizzes');
        })
        .finally(() => setLoading(false));
    } else if (quizId === 'mixed' && !location.state?.mixedQuiz) {
      navigate('/random');
    }
  }, [quizId, navigate, location.state]);

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const finalAnswers = answers.map((a, i) => 
      i === currentQuestion && answers[currentQuestion].selectedOption === -1 
        ? { selectedOption: -1 } 
        : a
    );

    console.log('🟢 Submitting Answers:', finalAnswers);

    if (isAuthenticated) {
      try {
        const result = await attemptsAPI.submit({
          quizId,
          answers: finalAnswers,
          timeTaken: quiz.timeLimit - timeLeft
        });
        navigate(`/results/${result.attempt._id}`, { 
          state: { 
            result: result.attempt, 
            correctAnswers: result.correctAnswers,
            quiz 
          } 
        });
      } catch (error) {
        console.error(error);
        navigateToLocalResults(finalAnswers);
      }
    } else {
      navigateToLocalResults(finalAnswers);
    }
  }, [answers, currentQuestion, isAuthenticated, quizId, quiz, timeLeft, navigate, submitting]);

  const navigateToLocalResults = (finalAnswers) => {
    let score = 0;
    const processedAnswers = finalAnswers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) score += question.points || 1;
      return { ...answer, isCorrect };
    });

    navigate('/results/local', {
      state: {
        result: {
          score,
          totalPoints: quiz.totalPoints,
          percentage: Math.round((score / quiz.totalPoints) * 100),
          answers: processedAnswers
        },
        correctAnswers: quiz.questions.map(q => ({
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        quiz
      }
    });
  };

  const selectOption = (optionIndex) => {
    console.log('🔵 Select Option:', { 
      questionIndex: currentQuestion, 
      optionIndex, 
      optionText: quiz.questions[currentQuestion].options[optionIndex] 
    });
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { 
      ...newAnswers[currentQuestion], 
      selectedOption: optionIndex 
    };
    setAnswers(newAnswers);
  };

  const goToQuestion = (index) => {
    setVisitedQuestions(prev => new Set([...prev, index]));
    setCurrentQuestion(index);
    if (window.innerWidth <= 900) {
      setShowSidebar(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  };

  const markForReview = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { 
      ...newAnswers[currentQuestion], 
      markedForReview: !newAnswers[currentQuestion].markedForReview 
    };
    setAnswers(newAnswers);
  };

  const clearResponse = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { 
      ...newAnswers[currentQuestion], 
      selectedOption: -1 
    };
    setAnswers(newAnswers);
  };

  const getQuestionStatus = (index) => {
    const answer = answers[index];
    const isVisited = visitedQuestions.has(index);
    const isAnswered = answer?.selectedOption >= 0;
    const isMarked = answer?.markedForReview;
    const isCurrent = index === currentQuestion;

    if (isCurrent) return 'current';
    if (isMarked && isAnswered) return 'marked-answered';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'visited';
    return 'not-visited';
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStats = () => {
    const answered = answers.filter(a => a?.selectedOption >= 0).length;
    const marked = answers.filter(a => a?.markedForReview).length;
    const notVisited = quiz.questions.length - visitedQuestions.size;
    return { answered, marked, notVisited, visited: visitedQuestions.size - answered };
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner-large"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  // Quiz intro screen
  if (!started) {
    return (
      <div className="quiz-intro-page">
        <div className="quiz-intro-card">
          <div className="intro-icon">{quiz.topic?.icon || '📝'}</div>
          <h1>{quiz.title}</h1>
          <p className="intro-desc">{quiz.description}</p>
          
          <div className="intro-stats">
            <div className="intro-stat">
              <span className="stat-number">{quiz.questions.length}</span>
              <span className="stat-label">Questions</span>
            </div>
            <div className="intro-stat">
              <span className="stat-number">{Math.floor(quiz.timeLimit / 60)}</span>
              <span className="stat-label">Minutes</span>
            </div>
            <div className="intro-stat">
              <span className="stat-number">{quiz.totalPoints}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>

          <div className={`difficulty-badge ${quiz.difficulty}`}>
            {quiz.difficulty?.toUpperCase()}
          </div>

          <div className="intro-instructions">
            <h3>📋 Instructions</h3>
            <ul>
              <li>Read each question carefully before answering</li>
              <li>You can navigate between questions using the panel</li>
              <li>Mark questions for review if unsure</li>
              <li>Timer starts once you begin</li>
              <li>Submit before time runs out</li>
            </ul>
          </div>

          {!isAuthenticated ? (
            <div className="intro-warning error">
              🔒 You must be logged in to attempt this quiz.
              <button 
                onClick={() => navigate('/login', { state: { from: location } })}
                className="start-quiz-btn"
                style={{ marginTop: '1rem', background: 'var(--error)' }}
              >
                Login to Start
              </button>
            </div>
          ) : (
            <button onClick={() => setStarted(true)} className="start-quiz-btn">
              🚀 Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const stats = getStats();

  return (
    <div className="quiz-attempt-container">
      {/* Header */}
      <header className="quiz-header">
        <div className="quiz-title-section">
          <h2>{quiz.title}</h2>
          <span className="topic-badge" style={{ background: quiz.topic?.color }}>
            {quiz.topic?.icon} {quiz.topic?.name}
          </span>
        </div>
        <div className={`quiz-timer ${timeLeft < 60 ? 'danger' : timeLeft < 180 ? 'warning' : ''}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="quiz-body">
        {/* Main Question Area */}
        <main className={`question-area ${!showSidebar ? 'full-width' : ''}`}>
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <div className="question-actions">
                <button 
                  onClick={markForReview}
                  className={`action-btn ${answers[currentQuestion]?.markedForReview ? 'marked' : ''}`}
                >
                  {answers[currentQuestion]?.markedForReview ? '🔖 Marked' : '📌 Mark for Review'}
                </button>
                <button onClick={clearResponse} className="action-btn clear">
                  🗑️ Clear
                </button>
              </div>
            </div>

            {question.chartData && (
              <ChartViewer 
                data={question.chartData} 
                type={question.chartType} 
                title={`Data Representation`}
              />
            )}

            <div className="question-text">
              {question.question}
            </div>

            <div className="options-container">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-card ${answers[currentQuestion]?.selectedOption === index ? 'selected' : ''}`}
                  onClick={() => selectOption(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {answers[currentQuestion]?.selectedOption === index && (
                    <span className="check-icon">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <button 
              onClick={prevQuestion} 
              className="nav-btn prev"
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            <button onClick={() => setShowSidebar(!showSidebar)} className="nav-btn toggle-sidebar">
              {showSidebar ? '◀ Hide Navigator' : '📋 Question Board'}
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button 
                onClick={handleSubmit} 
                className="nav-btn submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
              </button>
            ) : (
              <button onClick={nextQuestion} className="nav-btn next">
                Next →
              </button>
            )}
          </div>
        </main>

        {/* Sidebar with Question Tiles */}
        {showSidebar && (
          <>
            <aside className="question-sidebar">
              <div className="sidebar-header">
                <h3>Question Navigator</h3>
              </div>

              {/* Legend */}
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-dot answered"></span>
                  <span>Answered ({stats.answered})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot marked"></span>
                  <span>Marked ({stats.marked})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot visited"></span>
                  <span>Visited ({stats.visited})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot not-visited"></span>
                  <span>Not Visited ({stats.notVisited})</span>
                </div>
              </div>

              {/* Question Tiles */}
              <div className="question-tiles">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    className={`question-tile ${getQuestionStatus(index)}`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleSubmit} 
                className="sidebar-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '📤 Submit Quiz'}
              </button>
            </aside>
            <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)}></div>
          </>
        )}
      </div>
    </div>
  );
}
