import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import '../styles/Login.css';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Login: React.FC = () => {
  const { login, register } = useExpense();
  const [isSignup, setIsSignup] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Please fill in all fields');
      }
      if (!loginData.email.includes('@')) {
        throw new Error('Please enter a valid email');
      }
      
      await login(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (!signupData.email.includes('@')) {
        throw new Error('Please enter a valid email');
      }
      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await register(signupData.name, signupData.email, signupData.password);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>My Expense Tracker</h1>
          <p>Manage your expenses with ease</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isSignup ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="form-footer">
              <p>Don't have an account?</p>
              <button
                type="button"
                className="switch-button"
                onClick={() => {
                  setIsSignup(true);
                  setError('');
                  setSuccess('');
                }}
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="form-footer">
              <p>Already have an account?</p>
              <button
                type="button"
                className="switch-button"
                onClick={() => {
                  setIsSignup(false);
                  setError('');
                  setSuccess('');
                }}
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
