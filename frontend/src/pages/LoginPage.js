import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, userId, name, email } = res.data;
      login({ userId, name, email }, token);
      toast.success(`Welcome back, ${name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><TrendingUp size={22} /></div>
          <span className="logo-text">FinanceAI</span>
        </div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your financial dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input name="email" type="email" className="form-input input-padded"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input name="password" type={showPwd ? 'text' : 'password'} className="form-input input-padded input-padded-right"
                placeholder="Enter your password" value={form.password} onChange={handleChange} required />
              <button type="button" className="input-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div className="demo-hint">
          <strong>Demo:</strong> Register a new account to get started
        </div>
      </div>
    </div>
  );
}
