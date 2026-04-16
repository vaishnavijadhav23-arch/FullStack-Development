import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import './DashboardPage.css';

const CATEGORY_COLORS = {
  FOOD: '#10b981', TRAVEL: '#3b82f6', BILLS: '#f59e0b', SHOPPING: '#8b5cf6',
  ENTERTAINMENT: '#ec4899', HEALTH: '#06b6d4', EDUCATION: '#f97316',
  SALARY: '#10b981', FREELANCE: '#3b82f6', INVESTMENT: '#8b5cf6',
  SAVINGS: '#06b6d4', OTHER: '#64748b'
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getFull(), transactionAPI.getAll()])
      .then(([aRes, tRes]) => {
        setAnalytics(aRes.data);
        setRecentTx(tRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const pieData = analytics?.categoryBreakdown
    ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({ name, value: parseFloat(value) }))
    : [];

  const trendData = (analytics?.monthlyTrends || []).slice(-6).map(t => ({
    name: t.monthName?.split(' ')[0] || '',
    Income: parseFloat(t.income || 0),
    Expense: parseFloat(t.expense || 0),
    Savings: parseFloat(t.savings || 0),
  }));

  const savingsRate = analytics?.savingsRate || 0;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/transactions/add" className="btn btn-primary">
          <Plus size={16} /> Add Transaction
        </Link>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <StatCard icon={<TrendingUp size={20} />} label="Total Income" value={fmt(analytics?.totalIncome)} color="green" trend="+12%" />
        <StatCard icon={<TrendingDown size={20} />} label="Total Expenses" value={fmt(analytics?.totalExpense)} color="red" trend="+5%" />
        <StatCard icon={<DollarSign size={20} />} label="Net Savings" value={fmt(analytics?.netSavings)} color={analytics?.netSavings >= 0 ? 'green' : 'red'} />
        <StatCard icon={<PiggyBank size={20} />} label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} color={savingsRate >= 20 ? 'green' : 'amber'} />
      </div>

      {/* Charts row */}
      <div className="charts-grid">
        {/* Monthly Trend */}
        <div className="card chart-card">
          <h3 className="chart-title">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card chart-card">
          <h3 className="chart-title">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Savings bar */}
      <div className="card savings-card">
        <div className="savings-header">
          <div>
            <h3>Savings Progress</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Target: 20% of income</p>
          </div>
          <span className={`badge ${savingsRate >= 20 ? 'badge-income' : 'badge-warning'}`}>
            {savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill"
            style={{ width: `${Math.min(savingsRate, 100)}%`, background: savingsRate >= 20 ? 'var(--gradient-primary)' : 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
        </div>
        <div className="savings-labels">
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>0%</span>
          <span style={{ color: savingsRate >= 20 ? 'var(--accent-green)' : 'var(--accent-amber)', fontSize: 12, fontWeight: 600 }}>
            {savingsRate >= 20 ? '✅ Target reached!' : `${(20 - savingsRate).toFixed(1)}% more to reach target`}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>20%+</span>
        </div>
      </div>

      {/* Bottom row: Insights + Recent */}
      <div className="bottom-grid">
        {/* AI Insights */}
        <div className="card">
          <h3 className="chart-title" style={{ marginBottom: 16 }}>🤖 AI Insights</h3>
          <div className="insights-list">
            {(analytics?.warnings || []).map((w, i) => (
              <InsightItem key={i} text={w} type="warning" />
            ))}
            {(analytics?.insights || []).map((ins, i) => (
              <InsightItem key={i} text={ins} type="success" />
            ))}
            {(analytics?.suggestions || []).slice(0, 3).map((s, i) => (
              <InsightItem key={i} text={s} type="tip" />
            ))}
            {!analytics?.warnings?.length && !analytics?.insights?.length && (
              <div className="empty-state" style={{ padding: 16 }}>
                <p>Add transactions to unlock AI insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="chart-title">Recent Transactions</h3>
            <Link to="/transactions" style={{ fontSize: 13, color: 'var(--accent-green)' }}>View all →</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="empty-state" style={{ padding: 16 }}>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="recent-tx-list">
              {recentTx.map(tx => (
                <div key={tx.id} className="recent-tx-item">
                  <div className="tx-cat-icon" style={{ background: CATEGORY_COLORS[tx.category] + '22', color: CATEGORY_COLORS[tx.category] }}>
                    {tx.category?.[0]}
                  </div>
                  <div className="tx-details">
                    <div className="tx-desc">{tx.description || tx.category}</div>
                    <div className="tx-date">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div className={tx.type === 'INCOME' ? 'amount-positive' : 'amount-negative'}>
                    {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }) {
  const colors = { green: '#10b981', red: '#ef4444', amber: '#f59e0b', blue: '#3b82f6' };
  const c = colors[color] || colors.blue;
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: c + '1a', color: c }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: c }}>{value}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
}

function InsightItem({ text, type }) {
  const icons = { warning: <AlertTriangle size={14} />, success: <CheckCircle size={14} />, tip: <Lightbulb size={14} /> };
  const colors = { warning: '#f59e0b', success: '#10b981', tip: '#3b82f6' };
  const c = colors[type];
  return (
    <div className="insight-item" style={{ borderColor: c + '30', background: c + '08' }}>
      <span style={{ color: c, flexShrink: 0 }}>{icons[type]}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
