import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.access_token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <span>FreshKeeper</span>
          </div>
          <h1 className="auth-left-title">
            Reduce waste.<br />Eat fresher.
          </h1>
          <p className="auth-left-subtitle">
            Track your food, know what's about to expire, and never let groceries go to waste again.
          </p>
          <div className="auth-features">
            {[
              { emoji: '🥛', label: 'Track expiry dates' },
              { emoji: '🔔', label: 'Smart reminders' },
              { emoji: '📊', label: 'Waste analytics' },
              { emoji: '👨‍👩‍👧', label: 'Shared household' },
            ].map(f => (
              <div key={f.label} className="auth-feature">
                <span>{f.emoji}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-decoration" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your FreshKeeper account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="form-login" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm(p => ({...p, email: e.target.value})); setErrors(p => ({...p, email:''})); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password:''})); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPwd(p => !p)}
                  id="btn-toggle-password"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              id="btn-login-submit"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to FreshKeeper?</span>
          </div>

          <Link to="/register" className="btn btn-secondary btn-lg w-full" style={{ justifyContent: 'center' }} id="link-to-register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
