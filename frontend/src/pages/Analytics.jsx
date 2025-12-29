import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { attemptsAPI } from '../services/api';
import './Analytics.css';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      attemptsAPI.getStats(),
      attemptsAPI.getUserAttempts()
    ]).then(([statsData, attemptsData]) => {
      setStats(statsData);
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching analytics:', err);
      setAttempts([]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-large"></div>
      </div>
    );
  }

  // --- Data Processing for Charts ---

  // 1. Performance Trend (Last 10 attempts)
  const trendData = attempts.slice(0, 10).reverse().map((a, i) => ({
    name: `Quiz ${attempts.length - 9 + i}`,
    score: a.percentage,
    date: new Date(a.createdAt).toLocaleDateString()
  }));

  // 2. Topic Strength (Average score per topic)
  const topicMap = {};
  attempts.forEach(a => {
    const topic = a.quiz?.topic?.name || 'Unknown';
    if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
    topicMap[topic].total += a.percentage;
    topicMap[topic].count += 1;
  });

  const topicData = Object.keys(topicMap).map(topic => ({
    topic,
    score: Math.round(topicMap[topic].total / topicMap[topic].count),
    fullMark: 100
  }));

  // 3. Difficulty Distribution (Count of attempts by difficulty)
  // Assuming quiz has difficulty.
  const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };
  attempts.forEach(a => {
    const diff = a.quiz?.difficulty || 'Medium'; // fallback
    const capitalized = diff.charAt(0).toUpperCase() + diff.slice(1);
    if (difficultyMap[capitalized] !== undefined) difficultyMap[capitalized]++;
  });

  const difficultyData = Object.keys(difficultyMap).map(key => ({
    name: key,
    value: difficultyMap[key]
  })).filter(d => d.value > 0);

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444']; // Success, Warning, Error

  return (
    <div className="analytics-page">
      <div className="container section">
        <header className="mb-2xl text-center">
          <h1 className="gradient-text mb-sm">Your Analytics</h1>
          <p className="text-secondary">Track your progress and identify areas for improvement</p>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid grid-4 mb-3xl">
          <div className="stat-card card-3d card-glow">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.totalAttempts}</h3>
              <p>Total Quizzes</p>
            </div>
          </div>
          <div className="stat-card card-3d card-glow">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.averageScore}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card card-3d card-glow">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats.bestScore}%</h3>
              <p>Best Score</p>
            </div>
          </div>
          <div className="stat-card card-3d card-glow">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>{stats.totalPoints}</h3>
              <p>Total Points</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-2 mb-3xl">

          {/* Performance Trend */}
          <div className="card chart-card">
            <h3 className="mb-xl">Performance Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('/')[0] + '/' + val.split('/')[1]} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Topic Radar */}
          <div className="card chart-card">
            <h3 className="mb-xl">Topic Strength</h3>
            <div className="chart-container">
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-center h-full text-secondary">
                  Not enough data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Topic Breakdown Cards */}
        <h3 className="mb-lg">Topic Performance</h3>
        <div className="grid grid-4 mb-3xl">
          {topicData.map((t, index) => (
            <div key={index} className="card p-lg card-glow">
              <div className="flex flex-between mb-md">
                <span className="text-secondary font-medium">{t.topic}</span>
                <span className={`badge ${t.score >= 80 ? 'badge-success' : t.score >= 60 ? 'badge-warning' : 'badge-error'}`}>
                  {t.score >= 80 ? 'Strong' : t.score >= 60 ? 'Average' : 'Weak'}
                </span>
              </div>
              <div className="mb-sm">
                <div className="flex flex-between mb-xs text-sm">
                  <span>Avg Score</span>
                  <span className="font-bold">{t.score}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${t.score}%`,
                      background: t.score >= 80 ? 'var(--success)' : t.score >= 60 ? 'var(--warning)' : 'var(--error)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          {topicData.length === 0 && (
            <div className="col-span-4 text-center text-secondary py-lg">
              Take quizzes to see topic insights.
            </div>
          )}
        </div>

        {/* Recent Attempts Table */}
        <div className="card w-full mb-3xl p-xl">
          <h3 className="mb-lg">Recent Attempts</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quiz</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 5).map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td>{attempt.quiz?.title}</td>
                    <td>
                      <span className="badge badge-primary">{attempt.quiz?.topic?.name}</span>
                    </td>
                    <td className="font-bold">{attempt.percentage}%</td>
                    <td>
                      {attempt.percentage >= 80 ? <span className="badge badge-success">Excellent</span> :
                        attempt.percentage >= 60 ? <span className="badge badge-warning">Good</span> :
                          <span className="badge badge-error">Needs Improvement</span>}
                    </td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-xl text-secondary">No attempts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="mb-lg text-secondary">Want to improve your statistics?</p>
          <a href="/quizzes" className="btn btn-primary btn-lg">Take a Quiz</a>
        </div>
      </div>
    </div>
  );
}
