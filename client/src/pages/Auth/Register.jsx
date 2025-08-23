import React, { useState } from 'react';
import '../../styles/components/Register.css';
import axios from 'axios';
import { Link } from "react-router-dom";


const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({})

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        type: 'error'
    });

    const showAlert = (message, type = 'error') => {
        setAlert({ show: true, message, type });
        setTimeout(() => {
            setAlert({ show: false, message: '', type: 'error' });
        }, 4000);
    };

    const validationForm = () => {
        const newErrors = {}

        if (!name.trim()) {
            newErrors.name = "Name is required";
        } else if (name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            newErrors.password = "Password must contain uppercase, lowercase, number and special character (@$!%*?&)";
        }

        setErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const submitToServer = async (userData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            return response.data;
        } catch (error) {
            console.log("Server error:", error.response ?.data || error.message)
            throw error;
        }   
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validationForm();

        if (validation.isValid) {
            try {
                const userData = { name, email, password };
                const result = await submitToServer(userData);
                showAlert("Registration successful!", 'success');
                console.log("Form is valid:", { name, email });
                setName('');
                setEmail('');
                setPassword('');
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
                showAlert(errorMessage, 'error');
            }
        } else {
            const firstError = Object.values(validation.errors)[0];
            if (firstError) {
                  showAlert(firstError, 'error');
            }
        }
    };

    return (
        <>
            {/* Alert Component */}
            {alert.show && (
            <div className={`custom-alert custom-alert--${alert.type}`}>
                <span className="alert-message">{alert.message}</span>
                <button 
                className="alert-close" 
                onClick={() => setAlert({...alert, show: false})}
                >
                ×
                </button>
            </div>
        )}
        
        <div className="register-container">
        <div className="register-card">
            <h1>Register to FitFlow</h1>
            
            <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Full Name:</label>
                <input 
                type="text" 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
                <label>Email:</label>
                <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label>Password:</label>
                <input 
                    type="password" 
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            <button type="submit" className="register-button">
                Register
            </button>
            </form>
            
            <p className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
        </div>
    </>
  );
};

export default Register;
