import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import './TransactionsPage.css';

const CATEGORY_COLORS = {
  FOOD:'#10b981',TRAVEL:'#3b82f6',BILLS:'#f59e0b',SHOPPING:'#8b5cf6',
  ENTERTAINMENT:'#ec4899',HEALTH:'#06b6d4',EDUCATION:'#f97316',
  SALARY:'#10b981',FREELANCE:'#3b82f6',INVESTMENT:'#8b5cf6',SAVINGS:'#06b6d4',OTHER:'#64748b'
};

const fmt = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    transactionAPI.getAll().then(r => {
      setTransactions(r.data);
      setFiltered(r.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...transactions];
    if (typeFilter !== 'ALL') data = data.filter(t => t.type === typeFilter);
    if (catFilter !== 'ALL') data = data.filter(t => t.category === catFilter);
    if (search) data = data.filter(t =>
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [transactions, typeFilter, catFilter, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(id);
    try {
      await transactionAPI.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + parseFloat(t.amount), 0);

  const categories = [...new Set(transactions.map(t => t.category))];

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{filtered.length} of {transactions.length} transactions</p>
        </div>
        <Link to="/transactions/add" className="btn btn-primary">
          <Plus size={16} /> Add Transaction
        </Link>
      </div>

      {/* Summary strip */}
      <div className="tx-summary">
        <div className="tx-summary-item">
          <TrendingUp size={16} style={{color:'var(--accent-green)'}} />
          <span className="tx-summary-label">Income</span>
          <span className="amount-positive">{fmt(totalIncome)}</span>
        </div>
        <div className="tx-summary-divider" />
        <div className="tx-summary-item">
          <TrendingDown size={16} style={{color:'var(--accent-red)'}} />
          <span className="tx-summary-label">Expenses</span>
          <span className="amount-negative">{fmt(totalExpense)}</span>
        </div>
        <div className="tx-summary-divider" />
        <div className="tx-summary-item">
          <span className="tx-summary-label">Net</span>
          <span className={totalIncome - totalExpense >= 0 ? 'amount-positive' : 'amount-negative'}>
            {fmt(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="tx-filters card">
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder="Search transactions..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <Filter size={14} style={{color:'var(--text-muted)'}} />
          <select className="form-input filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select className="form-input filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or add a new transaction</p>
          <Link to="/transactions/add" className="btn btn-primary" style={{marginTop:16,display:'inline-flex'}}>
            <Plus size={16} /> Add Transaction
          </Link>
        </div>
      ) : (
        <div className="card tx-table-card">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{textAlign:'right'}}>Amount</th>
                <th style={{textAlign:'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="tx-row">
                  <td className="tx-date-cell">
                    {new Date(tx.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </td>
                  <td>
                    <div className="tx-desc-cell">
                      <div className="tx-cat-dot" style={{background: CATEGORY_COLORS[tx.category]+'33', color: CATEGORY_COLORS[tx.category]}}>
                        {tx.category?.[0]}
                      </div>
                      <span className="tx-desc-text">{tx.description || '—'}</span>
                    </div>
                  </td>
                  <td><span className="cat-label" style={{background:CATEGORY_COLORS[tx.category]+'18',color:CATEGORY_COLORS[tx.category]}}>{tx.category}</span></td>
                  <td><span className={`badge ${tx.type==='INCOME'?'badge-income':'badge-expense'}`}>{tx.type}</span></td>
                  <td style={{textAlign:'right'}}>
                    <span className={tx.type==='INCOME'?'amount-positive':'amount-negative'}>
                      {tx.type==='INCOME'?'+':'-'}{fmt(tx.amount)}
                    </span>
                  </td>
                  <td>
                    <div className="tx-actions">
                      <button className="icon-action" onClick={() => navigate(`/transactions/edit/${tx.id}`)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-action icon-action-danger"
                        onClick={() => handleDelete(tx.id)} disabled={deleting === tx.id}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
