import { useState, useRef, useEffect } from "react";

export default function CustomerProfile() {
  // ── Search ──
  const [searchEmail, setSearchEmail]     = useState("");
  const [searchError, setSearchError]     = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Profile fields ──
  const [emailid, setEmailid]       = useState("");
  const [name, setName]             = useState("");
  const [address, setAddress]       = useState("");
  const [city, setCity]             = useState("");
  const [stateVal, setStateVal]     = useState("");
  const [gender, setGender]         = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // ── UI ──
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const [infoMsg, setInfoMsg]       = useState("");

  // ── Field errors ──
  const [nameErr, setNameErr]       = useState("");
  const [addressErr, setAddressErr] = useState("");
  const [cityErr, setCityErr]       = useState("");
  const [stateErr, setStateErr]     = useState("");
  const [genderErr, setGenderErr]   = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-dismiss messages after 3 seconds ──
  useEffect(() => {
    if (successMsg || errorMsg || infoMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
        setInfoMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg, infoMsg]);

  function clearMessages() {
    setSuccessMsg(""); setErrorMsg(""); setInfoMsg("");
  }

  function clearFieldErrors() {
    setNameErr(""); setAddressErr(""); setCityErr(""); setStateErr(""); setGenderErr("");
  }

  function resetProfileFields() {
    setName(""); setAddress(""); setCity(""); setStateVal("");
    setGender(""); setProfilePic(null);
    clearFieldErrors(); clearMessages();
    setIsExistingUser(false);
  }

  // ── Profile pic handler ──
  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ── Search ──
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    clearMessages(); clearFieldErrors();
    if (!searchEmail.trim()) { setSearchError("Enter an email to search."); return; }

    setSearchLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/custprofile/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailid: searchEmail }),
      });
      const data = await res.json();

      if (res.ok && data.profile) {
        setEmailid(data.profile.emailid || "");
        setName(data.profile.name || "");
        setAddress(data.profile.address || "");
        setCity(data.profile.city || "");
        setStateVal(data.profile.state || "");
        setGender(data.profile.gender || "");
        setProfilePic(data.profile.profilepic || null);
        setIsExistingUser(true);
        setSuccessMsg("Profile loaded — you can update the details below.");
      } else {
        resetProfileFields();
        setEmailid(searchEmail);
        setIsExistingUser(false);
        setInfoMsg("No profile found for this email. Fill in the details and save.");
      }
    } catch { setErrorMsg("Cannot connect to server. Please try again."); }
    finally   { setSearchLoading(false); }
  }

  // ── Validate ──
  function validate() {
    let ok = true;
    clearFieldErrors();
    if (!name.trim())    { setNameErr("Full name is required.");    ok = false; }
    if (!address.trim()) { setAddressErr("Address is required.");   ok = false; }
    if (!city.trim())    { setCityErr("City is required.");         ok = false; }
    if (!stateVal)       { setStateErr("Please select a state.");   ok = false; }
    if (!gender)         { setGenderErr("Please select a gender."); ok = false; }
    return ok;
  }

  // ── Save ──
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/custprofile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailid, name, address, city, state: stateVal, gender, profilepic: profilePic }),
      });
      const data = await res.json();
      if (res.ok) { 
        setSuccessMsg("Profile saved successfully! "); 
        setIsExistingUser(true); 
      }
      else setErrorMsg(data.message || "Failed to save profile.");
    } catch { setErrorMsg("Cannot connect to server."); }
    finally   { setLoading(false); }
  }

  // ── Update ──
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/custprofile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailid, name, address, city, state: stateVal, gender, profilepic: profilePic }),
      });
      const data = await res.json();
      if (res.ok) setSuccessMsg("Profile updated successfully! ");
      else        setErrorMsg(data.message || "Failed to update profile.");
    } catch { setErrorMsg("Cannot connect to server."); }
    finally   { setLoading(false); }
  }

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
    "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
    "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
    "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
    "Ladakh","Puducherry","Chandigarh",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Jost', sans-serif;
          background: #eddfcc;
          min-height: 100vh;
        }

        /* ══ PAGE ══ */
        .cp-page {
          min-height: 100vh;
          background: #eddfcc;
        }

        /* ══ HERO BANNER ══ */
        .cp-hero {
          position: relative;
          height: 460px;
          overflow: hidden;
          background:
            linear-gradient(160deg, rgba(20,12,5,0.78) 0%, rgba(44,31,16,0.55) 55%, rgba(20,12,5,0.82) 100%),
            url("https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80")
            center/cover no-repeat;
        }

        /* bottom fade into page bg */
        .cp-hero::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 80px;
          background: linear-gradient(to bottom, transparent, #eddfcc);
        }

        .cp-hero-content {
          position: relative; z-index: 2;
          height: 100%;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          text-align: center; padding: 2rem;
        }

        .cp-hero-tag {
          font-size: 1.2rem; letter-spacing: 0.24em; text-transform: uppercase;
          color: #d4af37; font-weight: 500; margin-bottom: 0.4rem;
          display: flex; align-items: center; gap: 0.6rem;
        }
        .cp-hero-tag::before, .cp-hero-tag::after {
          content: ''; width: 40px; height: 1px; background: rgba(212,175,55,0.5);
        }

        .cp-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 4.8rem);
          font-weight: 500; color: #f5ede0; line-height: 1.05;
        }
        .cp-hero-title em { font-style: italic; color: #d4af37; }

        .cp-hero-sub {
          margin-top: 0rem; font-size: 1.1rem;
          color: rgba(245,237,224,0.75); font-weight: 400; letter-spacing: 0.04em;
        }

        /* ══ PROFILE AVATAR — overlapping hero ══ */
        .cp-avatar-wrap {
          display: flex; justify-content: center;
          margin-top: -134px; /* pulls up over hero */
          position: relative; z-index: 10;
          margin-bottom: 0;
        }

        .cp-avatar-ring {
          width: 148px; height: 148px; border-radius: 50%;
          border: 4px solid #faf6f0;
          box-shadow: 0 8px 32px rgba(44,31,16,0.22);
          background: #f0e4d0;
          overflow: hidden; position: relative;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .cp-avatar-ring:hover { box-shadow: 0 8px 32px rgba(212,175,55,0.35); }

        .cp-avatar-ring img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .cp-avatar-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.3rem; color: #b89060;
        }
        .cp-avatar-placeholder span {
          font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase;
        }

        .cp-avatar-actions {
          display: flex; align-items: center; gap: 0.6rem;
          margin-top: 0.75rem; flex-direction: column;
        }

        .cp-avatar-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 500; color: #2c1f10;
          letter-spacing: 0.02em;
        }
        .cp-avatar-name em { font-style: italic; color: #8b5e2f; }

        .cp-avatar-btn-row { display: flex; gap: 0.5rem; }

        .btn-browse {
          padding: 0.35rem 1rem;
          border: 1.5px solid #d4af37; border-radius: 100px;
          background: none; font-family: 'Jost', sans-serif;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #8b5e2f; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-browse:hover { background: #d4af37; color: #2c1f10; }

        .btn-remove {
          padding: 0.35rem 1rem;
          border: 1.5px solid rgba(192,57,43,0.4); border-radius: 100px;
          background: none; font-family: 'Jost', sans-serif;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #c0392b; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-remove:hover { background: rgba(192,57,43,0.08); }

        /* ══ MAIN CARD ══ */
        .cp-card {
          background: #faf6f0;
          border-radius: 20px;
          max-width: 950px;
          margin: 1.6rem auto 3rem;
          box-shadow: 0 6px 36px rgba(44,31,16,0.1);
          overflow: hidden;
        }

        .cp-card-bar {
          height: 4px;
          background: linear-gradient(90deg, transparent 5%, #d4af37 30%, #d4af37 70%, transparent 95%);
        }

        .cp-card-body { padding: 2rem 2.5rem 2.5rem; }

        /* ══ SECTION HEADER ══ */
        .sec-head {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.2rem;
        }
        .sec-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.16));
          border: 1px solid rgba(212,175,55,0.45);
          display: flex; align-items: center; justify-content: center;
          color: #8b5e2f; flex-shrink: 0;
        }
        .sec-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 530; color: #2c1f10;
        }
        .sec-line { flex: 1; height: 1.5px; background: #e8d8c4; }

        /* ══ ALERTS — Toast Popups ══ */
        @keyframes slideInDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%,0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100px); opacity: 0; }
        }

        .alert {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          min-width: 340px;
          max-width: 500px;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 500;
          box-shadow: 0 8px 32px rgba(44,31,16,0.25);
          animation: slideInDown 0.4s cubic-bezier(0.34, 1.3, 0.64, 1);
        }
        .alert-ok   { 
          background: linear-gradient(135deg, rgba(39,174,96,0.95), rgba(39,174,96,0.98)); 
          border: 1px solid rgba(39,174,96,1); 
          color: #fff; 
        }
        .alert-err  { 
          background: linear-gradient(135deg, rgba(192,57,43,0.95), rgba(192,57,43,0.98)); 
          border: 1px solid rgba(192,57,43,1); 
          color: #fff; 
        }
        .alert-info { 
          background: linear-gradient(135deg, rgba(212,175,55,0.95), rgba(212,175,55,0.98)); 
          border: 1px solid rgba(212,175,55,1); 
          color: #2c1f10; 
        }

        /* ══ MODE BADGE ══ */
        .mode-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 1rem; border-radius: 100px; margin-bottom: 1.6rem;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .badge-new    { background: rgba(39,174,96,0.1); border: 1px solid rgba(39,174,96,0.28); color: #1e8449; }
        .badge-update { background: rgba(212,175,55,0.12); border: 1px solid rgba(212,175,55,0.35); color: #7a5510; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        /* ══ FIELDS ══ */
        .field { margin-bottom: 1.15rem; }

        .field label {
          display: block; font-size: 0.85rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #5a4233; margin-bottom: 0.28rem;
        }

        .input-wrap { position: relative; display: flex; align-items: center; }

        .fi {
          position: absolute; left: 0.85rem; color: #b89060;
          pointer-events: none; display: flex;
        }

        input, select {
          width: 100%; padding: 0.78rem 1rem 0.78rem 2.4rem;
          border: 1.5px solid #e0d0bc; border-radius: 10px;
          background: #fff; font-family: 'Jost', sans-serif;
          font-size: 0.92rem; color: #2c1f10; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        input::placeholder { color: #c0a880; font-weight: 300; }
        input:focus, select:focus {
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212,175,55,0.13);
        }
        input.ie, select.ie { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,0.08); }
        input:disabled { background: #f0e9df; color: #9a8070; cursor: not-allowed; }
        select { appearance: none; cursor: pointer; }
        .sa { position: absolute; right: 0.85rem; color: #b89060; pointer-events: none; font-size: 0.68rem; }

        .ferr {
          margin-top: 0.28rem; font-size: 0.74rem; color: #c0392b;
          display: flex; align-items: center; gap: 0.28rem;
        }

        /* ══ GRID LAYOUTS ══ */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .divider { height: 1.2px; background: #e8d8c4; margin: 1.8rem 0; }

        /* ══ SAVE / UPDATE BUTTONS ══ */
        .btn-row { display: flex; gap: 1rem; justify-content: center; padding-top: 0.5rem; }

        .btn-save {
          padding: 0.9rem 3rem;
          background: linear-gradient(135deg, #2c1f10, #4a2e14);
          color: #f5ede0; border: none; border-radius: 100px;
          font-family: 'Jost', sans-serif; font-size: 0.84rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          transition: all 0.25s; box-shadow: 0 4px 18px rgba(44,31,16,0.18);
        }
        .btn-save:hover {
          background: linear-gradient(135deg, #d4af37, #b8952a);
          color: #2c1f10; box-shadow: 0 6px 24px rgba(212,175,55,0.35);
          transform: translateY(-2px);
        }
        .btn-save:active { transform: translateY(0); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-update {
          padding: 0.9rem 3rem;
          background: #fff; color: #8b5e2f;
          border: 1.5px solid #d4af37; border-radius: 100px;
          font-family: 'Jost', sans-serif; font-size: 0.84rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          transition: all 0.25s;
        }
        .btn-update:hover {
          background: linear-gradient(135deg, #d4af37, #b8952a);
          color: #2c1f10; border-color: transparent;
          box-shadow: 0 6px 24px rgba(212,175,55,0.35);
          transform: translateY(-2px);
        }
        .btn-update:active { transform: translateY(0); }
        .btn-update:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 0.45rem; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(245,237,224,0.35); border-top-color: #f5ede0;
          border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .spinner-dark {
          width: 14px; height: 14px;
          border: 2px solid rgba(44,31,16,0.2); border-top-color: #2c1f10;
          border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* ══ SEARCH BUTTON ══ */
        .btn-search {
          padding: 0.78rem 1.5rem;
          background: linear-gradient(135deg, #d4af37, #b8952a);
          color: #2c1f10; border: none; border-radius: 10px;
          font-family: 'Jost', sans-serif; font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
          white-space: nowrap; flex-shrink: 0; margin-top: 1.52rem;
          transition: all 0.2s; box-shadow: 0 3px 12px rgba(212,175,55,0.3);
        }
        .btn-search:hover { background: linear-gradient(135deg, #2c1f10, #4a2e14); color: #f5ede0; }
        .btn-search:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ══ TAILOR TIPS CARD ══ */
        .tips-card {
          background: linear-gradient(135deg, #2c1f10 0%, #3d2710 100%);
          border-radius: 16px; padding: 1.5rem 1.8rem;
          margin-top: 1.8rem; position: relative; overflow: hidden;
        }
        .tips-card::before {
          content: '✂';
          position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%);
          font-size: 5rem; opacity: 0.07; color: #d4af37; pointer-events: none;
        }
        .tips-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 500; color: #d4af37;
          letter-spacing: 0.06em; margin-bottom: 0.8rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .tips-list { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
        .tips-list li {
          font-size: 0.8rem; color: rgba(245,237,224,0.7);
          font-weight: 300; display: flex; align-items: flex-start; gap: 0.5rem;
          line-height: 1.5;
        }
        .tips-list li::before { content: '—'; color: #d4af37; flex-shrink: 0; }

        /* ══ SEARCH ROW ══ */
        .search-row { display: flex; gap: 0.75rem; align-items: flex-start; }
        .search-row .field { flex: 1; margin-bottom: 0; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 640px) {
          .cp-card-body { padding: 1.5rem 1.2rem 2rem; }
          .grid-2 { grid-template-columns: 1fr; }
          .btn-row { flex-direction: column; }
          .btn-save, .btn-update { width: 100%; }
        }
      `}</style>

      <div className="cp-page">

        {/* ══ HERO BANNER ══ */}
        <div className="cp-hero">
          <div className="cp-hero-content">
            <p className="cp-hero-tag">Artiq Platform</p>
            <h1 className="cp-hero-title">
              Customer <em>Profile</em>
            </h1>
            <p className="cp-hero-sub">Manage your details</p>
          </div>
        </div>

        {/* ══ AVATAR — overlapping hero ══ */}
        <div className="cp-avatar-wrap">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
            <div className="cp-avatar-ring" onClick={() => fileInputRef.current?.click()}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                <div className="cp-avatar-placeholder">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Photo</span>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicChange} />

            <p className="cp-avatar-name">
              {name ? <>{name.split(" ")[0]} <em>{name.split(" ").slice(1).join(" ")}</em></> : <em style={{ color: "#b89060", fontFamily: "Cormorant Garamond, serif", fontSize: "1rem" }}>Your Name Here</em>}
            </p>

            <div className="cp-avatar-btn-row">
              <button className="btn-browse" onClick={() => fileInputRef.current?.click()}>
                Browse Photo
              </button>
              {profilePic && (
                <button className="btn-remove" onClick={() => setProfilePic(null)}>Remove</button>
              )}
            </div>
          </div>
        </div>

        {/* ══ MAIN CARD ══ */}
        <div className="cp-card">
          <div className="cp-card-bar" />
          <div className="cp-card-body">

            {/* ── SECTION: Search ── */}
            <div className="sec-head">
              <div className="sec-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <span className="sec-title">Find or Create Profile</span>
              <div className="sec-line" />
            </div>

            <form onSubmit={handleSearch}>
              <div className="search-row">
                <div className="field">
                  <label htmlFor="searchEmail">Email Address</label>
                  <div className="input-wrap">
                    <span className="fi">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      id="searchEmail" type="email"
                      className={searchError ? "ie" : ""}
                      placeholder="Enter customer email to search…"
                      value={searchEmail}
                      onChange={(e) => { setSearchEmail(e.target.value); setSearchError(""); }}
                    />
                  </div>
                  {searchError && <p className="ferr"><span>●</span> {searchError}</p>}
                </div>
                <button type="submit" className="btn-search" disabled={searchLoading}>
                  <span className="btn-inner">
                    {searchLoading ? <><span className="spinner-dark" /> Searching…</> : <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg> Search
                    </>}
                  </span>
                </button>
              </div>
            </form>

            {/* ── Alerts — now toast popups ── */}
            {successMsg && <div className="alert alert-ok"><span>✓</span> {successMsg}</div>}
            {errorMsg   && <div className="alert alert-err"><span>⚠</span> {errorMsg}</div>}
            {infoMsg    && <div className="alert alert-info"><span>ℹ</span> {infoMsg}</div>}

            {/* ── Mode badge ── */}
            <div style={{ marginTop: "1.5rem" }}>
              <span className={`mode-badge ${isExistingUser ? "badge-update" : "badge-new"}`}>
                <span className="badge-dot" />
                {isExistingUser ? "Update Existing Profile" : "New Profile — Fill & Save"}
              </span>
            </div>

            {/* ── SECTION: Personal Info ── */}
            <div className="sec-head">
              <div className="sec-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="sec-title">Personal Information</span>
              <div className="sec-line" />
            </div>

            <div className="grid-2">
              {/* Email (read-only) */}
              <div className="field">
                <label htmlFor="emailid">Email ID <span style={{ color: "#b89060", fontSize: "0.65rem", textTransform: "none", letterSpacing: 0 }}>(read-only)</span></label>
                <div className="input-wrap">
                  <span className="fi">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input id="emailid" type="email" value={emailid} disabled placeholder="Populated after search" />
                </div>
              </div>

              {/* Name */}
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrap">
                  <span className="fi">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="name" type="text" className={nameErr ? "ie" : ""}
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameErr(""); }}
                  />
                </div>
                {nameErr && <p className="ferr"><span>●</span> {nameErr}</p>}
              </div>
            </div>

            {/* Gender */}
            <div className="grid-2">
              <div className="field">
                <label htmlFor="gender">Gender</label>
                <div className="input-wrap">
                  <span className="fi">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/>
                      <line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
                    </svg>
                  </span>
                  <select id="gender" className={genderErr ? "ie" : ""} value={gender} onChange={(e) => { setGender(e.target.value); setGenderErr(""); }}>
                    <option value="">Select gender…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <span className="sa">▼</span>
                </div>
                {genderErr && <p className="ferr"><span>●</span> {genderErr}</p>}
              </div>
            </div>

            <div className="divider" />

            {/* ── SECTION: Address ── */}
            <div className="sec-head">
              <div className="sec-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span className="sec-title">Address Details</span>
              <div className="sec-line" />
            </div>

            {/* Street address */}
            <div className="field">
              <label htmlFor="address">Street Address</label>
              <div className="input-wrap">
                <span className="fi">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </span>
                <input
                  id="address" type="text" className={addressErr ? "ie" : ""}
                  placeholder="House no., street, area…"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setAddressErr(""); }}
                />
              </div>
              {addressErr && <p className="ferr"><span>●</span> {addressErr}</p>}
            </div>

            {/* City + State */}
            <div className="grid-2">
              <div className="field">
                <label htmlFor="city">City</label>
                <div className="input-wrap">
                  <span className="fi">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                    </svg>
                  </span>
                  <input
                    id="city" type="text" className={cityErr ? "ie" : ""}
                    placeholder="Your city"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setCityErr(""); }}
                  />
                </div>
                {cityErr && <p className="ferr"><span>●</span> {cityErr}</p>}
              </div>

              <div className="field">
                <label htmlFor="stateVal">State</label>
                <div className="input-wrap">
                  <span className="fi">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                  </span>
                  <select id="stateVal" className={stateErr ? "ie" : ""} value={stateVal} onChange={(e) => { setStateVal(e.target.value); setStateErr(""); }}>
                    <option value="">Select state…</option>
                    {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="sa">▼</span>
                </div>
                {stateErr && <p className="ferr"><span>●</span> {stateErr}</p>}
              </div>
            </div>

            <div className="divider" />

            {/* ══ SAVE / UPDATE BUTTONS ══ */}
            <div className="btn-row">
              {!isExistingUser ? (
                <button className="btn-save" onClick={handleSave} disabled={loading}>
                  <span className="btn-inner">
                    {loading ? <><span className="spinner" /> Saving…</> : <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Profile
                    </>}
                  </span>
                </button>
              ) : (
                <button className="btn-update" onClick={handleUpdate} disabled={loading}>
                  <span className="btn-inner">
                    {loading ? <><span className="spinner-dark" /> Updating…</> : <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Update Profile
                    </>}
                  </span>
                </button>
              )}
            </div>

            {/* ══ TAILOR TIPS CARD ══ */}
            <div className="tips-card">
              <p className="tips-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Profile Tips
              </p>
              <ul className="tips-list">
                <li>Keep your address accurate so tailors can deliver to the right location</li>
                <li>A clear profile photo helps your tailor identify you during fittings</li>
                <li>You can update your details at any time after saving</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}