import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import './BudgetPage.css';

const CATEGORIES = ['FOOD','TRAVEL','BILLS','SHOPPING','ENTERTAINMENT','HEALTH','EDUCATION','OTHER'];
const CAT_EMOJI = { FOOD:'🍽️',TRAVEL:'✈️',BILLS:'💡',SHOPPING:'🛍️',ENTERTAINMENT:'🎬',HEALTH:'🏥',EDUCATION:'📚',OTHER:'📦' };
const CATEGORY_COLORS = { FOOD:'#10b981',TRAVEL:'#3b82f6',BILLS:'#f59e0b',SHOPPING:'#8b5cf6',ENTERTAINMENT:'#ec4899',HEALTH:'#06b6d4',EDUCATION:'#f97316',OTHER:'#64748b' };
const fmt = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BudgetPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'FOOD', monthlyLimit: '' });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = () => {
    setLoading(true);
    budgetAPI.getByMonth(month, year).then(r => setBudgets(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.monthlyLimit || parseFloat(form.monthlyLimit) <= 0) { toast.error('Enter a valid limit'); return; }
    setSaving(true);
    try {
      await budgetAPI.createOrUpdate({ ...form, monthlyLimit: parseFloat(form.monthlyLimit), month, year });
      toast.success('Budget saved!');
      setShowForm(false);
      setForm({ category: 'FOOD', monthlyLimit: '' });
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save budget');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this budget?')) return;
    try {
      await budgetAPI.delete(id);
      toast.success('Budget removed');
      fetchBudgets();
    } catch { toast.error('Failed to delete'); }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.monthlyLimit), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent || 0), 0);

  return (
    <div className="budget-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Manager</h1>
          <p className="page-subtitle">Track your spending against monthly limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Set Budget'}
        </button>
      </div>

      {/* Month selector */}
      <div className="month-nav card">
        <div className="month-pills">
          {MONTHS.map((m, i) => (
            <button key={i} className={`month-pill ${month === i+1 ? 'month-pill-active' : ''}`}
              onClick={() => setMonth(i+1)}>{m}</button>
          ))}
        </div>
        <div className="year-nav">
          <button className="year-btn" onClick={() => setYear(y => y-1)}>‹</button>
          <span className="year-label">{year}</span>
          <button className="year-btn" onClick={() => setYear(y => y+1)}>›</button>
        </div>
      </div>

      {/* Summary */}
      <div className="budget-summary">
        <div className="budget-summary-item">
          <div className="bs-label">Total Budgeted</div>
          <div className="bs-value">{fmt(totalBudgeted)}</div>
        </div>
        <div className="budget-summary-item">
          <div className="bs-label">Total Spent</div>
          <div className="bs-value" style={{color: totalSpent > totalBudgeted ? 'var(--accent-red)' : 'var(--accent-green)'}}>{fmt(totalSpent)}</div>
        </div>
        <div className="budget-summary-item">
          <div className="bs-label">Remaining</div>
          <div className="bs-value" style={{color: totalBudgeted-totalSpent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}}>
            {fmt(totalBudgeted - totalSpent)}
          </div>
        </div>
        <div className="budget-summary-item">
          <div className="bs-label">Budgets Set</div>
          <div className="bs-value">{budgets.length}</div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card budget-form-card">
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Set Monthly Budget</h3>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Monthly Limit (₹)</label>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontWeight:700,color:'var(--text-secondary)'}}>₹</span>
                <input type="number" step="0.01" min="1" className="form-input" style={{paddingLeft:28}}
                  placeholder="5000" value={form.monthlyLimit}
                  onChange={e => setForm(f=>({...f,monthlyLimit:e.target.value}))} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{alignSelf:'flex-end',height:42}}>
              {saving ? <span className="btn-spinner" /> : 'Save Budget'}
            </button>
          </form>
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="card empty-state">
          <PiggyBank />
          <h3>No budgets for {MONTHS[month-1]} {year}</h3>
          <p>Set category limits to track your spending</p>
          <button className="btn btn-primary" style={{marginTop:16}} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Set Your First Budget
          </button>
        </div>
      ) : (
        <div className="budget-cards-grid">
          {budgets.map(b => <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

function PiggyBank() {
  return <div style={{fontSize:48,marginBottom:12}}>🐷</div>;
}

function BudgetCard({ budget, onDelete }) {
  const pct = Math.min(budget.percentageUsed || 0, 100);
  const color = CATEGORY_COLORS[budget.category] || '#64748b';
  const exceeded = budget.exceeded;
  const fmt = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

  return (
    <div className={`card budget-card ${exceeded ? 'budget-card-exceeded' : ''}`}>
      <div className="budget-card-header">
        <div className="budget-cat-icon" style={{background:color+'20',color}}>
          {CAT_EMOJI[budget.category]} 
        </div>
        <div className="budget-cat-info">
          <div className="budget-cat-name">{budget.category}</div>
          <div className="budget-cat-limit">Limit: {fmt(budget.monthlyLimit)}</div>
        </div>
        <div className="budget-status">
          {exceeded
            ? <AlertTriangle size={16} style={{color:'var(--accent-red)'}} />
            : <CheckCircle size={16} style={{color:'var(--accent-green)'}} />}
        </div>
      </div>

      <div className="budget-progress-bg">
        <div className="budget-progress-fill"
          style={{ width:`${pct}%`, background: exceeded ? 'linear-gradient(90deg,#ef4444,#f97316)' : `linear-gradient(90deg,${color},${color}bb)` }} />
      </div>

      <div className="budget-stats">
        <div className="budget-stat">
          <div className="budget-stat-label">Spent</div>
          <div className="budget-stat-value" style={{color: exceeded ? 'var(--accent-red)' : color}}>{fmt(budget.spent)}</div>
        </div>
        <div className="budget-stat" style={{textAlign:'center'}}>
          <div className="budget-stat-label">Used</div>
          <div className="budget-stat-value" style={{color: pct>80?'var(--accent-red)':pct>60?'var(--accent-amber)':'var(--accent-green)'}}>
            {budget.percentageUsed?.toFixed(1)}%
          </div>
        </div>
        <div className="budget-stat" style={{textAlign:'right'}}>
          <div className="budget-stat-label">Remaining</div>
          <div className="budget-stat-value" style={{color: budget.remaining >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}}>{fmt(budget.remaining)}</div>
        </div>
      </div>

      {exceeded && (
        <div className="budget-warning">
          <AlertTriangle size={12} /> Exceeded by {fmt(Math.abs(budget.remaining))}
        </div>
      )}

      <button className="budget-delete-btn" onClick={() => onDelete(budget.id)}>
        <Trash2 size={12} /> Remove
      </button>
    </div>
  );
}
