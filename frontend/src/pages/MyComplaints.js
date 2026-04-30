import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./myComplaints.css";

function MyComplaints() {
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, translateStatus } = useLanguage();

  // We fallback to manual translation strings here so you don't have to edit translations.js again!
  const L = {
    title: language === "ta" ? "எனது புகார்கள்" : "My Complaints",
    subtitle: language === "ta" ? "நீங்கள் சமர்ப்பித்த புகார்களின் தனிப்பட்ட பதிவு." : "A private log of grievances you have submitted.",
    emptyTitle: language === "ta" ? "புகார்கள் எதுவும் கிடைக்கவில்லை" : "No complaints found",
    emptyText: language === "ta" ? "நீங்கள் இன்னும் எந்த புகாரையும் சமர்ப்பிக்கவில்லை." : "You haven't submitted any complaints yet.",
    id: language === "ta" ? "ID" : "ID",
    department: language === "ta" ? "துறை" : "Department",
    description: language === "ta" ? "விவரம்" : "Description",
    reportedOn: language === "ta" ? "பதியப்பட்ட தேதி:" : "Reported on:"
  };

  useEffect(() => {
    // 1. Get the current logged-in citizen's email
    const currentUserEmail = localStorage.getItem("currentUserEmail") || "";

    fetch("http://127.0.0.1:5001/admin")
      .then(res => res.json())
      .then(data => {
        // 2. THE PRIVACY FIX: Strictly filter out everyone else's tickets!
        const myData = data.filter(
          (c) => c.email && c.email.toLowerCase() === currentUserEmail.toLowerCase()
        );

        // Sort by newest first
        const sortedData = myData.sort((a, b) => {
          const dateA = new Date(a.created_at?.$date || a.created_at || 0);
          const dateB = new Date(b.created_at?.$date || b.created_at || 0);
          return dateB - dateA;
        });

        setMyComplaints(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch my complaints:", err);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="my-complaints-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="my-complaints-shell">
        <div className="my-complaints-header">
          <h1>{L.title}</h1>
          <p>{L.subtitle}</p>
        </div>

        {loading ? (
          <div className="my-complaints-loading">
            <span className="spinner" />
          </div>
        ) : myComplaints.length === 0 ? (
          <div className="my-complaints-empty">
            <h3>{L.emptyTitle}</h3>
            <p>{L.emptyText}</p>
          </div>
        ) : (
          <div className="my-complaints-list">
            {myComplaints.map((c) => {
              const dateString = c.created_at ? new Date(c.created_at.$date || c.created_at).toLocaleDateString() : "Unknown Date";

              return (
                <motion.div
                  className="my-card"
                  key={c.trackingId || c._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="my-card-top">
                    <span className="my-card-status">{translateStatus(c.status || "Pending")}</span>
                    <span className="my-card-date">{L.reportedOn} {dateString}</span>
                  </div>

                  <h3 className="my-card-dept">{getLocalizedDepartmentLabel(c.department, language)}</h3>
                  <p className="my-card-id"><strong>{L.id}:</strong> {c.trackingId}</p>

                  <div className="my-card-body">
                    <p><strong>{L.description}:</strong> {c.complaint}</p>
                  </div>

                  {c.image && (
                    <div className="my-card-image">
                      <img src={c.image} alt="Complaint Evidence" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MyComplaints;