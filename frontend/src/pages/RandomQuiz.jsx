import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizzesAPI, topicsAPI } from '../services/api';
import './RandomQuiz.css';

export default function RandomQuiz() {
  const navigate = useNavigate();
  const [mixedQuizzes, setMixedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMixedQuizzes();
  }, []);

  const fetchMixedQuizzes = async () => {
    try {
      // 1. Find the "Mixed Aptitude" topic
      const topics = await topicsAPI.getAll();
      const mixedTopic = topics.find(t => t.name === 'Mixed Aptitude' || t.name === 'Random / Mixed');

      if (!mixedTopic) {
        setError('No mixed aptitude section found.');
        return;
      }

      // 2. Fetch quizzes for this topic
      const quizzes = await quizzesAPI.getByTopic(mixedTopic._id);
      setMixedQuizzes(quizzes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    navigate(`/quiz/${quiz._id}`);
  };

  if (loading) {
    return (
      <div className="random-quiz-page">
        <div className="loading-container">
          <div className="dice-animation">🎲</div>
          <p>Loading random quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="random-quiz-page">
        <div className="error-container">
          <div className="error-icon">😕</div>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="random-quiz-page">
      <div className="random-quiz-container">
        <div className="random-header">
          <div className="random-icon">🎲</div>
          <h1>Mixed Aptitude Tests</h1>
          <p>Challenge yourself with curated full-length mock tests covering all topics.</p>
        </div>

        {/* Available Tests List */}
        <div className="mixed-quizzes-grid">
          {mixedQuizzes.length > 0 ? (
            mixedQuizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-preview-card">
                <div className="card-header">
                  <h2>{quiz.title}</h2>
                  <span className={`badge ${quiz.quizType === 'long' ? 'long' : 'short'}`}>
                    {quiz.quizType === 'long' ? 'FULL LENGTH' : 'MINI MOCK'}
                  </span>
                </div>
                
                <p className="quiz-desc">{quiz.description}</p>
                
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span className="stat-value">{quiz.questions?.length || 0}</span>
                    <span className="stat-label">Questions</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-value">{Math.floor(quiz.timeLimit / 60)}</span>
                    <span className="stat-label">Minutes</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-value">{quiz.totalPoints}</span>
                    <span className="stat-label">Points</span>
                  </div>
                </div>

                <button 
                  onClick={() => startQuiz(quiz)} 
                  className="start-btn"
                >
                  🚀 Start Test
                </button>
              </div>
            ))
          ) : (
            <div className="no-quizzes">
              <p>No mixed quizzes available at the moment. Please check back later!</p>
            </div>
          )}
        </div>

        <Link to="/quizzes" className="browse-link">
          Or browse topic-wise quizzes →
        </Link>
      </div>
    </div>
  );
}
