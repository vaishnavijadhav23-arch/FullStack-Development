import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import './AddTransactionPage.css';

const CATEGORIES = {
  INCOME: ['SALARY', 'FREELANCE', 'INVESTMENT', 'SAVINGS', 'OTHER'],
  EXPENSE: ['FOOD', 'TRAVEL', 'BILLS', 'SHOPPING', 'ENTERTAINMENT', 'HEALTH', 'EDUCATION', 'OTHER']
};

const CAT_EMOJI = {
  FOOD:'🍽️', TRAVEL:'✈️', BILLS:'💡', SHOPPING:'🛍️', ENTERTAINMENT:'🎬',
  HEALTH:'🏥', EDUCATION:'📚', SALARY:'💼', FREELANCE:'💻',
  INVESTMENT:'📈', SAVINGS:'🏦', OTHER:'📦'
};

export default function AddTransactionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', category: 'FOOD',
    date: new Date().toISOString().split('T')[0], description: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      transactionAPI.getById(id).then(r => {
        const t = r.data;
        setForm({ type: t.type, amount: t.amount, category: t.category, date: t.date, description: t.description || '' });
      }).catch(() => toast.error('Failed to load transaction')).finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => {
      const next = { ...f, [name]: value };
      if (name === 'type') next.category = CATEGORIES[value][0];
      return next;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await transactionAPI.update(id, payload);
        toast.success('Transaction updated!');
      } else {
        await transactionAPI.create(payload);
        toast.success('Transaction added!');
      }
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-spinner"><div className="spinner" /></div>;

  const cats = CATEGORIES[form.type] || [];

  return (
    <div className="add-tx-page">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{marginBottom:8}}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update transaction details' : 'Record a new income or expense'}</p>
        </div>
      </div>

      <div className="add-tx-grid">
        <div className="card add-tx-form-card">
          <form onSubmit={handleSubmit}>
            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="type-toggle">
                {['EXPENSE', 'INCOME'].map(t => (
                  <button key={t} type="button"
                    className={`type-btn ${form.type === t ? 'type-btn-active-' + t.toLowerCase() : ''}`}
                    onClick={() => handleChange({ target: { name: 'type', value: t } })}>
                    {t === 'INCOME' ? '📈 Income' : '📉 Expense'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <div className="amount-input-wrap">
                <span className="currency-symbol">₹</span>
                <input name="amount" type="number" step="0.01" min="0.01"
                  className="form-input amount-input" placeholder="0.00"
                  value={form.amount} onChange={handleChange} required />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="cat-grid">
                {cats.map(cat => (
                  <button key={cat} type="button"
                    className={`cat-btn ${form.category === cat ? 'cat-btn-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}>
                    <span className="cat-emoji">{CAT_EMOJI[cat]}</span>
                    <span className="cat-name">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input name="date" type="date" className="form-input"
                value={form.date} onChange={handleChange} required />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input name="description" type="text" className="form-input"
                placeholder="e.g., Monthly groceries, Electricity bill..."
                value={form.description} onChange={handleChange} maxLength={200} />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <Loader size={16} className="spin-icon" /> : <Save size={16} />}
              {loading ? 'Saving...' : (isEdit ? 'Update Transaction' : 'Save Transaction')}
            </button>
          </form>
        </div>

        {/* Preview card */}
        <div className="card preview-card">
          <h3 style={{fontSize:14,fontWeight:600,color:'var(--text-secondary)',marginBottom:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>Preview</h3>
          <div className="preview-amount" style={{color: form.type === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)'}}>
            {form.type === 'INCOME' ? '+' : '-'}₹{parseFloat(form.amount||0).toLocaleString('en-IN')}
          </div>
          <div className="preview-detail">
            <span>{CAT_EMOJI[form.category]}</span>
            <span>{form.category}</span>
          </div>
          <div className="preview-detail">
            <span>📅</span>
            <span>{form.date ? new Date(form.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—'}</span>
          </div>
          {form.description && (
            <div className="preview-detail">
              <span>📝</span>
              <span>{form.description}</span>
            </div>
          )}
          <div className="preview-badge-wrap">
            <span className={`badge ${form.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>{form.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
