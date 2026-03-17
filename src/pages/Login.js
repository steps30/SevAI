import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const { text } = useLanguage();
  const loginText = text.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const credsByRole = {
    user: { email: "user@gmail.com", password: "1234" },
  };

  const activeCreds = credsByRole.user;
  const roleLabel = selectedRole === "admin" ? loginText.admin : loginText.user;

  const handleLogin = (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (selectedRole === "admin") {
      const account = findAdminAccountByEmail(normalizedEmail);

      if (account && password === account.password) {
        setError("");
        setAdminDepartment(account.department);
        setAdminId(account.adminId);
        setCurrentUserEmail(account.email);
        setCurrentUserName(account.adminId);
        localStorage.setItem("adminDepartment", account.department);
        localStorage.setItem("adminId", account.adminId);
        localStorage.setItem("currentUserEmail", account.email);
        localStorage.setItem("currentUserName", account.adminId);
        setIsLoggedIn(true);
        return;
      }

      setError(loginText.invalidAdminCredentials);
      return;
    }

    if (normalizedEmail === activeCreds.email && password === activeCreds.password) {
      setError("");
      setAdminDepartment("");
      setAdminId("");
      setCurrentUserEmail(activeCreds.email);
      setCurrentUserName("User");
      localStorage.removeItem("adminDepartment");
      localStorage.removeItem("adminId");
      localStorage.setItem("currentUserEmail", activeCreds.email);
      localStorage.setItem("currentUserName", "User");
      setIsLoggedIn(true);
    } else {
      setError(
        loginText.invalidCredentials
          .replace("{role}", roleLabel)
          .replace("{email}", activeCreds.email)
          .replace("{password}", activeCreds.password)
      );
    }
  };

  return (
    <div className="login-main">
      <motion.div
        className="login-brand"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="login-brand-mark" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>{text.common?.brandName || "COMPANY LOGO"}</p>
      </motion.div>

      <motion.div
        className="login-wrapper"
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          className="login-right"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="login-visual-art" aria-hidden="true">
            <img src="/images/grievance-hero.svg" alt="" />
          </div>
          <h2>{loginText.welcomeBack}</h2>
          <p>
            {loginText.roleSelected} <strong>{roleLabel}</strong> {loginText.login.toLowerCase()}.
            {" "}{loginText.continueText}
          </p>
        </motion.div>

        <div className="login-divider" aria-hidden="true"></div>

        <motion.div
          className="login-left"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <h2>{roleLabel} {loginText.login}</h2>

          <button
            type="button"
            className="change-role-btn"
            onClick={() => {
              onChangeRole();
              navigate("/role-select");
            }}
          >
            {loginText.changeRole}
          </button>

          <form onSubmit={handleLogin} className="login-form">
            <label className="login-input-wrap">
              <input
                type="email"
                placeholder={`${roleLabel} ${loginText.emailAddress}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="login-input-icon" aria-hidden="true">@</span>
            </label>

            <label className="login-input-wrap">
              <input
                type="password"
                placeholder={loginText.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="login-input-icon" aria-hidden="true">*</span>
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit">{loginText.login}</button>
            <p className="login-support-text">{loginText.continueText}</p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;