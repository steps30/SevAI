import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import "./navbar.css";

function Navbar({ theme, setTheme, selectedRole }) {
  const navigate = useNavigate();
  const isAdmin = selectedRole === "admin";
  const { language, setLanguage, text } = useLanguage();
  const nav = text.navbar;
  const common = text.common;

  return (
    <motion.header
      className="sev-navbar"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="sev-nav-inner">

        <div className="sev-brand">
          <span className="sev-dot" />
          <span className="sev-title">{common.brandName}</span>
        </div>

        <nav className="sev-links">

          <span className={`role-pill ${isAdmin ? "admin" : "user"}`}>
            {isAdmin ? nav.admin : nav.user}
          </span>

          {!isAdmin && (
            <NavLink to="/" end className={({ isActive }) =>
              isActive ? "sev-link active" : "sev-link"
            }>
              {nav.home}
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink to="/complaint" className={({ isActive }) =>
              isActive ? "sev-link active" : "sev-link"
            }>
              {nav.complaint}
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink to="/dashboard" className={({ isActive }) =>
              isActive ? "sev-link active" : "sev-link"
            }>
              {nav.dashboard}
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) =>
              isActive ? "sev-link active" : "sev-link"
            }>
              {nav.adminPanel}
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink to="/track" className={({ isActive }) =>
              isActive ? "sev-link active" : "sev-link"
            }>
              {nav.trackComplaint}
            </NavLink>
          )}

          <div className="language-toggle" role="group" aria-label={common.language}>
            <button
              type="button"
              className={language === "en" ? "language-toggle-btn active" : "language-toggle-btn"}
              onClick={() => setLanguage("en")}
              title={common.toggleToEnglish}
            >
              {common.english}
            </button>
            <button
              type="button"
              className={language === "ta" ? "language-toggle-btn active" : "language-toggle-btn"}
              onClick={() => setLanguage("ta")}
              title={common.toggleToTamil}
            >
              {common.tamil}
            </button>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={nav.toggleTheme}
            title={nav.toggleTheme}
          >
            <span>{theme === "light" ? `🌙 ${nav.themeDark}` : `☀️ ${nav.themeLight}`}</span>
          </button>

          {/* Profile Circle */}
          <button
            type="button"
            className="profile-circle"
            onClick={() => navigate("/profile")}
            aria-label={nav.profile}
            title={nav.profile}
          >
            <span className="profile-circle-icon" aria-hidden="true">👤</span>
          </button>

        </nav>
      </div>
    </motion.header>
  );
}

export default Navbar;