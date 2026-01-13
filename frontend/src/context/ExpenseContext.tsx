import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { authAPI, userAPI, expenseAPI, categoryAPI, subscriptionAPI, analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currency: string;
  monthlyBudget?: number;
  avatar?: string;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  budget: number;
  spending?: number;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  description?: string;
  paymentMethod: string;
}

export interface Subscription {
  _id: string;
  name: string;
  amount: number;
  category: Category;
  frequency: string;
  nextPaymentDate: string;
  startDate: string;
  isActive: boolean;
  isPaid?: boolean;
  lastPaidDate?: string;
  description?: string;
}

export interface DashboardData {
  currentMonth: {
    total: number;
    count: number;
    percentageChange: string;
  };
  categorySpending: Array<{
    _id: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    count: number;
  }>;
  dailySpending: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  paymentMethods: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
}

interface ExpenseContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  expenses: Expense[];
  categories: Category[];
  subscriptions: Subscription[];
  dashboardData: DashboardData | null;
  
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Profile
  updateProfile: (data: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Expenses
  fetchExpenses: (params?: any) => Promise<void>;
  addExpense: (data: any) => Promise<void>;
  updateExpense: (id: string, data: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Categories
  fetchCategories: () => Promise<void>;
  addCategory: (data: any) => Promise<void>;
  updateCategory: (id: string, data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Subscriptions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (data: any) => Promise<void>;
  updateSubscription: (id: string, data: any) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  
  // Analytics
  fetchDashboard: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Auth functions
  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setExpenses([]);
    setCategories([]);
    setSubscriptions([]);
    setDashboardData(null);
    toast.info('Logged out successfully');
  };

  // Profile functions
  const updateProfile = async (data: any) => {
    try {
      const response = await userAPI.updateProfile(data);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      throw error;
    }
  };

  // Expense functions
  const fetchExpenses = async (params?: any) => {
    try {
      const response = await expenseAPI.getAll(params);
      setExpenses(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch expenses');
      throw error;
    }
  };

  const addExpense = async (data: any) => {
    try {
      const response = await expenseAPI.create(data);
      setExpenses([response.data, ...expenses]);
      toast.success('Expense added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id: string, data: any) => {
    try {
      const response = await expenseAPI.update(id, data);
      setExpenses(expenses.map(exp => exp._id === id ? response.data : exp));
      toast.success('Expense updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenseAPI.delete(id);
      setExpenses(expenses.filter(exp => exp._id !== id));
      toast.success('Expense deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
      throw error;
    }
  };

  // Category functions
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch categories');
      throw error;
    }
  };

  const addCategory = async (data: any) => {
    try {
      const response = await categoryAPI.create(data);
      setCategories([...categories, response.data]);
      toast.success('Category added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (id: string, data: any) => {
    try {
      const response = await categoryAPI.update(id, data);
      setCategories(categories.map(cat => cat._id === id ? response.data : cat));
      toast.success('Category updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter(cat => cat._id !== id));
      toast.success('Category deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw error;
    }
  };

  // Subscription functions
  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getAll();
      setSubscriptions(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch subscriptions');
      throw error;
    }
  };

  const addSubscription = async (data: any) => {
    try {
      const response = await subscriptionAPI.create(data);
      setSubscriptions([...subscriptions, response.data]);
      toast.success('Subscription added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add subscription');
      throw error;
    }
  };

  const updateSubscription = async (id: string, data: any) => {
    try {
      const response = await subscriptionAPI.update(id, data);
      setSubscriptions(subscriptions.map(sub => sub._id === id ? response.data : sub));
      toast.success('Subscription updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      await subscriptionAPI.delete(id);
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
      toast.success('Subscription deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subscription');
      throw error;
    }
  };

  // Analytics functions
  const fetchDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch dashboard data');
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        expenses,
        categories,
        subscriptions,
        dashboardData,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        fetchSubscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        fetchDashboard,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
