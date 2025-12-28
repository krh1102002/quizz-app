import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quizzesAPI, topicsAPI } from '../../services/api';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ quizzes: 0, topics: 0 });
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    Promise.all([
      quizzesAPI.getAllAdmin().catch(() => []),
      topicsAPI.getAll()
    ]).then(([quizzesData, topicsData]) => {
      setQuizzes(quizzesData);
      setTopics(topicsData);
      setStats({
        quizzes: quizzesData.length,
        topics: topicsData.length
      });
    }).finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizzesAPI.delete(id);
      setQuizzes(prev => prev.filter(q => q._id !== id));
      setStats(prev => ({ ...prev, quizzes: prev.quizzes - 1 }));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      await topicsAPI.delete(id);
      setTopics(prev => prev.filter(t => t._id !== id));
      setStats(prev => ({ ...prev, topics: prev.topics - 1 }));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h3 className="mb-lg" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin Panel
        </h3>
        <nav className="admin-nav">
          <div 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 Quizzes
          </div>
          <div 
            className={`admin-nav-item ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            📂 Topics
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <h1 className="mb-2xl">Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <h3>{stats.quizzes}</h3>
                  <p>Total Quizzes</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-info">
                  <h3>{stats.topics}</h3>
                  <p>Topics</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❓</div>
                <div className="stat-info">
                  <h3>{quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}</h3>
                  <p>Total Questions</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <h3>{quizzes.reduce((sum, q) => sum + (q.attemptsCount || 0), 0)}</h3>
                  <p>Total Attempts</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <h2 className="mb-lg">Quick Actions</h2>
            <div className="flex gap-md mb-2xl">
              <button onClick={() => { setEditingQuiz(null); setShowQuizModal(true); }} className="btn btn-primary">
                ➕ Add Quiz
              </button>
              <button onClick={() => { setEditingTopic(null); setShowTopicModal(true); }} className="btn btn-secondary">
                ➕ Add Topic
              </button>
            </div>

            {/* Recent Quizzes */}
            <h2 className="mb-lg">Recent Quizzes</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topic</th>
                    <th>Questions</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.slice(0, 5).map(quiz => (
                    <tr key={quiz._id}>
                      <td>{quiz.title}</td>
                      <td>{quiz.topic?.name || 'N/A'}</td>
                      <td>{quiz.questions?.length || 0}</td>
                      <td>
                        <span className={`badge badge-${quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'error'}`}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${quiz.isActive ? 'success' : 'error'}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'quizzes' && (
          <>
            <div className="flex flex-between mb-2xl">
              <h1>Manage Quizzes</h1>
              <button onClick={() => { setEditingQuiz(null); setShowQuizModal(true); }} className="btn btn-primary">
                ➕ Add Quiz
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Topic</th>
                    <th>Questions</th>
                    <th>Difficulty</th>
                    <th>Attempts</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(quiz => (
                    <tr key={quiz._id}>
                      <td>{quiz.title}</td>
                      <td>
                        <span style={{ color: quiz.topic?.color }}>
                          {quiz.topic?.icon} {quiz.topic?.name || 'N/A'}
                        </span>
                      </td>
                      <td>{quiz.questions?.length || 0}</td>
                      <td>
                        <span className={`badge badge-${quiz.difficulty === 'easy' ? 'success' : quiz.difficulty === 'medium' ? 'warning' : 'error'}`}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td>{quiz.attemptsCount || 0}</td>
                      <td>
                        <span className={`badge badge-${quiz.isActive ? 'success' : 'error'}`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-sm">
                          <button 
                            onClick={() => { setEditingQuiz(quiz); setShowQuizModal(true); }}
                            className="btn btn-ghost btn-sm"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--error)' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'topics' && (
          <>
            <div className="flex flex-between mb-2xl">
              <h1>Manage Topics</h1>
              <button onClick={() => { setEditingTopic(null); setShowTopicModal(true); }} className="btn btn-primary">
                ➕ Add Topic
              </button>
            </div>
            
            <div className="grid grid-3 gap-lg">
              {topics.map(topic => (
                <div key={topic._id} className="card" style={{ padding: 'var(--space-xl)' }}>
                  <div className="flex flex-between mb-md">
                    <div style={{ fontSize: '2rem' }}>{topic.icon}</div>
                    <div className="flex gap-sm">
                      <button 
                        onClick={() => { setEditingTopic(topic); setShowTopicModal(true); }}
                        className="btn btn-ghost btn-sm"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteTopic(topic._id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--error)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 style={{ color: topic.color }}>{topic.name}</h3>
                  <p className="text-secondary text-sm">{topic.description}</p>
                  <p className="text-muted text-sm mt-md">{topic.quizCount} quizzes</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          quiz={editingQuiz}
          topics={topics}
          onClose={() => setShowQuizModal(false)}
          onSave={(savedQuiz) => {
            if (editingQuiz) {
              setQuizzes(prev => prev.map(q => q._id === savedQuiz._id ? savedQuiz : q));
            } else {
              setQuizzes(prev => [savedQuiz, ...prev]);
              setStats(prev => ({ ...prev, quizzes: prev.quizzes + 1 }));
            }
            setShowQuizModal(false);
          }}
        />
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <TopicModal
          topic={editingTopic}
          onClose={() => setShowTopicModal(false)}
          onSave={(savedTopic) => {
            if (editingTopic) {
              setTopics(prev => prev.map(t => t._id === savedTopic._id ? savedTopic : t));
            } else {
              setTopics(prev => [...prev, savedTopic]);
              setStats(prev => ({ ...prev, topics: prev.topics + 1 }));
            }
            setShowTopicModal(false);
          }}
        />
      )}
    </div>
  );
}

// Quiz Modal Component
function QuizModal({ quiz, topics, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    topic: quiz?.topic?._id || '',
    difficulty: quiz?.difficulty || 'medium',
    timeLimit: quiz?.timeLimit || 300,
    questions: quiz?.questions || [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) return;
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        timeLimit: parseInt(formData.timeLimit),
        questions: formData.questions.map(q => ({
          ...q,
          correctAnswer: parseInt(q.correctAnswer)
        }))
      };

      let result;
      if (quiz) {
        result = await quizzesAPI.update(quiz._id, data);
      } else {
        result = await quizzesAPI.create(data);
      }
      onSave(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{quiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {error && (
              <div className="mb-lg" style={{ 
                padding: 'var(--space-md)', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)'
              }}>
                {error}
              </div>
            )}

            <div className="grid grid-2 gap-lg mb-lg">
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Topic *</label>
                <select
                  className="input w-full"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  required
                >
                  <option value="">Select a topic</option>
                  {topics.map(t => (
                    <option key={t._id} value={t._id}>{t.icon} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group mb-lg">
              <label className="input-label">Description</label>
              <textarea
                className="input textarea w-full"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-2 gap-lg mb-xl">
              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <select
                  className="input w-full"
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Time Limit (seconds)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formData.timeLimit}
                  onChange={e => setFormData({ ...formData, timeLimit: e.target.value })}
                  min="60"
                />
              </div>
            </div>

            <div className="flex flex-between mb-lg">
              <h3>Questions ({formData.questions.length})</h3>
              <button type="button" onClick={addQuestion} className="btn btn-secondary btn-sm">
                ➕ Add Question
              </button>
            </div>

            {formData.questions.map((q, qIndex) => (
              <div key={qIndex} className="card mb-lg" style={{ padding: 'var(--space-lg)' }}>
                <div className="flex flex-between mb-md">
                  <span className="badge badge-primary">Question {qIndex + 1}</span>
                  {formData.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIndex)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>
                      🗑️
                    </button>
                  )}
                </div>
                
                <div className="input-group mb-md">
                  <label className="input-label">Question *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={q.question}
                    onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-2 gap-sm mb-md">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="input-group">
                      <label className="input-label">
                        Option {String.fromCharCode(65 + optIndex)}
                        {q.correctAnswer === optIndex && ' ✓'}
                      </label>
                      <div className="flex gap-sm">
                        <input
                          type="text"
                          className="input"
                          style={{ flex: 1 }}
                          value={opt}
                          onChange={e => {
                            const newOptions = [...q.options];
                            newOptions[optIndex] = e.target.value;
                            handleQuestionChange(qIndex, 'options', newOptions);
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                          className={`btn ${q.correctAnswer === optIndex ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="input-group">
                  <label className="input-label">Explanation (optional)</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={q.explanation}
                    onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (quiz ? 'Update Quiz' : 'Create Quiz')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Topic Modal Component
function TopicModal({ topic, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: topic?.name || '',
    description: topic?.description || '',
    icon: topic?.icon || '📚',
    color: topic?.color || '#6366f1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const icons = ['📚', '🔬', '📐', '🏛️', '🌍', '💻', '🎨', '🎵', '⚽', '🎬', '🧠', '💼', '🚀', '🔢', '📖'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (topic) {
        result = await topicsAPI.update(topic._id, formData);
      } else {
        result = await topicsAPI.create(formData);
      }
      onSave(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{topic ? 'Edit Topic' : 'Create Topic'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="mb-lg" style={{ 
                padding: 'var(--space-md)', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: 'var(--radius-md)',
                color: 'var(--error)'
              }}>
                {error}
              </div>
            )}

            <div className="input-group mb-lg">
              <label className="input-label">Name *</label>
              <input
                type="text"
                className="input w-full"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group mb-lg">
              <label className="input-label">Description</label>
              <textarea
                className="input textarea w-full"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="input-group mb-lg">
              <label className="input-label">Icon</label>
              <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      background: formData.icon === icon ? 'var(--primary)' : 'var(--surface)',
                      border: formData.icon === icon ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Color</label>
              <div className="flex gap-md" style={{ alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: '50px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="input"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (topic ? 'Update Topic' : 'Create Topic')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
