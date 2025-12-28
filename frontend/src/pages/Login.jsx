import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect to previous page or home/admin
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }} className="flex flex-center">
      <div className="container" style={{ maxWidth: '450px' }}>
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <div className="text-center mb-2xl">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔐</div>
            <h1 style={{ fontSize: '1.75rem' }}>Welcome Back</h1>
            <p className="text-secondary">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="mb-lg" style={{ 
              padding: 'var(--space-md)', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-lg">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group mb-xl">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-xl">
            <p className="text-secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary-light)' }}>
                Sign up
              </Link>
            </p>
          </div>

          <div style={{ 
            marginTop: 'var(--space-xl)', 
            padding: 'var(--space-md)',
            background: 'var(--surface-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem'
          }}>
            <p className="text-muted text-center mb-sm">Demo Credentials:</p>
            <p className="text-secondary text-center">
              <strong>Admin:</strong> admin@quiz.com / admin123<br/>
              <strong>User:</strong> user@quiz.com / user123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
