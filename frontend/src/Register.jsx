import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaMobileAlt, FaKey } from 'react-icons/fa';
// Note: We are reusing the Login.css for the design
import './Login.css'; 

const API_BASE_URL = 'http://localhost:5000'; 

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        roll_number: '',
        phone_number: '',
        email: '',
        password: '', // Hidden in your form, but needed for the backend API
        otp: '',
    });
    const [errors, setErrors] = useState({});
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Hardcode the password since it's not explicitly in the form, 
    // but the backend requires it. (Ideally, the form would include a Password field).
    const HARDCODED_PASSWORD = 'password123'; 

    const validateField = (name, value) => {
        let error = '';
        if (name === 'username' && !/^\S+$/.test(value)) {
            error = 'Username cannot contain spaces.';
        } else if (name === 'roll_number' && !/^\d{12}$/.test(value)) {
            error = 'Roll number must be exactly 12 digits.';
        } else if (name === 'phone_number' && !/^\d{10}$/.test(value)) {
            error = 'Mobile number must be exactly 10 digits.';
        } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Invalid email address.';
        } else if (name === 'otp' && !/^\d{4,6}$/.test(value)) {
            error = 'OTP must be 4 to 6 digits.';
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear the specific error when the user types
        setErrors(prev => ({ ...prev, [name]: '' }));

        // Reset verification status if OTP or email changes
        if (name === 'email' || name === 'otp') {
            setIsOtpVerified(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        // Skip OTP sending if email validation fails
        const emailError = validateField('email', formData.email);
        if (emailError) {
            setErrors(prev => ({ ...prev, email: emailError }));
            return;
        }

        setIsLoading(true);
        // 🚨 TO DO: Implement actual API call to send OTP to the backend
        console.log(`Sending OTP to ${formData.email}...`);
        
        // Mock successful OTP send
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        setIsOtpSent(true);
        alert('OTP sent successfully to your email. (Mock response)');
        
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpError = validateField('otp', formData.otp);
        if (otpError) {
            setErrors(prev => ({ ...prev, otp: otpError }));
            return;
        }
        if (!isOtpSent) {
            setErrors(prev => ({ ...prev, otp: 'Please send OTP first.' }));
            return;
        }

        setIsLoading(true);
        // 🚨 TO DO: Implement actual API call to verify OTP
        console.log(`Verifying OTP: ${formData.otp}`);
        
        // Mock successful OTP verification
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // In a real app, you'd check the API response for success/failure
        setIsOtpVerified(true);
        alert('OTP verified successfully! You can now proceed.');

        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Client-Side Validation (full form)
        let newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (!isOtpVerified) {
            newErrors.otp = 'Please verify the OTP before proceeding.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        // 2. Prepare data for backend API
        const registrationData = {
            username: formData.username,
            roll_number: formData.roll_number,
            phone_number: formData.phone_number,
            email: formData.email,
            password: HARDCODED_PASSWORD, // Use the hardcoded password
            // gender is currently not in the form, will be null in backend
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Registration successful! User ID: ${data.userId}. You can now log in.`);
                // Redirect to login page or next step
                // navigate('/login'); 
            } else {
                // Display error from backend (e.g., 'User already exists')
                setErrors({ general: data.message || 'Registration failed.' });
            }
        } catch (error) {
            setErrors({ general: 'Network Error: Could not connect to the server.' });
            console.error('Registration API error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1>E-Certificate Management Portal</h1>
            <div className="login-box">
                <h2 className="login-title">REGISTER</h2>
                {errors.general && <p className="error-text general-error">{errors.general}</p>}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Full Name / Username */}
                    <div className="input-group">
                        <span className="input-icon"><FaUser /></span>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Full Name (Username, No Spaces)"
                            required
                        />
                    </div>
                    {errors.username && <p className="error-text">{errors.username}</p>}

                    {/* Roll Number (12 Digits) */}
                    <div className="input-group">
                        <span className="input-icon"><FaLock /></span> 
                        <input
                            type="text"
                            name="roll_number"
                            value={formData.roll_number}
                            onChange={handleChange}
                            placeholder="Roll Number (12 Digits)"
                            maxLength="12"
                            required
                        />
                    </div>
                    {errors.roll_number && <p className="error-text">{errors.roll_number}</p>}

                    {/* Mobile Number (10 Digits) */}
                    <div className="input-group">
                        <span className="input-icon"><FaMobileAlt /></span>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Mobile Number (10 Digits)"
                            maxLength="10"
                            required
                        />
                    </div>
                    {errors.phone_number && <p className="error-text">{errors.phone_number}</p>}

                    {/* Email */}
                    <div className="input-group">
                        <span className="input-icon"><FaEnvelope /></span>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    {/* Send OTP Button (only shown if OTP not sent or verified) */}
                    {!isOtpVerified && (
                        <button 
                            onClick={handleSendOtp} 
                            disabled={isLoading || isOtpSent}
                            className="otp-button"
                            style={{ marginBottom: '15px' }}
                        >
                            {isLoading ? 'Sending...' : (isOtpSent ? 'OTP Sent (Resend?)' : 'Send OTP')}
                        </button>
                    )}

                    {/* OTP Field (Only shown after OTP is sent) */}
                    {isOtpSent && !isOtpVerified && (
                        <>
                            <div className="input-group otp-input-group">
                                <span className="input-icon"><FaKey /></span>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="Enter OTP (4-6 Digits)"
                                    maxLength="6"
                                    required
                                />
                                <button 
                                    onClick={handleVerifyOtp} 
                                    disabled={isLoading}
                                    className="verify-button"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                            {errors.otp && <p className="error-text">{errors.otp}</p>}
                        </>
                    )}

                    {/* PROCEED Button (Enabled only after OTP is verified) */}
                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={isLoading || !isOtpVerified}
                    >
                        {isLoading ? 'Processing...' : 'Proceed'}
                    </button>

                </form>

                <p className="register-text">
                    Already have an account? 
                    <a href="/login" className="register-link"> LOGIN</a>
                </p>
            </div>
        </div>
    );
};

export default Register;