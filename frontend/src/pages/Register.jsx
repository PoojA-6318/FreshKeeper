import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone_no: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;
      await authAPI.register(payload);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } 
    catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'Registration failed. Please try again.';

      if (Array.isArray(detail)) {
        msg = detail.map((error) => error.msg).join(', ');
      } else if (typeof detail === 'string') {
        msg = detail;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };


  const field = (key, updates) => {
    setForm(p => ({...p, [key]: updates}));
    setErrors(p => ({...p, [key]: ''}));
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
            Your fridge,<br />always fresh.
          </h1>
          <p className="auth-left-subtitle">
            Join thousands of households managing their food smarter and wasting less.
          </p>
          <div className="auth-stats">
            <div className="auth-stat">
              <span className="auth-stat-num">73%</span>
              <span className="auth-stat-label">Less food waste</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">∞</span>
              <span className="auth-stat-label">Fridges supported</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">Free</span>
              <span className="auth-stat-label">Always</span>
            </div>
          </div>
        </div>
        <div className="auth-left-decoration" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account ✨</h2>
            <p>Start managing your food inventory today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="form-register" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className={`form-input ${errors.full_name ? 'input-error' : ''}`}
                  placeholder="Pooja Sharma"
                  value={form.full_name}
                  onChange={e => field('full_name', e.target.value)}
                  autoComplete="name"
                />
              </div>
              {errors.full_name && <p className="form-error">{errors.full_name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => field('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-contact">
                Contact number
              </label>

              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />

                <input
                  id="reg-contact"
                  type="tel"
                  className={`form-input ${
                    errors.phone_no ? 'input-error' : ''
                  }`}
                  placeholder="9876543210"
                  value={form.phone_no}
                  onChange={e => field('phone_no', e.target.value)}
                  autoComplete="tel"
                />
              </div>

              {errors.phone_no && (
                <p className="form-error">{errors.phone_no}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => field('password', e.target.value)}
                />
                <button type="button" className="input-eye-btn" onClick={() => setShowPwd(p => !p)} id="btn-toggle-pwd">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-confirm"
                  type={showPwd ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => field('confirmPassword', e.target.value)}
                />
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              id="btn-register-submit"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn btn-secondary btn-lg w-full" style={{ justifyContent: 'center' }} id="link-to-login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
