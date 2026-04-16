import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, PlusCircle, PiggyBank,
  LogOut, Menu, X, TrendingUp, Bell, ChevronRight
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/transactions/add', icon: PlusCircle, label: 'Add Transaction' },
  { to: '/budget', icon: PiggyBank, label: 'Budgets' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><TrendingUp size={18} /></div>
            <span className="logo-text">FinanceAI</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="top-bar-right">
            <button className="icon-btn"><Bell size={18} /></button>
            <div className="user-pill">
              <div className="user-avatar-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
