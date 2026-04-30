import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./dashboard.css";

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  // NEW: State for clicking the stat cards!
  const [statusFilter, setStatusFilter] = useState("All");
  const { language, text, translateStatus } = useLanguage();
  const dashboard = text.dashboard;

  useEffect(() => {
    fetch("http://127.0.0.1:5001/admin")
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(err => console.error(err));
  }, []);

  const filtered = useMemo(() => {
    let result = complaints;

    // 1. Apply the Clickable Status Filter
    if (statusFilter !== "All") {
      if (statusFilter === "Active") {
        result = result.filter(c => c.status === "In Progress" || c.status === "Assigned");
      } else {
        result = result.filter(c => c.status === statusFilter);
      }
    }

    // 2. Apply the Search Filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((c) => {
        const textStr = `${c.trackingId || ""} ${c.department || ""} ${c.complaint || ""} ${c.status || ""}`.toLowerCase();
        return textStr.includes(q);
      });
    }

    // 3. Sort Newest to Oldest!
    return result.sort((a, b) => {
      const dateA = new Date(a.created_at?.$date || a.created_at || 0);
      const dateB = new Date(b.created_at?.$date || b.created_at || 0);
      return dateB - dateA;
    });
  }, [complaints, search, statusFilter]);

  // Stats
  const total = complaints.length;
  const pending = complaints.filter((c) => (c.status || "") === "Pending").length;
  const inProgress = complaints.filter((c) => (c.status || "") === "In Progress" || (c.status || "") === "Assigned").length;
  const resolved = complaints.filter((c) => (c.status || "") === "Resolved").length;

  return (
    <motion.div className="dashboard-page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="dashboard-shell">
        <div className="dashboard-top">
          <div>
            {/* Translated Titles! */}
            <h1 className="dashboard-title">{dashboard.publicPortal || "Public Transparency Portal"}</h1>
            <p className="dashboard-subtitle">{dashboard.portalDesc || "Live view of all city grievances, AI routing, and resolution status."}</p>
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

        {/* Clickable Stat Cards! */}
        <div className="stats-row">
          <motion.div className="stat" whileHover={{ y: -3 }} onClick={() => setStatusFilter("All")} style={{ cursor: "pointer", border: statusFilter === "All" ? "2px solid #3b82f6" : "" }}>
            <div className="label">{dashboard.totalComplaints}</div>
            <div className="value">{total}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }} onClick={() => setStatusFilter("Pending")} style={{ cursor: "pointer", border: statusFilter === "Pending" ? "2px solid #3b82f6" : "" }}>
            <div className="label">{dashboard.pending}</div>
            <div className="value">{pending}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }} onClick={() => setStatusFilter("Active")} style={{ cursor: "pointer", border: statusFilter === "Active" ? "2px solid #3b82f6" : "" }}>
            <div className="label">{dashboard.activeWork || "Active Work"}</div>
            <div className="value">{inProgress}</div>
          </motion.div>
          <motion.div className="stat" whileHover={{ y: -3 }} onClick={() => setStatusFilter("Resolved")} style={{ cursor: "pointer", border: statusFilter === "Resolved" ? "2px solid #3b82f6" : "" }}>
            <div className="label">{dashboard.resolved}</div>
            <div className="value">{resolved}</div>
          </motion.div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>{dashboard.emptyTitle}</h3>
            <p>{dashboard.emptyText}</p>
            {statusFilter !== "All" && (
              <button style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer' }} onClick={() => setStatusFilter("All")}>Clear Filters</button>
            )}
          </div>
        ) : (
          <div className="complaint-list">
            {filtered.map((c) => {
              const dateString = c.created_at ? new Date(c.created_at.$date || c.created_at).toLocaleDateString() : "Unknown Date";
              return (
                <motion.div className="complaint-row" key={c.trackingId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="row-head">
                    <div>
                      <h3 className="row-title">{getLocalizedDepartmentLabel(c.department, language)}</h3>
                      <p className="row-id">ID: {c.trackingId} • {dateString}</p>
                    </div>
                    <span className="row-status">{translateStatus(c.status || "Pending")}</span>
                  </div>
                  <div className="row-grid">
                    <p><strong>{dashboard.area}:</strong> {`${c.street || ""} ${c.area || ""} ${c.pin || ""}`.trim() || "Location not provided"}</p>
                    <p className="row-desc"><strong>{dashboard.description}:</strong> {c.complaint || "-"}</p>
                  </div>
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