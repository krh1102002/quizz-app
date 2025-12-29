import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subtopicsAPI, quizzesAPI } from '../services/api';

export default function SubtopicQuizzes() {
  const { subtopicId } = useParams();
  const [subtopic, setSubtopic] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subtopicsAPI.getOne(subtopicId),
      quizzesAPI.getBySubtopic(subtopicId)
    ]).then(([subtopicData, quizzesData]) => {
      setSubtopic(subtopicData);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    }).catch((error) => {
      console.error('Error fetching subtopic data:', error);
      setQuizzes([]);
    })
      .finally(() => setLoading(false));
  }, [subtopicId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading quizzes...</p>
      </div>
    );
  }

  if (!subtopic) return <div className="text-center pt-2xl">Subtopic not found</div>;

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <Link to={`/topics/${subtopic.topic}`} className="btn btn-ghost mb-lg">
          ← Back to Subtopics
        </Link>

        <div className="text-center mb-2xl">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
            {subtopic.icon || '📝'}
          </div>
          <h1>{subtopic.name}</h1>
          <p className="text-secondary">{subtopic.description}</p>
        </div>

        <div className="grid grid-3 gap-lg">
          {quizzes.map(quiz => (
            <Link key={quiz._id} to={`/quiz/${quiz._id}`} className="quiz-card card-3d card-glow">
              <h3 className="quiz-card-title">{quiz.title}</h3>
              <p className="quiz-card-desc">{quiz.description}</p>

              <div className="quiz-card-meta">
                <span>
                  {quiz.quizType === 'long' ? '📝 Full Test' : '⚡ Practice'}
                </span>
                <span>⏱️ {Math.floor(quiz.timeLimit / 60)} min</span>
              </div>

              <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'error'}`}>
                  {quiz.difficulty?.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {quiz.questions?.length || 0} Qs
                </span>
              </div>
            </Link>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center text-secondary">
            No quizzes available for this subtopic yet.
          </div>
        )}
      </div>
    </div>
  );
}
