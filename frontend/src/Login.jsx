import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

// ⚠️ IMPORTANT: Define the base URL for your backend server
const API_BASE_URL = 'http://localhost:5000'; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false); 
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [inputErrors, setInputErrors] = useState({
    username: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (inputErrors[name]) {
      setInputErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ======================================================================
  // ✅ Function to handle the actual API call to the backend
  // ======================================================================
  const handleLoginAttempt = async ({ username, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success: The server returned a 200 OK and success: true
        return { 
          success: true, 
          user: data.user, 
          dashboardUrl: data.dashboardUrl 
        };
      } else {
        // Failure: Server returned 401 (Invalid credentials) or another error
        return { 
          success: false, 
          type: 'username', 
          message: data.message || 'Login failed. Please try again.' 
        };
      }
    } catch (error) {
      // Network failure (server is down, CORS issue, etc.)
      console.error('API connection error:', error);
      throw new Error('Network Error: Could not connect to the server. Check if the server is running.');
    }
  };
  // ======================================================================

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setInputErrors({ username: '', password: '' });

    try {
      const response = await handleLoginAttempt(formData);

      if (response.success) {
        // Handle successful login (e.g., store token/user, redirect)
        alert(`Login Successful! Redirecting to ${response.dashboardUrl}`); 
        // ⚠️ In a real app, use React Router here: navigate(response.dashboardUrl);
      } else {
        // ✅ IMPROVEMENT: Only set the error on the username field, 
        // as the backend returns a generic error.
        setInputErrors({ 
            username: response.message, 
            password: '' 
        });
      }
    } catch (error) {
      // Display the network error thrown from handleLoginAttempt
      alert(error.message); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>E-Certificate Management Portal</h1>
      <div className="login-box">
        <h2 className="login-title">LOGIN</h2>
        <form onSubmit={handleSubmit}>
          
          {/* USERNAME FIELD */}
          <div className="input-group">
            <span className="input-icon"><FaUser /></span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          </div>
          {/* ERROR DISPLAY: Displays error set in inputErrors.username */}
          {inputErrors.username && (
            <p className="error-text">{inputErrors.username}</p>
          )}

          {/* PASSWORD FIELD */}
          <div className="input-group">
            <span className="input-icon"><FaLock /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {/* The dedicated password error display is now redundant/removed */}

          <div className="forgot-password-container">
            <a href="/forgot-password" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

        </form>
        
        <p className="register-text">
          Don't have an account? 
          <a href="/frontend/src/Register.jsx" className="register-link"> REGISTER</a>
        </p>
      </div>
    </div>
  );
};

export default Login;