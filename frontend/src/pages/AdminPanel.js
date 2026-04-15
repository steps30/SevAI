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

  useEffect(() => {
  fetch("http://127.0.0.1:5000/admin")
    .then(res => res.json())
    .then(data => setComplaints(data))
    .catch(err => console.error(err));
}, []);

  const updateComplaint = async (trackingId, changes) => {
  try {
    await fetch(`http://127.0.0.1:5000/update/${trackingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(changes)
    });

    // refresh data
    const res = await fetch("http://127.0.0.1:5000/admin");
    const data = await res.json();
    setComplaints(data);

  } catch (err) {
    console.error(err);
  }
};

  const scopedComplaints = useMemo(() => {
    if (!adminDepartment) {
      return complaints;
    }

    return complaints.filter((c) => c.department === adminDepartment);
  }, [complaints, adminDepartment]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return scopedComplaints.filter((c) => {
      const statusOk = statusFilter === "All" || (c.status || "Pending") === statusFilter;
      if (!statusOk) return false;

      if (!q) return true;

      const haystack = `${c.trackingId || ""} ${c.name || ""} ${c.phone || ""} ${c.department || ""} ${c.complaint || ""} ${c.status || ""} ${c.adminNote || ""}`.toLowerCase();
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
            <p>
              {admin.subtitle}
              {adminDepartment ? ` ${getLocalizedDepartmentLabel(adminDepartment, language)}.` : ""}
              {adminId ? ` (${admin.id}: ${adminId})` : ""}
            </p>
          </div>

          <div className="admin-filters">
            <div className="language-toggle admin-language-toggle" role="group" aria-label={common.language}>
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
                key={c.id}
                className="admin-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="admin-card-head">
                  <div>
                    <h3>{getLocalizedDepartmentLabel(c.department, language)}</h3>
                    <p>{admin.id}: {c.trackingId || c.id} • {c.name || "-"} • {c.phone || "-"}</p>
                  </div>
                  <span className="admin-status-pill">{translateStatus(c.status || "Pending")}</span>
                </div>

                <p className="admin-desc">{c.complaint || admin.noDescription}</p>

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
                    rows={3}
                    value={c.adminNote || ""}
                    placeholder={admin.notePlaceholder}
                    onChange={(e) => updateComplaint(c.trackingId, { adminNote: e.target.value })}
                  />
                </label>

                {c.image && (
                  <img src={c.image} alt={admin.evidenceAlt} className="admin-evidence" />
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
