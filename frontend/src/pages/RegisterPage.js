import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { TrendingUp, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { token, userId, name, email } = res.data;
      login({ userId, name, email }, token);
      toast.success(`Welcome to FinanceAI, ${name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
          <h1>Create your account</h1>
          <p>Start your journey to financial freedom</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input name="name" type="text" className="form-input input-padded"
                  placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input name="phone" type="tel" className="form-input input-padded"
                  placeholder="+91 98765..." value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </div>
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
              <input name="password" type={showPwd ? 'text' : 'password'}
                className="form-input input-padded input-padded-right"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              <button type="button" className="input-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
