import React, { useState } from "react";
import '../../styles/components/Login.css';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


function Login() {
  // States for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for alert messages
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error"
  });
  const navigate = useNavigate();


const showAlert = (message, type = "error") => {
    setAlert({show: true, message, type})
    setTimeout(() => {setAlert({show: false, message: "", type: "error"})}, 4000);
}

const validationForm = () => {
    const newErrors = {};

    if (!email.trim()) {
        newErrors.email = "Email is required";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email";
    }

    if (!password) {
        newErrors.password = "Password is required";
    }
    else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
}


const submitToServer = async (userData) => {
  try {
    // Send login request to the server
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      userData
    );
    return response.data; // will include the JWT token
  } catch (error) {
    console.log("Server error:", error.response?.data || error.message);
    throw error;
  }
}
const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = validationForm();
  if (validation.isValid) {
    try {
      // Prepare user data
      const userData = { email, password };

      // Send login request to server
      const result = await submitToServer(userData);
      console.log("Server response:", result);
      localStorage.setItem('token', result.token);

      // Show success alert
      showAlert("Login successful!", "success");

      // Clear form fields
      setEmail("");
      setPassword("");

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      // Show error from server or fallback message
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      showAlert(errorMessage, "error");
    }
  } else {
    // Show first validation error
    const firstError = Object.values(validation.errors)[0];
    if (firstError) {
      showAlert(firstError, "error");
    }
  }
}
return (
    <>
      {alert.show && (
        <div className={`custom-alert custom-alert--${alert.type}`}>
          <span className="alert-message">{alert.message}</span>
          <button
            className="alert-close"
            onClick={() => setAlert({ ...alert, show: false })}
          >
            ×
          </button>
        </div>
      )}

      <div className="login-container">
        <div className="login-card">
          <h1>Login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot your password? Reset it here</Link>
            </div>

            <p className="register-link">
              Don’t have an account? <Link to="/register">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}



export default Login;
