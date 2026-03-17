import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import "./MyProfile.css";

function MyProfile({ setIsLoggedIn, setSelectedRole, selectedRole, currentUserEmail, currentUserName }) {
  const navigate = useNavigate();
  const { text } = useLanguage();
  const profileText = text.profile;
  const roleKey = selectedRole || "user";
  const identityEmail = currentUserEmail || (roleKey === "admin" ? "admin@gmail.com" : "user@gmail.com");
  const identityName = currentUserName || (roleKey === "admin" ? profileText.defaultName : "User");
  const profileDetailsKey = `profileDetails:${roleKey}:${identityEmail}`;
  const profileImageKey = `profileImage:${roleKey}:${identityEmail}`;

  const [profileImage, setProfileImage] = useState(
    () => localStorage.getItem(profileImageKey) || ""
  );
  const [profile, setProfile] = useState(() => {
    const saved = JSON.parse(localStorage.getItem(profileDetailsKey) || "null");
    return {
      name: saved?.name || identityName,
      email: saved?.email || identityEmail,
      phone: saved?.phone || "",
      location: saved?.location || profileText.defaultLocation,
    };
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem(profileImageKey, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(profileDetailsKey, JSON.stringify(profile));
    localStorage.setItem("currentUserName", profile.name || identityName);
    localStorage.setItem("currentUserEmail", profile.email || identityEmail);
    alert(profileText.updatedSuccess);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedRole();
    localStorage.removeItem("isLoggedIn");
    navigate("/role-select");
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
            <div className="profile-avatar-wrap">
              {profileImage ? (
                <img src={profileImage} alt={profileText.profileAlt} className="profile-avatar" />
              ) : (
                <div className="profile-avatar profile-placeholder" aria-label={profileText.defaultProfileAvatar}>
                  <span className="profile-icon-symbol">👤</span>
                </div>
              )}
              <label className="avatar-edit" htmlFor="profile-image-input">✎</label>
              <input id="profile-image-input" type="file" onChange={handleImageUpload} />
            </div>

            <div>
              <h2>{profile.name || profileText.yourName}</h2>
              <p>{profile.email || profileText.emailPlaceholder}</p>
            </div>
          </div>

          <button
            type="button"
            className="profile-close"
            onClick={() => navigate("/")}
            aria-label={profileText.closeProfile}
          >
            ×
          </button>
        </div>

        <div className="profile-form-modern">
          <div className="profile-line">
            <span>{profileText.name}</span>
            <input
              type="text"
              name="name"
              className="profile-input"
              value={profile.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder={profileText.yourNamePlaceholder}
              autoComplete="off"
            />
          </div>

          <div className="profile-line">
            <span>{profileText.emailAccount}</span>
            <input
              type="email"
              name="email"
              className="profile-input"
              value={profile.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder={profileText.emailPlaceholder}
              autoComplete="off"
            />
          </div>

          <div className="profile-line">
            <span>{profileText.mobileNumber}</span>
            <input
              type="tel"
              name="phone"
              className="profile-input"
              value={profile.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder={profileText.mobilePlaceholder}
              autoComplete="off"
            />
          </div>

          <div className="profile-line">
            <span>{profileText.location}</span>
            <input
              type="text"
              name="location"
              className="profile-input"
              value={profile.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder={profileText.locationPlaceholder}
              autoComplete="off"
            />
          </div>
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