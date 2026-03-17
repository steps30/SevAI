import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

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
          <button
            type="button"
            className="role-card"
            onClick={() => handleSelect("user")}
          >
            <span className="role-icon" aria-hidden="true">👤</span>
            <span className="role-name">{roleSelect.userLogin}</span>
            <span className="role-hint">{roleSelect.userHint}</span>
          </button>

          <button
            type="button"
            className="role-card"
            onClick={() => handleSelect("admin")}
          >
            <span className="role-icon" aria-hidden="true">🛡️</span>
            <span className="role-name">{roleSelect.adminLogin}</span>
            <span className="role-hint">{roleSelect.adminHint}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginRoleSelect;
