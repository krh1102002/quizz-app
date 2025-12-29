import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { topicsAPI, quizzesAPI } from '../services/api';

export default function Home() {
  const [topics, setTopics] = useState([]);
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      topicsAPI.getAll(),
      quizzesAPI.getAll({ limit: 6 })
    ]).then(([topicsData, quizzesData]) => {
      setTopics(topicsData);
      setFeaturedQuizzes(quizzesData);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Test Your Knowledge with{' '}
            <span className="gradient-text">QuizMaster</span>
          </h1>
          <p className="hero-subtitle">
            Challenge yourself with thousands of quizzes across various topics. 
            Learn, compete, and track your progress in a stunning 3D experience.
          </p>
          <div className="hero-actions">
            <Link to="/quizzes" className="btn btn-primary btn-lg">
              🚀 Start Quiz
            </Link>
            <Link to="/random" className="btn btn-secondary btn-lg">
              🎲 Random Quiz
            </Link>
          </div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="hero-decorations" style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '4rem',
          opacity: 0.3,
          animation: 'float 6s ease-in-out infinite'
        }}>📚</div>
        <div className="hero-decorations" style={{
          position: 'absolute',
          bottom: '30%',
          right: '15%',
          fontSize: '3rem',
          opacity: 0.3,
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '-3s'
        }}>🧠</div>
      </section>

      {/* Topics Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-2xl">
            <h2>Explore Topics</h2>
            <p className="text-secondary">Choose a topic and test your expertise</p>
          </div>
          
          {loading ? (
            <div className="flex flex-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-3 gap-lg">
              {topics.map(topic => (
                <Link 
                  key={topic._id} 
                  to={`/topics/${topic._id}`}
                  className="topic-card"
                  style={{ '--topic-color': topic.color }}
                >
                  <div className="topic-icon">{topic.icon}</div>
                  <h3 className="topic-name">{topic.name}</h3>                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Quizzes */}
      <section className="section" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div className="flex flex-between mb-xl">
            <div>
              <h2>Featured Quizzes</h2>
              <p className="text-secondary">Popular quizzes you might enjoy</p>
            </div>
            <Link to="/quizzes" className="btn btn-ghost">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex flex-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-3 gap-lg">
              {featuredQuizzes.map(quiz => (
                <Link key={quiz._id} to={`/quiz/${quiz._id}`} className="quiz-card card-3d">
                  <div 
                    className="quiz-card-icon"
                    style={{ background: quiz.topic?.color ? `${quiz.topic.color}20` : undefined }}
                  >
                    {quiz.topic?.icon || '📝'}
                  </div>
                  <h3 className="quiz-card-title">{quiz.title}</h3>
                  <p className="quiz-card-desc">{quiz.description}</p>
                  <div className="quiz-card-meta">
                    <span>
                      <span style={{ color: quiz.topic?.color }}>{quiz.topic?.name}</span>
                    </span>
                    <span>
                      ⏱️ {Math.floor(quiz.timeLimit / 60)} min
                    </span>
                    <span className={`badge badge-${quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'error'}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-4 gap-xl text-center">
            <div className="stat">
              <div className="stat-value gradient-text">1000+</div>
              <div className="stat-label">Questions</div>
            </div>
            <div className="stat">
              <div className="stat-value gradient-text">50+</div>
              <div className="stat-label">Topics</div>
            </div>
            <div className="stat">
              <div className="stat-value gradient-text">10K+</div>
              <div className="stat-label">Quiz Attempts</div>
            </div>
            <div className="stat">
              <div className="stat-value gradient-text">5K+</div>
              <div className="stat-label">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ 
            padding: 'var(--space-3xl)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
            textAlign: 'center'
          }}>
            <h2 className="mb-md">Ready to Challenge Yourself?</h2>
            <p className="text-secondary mb-xl" style={{ maxWidth: '500px', margin: '0 auto var(--space-xl)' }}>
              Join thousands of quiz enthusiasts and start your learning journey today!
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
