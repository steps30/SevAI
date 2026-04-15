import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./TrackComplaint.css";

function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { language, text, translateStatus } = useLanguage();
  const track = text.track;

  // Step labels (breadcrumb)
  const steps = ["Registered", "Assigned", "In Progress", "Resolved"];

  // Map status -> step index
  const getStepIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("register")) return 0;
    if (s.includes("assign")) return 1;
    if (s.includes("progress")) return 2;
    if (s.includes("resolve")) return 3;
    return 0;
  };

  const findComplaintById = useCallback(async (id) => {
  try {
    const res = await fetch("http://127.0.0.1:5000/admin");
    const data = await res.json();

    return data.find(
      (item) =>
        String(item.trackingId || "").toLowerCase() === id.toLowerCase()
    );

  } catch (err) {
    console.error(err);
    return null;
  }
}, []);

  const buildResult = useCallback((found) => {
    const baseStatus = found.status || "Pending";
    const createdAt = new Date(found.created_at?.$date || found.created_at || Date.now());
    const lastUpdated = new Date(found.created_at?.$date || found.created_at || Date.now());
    const timeline = [
      { status: "Registered", time: createdAt },
      ...(baseStatus !== "Pending" ? [{ status: baseStatus, time: lastUpdated }] : []),
      ...(found.adminNote ? [{ status: "Admin Note", time: found.adminNote }] : []),
    ];

    return {
      id: found.trackingId,
      status: baseStatus,
      department: found.department || "General",
      updated: lastUpdated,
      image: found.image,
      assignedOfficer: found.assignedOfficer || "",
      adminNote: found.adminNote || "",
      timeline,
    };
  }, []);

  const handleTrack = async () => {
    const id = complaintId.trim();

    if (!id) {
      setError(track.enterIdError);
      setResult(null);
      return;
    }

    const found = await findComplaintById(id);

    if (!found) {
      setError(track.notFoundError);
      setResult(null);
      return;
    }

    setError("");
    setResult(buildResult(found));
  };

  
  return (
    <motion.div
      className="track-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="track-header">
        <h1>{track.title}</h1>
        <p>{track.subtitle}</p>
      </div>

      <div className="track-search">
        <div className="track-search-input-wrap">
          <span className="track-search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            placeholder={track.enterId}
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleTrack}>{track.track}</button>
      </div>

      {error && <div className="track-error">{error}</div>}

      {result && (
        <motion.div
          className="track-modern"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="track-summary">
            <h2>{getLocalizedDepartmentLabel(result.department, language)} {track.complaintSuffix}</h2>
            <p className="muted">{track.complaintId}: {result.id}</p>
            <p className="muted">{track.lastUpdated}: {result.updated}</p>
            <span className="badge">{translateStatus(result.status)}</span>

            <div className="track-meta-grid">
              <div className="meta-card">
                <span className="meta-label">{track.complaintId}</span>
                <strong>{result.id}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">{track.department}</span>
                <strong>{getLocalizedDepartmentLabel(result.department, language)}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">{track.currentStatus}</span>
                <strong>{translateStatus(result.status)}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">{track.assignedOfficer}</span>
                <strong>{result.assignedOfficer || track.notAssigned}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">{track.adminNote}</span>
                <strong>{result.adminNote || track.noAdminNote}</strong>
              </div>
            </div>

            {result.image && (
              <div className="track-image">
                <img src={result.image} alt={track.evidenceAlt} />
              </div>
            )}
          </div>

          <div className="track-progress-panel">
            <div className="stepper">
              <div className="stepper-line" />
              <div
                className="stepper-progress"
                style={{
                  width: `${(getStepIndex(result.status) / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((label, index) => (
                <div
                  key={label}
                  className={index <= getStepIndex(result.status) ? "step done" : "step"}
                >
                  <div className="step-dot">{index + 1}</div>
                  <div className="step-label">{translateStatus(label)}</div>
                </div>
              ))}
            </div>

            <div className="timeline">
              <h3>{track.timeline}</h3>
              <ul>
                {result.timeline.map((item, index) => (
                  <li key={`${item.status}-${index}`}>
                    <span className="tl-status">{translateStatus(item.status)}</span>
                    <span className="tl-time">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default TrackComplaint;