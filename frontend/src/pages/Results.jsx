import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ChartViewer from '../components/ChartViewer';
import './Results.css';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const { result, correctAnswers, quiz } = location.state || {};

  useEffect(() => {
    if (!result || !quiz) {
      navigate('/quizzes');
    }
  }, [result, quiz, navigate]);

  if (!result || !quiz) {
    return null;
  }

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#22c55e', label: 'Excellent!' };
    if (percentage >= 80) return { grade: 'A', color: '#22c55e', label: 'Great Job!' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6', label: 'Good Work!' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b', label: 'Keep Practicing' };
    if (percentage >= 50) return { grade: 'D', color: '#f97316', label: 'Need Improvement' };
    return { grade: 'F', color: '#ef4444', label: 'Try Again' };
  };

  const gradeInfo = getGrade(result.percentage);
  
  const stats = {
    correct: result.answers?.filter(a => a.isCorrect).length || 0,
    wrong: result.answers?.filter(a => a.selectedOption >= 0 && !a.isCorrect).length || 0,
    unanswered: result.answers?.filter(a => a.selectedOption === -1 || a.selectedOption === undefined).length || 0
  };

  return (
    <div className="results-page">
      <div className="results-container">
        {/* Score Card */}
        <div className="score-card">
          <div className="score-circle" style={{ borderColor: gradeInfo.color }}>
            <div className="score-grade" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</div>
            <div className="score-percentage">{result.percentage}%</div>
          </div>
          
          <h1 className="score-title">{gradeInfo.label}</h1>
          <p className="score-quiz-name">{quiz.title}</p>

          <div className="score-stats">
            <div className="score-stat">
              <span className="stat-value correct">{stats.correct}</span>
              <span className="stat-title">Correct</span>
            </div>
            <div className="score-stat">
              <span className="stat-value wrong">{stats.wrong}</span>
              <span className="stat-title">Wrong</span>
            </div>
            <div className="score-stat">
              <span className="stat-value unanswered">{stats.unanswered}</span>
              <span className="stat-title">Skipped</span>
            </div>
          </div>

          <div className="score-points">
            <span className="points-earned">{result.score}</span>
            <span className="points-divider">/</span>
            <span className="points-total">{result.totalPoints || quiz.totalPoints}</span>
            <span className="points-label">Points</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button 
            className="action-btn view-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '📊 Hide Details' : '📋 View Details'}
          </button>
          <Link to="/quizzes" className="action-btn try-again">
            🔄 Take Another Quiz
          </Link>
          <Link to="/" className="action-btn home">
            🏠 Go Home
          </Link>
        </div>

        {/* Detailed Review */}
        {showDetails && (
          <div className="review-section">
            <h2>📝 Detailed Review</h2>
            
            {/* Question tiles */}
            <div className="review-tiles">
              {quiz.questions.map((question, index) => {
                const answer = result.answers?.[index];
                const correct = correctAnswers?.[index];
                const isCorrect = answer?.isCorrect || (answer?.selectedOption === correct?.correctAnswer);
                const isSkipped = answer?.selectedOption === -1 || answer?.selectedOption === undefined;
                
                return (
                  <button
                    key={index}
                    className={`review-tile ${isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong'} ${activeQuestion === index ? 'active' : ''}`}
                    onClick={() => setActiveQuestion(activeQuestion === index ? null : index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="review-legend">
              <span className="legend-item"><span className="dot correct"></span> Correct</span>
              <span className="legend-item"><span className="dot wrong"></span> Wrong</span>
              <span className="legend-item"><span className="dot skipped"></span> Skipped</span>
            </div>

            {/* Active Question Detail */}
            {activeQuestion !== null && (
              <div className="question-review">
                <div className="review-question-header">
                  <span className="review-q-number">Question {activeQuestion + 1}</span>
                  {(() => {
                    const answer = result.answers?.[activeQuestion];
                    const correct = correctAnswers?.[activeQuestion];
                    const isCorrect = answer?.isCorrect || (answer?.selectedOption === correct?.correctAnswer);
                    const isSkipped = answer?.selectedOption === -1 || answer?.selectedOption === undefined;
                    return (
                      <span className={`review-status ${isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong'}`}>
                        {isSkipped ? '⏭️ Skipped' : isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    );
                  })()}
                </div>

                {quiz.questions[activeQuestion].chartData && (
                  <ChartViewer 
                    data={quiz.questions[activeQuestion].chartData} 
                    type={quiz.questions[activeQuestion].chartType} 
                    title={`Data Representation`}
                  />
                )}

                <div className="review-question-text">
                  {quiz.questions[activeQuestion].question}
                </div>

                <div className="review-options">
                  {quiz.questions[activeQuestion].options.map((option, optIndex) => {
                    const answer = result.answers?.[activeQuestion];
                    const correct = correctAnswers?.[activeQuestion];
                    const isSelected = answer?.selectedOption === optIndex;
                    const isCorrectOption = correct?.correctAnswer === optIndex;
                    
                    return (
                      <div 
                        key={optIndex}
                        className={`review-option ${isCorrectOption ? 'correct' : ''} ${isSelected && !isCorrectOption ? 'wrong' : ''} ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                        <span className="option-text">{option}</span>
                        {isCorrectOption && <span className="correct-mark">✓</span>}
                        {isSelected && !isCorrectOption && <span className="wrong-mark">✗</span>}
                      </div>
                    );
                  })}
                </div>

                {correctAnswers?.[activeQuestion]?.explanation && (
                  <div className="review-explanation">
                    <h4>💡 Explanation</h4>
                    <p>{correctAnswers[activeQuestion].explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* All Questions List */}
            {activeQuestion === null && (
              <p className="click-hint">👆 Click on a question number above to see details and explanation</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
