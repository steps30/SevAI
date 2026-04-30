import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { getLocalizedDepartmentLabel } from "../i18n/departments";
import "./MyProfile.css";

function MyProfile({ setIsLoggedIn, setSelectedRole, selectedRole, currentUserEmail, currentUserName }) {
  const navigate = useNavigate();
  const { language, text } = useLanguage();
  const profileText = text.profile;

  const isAdmin = selectedRole === "admin";
  const identityEmail = currentUserEmail || (isAdmin ? "admin@sevai.in" : "user@gmail.com");
  const identityName = currentUserName || (isAdmin ? profileText.defaultName : "Citizen");

  // Pull Admin's specific department if they are logged in
  const adminDepartment = localStorage.getItem("adminDepartment") || "";

  const [profile, setProfile] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(`profileDetails:${selectedRole}`) || "null");
    return {
      name: saved?.name || identityName,
      phone: saved?.phone || "",
      location: saved?.location || profileText.defaultLocation,
    };
  });

  const handleFieldChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save only editable fields
    localStorage.setItem(`profileDetails:${selectedRole}`, JSON.stringify(profile));

    // Update the global display name if they are a citizen
    if (!isAdmin) {
      localStorage.setItem("currentUserName", profile.name);
    }
    alert(profileText.updatedSuccess);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedRole();
    localStorage.clear(); // Clean slate on logout
    navigate("/role-select");
  };

  // Safely route the Close button back to the correct dashboard
  const handleClose = () => {
    navigate(isAdmin ? "/admin" : "/");
  };

  return (
    <div className="profile-main">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="profile-head-modern">
          <div className="profile-head-user">

            {/* Dynamic Role-Based Avatar (No File Uploads needed!) */}
            <div className={`profile-avatar-static ${isAdmin ? "admin-avatar" : "user-avatar"}`} aria-hidden="true">
              <span className="profile-icon-symbol">{isAdmin ? "🛡️" : "👤"}</span>
            </div>

            <div>
              <h2>{isAdmin ? identityName : profile.name}</h2>
              <p className="role-badge">{isAdmin ? "Official Account" : "Citizen Account"}</p>
            </div>
          </div>

          <button
            type="button"
            className="profile-close"
            onClick={handleClose}
            aria-label={profileText.closeProfile}
          >
            ×
          </button>
        </div>

        <div className="profile-form-modern">
          <div className="profile-line">
            <span>{profileText.emailAccount}</span>
            <input
              type="email"
              value={identityEmail}
              disabled // Always locked. Email is the primary identity token.
              className="profile-input locked"
            />
          </div>

          <div className="profile-line">
            <span>{profileText.name}</span>
            <input
              type="text"
              value={isAdmin ? identityName : profile.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder={profileText.yourNamePlaceholder}
              disabled={isAdmin} // Admins cannot change their official ID
              className={`profile-input ${isAdmin ? "locked" : ""}`}
            />
          </div>

          <div className="profile-line">
            <span>{profileText.mobileNumber}</span>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder={profileText.mobilePlaceholder}
              className="profile-input"
            />
          </div>

          {/* Dynamic Bottom Field based on Role */}
          {isAdmin ? (
            <div className="profile-line">
              <span>Assigned Department</span>
              <input
                type="text"
                value={adminDepartment ? getLocalizedDepartmentLabel(adminDepartment, language) : "Super Admin"}
                disabled
                className="profile-input locked"
              />
            </div>
          ) : (
            <div className="profile-line">
              <span>{profileText.location}</span>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder={profileText.locationPlaceholder}
                className="profile-input"
              />
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button type="button" className="profile-save-btn" onClick={handleSave}>
            {profileText.saveChanges}
          </button>
          <button type="button" className="profile-logout-btn" onClick={handleLogout}>
            {profileText.logout}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default MyProfile;