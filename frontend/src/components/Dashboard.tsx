import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';
import { useExpense } from '../context/ExpenseContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, subscriptions, dashboardData, fetchExpenses, fetchSubscriptions, fetchDashboard } = useExpense();

  useEffect(() => {
    fetchExpenses();
    fetchSubscriptions();
    fetchDashboard();
  }, []);

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const totalSubscriptions = activeSubscriptions.reduce((sum, sub) => {
    const multiplier = { daily: 30, weekly: 4, monthly: 1, yearly: 1/12 }[sub.frequency] || 1;
    return sum + (sub.amount * multiplier);
  }, 0);
  
  const thisMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const recentExpenses = expenses.slice(0, 5);

  // Calculate last month for trend comparison
  const lastMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return expDate.getMonth() === lastMonth.getMonth() && expDate.getFullYear() === lastMonth.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const monthTrend = lastMonthExpenses > 0 
    ? parseFloat(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses * 100).toFixed(1))
    : 0;

  // Prepare chart data
  const categoryData = dashboardData?.categorySpending.map(cat => ({
    name: cat.name,
    value: cat.total,
    color: cat.color || '#0ea5e9'
  })) || [];

  const COLORS = categoryData.map(d => d.color);
  const totalCategoryAmount = categoryData.reduce((sum, cat) => sum + cat.value, 0);

  // Daily spending data for area chart - sort chronologically
  const dailyData = dashboardData?.dailySpending
    .slice(0, 7)
    .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime())
    .map(day => ({
      date: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: day.total
    })) || [];



  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Track your expenses and subscriptions</p>
        </div>
        <div className="header-actions">
          <button className="btn-add-expense" onClick={() => navigate('/expenses')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Expense
          </button>
          <button className="btn-add-subscription" onClick={() => navigate('/subscriptions')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Subscription
          </button>
        </div>
      </div>

      {/* Stats Cards - Top Row */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Expenses</span>
            <p className="stat-value">{expenses.length}</p>
            <span className="stat-trend positive">+{expenses.length > 0 ? '12%' : '0%'} from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Amount</span>
            <p className="stat-value">₹{totalExpenses.toFixed(0)}</p>
            <span className={`stat-trend ${monthTrend >= 0 ? 'positive' : 'negative'}`}>
              {monthTrend >= 0 ? '+' : ''}{monthTrend}% from last month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Subscriptions</span>
            <p className="stat-value">{activeSubscriptions.length}</p>
            <span className="stat-trend neutral">₹{totalSubscriptions.toFixed(0)}/month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Average per Expense</span>
            <p className="stat-value">₹{(expenses.length > 0 ? totalExpenses / expenses.length : 0).toFixed(0)}</p>
            <span className="stat-trend positive">+5% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section - 66/33 Split */}
      <div className="charts-section">
        <div className="chart-card chart-main">
          <h3 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Daily Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {dailyData.length > 0 ? (
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0066" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f63b6d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8e5ff" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#767f72" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#64686f" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ff0055" 
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                  dot={{ fill: '#ff1f66', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            ) : (
              <div className="no-chart-data">No daily spending data available</div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-side">
          <h3 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            {categoryData.length > 0 ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="donut-center-text"
                >
                  <tspan x="50%" dy="-0.5em" fontSize="14" fill="#6b7280">Total</tspan>
                  <tspan x="50%" dy="1.5em" fontSize="20" fontWeight="700" fill="#111827">₹{totalCategoryAmount.toFixed(0)}</tspan>
                </text>
              </PieChart>
            ) : (
              <div className="no-chart-data">No category data available</div>
            )}
          </ResponsiveContainer>
          <div className="chart-legend">
            {categoryData.map((cat, index) => (
              <div key={index} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: cat.color }}></span>
                <span className="legend-label">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="recent-expenses">
        <div className="recent-header">
          <h2>Recent Expenses</h2>
          <button className="view-all-btn" onClick={() => navigate('/expenses')}>
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="no-data">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No expenses yet. Start tracking by adding your first expense!</p>
          </div>
        ) : (
          <div className="expenses-list">
            {recentExpenses.map((exp) => (
              <div key={exp._id} className="expense-item">
                <div className="expense-item-icon" style={{ backgroundColor: exp.category?.color + '20', color: exp.category?.color }}>
                  {exp.category?.icon || '📁'}
                </div>
                <div className="expense-item-details">
                  <h4>{exp.title}</h4>
                  <p className="expense-category">{exp.category?.name}</p>
                </div>
                <div className="expense-item-right">
                  <span className="expense-item-amount">₹{exp.amount.toFixed(2)}</span>
                  <span className="expense-item-date">{new Date(exp.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
