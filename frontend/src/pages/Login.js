import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { findAdminAccountByEmail } from "../auth/adminAccounts";

function Login({
  setIsLoggedIn,
  selectedRole,
  onChangeRole,
  setAdminDepartment,
  setAdminId,
  setCurrentUserEmail,
  setCurrentUserName,
}) {
  const navigate = useNavigate();
  const { text, language } = useLanguage();
  const loginText = text.login;

  // View Modes: 'LOGIN', 'SIGNUP_1', 'SIGNUP_2', 'FORGOT_1', 'FORGOT_2'
  const [mode, setMode] = useState("LOGIN");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = selectedRole === "admin" ? loginText.admin : loginText.user;
  const isAdmin = selectedRole === "admin";

  const executeLoginSuccess = (userName, userEmail, token = null) => {
    if (token) localStorage.setItem("authToken", token);
    setCurrentUserEmail(userEmail);
    setCurrentUserName(userName);
    localStorage.setItem("currentUserEmail", userEmail);
    localStorage.setItem("currentUserName", userName);
    setIsLoggedIn(true);
  };

  const handleAdminLogin = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = findAdminAccountByEmail(normalizedEmail);

    if (account && password === account.password) {
      const safeDepartment = account.department || "";
      setAdminDepartment(safeDepartment);
      setAdminId(account.adminId);
      executeLoginSuccess(account.adminId, account.email);
    } else {
      setError(loginText.invalidAdminCredentials || "Invalid Admin Credentials.");
    }
  };

  const handleCitizenLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        executeLoginSuccess(data.user.name, data.user.email, data.token);
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequestOTP = async () => {
    if (!name.trim() || password.length < 6) {
      setError("Please provide a name and a password (min 6 chars).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/signup/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) setMode("SIGNUP_2");
      else setError(data.error || "Failed to send OTP.");
    } catch (err) { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleSignupVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        executeLoginSuccess(data.user.name, data.user.email, data.token);
      } else setError(data.error || "Invalid OTP.");
    } catch (err) { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleForgotRequestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/forgot/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) setMode("FORGOT_2");
      else setError(data.error || "Email not found.");
    } catch (err) { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleForgotReset = async () => {
    if (password.length < 6) { setError("New password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5001/api/auth/forgot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMode("LOGIN");
        setPassword("");
        setOtp("");
        setError("Password reset successfully! Please log in."); // Show as positive message temporarily
      } else setError(data.error || "Invalid OTP.");
    } catch (err) { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAdmin) { handleAdminLogin(); return; }

    switch (mode) {
      case "LOGIN": handleCitizenLogin(); break;
      case "SIGNUP_1": handleSignupRequestOTP(); break;
      case "SIGNUP_2": handleSignupVerifyOTP(); break;
      case "FORGOT_1": handleForgotRequestOTP(); break;
      case "FORGOT_2": handleForgotReset(); break;
      default: break;
    }
  };

  return (
    <div className="login-main">
      <motion.div className="login-brand" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <img src="/logo.svg" alt="SevAI Logo" style={{ height: "40px", width: "auto" }} />
      </motion.div>

      <motion.div className="login-wrapper" initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
        <motion.div className="login-right" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}>
          <div className="login-visual-art" aria-hidden="true">
            <img src="/images/grievance-hero.svg" alt="" />
          </div>
          <h2>{loginText.welcomeBack}</h2>
          <p>{loginText.roleSelected} <strong>{roleLabel}</strong>. {loginText.continueText}</p>
        </motion.div>

        <div className="login-divider" aria-hidden="true"></div>

        <motion.div className="login-left" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
          <h2>
            {isAdmin ? `${roleLabel} Login` :
              mode === "LOGIN" ? "Citizen Login" :
                mode.includes("SIGNUP") ? "Create Account" : "Reset Password"}
          </h2>

          <button type="button" className="change-role-btn" onClick={() => { onChangeRole(); navigate("/role-select"); }}>
            ← {loginText.changeRole}
          </button>

          <form onSubmit={handleSubmit} className="login-form" style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "15px" }}>
            <AnimatePresence mode="wait">
              {/* VIEWS: LOGIN, SIGNUP_1, FORGOT_1 (Require Email) */}
              {["LOGIN", "SIGNUP_1", "FORGOT_1"].includes(mode) && (
                <motion.div key="email-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {mode === "SIGNUP_1" && !isAdmin && (
                    <label className="login-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: "100%", padding: "14px 16px 14px 44px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid rgba(150, 150, 150, 0.3)", background: "transparent", fontSize: "15px", color: "inherit" }}
                      />
                      <span className="login-input-icon" style={{ position: "absolute", left: "14px", pointerEvents: "none", opacity: 0.6 }}>👤</span>
                    </label>
                  )}

                  <label className="login-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                    <input
                      type="email"
                      placeholder={loginText.emailAddress}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      style={{ width: "100%", padding: "14px 16px 14px 44px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid rgba(150, 150, 150, 0.3)", background: "transparent", fontSize: "15px", color: "inherit" }}
                    />
                    <span className="login-input-icon" style={{ position: "absolute", left: "14px", pointerEvents: "none", opacity: 0.6 }}>@</span>
                  </label>

                  {["LOGIN", "SIGNUP_1"].includes(mode) && (
                    <label className="login-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                      <input
                        type="password"
                        placeholder={mode === "SIGNUP_1" ? "Create Password" : loginText.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "14px 16px 14px 44px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid rgba(150, 150, 150, 0.3)", background: "transparent", fontSize: "15px", color: "inherit" }}
                      />
                      <span className="login-input-icon" style={{ position: "absolute", left: "14px", pointerEvents: "none", opacity: 0.6 }}>*</span>
                    </label>
                  )}

                  {/* Forgot Password Link */}
                  {mode === "LOGIN" && !isAdmin && (
                    <p className="login-support-text" style={{ textAlign: "right", marginTop: "-6px", marginBottom: "5px" }}>
                      <span onClick={() => { setMode("FORGOT_1"); setError(""); }} style={{ cursor: "pointer", color: "#6d4ce3", fontSize: "13px", fontWeight: "600" }}>
                        Forgot Password?
                      </span>
                    </p>
                  )}
                </motion.div>
              )}

              {/* VIEWS: SIGNUP_2, FORGOT_2 (Require OTP) */}
              {["SIGNUP_2", "FORGOT_2"].includes(mode) && (
                <motion.div key="otp-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p className="login-support-text" style={{ marginBottom: "5px", fontSize: "14px", opacity: 0.9 }}>
                    We sent a 6-digit code to <strong>{email}</strong>.
                  </p>

                  <label className="login-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ width: "100%", padding: "14px 16px 14px 44px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid rgba(150, 150, 150, 0.3)", background: "transparent", fontSize: "16px", letterSpacing: "3px", fontWeight: "bold", color: "inherit" }}
                    />
                    <span className="login-input-icon" style={{ position: "absolute", left: "14px", pointerEvents: "none", opacity: 0.6 }}>🔒</span>
                  </label>

                  {mode === "FORGOT_2" && (
                    <label className="login-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                      <input
                        type="password"
                        placeholder="Enter New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "14px 16px 14px 44px", boxSizing: "border-box", borderRadius: "8px", border: "1px solid rgba(150, 150, 150, 0.3)", background: "transparent", fontSize: "15px", color: "inherit" }}
                      />
                      <span className="login-input-icon" style={{ position: "absolute", left: "14px", pointerEvents: "none", opacity: 0.6 }}>*</span>
                    </label>
                  )}

                  <button type="button" className="change-role-btn" onClick={() => setMode(mode === "SIGNUP_2" ? "SIGNUP_1" : "FORGOT_1")} style={{ alignSelf: "flex-start" }}>
                    ← Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="login-error" style={{ color: error.includes("successfully") ? "#10b981" : "#ef4444", fontSize: "14px", marginTop: "10px", marginBottom: "0" }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", marginTop: "16px", fontSize: "16px", fontWeight: "700", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #6d4ce3, #5533ff)", color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Processing..." :
                mode === "LOGIN" ? loginText.login :
                  mode === "SIGNUP_1" ? "Verify Email to Sign Up" :
                    mode === "SIGNUP_2" ? "Verify & Create Account" :
                      mode === "FORGOT_1" ? "Send Reset Link" :
                        "Reset Password"}
            </button>

            {/* Toggle Sign Up / Login */}
            {!isAdmin && ["LOGIN", "SIGNUP_1"].includes(mode) && (
              <p className="login-support-text toggle-auth-text" style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
                {mode === "LOGIN" ? "Don't have an account?" : "Already have an account?"}{" "}
                <strong onClick={() => { setMode(mode === "LOGIN" ? "SIGNUP_1" : "LOGIN"); setError(""); }} style={{ cursor: "pointer", color: "#6d4ce3", fontWeight: "600" }}>
                  {mode === "LOGIN" ? "Sign up here." : "Log in here."}
                </strong>
              </p>
            )}

            {/* Back to Login from Forgot Password */}
            {mode === "FORGOT_1" && (
              <p className="login-support-text toggle-auth-text" style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
                <strong onClick={() => { setMode("LOGIN"); setError(""); }} style={{ cursor: "pointer", color: "#6d4ce3", fontWeight: "600" }}>
                  ← Back to Login
                </strong>
              </p>
            )}

          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;