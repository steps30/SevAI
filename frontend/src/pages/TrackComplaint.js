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

  const findComplaintById = useCallback((id) => {
    const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    return complaints.find(
      (item) =>
        String(item.trackingId || "").toLowerCase() === id.toLowerCase() ||
        String(item.id || "") === id
    );
  }, []);

  const buildResult = useCallback((found) => {
    const baseStatus = found.status || "Pending";
    const createdAt = new Date(found.date || Date.now()).toLocaleString();
    const lastUpdated = new Date(found.updatedAt || found.date || Date.now()).toLocaleString();

    const timeline = [
      { status: "Registered", time: createdAt },
      ...(baseStatus !== "Pending" ? [{ status: baseStatus, time: lastUpdated }] : []),
      ...(found.adminNote ? [{ status: "Admin Note", time: found.adminNote }] : []),
    ];

    return {
      id: found.trackingId || found.id,
      status: baseStatus,
      department: found.department || "General",
      updated: lastUpdated,
      image: found.image,
      assignedOfficer: found.assignedOfficer || "",
      adminNote: found.adminNote || "",
      timeline,
    };
  }, []);

  const handleTrack = () => {
    const id = complaintId.trim();

    if (!id) {
      setError(track.enterIdError);
      setResult(null);
      return;
    }

    const found = findComplaintById(id);

    if (!found) {
      setError(track.notFoundError);
      setResult(null);
      return;
    }

    setError("");
    setResult(buildResult(found));
  };

  useEffect(() => {
    if (!result?.id) return;

    const refreshCurrent = () => {
      const found = findComplaintById(String(result.id));
      if (found) {
        setResult(buildResult(found));
      }
    };

    const handleStorage = (e) => {
      if (!e.key || e.key === "complaints") refreshCurrent();
    };

    const handleComplaintsUpdated = () => {
      refreshCurrent();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshCurrent);
    window.addEventListener("complaints-updated", handleComplaintsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshCurrent);
      window.removeEventListener("complaints-updated", handleComplaintsUpdated);
    };
  }, [buildResult, findComplaintById, result?.id]);

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