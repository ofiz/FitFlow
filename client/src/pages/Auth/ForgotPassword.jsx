import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/components/ForgotPassword.css";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "error"
  });
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "error" });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showAlert("Please enter your email", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert("Please enter a valid email", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      showAlert(response.data.message, "success");
      setEmail("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          "Failed to send reset email. Please try again.";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h1>Reset Password</h1>
          <p className="instruction-text">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form className="forgot-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="reset-button"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;