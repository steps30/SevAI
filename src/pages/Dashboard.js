import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./dashboard.css";

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const { language, text, translateStatus } = useLanguage();
  const dashboard = text.dashboard;

  useEffect(() => {
    const loadComplaints = () => {
      const stored = JSON.parse(localStorage.getItem("complaints")) || [];
      setComplaints(stored);
    };

    loadComplaints();

    const handleStorage = (e) => {
      if (!e.key || e.key === "complaints") loadComplaints();
    };

    const handleComplaintsUpdated = () => {
      loadComplaints();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadComplaints);
    window.addEventListener("complaints-updated", handleComplaintsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadComplaints);
      window.removeEventListener("complaints-updated", handleComplaintsUpdated);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return complaints;
    return complaints.filter((c) => {
      const text =
        `${c.trackingId || ""} ${c.department || ""} ${c.name || ""} ${c.phone || ""} ${c.complaint || ""} ${c.status || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [complaints, search]);

  // Stats
  const total = complaints.length;
  const pending = complaints.filter((c) => (c.status || "") === "Pending").length;
  const inProgress = complaints.filter((c) => (c.status || "") === "In Progress").length;
  const resolved = complaints.filter((c) => (c.status || "") === "Resolved").length;

  return (
    <motion.div
      className="dashboard-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="dashboard-shell">
        <div className="dashboard-top">
          <div>
            <h1 className="dashboard-title">{dashboard.title}</h1>
            <p className="dashboard-subtitle">
              {dashboard.subtitle}
            </p>
          </div>

          <div className="dashboard-search">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              className="search-box"
              placeholder={dashboard.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <motion.div
          className="dashboard-visual"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="dashboard-visual-copy">
            <h3>{dashboard.visualTitle}</h3>
            <p>
              {dashboard.visualText}
            </p>
          </div>
          <img src="/images/dashboard-ops.svg" alt={dashboard.visualAlt} />
        </motion.div>

        <div className="stats-row">
          <motion.div className="stat" whileHover={{ y: -3 }}>
            <div className="label">{dashboard.totalComplaints}</div>
            <div className="value">{total}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }}>
            <div className="label">{dashboard.pending}</div>
            <div className="value">{pending}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }}>
            <div className="label">{dashboard.inProgress}</div>
            <div className="value">{inProgress}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }}>
            <div className="label">{dashboard.resolved}</div>
            <div className="value">{resolved}</div>
          </motion.div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>{dashboard.emptyTitle}</h3>
            <p>{dashboard.emptyText}</p>
          </div>
        ) : (
          <div className="complaint-list">
            {filtered.map((c) => {
              return (
                <motion.div
                  className="complaint-row"
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="row-head">
                    <div>
                      <h3 className="row-title">{getLocalizedDepartmentLabel(c.department, language)} {dashboard.complaintSuffix}</h3>
                      <p className="row-id">{dashboard.id}: {c.trackingId || c.id}</p>
                    </div>
                    <span className="row-status">{translateStatus(c.status || "Pending")}</span>
                  </div>

                  <div className="row-grid">
                    <p><strong>{dashboard.name}:</strong> {c.name || "-"}</p>
                    <p><strong>{dashboard.phone}:</strong> {c.phone || "-"}</p>
                    <p><strong>{dashboard.area}:</strong> {`${c.street || ""} ${c.area || ""} ${c.pin || ""}`.trim() || "-"}</p>
                    <p className="row-desc"><strong>{dashboard.description}:</strong> {c.complaint || "-"}</p>
                  </div>

                  {c.image && <img src={c.image} alt={dashboard.evidenceAlt} />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Dashboard;