import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./admin.css";

const STATUS_OPTIONS = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];

function AdminPanel({ adminDepartment, adminId }) {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { language, setLanguage, text, translateStatus } = useLanguage();
  const admin = text.admin;
  const common = text.common;

  // 1. Fetch from your Live AI Backend
  useEffect(() => {
    fetch("http://127.0.0.1:5001/admin")
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(err => console.error("Error fetching admin data:", err));
  }, []);

  // 2. Update Status and freeze Time Escalation
  const updateComplaint = async (trackingId, changes) => {
    try {
      await fetch(`http://127.0.0.1:5001/update/${trackingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(changes)
      });

      // Refresh data so the UI sorts instantly based on the new math
      const res = await fetch("http://127.0.0.1:5001/admin");
      const data = await res.json();
      setComplaints(data);

    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const scopedComplaints = useMemo(() => {
    if (!adminDepartment) return complaints;
    return complaints.filter((c) => c.department === adminDepartment);
  }, [complaints, adminDepartment]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedComplaints.filter((c) => {
      const statusOk = statusFilter === "All" || (c.status || "Pending") === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;

      const haystack = `${c.trackingId || ""} ${c.name || ""} ${c.department || ""} ${c.complaint || ""} ${c.status || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [scopedComplaints, search, statusFilter]);

  const stats = useMemo(() => {
    const total = scopedComplaints.length;
    const pending = scopedComplaints.filter((c) => (c.status || "Pending") === "Pending").length;
    const assigned = scopedComplaints.filter((c) => (c.status || "") === "Assigned").length;
    const inProgress = scopedComplaints.filter((c) => (c.status || "") === "In Progress").length;
    const resolved = scopedComplaints.filter((c) => (c.status || "") === "Resolved").length;
    const rejected = scopedComplaints.filter((c) => (c.status || "") === "Rejected").length;
    return { total, pending, assigned, inProgress, resolved, rejected };
  }, [scopedComplaints]);

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="admin-shell">
        <div className="admin-top">
          <div>
            <h1>{admin.title}</h1>
            <p>Live AI Triage Dashboard</p>
          </div>

          <div className="admin-filters">
            <div className="language-toggle admin-language-toggle" role="group">
              <button
                type="button"
                className={language === "en" ? "language-toggle-btn active" : "language-toggle-btn"}
                onClick={() => setLanguage("en")}
              >
                {common.english}
              </button>
              <button
                type="button"
                className={language === "ta" ? "language-toggle-btn active" : "language-toggle-btn"}
                onClick={() => setLanguage("ta")}
              >
                {common.tamil}
              </button>
            </div>

            <div className="admin-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={admin.searchPlaceholder}
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">{admin.allStatuses}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{translateStatus(s)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat"><span>{admin.total}</span><strong>{stats.total}</strong></div>
          <div className="admin-stat"><span>{admin.pending}</span><strong>{stats.pending}</strong></div>
          <div className="admin-stat"><span>{admin.assigned}</span><strong>{stats.assigned}</strong></div>
          <div className="admin-stat"><span>{admin.inProgress}</span><strong>{stats.inProgress}</strong></div>
          <div className="admin-stat"><span>{admin.resolved}</span><strong>{stats.resolved}</strong></div>
          <div className="admin-stat"><span>{admin.rejected}</span><strong>{stats.rejected}</strong></div>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty">{admin.empty}</div>
        ) : (
          <div className="admin-list">
            {filtered.map((c) => (
              <motion.div
                key={c.trackingId || c.id}
                className="admin-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ borderLeft: `6px solid ${c.priority > 60 ? '#d9534f' : c.priority > 30 ? '#f0ad4e' : '#5cb85c'}` }}
              >
                <div className="admin-card-head">
                  <div>
                    <h3>{getLocalizedDepartmentLabel(c.department, language)}</h3>
                    <p>ID: {c.trackingId} • {c.name || "Anonymous"} • {c.phone || "-"}</p>
                    {c.location && c.location.coordinates && (
                      <p style={{ fontSize: '0.85em', color: '#0066cc' }}>
                        📍 GPS: {c.location.coordinates[1].toFixed(4)}, {c.location.coordinates[0].toFixed(4)}
                      </p>
                    )}
                  </div>
                  <span className="admin-status-pill">{translateStatus(c.status || "Pending")}</span>
                </div>

                <p className="admin-desc">{c.complaint || admin.noDescription}</p>

                {/* THE AI TRIAGE METRICS DASHBOARD */}
                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', margin: '15px 0', border: '1px solid #e9ecef' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#495057', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🤖 AI Priority Engine</span>
                    <span style={{ color: c.priority > 60 ? '#d9534f' : '#333' }}>
                      Score: {c.priority ? c.priority.toFixed(2) : "0.00"}
                    </span>
                  </h4>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.85em' }}>
                    <div style={{ padding: '6px 10px', background: '#e9ecef', borderRadius: '4px' }}>
                      <strong>Severity (DAR):</strong> {c.severity_score ? c.severity_score.toFixed(1) : "0"}
                    </div>
                    <div style={{ padding: '6px 10px', background: c.is_authentic ? '#dff0d8' : '#f2dede', borderRadius: '4px', color: c.is_authentic ? '#3c763d' : '#a94442' }}>
                      <strong>Handshake:</strong> {c.is_authentic ? "✅ Verified" : `❌ Penalty (x${c.auth_multiplier})`}
                    </div>
                    <div style={{ padding: '6px 10px', background: '#e9ecef', borderRadius: '4px' }}>
                      <strong>Cluster Penalty:</strong> +{c.duplicate_points || 0} pts
                    </div>
                    <div style={{ padding: '6px 10px', background: '#e9ecef', borderRadius: '4px' }}>
                      <strong>Time Escalation:</strong> +{c.time_points ? c.time_points.toFixed(2) : "0"} pts
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.8em', color: '#6c757d' }}>
                    <strong>AI Vision:</strong> {c.image_category || "GENERAL"} | <strong>AI NLP:</strong> {c.text_category || "GENERAL"}
                  </div>
                </div>

                <div className="admin-actions">
                  <label>
                    {admin.status}
                    <select
                      value={c.status || "Pending"}
                      onChange={(e) => updateComplaint(c.trackingId, { status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{translateStatus(s)}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    {admin.assignedOfficer}
                    <input
                      type="text"
                      value={c.assignedOfficer || ""}
                      placeholder={admin.officerPlaceholder}
                      onChange={(e) => updateComplaint(c.trackingId, { assignedOfficer: e.target.value })}
                    />
                  </label>
                </div>

                <label className="admin-note-wrap">
                  {admin.adminNote}
                  <textarea
                    rows={2}
                    value={c.adminNote || ""}
                    placeholder={admin.notePlaceholder}
                    onChange={(e) => updateComplaint(c.trackingId, { adminNote: e.target.value })}
                  />
                </label>

                {/* THE IMAGE BLOCK */}
                {c.image && (
                  <img
                    src={c.image}
                    alt={admin.evidenceAlt || "Citizen Evidence"}
                    className="admin-evidence"
                    style={{ objectFit: 'cover' }}
                  />
                )}

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminPanel;