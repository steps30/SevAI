import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, text } = useLanguage();
  const home = text.home;
  const common = text.common;

  return (
    <motion.div
      className="home2"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="home2-container">
        {/* Top Heading */}
        <div className="home2-hero-wrap">
          <div className="home2-hero">
            <div className="home2-hero-topline">
              <p className="home2-kicker">{home.kicker}</p>
            </div>

            <h1 className="home2-title">
              {home.titlePrefix} <span>{home.titleAccent}</span>
            </h1>

            <p className="home2-subtitle">
              {home.subtitle}
            </p>

            <div className="home2-actions">
              <button className="home2-btn primary" onClick={() => navigate("/complaint")}>
                {home.submitComplaint}
              </button>
              <button className="home2-btn secondary" onClick={() => navigate("/dashboard")}>
                {home.openDashboard}
              </button>
            </div>

          </div>

          <motion.div
            className="home2-hero-image"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <img src="/images/grievance-card.svg" alt={home.heroImageAlt} />
          </motion.div>
        </div>

        <motion.div
          className="home2-impact-strip"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <div className="impact-item">
            <span className="impact-value">{home.impactDigitalValue}</span>
            <span className="impact-label">{home.impactDigitalLabel}</span>
          </div>
          <div className="impact-item">
            <span className="impact-value">{home.impactLangValue}</span>
            <span className="impact-label">{home.impactLangLabel}</span>
          </div>
          <div className="impact-item">
            <span className="impact-value">{home.impactAiValue}</span>
            <span className="impact-label">{home.impactAiLabel}</span>
          </div>
          <div className="impact-item">
            <span className="impact-value">{home.impactLiveValue}</span>
            <span className="impact-label">{home.impactLiveLabel}</span>
          </div>
        </motion.div>

        <motion.div
          className="home2-process-wrap"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.42 }}
        >
          <motion.div
            className="home2-process"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <h3>{home.processTitle}</h3>
            <div className="process-line" />
            <div className="process-steps">
              <div className="step-item">
                <span className="step-index">01</span>
                <div>
                  <h4>{home.step1Title}</h4>
                  <p>{home.step1Text}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-index">02</span>
                <div>
                  <h4>{home.step2Title}</h4>
                  <p>{home.step2Text}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-index">03</span>
                <div>
                  <h4>{home.step3Title}</h4>
                  <p>{home.step3Text}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-index">04</span>
                <div>
                  <h4>{home.step4Title}</h4>
                  <p>{home.step4Text}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Track complaint quick-access card */}
          <motion.div
            className="home2-track-card"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.38, delay: 0.08 }}
          >
            <div className="track-card-icon" aria-hidden="true">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="38" height="38" rx="10" fill="rgba(111,124,255,0.14)" />
                <path d="M11 19h16M19 11l8 8-8 8" stroke="#6f7cff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>{home.trackCardTitle || "Track Your Complaint"}</h3>
            <p>{home.trackCardDesc || "Already filed a grievance? Enter your Complaint ID to get a real-time status update instantly."}</p>
            <div className="track-card-stats">
              <div className="track-stat">
                <span className="track-stat-value">{home.trackStat1Value || "Real-Time"}</span>
                <span className="track-stat-label">{home.trackStat1Label || "Status Updates"}</span>
              </div>
              <div className="track-stat">
                <span className="track-stat-value">{home.trackStat2Value || "End-to-End"}</span>
                <span className="track-stat-label">{home.trackStat2Label || "Visibility"}</span>
              </div>
            </div>
            <button
              type="button"
              className="track-card-btn"
              onClick={() => navigate("/track")}
            >
              <span>{home.trackBtn || "Track Complaint"}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="track-card-faq">
              <div className="track-faq-item">
                <span className="track-faq-dot" />
                <p>{home.trackFaq1 || "Your Complaint ID is emailed to you when you submit a grievance."}</p>
              </div>
              <div className="track-faq-item">
                <span className="track-faq-dot" />
                <p>{home.trackFaq2 || "Status updates from Pending to In Progress to Resolved are shown in real time."}</p>
              </div>
              <div className="track-faq-item">
                <span className="track-faq-dot" />
                <p>{home.trackFaq3 || "Admin remarks and department actions are visible at every stage of your complaint."}</p>
              </div>
            </div>
          </motion.div>

        </motion.div>

        <motion.footer
          className="home2-footer"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
        >
          <div className="home2-footer-grid">
            <div className="home2-footer-col brand">
              <h4>{home.footerBrandTitle}</h4>
              <p>
                {home.footerBrandText}
              </p>
              <span className="footer-chip">{home.footerChip}</span>
            </div>

            <div className="home2-footer-col">
              <h5>{home.quickAccess}</h5>
              <div className="home2-footer-links">
                <button type="button" onClick={() => navigate("/")}>{text.navbar.home}</button>
                <button type="button" onClick={() => navigate("/complaint")}>{home.submit}</button>
                <button type="button" onClick={() => navigate("/track")}>{home.track}</button>
                <button type="button" onClick={() => navigate("/dashboard")}>{text.navbar.dashboard}</button>
              </div>
            </div>

            <div className="home2-footer-col support">
              <h5>{home.support}</h5>
              <p>{home.helpDesk}</p>
              <p>{home.email}</p>
              <p>{home.hours}</p>
            </div>
          </div>

          <div className="home2-footer-bottom">
            <span>{home.copyright}</span>
            <span>{home.footerTagline}</span>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}

export default Home;