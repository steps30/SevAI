import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import "./roleSelect.css";

function LoginRoleSelect({ onSelectRole }) {
  const navigate = useNavigate();
  const { text } = useLanguage();
  const roleSelect = text.roleSelect;

  const handleSelect = (role) => {
    onSelectRole(role);
    navigate("/login");
  };

  return (
    <div className="role-select-main">
      <motion.div
        className="role-select-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <p className="role-select-kicker">{roleSelect.kicker}</p>
        <h1 className="role-select-title">{roleSelect.title}</h1>
        <p className="role-select-subtitle">
          {roleSelect.subtitle}
        </p>

        <div className="role-select-grid">
          {/* Citizen / User Card */}
          <button
            type="button"
            className="role-card user-card"
            onClick={() => handleSelect("user")}
          >
            <div className="role-icon-wrap" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span className="role-name">{roleSelect.userLogin}</span>
            <span className="role-hint">{roleSelect.userHint}</span>
          </button>

          {/* Admin / Official Card */}
          <button
            type="button"
            className="role-card admin-card"
            onClick={() => handleSelect("admin")}
          >
            <div className="role-icon-wrap" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span className="role-name">{roleSelect.adminLogin}</span>
            <span className="role-hint">{roleSelect.adminHint}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginRoleSelect;