import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Sanscript from "sanscript";
import exifr from "exifr";
import { useLanguage } from "../context/LanguageContext";
import { departmentOptions } from "../i18n/departments";
import { buildPhotoGeoMapUrl, getPhotoGeoSourceLabel } from "../utils/photoGeo";
import "./complaint.css";

const tamilConsonants = [
  "க","ங","ச","ஞ","ட","ண","த","ந","ப","ம","ய","ர","ல","வ","ழ","ள","ற","ன",
  "ஜ","ஶ","ஷ","ஸ","ஹ","க்ஷ",
];
const tamilSpecialLetters = ["ஃ", "ஸ்ரீ"];
// index 0 = pure consonant (no sign), indices 1-12 = vowel signs
const tamilVowelSigns = ["","ா","ி","ீ","ு","ூ","ெ","ே","ை","ொ","ோ","ௌ","்"];
const vowelColHeaders = ["அ","ஆ","இ","ஈ","உ","ஊ","எ","ஏ","ஐ","ஒ","ஓ","ஔ","க்"];

function Complaint() {
  const { language, setLanguage, text } = useLanguage();
  const lang = language;
  const L = text.complaint;
  const common = text.common;

  // --- Form state ---
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    area: "",
    pin: "",
    filledBy: "",
    filledByOther: "",
    complaint: "",
    department: "",
    image: "",
    photoGeo: null,
  });
  const photoGeoMapUrl = buildPhotoGeoMapUrl(formData.photoGeo);

  // --- Image capture/choose ---
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const requestGeoLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          capturedAt: new Date().toISOString(),
          source: "device-geolocation",
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  const getGeoFromExif = async (file) => {
    try {
      const gps = await exifr.gps(file);
      if (!gps || typeof gps.latitude !== "number" || typeof gps.longitude !== "number") {
        return null;
      }

      return {
        latitude: Number(gps.latitude.toFixed(6)),
        longitude: Number(gps.longitude.toFixed(6)),
        accuracy: null,
        capturedAt: new Date().toISOString(),
        source: "photo-exif",
      };
    } catch {
      return null;
    }
  };

  const reverseGeocodeLocation = async (location) => {
    if (!location?.latitude || !location?.longitude) {
      return null;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": lang === "ta" ? "ta,en" : "en,ta",
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const address = data?.address || {};

      const street = [address.house_number, address.road || address.pedestrian || address.residential || address.footway]
        .filter(Boolean)
        .join(" ")
        .trim();

      const area =
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        address.village ||
        address.town ||
        address.city ||
        address.county ||
        "";

      const rawPin = String(address.postcode || "").replace(/\D/g, "").slice(0, 6);
      const pin = rawPin.length === 6 ? rawPin : "";

      return { street, area, pin };
    } catch {
      return null;
    }
  };

  const autoFillAddressFromLocation = async (location) => {
    const resolved = await reverseGeocodeLocation(location);
    if (!resolved) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      street: prev.street || resolved.street,
      area: prev.area || resolved.area,
      pin: prev.pin || resolved.pin,
    }));
  };

  const handleCameraCapture = async () => {
    const location = await requestGeoLocation();

    setFormData((prev) => ({
      ...prev,
      photoGeo: location,
    }));

    if (!location) {
      alert(L.geoFailed);
    }

    cameraInputRef.current?.click();
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const exifLocation = await getGeoFromExif(file);
    const browserLocation = exifLocation ? null : (formData.photoGeo || await requestGeoLocation());
    const location = exifLocation || browserLocation;

    if (location) {
      void autoFillAddressFromLocation(location);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
        photoGeo: location,
      }));
    };
    reader.readAsDataURL(file);
  };

  // --- Voice input (Speech-to-Text) ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const voiceBaseTextRef = useRef("");
  const voiceCommittedTextRef = useRef("");

  // --- Tamil virtual keyboard ---
  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const activeInputRef = useRef(null);

  useEffect(() => {
    // Setup SpeechRecognition once
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return; // browser not supported

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === "ta" ? "ta-IN" : "en-IN";

    recognition.onresult = (event) => {
      let committedDelta = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) committedDelta += transcript + " ";
        else interimText += transcript + " ";
      }

      if (committedDelta) {
        voiceCommittedTextRef.current += committedDelta;
      }

      const merged = `${voiceBaseTextRef.current} ${voiceCommittedTextRef.current} ${interimText}`
        .replace(/\s+/g, " ")
        .trim();

      setFormData((prev) => ({
        ...prev,
        complaint: merged,
      }));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // update language when toggled
    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [lang]);

  const startVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert(L.voiceUnsupported);
      return;
    }

    // Keep a stable base so interim/final updates don't duplicate previously typed text.
    voiceBaseTextRef.current = formData.complaint || "";
    voiceCommittedTextRef.current = "";

    try {
      rec.lang = lang === "ta" ? "ta-IN" : "en-IN";
      setIsListening(true);
      rec.start();
    } catch (e) {
      // start can throw if already started
      setIsListening(true);
    }
  };

  const stopVoice = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {}
    setIsListening(false);
  };

  // --- Tamil keyboard handlers ---
  const handleFieldFocus = (e) => {
    activeInputRef.current = e.target;
  };

  const handleTamilKey = (char) => {
    const el = activeInputRef.current;
    if (!el) return;
    const fieldName = el.name;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const current = formData[fieldName] ?? "";
    const newValue = current.substring(0, start) + char + current.substring(end);
    setFormData((prev) => ({ ...prev, [fieldName]: newValue }));
    requestAnimationFrame(() => {
      el.focus();
      const newPos = start + char.length;
      el.setSelectionRange(newPos, newPos);
    });
  };

  const handleTamilBackspace = () => {
    const el = activeInputRef.current;
    if (!el) return;
    const fieldName = el.name;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const current = formData[fieldName] ?? "";
    let newValue, newPos;
    if (start !== end) {
      newValue = current.substring(0, start) + current.substring(end);
      newPos = start;
    } else if (start > 0) {
      newValue = current.substring(0, start - 1) + current.substring(start);
      newPos = start - 1;
    } else {
      return;
    }
    setFormData((prev) => ({ ...prev, [fieldName]: newValue }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  };

  // --- Generic change handler ---
  const transliterateTamil = (value) => {
    if (!value) return value;

    if (/[\u0B80-\u0BFF]/.test(value)) {
      return value;
    }

    try {
      return Sanscript.t(value, "itrans", "tamil");
    } catch {
      return value;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const tamilEnabledFields = ["name", "street", "area", "complaint", "filledByOther"];

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: digits,
      }));
      return;
    }

    if (name === "pin") {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: digits,
      }));
      return;
    }

    const nextValue =
      lang === "ta" && tamilEnabledFields.includes(name)
        ? transliterateTamil(value)
        : value;

    if (name === "filledBy") {
      setFormData((prev) => ({
        ...prev,
        [name]: nextValue,
        filledByOther: nextValue === "others" ? prev.filledByOther : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const getDepartmentCode = (department) => {
    const raw = String(department || "").split("-")[0].trim();
    const normalized = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    return normalized || "GEN";
  };

  const buildUniqueTrackingId = (department, existingIds) => {
    const deptCode = getDepartmentCode(department);
    let trackingId = "";

    do {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const rand = Math.floor(1000 + Math.random() * 9000);
      trackingId = `${deptCode}-${yy}${mm}${dd}-${rand}`;
    } while (existingIds.has(trackingId));

    return trackingId;
  };

  // --- Submit ---
  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.complaint) {
      alert(L.required);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      alert(L.phoneInvalid);
      return;
    }

    if (formData.pin && !/^\d{6}$/.test(formData.pin)) {
      alert(L.pinInvalid);
      return;
    }

    if (formData.filledBy === "others" && !formData.filledByOther.trim()) {
      alert(L.filledByOtherRequired);
      return;
    }

    const wordCount = formData.complaint.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      alert(L.complaintWordInvalid);
      return;
    }

    const existing = JSON.parse(localStorage.getItem("complaints")) || [];
    const existingIds = new Set(existing.map((item) => item.trackingId));
    const trackingId = buildUniqueTrackingId(formData.department, existingIds);

    const newComplaint = {
      id: Date.now(),
      trackingId,
      ...formData,
      status: "Pending",
      date: new Date().toISOString(), // ISO for time-based escalation
    };

    existing.push(newComplaint);
    localStorage.setItem("complaints", JSON.stringify(existing));

    alert(`${L.submitted}\n${L.trackingId}: ${trackingId}`);

    setFormData({
      name: "",
      phone: "",
      email: "",
      street: "",
      area: "",
      pin: "",
      filledBy: "",
      filledByOther: "",
      complaint: "",
      department: "",
      image: "",
      photoGeo: null,
    });
  };

  return (
    <motion.div
      className="complaint-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="complaint-shell">
        {/* Header */}
        <div className="complaint-header">
          <div>
            <h2 className="complaint-title">{L.title}</h2>
            <p className="complaint-subtitle">{L.subtitle}</p>
          </div>

          <div className="complaint-visual">
            <img src="/images/complaint-intake.svg" alt={L.headerImageAlt} />
          </div>

          {/* Language toggle */}
          <div className="lang-toggle language-toggle" role="group" aria-label={common.language}>
            <button
              className={lang === "en" ? "lang-btn language-toggle-btn active" : "lang-btn language-toggle-btn"}
              onClick={() => { setLanguage("en"); setShowTamilKeyboard(false); }}
              type="button"
              title={common.toggleToEnglish}
            >
              {common.english}
            </button>
            <button
              className={lang === "ta" ? "lang-btn language-toggle-btn active" : "lang-btn language-toggle-btn"}
              onClick={() => setLanguage("ta")}
              type="button"
              title={common.toggleToTamil}
            >
              {common.tamil}
            </button>
          </div>
        </div>

        {/* Card */}
        <motion.div
          className="complaint-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {/* Grid fields */}
          <div className="form-grid">
            <div className="field">
              <label>{L.name} *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={handleFieldFocus}
                placeholder={L.name}
              />
            </div>

            <div className="field">
              <label>{L.phone} *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={L.phone}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
              />
            </div>

            <div className="field">
              <label>{L.email}</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={L.email}
              />
            </div>

            <div className="field">
              <label>{L.street}</label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                onFocus={handleFieldFocus}
                placeholder={L.street}
              />
            </div>

            <div className="field">
              <label>{L.area}</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                onFocus={handleFieldFocus}
                placeholder={L.area}
              />
            </div>

            <div className="field">
              <label>{L.pin}</label>
              <input
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                placeholder={L.pin}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
            </div>

            <div className="field">
              <label>{L.filledBy}</label>
              <select
                name="filledBy"
                value={formData.filledBy}
                onChange={handleChange}
              >
                <option value="">{L.selectFilledBy}</option>
                <option value="individual">{L.individual}</option>
                <option value="group">{L.group}</option>
                <option value="others">{L.others}</option>
              </select>
            </div>

            {formData.filledBy === "others" && (
              <div className="field">
                <label>{L.filledByOther}</label>
                <input
                  name="filledByOther"
                  value={formData.filledByOther}
                  onChange={handleChange}
                  onFocus={handleFieldFocus}
                  placeholder={L.filledByOtherPlaceholder}
                />
              </div>
            )}

            <div className="field">
              <label>{L.department}</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">{L.selectDept}</option>
                {departmentOptions.map((department) => (
                  <option key={department.value} value={department.value}>
                    {lang === "ta" ? department.ta : department.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complaint + Voice */}
          <div className="field full">
            <div className="field-row">
              <label>{L.complaint} *</label>

              <div className="voice-actions">
                {!isListening ? (
                  <button className="ghost" type="button" onClick={startVoice}>
                    🎙️ {L.voiceBtn}
                  </button>
                ) : (
                  <button className="danger" type="button" onClick={stopVoice}>
                    ⏹ {L.stopVoiceBtn}
                  </button>
                )}
              </div>
            </div>

            <textarea
              name="complaint"
              value={formData.complaint}
              onChange={handleChange}
              onFocus={handleFieldFocus}
              rows={5}
              placeholder={L.complaint}
            />

            {lang === "ta" && (
              <div className="typing-hint">{L.typingHint}</div>
            )}

            {isListening && <div className="listening">{L.listening}</div>}
          </div>

          {/* Tamil Virtual Keyboard */}
          {lang === "ta" && (
            <div className="tamil-keyboard-section">
              {!showTamilKeyboard && (
                <button
                  type="button"
                  className="tamil-kb-open-btn"
                  onClick={() => setShowTamilKeyboard(true)}
                >
                  <span className="tamil-kb-open-icon">⌨</span>
                  <span>{L.openTamilKeyboard}</span>
                </button>
              )}

              {showTamilKeyboard && (
                <div className="tamil-keyboard">
                  {/* Header bar */}
                  <div className="tamil-kb-header">
                    <span className="tamil-kb-header-icon">⌨</span>
                    <div className="tamil-kb-header-text">
                      <span className="tamil-kb-header-title">{L.tamilKeyboard}</span>
                      <span className="tamil-kb-header-sub">{L.tamilKeyboardSub}</span>
                    </div>
                    <div className="tamil-kb-header-right">
                      <div className={`tamil-kb-active-badge${activeInputRef.current ? " has-field" : ""}`}>
                        {activeInputRef.current
                          ? `✏️ ${activeInputRef.current.name}`
                          : `⬆ ${L.activeFieldPrompt}`}
                      </div>
                      <button
                        type="button"
                        className="tamil-kb-close"
                        onClick={() => setShowTamilKeyboard(false)}
                        aria-label={L.tamilKeyboard}
                      >✕</button>
                    </div>
                  </div>

                  {/* ── Combined letters grid ── */}
                  <div className="tamil-kb-section">
                    <div className="tamil-kb-badge">{L.combinedLetters}</div>
                    <div className="tamil-kb-grid-scroll">
                      <table className="tamil-kb-grid">
                        <thead>
                          <tr>
                            <th className="tamil-kb-th-empty"></th>
                            {vowelColHeaders.map((h) => (
                              <th key={h} className="tamil-kb-th">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tamilConsonants.map((con) => (
                            <tr key={con}>
                              <td className="tamil-kb-row-label">{con}</td>
                              {tamilVowelSigns.map((sign, si) => {
                                const char = con + sign;
                                return (
                                  <td key={si} className="tamil-kb-td">
                                    <button
                                      type="button"
                                      className="tamil-key"
                                      onMouseDown={(e) => { e.preventDefault(); handleTamilKey(char); }}
                                    >{char}</button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Special letters ── */}
                  <div className="tamil-kb-section tamil-kb-section-extra">
                    <div className="tamil-kb-badge">{L.specialLetters}</div>
                    <div className="tamil-kb-extra-row">
                      {tamilSpecialLetters.map((char) => (
                        <button
                          key={char}
                          type="button"
                          className="tamil-key tamil-extra-key"
                          onMouseDown={(e) => { e.preventDefault(); handleTamilKey(char); }}
                        >{char}</button>
                      ))}
                    </div>
                  </div>

                  {/* ── Controls ── */}
                  <div className="tamil-kb-controls">
                    <button type="button" className="tamil-ctrl-key tamil-ctrl-space"
                      onMouseDown={(e) => { e.preventDefault(); handleTamilKey(" "); }}>
                      ␣ &nbsp; {L.space}
                    </button>
                    <button type="button" className="tamil-ctrl-key tamil-ctrl-backspace"
                      onMouseDown={(e) => { e.preventDefault(); handleTamilBackspace(); }}>
                      ⌫ &nbsp; {L.backspace}
                    </button>
                    <button type="button" className="tamil-ctrl-key tamil-ctrl-enter"
                      onMouseDown={(e) => { e.preventDefault(); handleTamilKey("\n"); }}>
                      ↵ &nbsp; {L.enter}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image upload (Camera + File) */}
          <div className="upload-box">
            <div className="upload-title">{L.uploadTitle}</div>

            <div className="upload-actions">
              <button
                type="button"
                className="primary"
                onClick={handleCameraCapture}
              >
                📷 {L.cameraBtn}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                🖼️ {L.fileBtn}
              </button>

              {/* Hidden inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImagePick}
                style={{ display: "none" }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                style={{ display: "none" }}
              />
            </div>

            {formData.image && (
              <div className="preview">
                <div className="preview-label">{L.preview}</div>
                <img src={formData.image} alt={L.evidenceAlt} />
                {formData.photoGeo && (
                  <div className="geo-card">
                    <p className="geo-label">
                      {L.geoCaptured} {formData.photoGeo.latitude}, {formData.photoGeo.longitude}
                    </p>
                    <p className="geo-label">{L.geoSaved}</p>
                    <div className="geo-meta-grid">
                      <span><strong>{common.source}:</strong> {getPhotoGeoSourceLabel(formData.photoGeo.source, common)}</span>
                      <span><strong>{common.capturedAt}:</strong> {formData.photoGeo.capturedAt ? new Date(formData.photoGeo.capturedAt).toLocaleString() : common.notAvailable}</span>
                      <span><strong>{common.accuracy}:</strong> {formData.photoGeo.accuracy != null ? `${formData.photoGeo.accuracy} m` : common.notAvailable}</span>
                    </div>
                    {photoGeoMapUrl && (
                      <a className="geo-map-link" href={photoGeoMapUrl} target="_blank" rel="noreferrer">
                        {common.openMap}
                      </a>
                    )}
                  </div>
                )}
                {!formData.photoGeo && (
                  <p className="geo-label">{L.geoTips}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button className="submit" type="button" onClick={handleSubmit}>
            {L.submit}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Complaint;