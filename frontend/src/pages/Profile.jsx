import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attemptsAPI } from '../services/api';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        attemptsAPI.getUserAttempts().catch(() => []),
        attemptsAPI.getStats().catch(() => null)
      ]).then(([attemptsData, statsData]) => {
        setAttempts(attemptsData);
        setStats(statsData);
      }).finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Profile Header */}
        <div className="card mb-2xl" style={{ padding: 'var(--space-2xl)' }}>
          <div className="flex gap-xl" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ marginBottom: 'var(--space-xs)' }}>{user?.name}</h1>
              <p className="text-secondary">{user?.email}</p>
              <span className={`badge badge-${user?.role === 'admin' ? 'primary' : 'success'} mt-sm`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid mb-2xl">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <h3>{stats.totalAttempts}</h3>
                <p>Quizzes Taken</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.averageScore}%</h3>
                <p>Average Score</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>{stats.totalPoints}</h3>
                <p>Total Points</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <h3>{stats.bestScore}%</h3>
                <p>Best Score</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attempts */}
        <h2 className="mb-lg">Recent Quiz Attempts</h2>
        
        {attempts.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-3xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📝</div>
            <h3>No quizzes taken yet</h3>
            <p className="text-secondary mb-xl">Start your learning journey now!</p>
            <Link to="/quizzes" className="btn btn-primary">
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(attempt => (
                  <tr key={attempt._id}>
                    <td>{attempt.quiz?.title || 'Unknown Quiz'}</td>
                    <td>
                      <span style={{ color: attempt.quiz?.topic?.color }}>
                        {attempt.quiz?.topic?.icon} {attempt.quiz?.topic?.name || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${attempt.percentage >= 70 ? 'success' : attempt.percentage >= 50 ? 'warning' : 'error'}`}>
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td className="text-secondary">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
