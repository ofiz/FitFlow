import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../styles/components/ResetPassword.css";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!newPassword || !confirmPassword) {
      showAlert("Please fill in all fields", "error");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword }
      );
      showAlert(response.data.message, "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          "Failed to reset password. Please try again.";
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

      <div className="reset-password-container">
        <div className="reset-password-card">
          <h1>Set New Password</h1>
          <p className="instruction-text">
            Please enter your new password below.
          </p>
          
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="reset-submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;