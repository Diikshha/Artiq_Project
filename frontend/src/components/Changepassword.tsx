// src/components/ChangePassword.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [errorMsg, setErrorMsg]       = useState("");

  const [curErr, setCurErr]   = useState("");
  const [newErr, setNewErr]   = useState("");
  const [conErr, setConErr]   = useState("");

  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  useEffect(() => {
    if (successMsg || errorMsg) {
      const t = setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg]);

  function validate() {
    let ok = true;
    setCurErr(""); setNewErr(""); setConErr("");
    if (!currentPwd.trim()) { setCurErr("Current password is required."); ok = false; }
    if (!newPwd.trim()) { setNewErr("New password is required."); ok = false; }
    else if (!pwdRegex.test(newPwd)) {
      setNewErr("Min 8 chars with uppercase, lowercase, number & special character."); ok = false;
    }
    if (!confirmPwd.trim()) { setConErr("Please confirm your new password."); ok = false; }
    else if (newPwd !== confirmPwd) { setConErr("Passwords do not match."); ok = false; }
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const emailid = sessionStorage.getItem("userEmail");
    if (!emailid) { setErrorMsg("Session expired. Please log in again."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailid, currentPwd, newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Password changed successfully!");
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } else {
        setErrorMsg(data.message || "Failed to change password.");
      }
    } catch {
      setErrorMsg("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const EyeOpen = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOff = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Jost', sans-serif; background: #eddfcc; min-height: 100vh; }

        .cp-header {
          background: #2c1f10;
          padding: 0 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          border-bottom: 2px solid rgba(212,175,55,0.2);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .cp-header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .cp-header-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: #f5ede0;
          letter-spacing: 0.04em;
        }
        .cp-header-logo-text span { color: #d4af37; font-style: italic; }
        .cp-back-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1.2rem;
          background: transparent;
          border: 1.5px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          color: rgba(245,237,224,0.7);
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.22s;
        }
        .cp-back-btn:hover { border-color: rgba(212,175,55,0.6); color: #d4af37; background: rgba(212,175,55,0.08); }

        .cp-page {
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          background: #eddfcc;
        }
        .cp-card {
          background: #fff;
          border: 1.5px solid #e8d8c4;
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 480px;
          position: relative;
          overflow: hidden;
        }
        .cp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #d4af37, #8b5e2f);
        }
        .cp-card-eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #d4af37;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .cp-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 500;
          color: #2c1f10;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }
        .cp-card-title em { font-style: italic; color: #8b5e2f; }
        .cp-card-desc {
          font-size: 0.9rem;
          color: #7a6248;
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .cp-field { margin-bottom: 1.3rem; }
        .cp-label { display: block; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #5a4233; margin-bottom: 0.5rem; }
        .cp-field-wrap { position: relative; display: flex; align-items: center; }
        .cp-field-icon { position: absolute; left: 0.9rem; color: #8b7355; display: flex; align-items: center; pointer-events: none; }
        .cp-input {
          width: 100%; padding: 0.8rem 2.8rem 0.8rem 2.6rem;
          background: #faf6f0; border: 1.5px solid #e0d0bc; border-radius: 8px;
          font-family: 'Jost', sans-serif; font-size: 0.95rem; color: #2c1f10;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input:focus { border-color: #8b5e2f; box-shadow: 0 0 0 3px rgba(139,94,47,0.1); background: #fff; }
        .cp-input.err { border-color: #c0392b; }
        .cp-eye { position: absolute; right: 0.8rem; background: none; border: none; cursor: pointer; color: #8b7355; display: flex; align-items: center; padding: 0; }
        .cp-err { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; color: #c0392b; margin-top: 0.4rem; }

        .cp-alert { padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.92rem; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; }
        .cp-alert-success { background: rgba(39,174,96,0.15); border: 1px solid rgba(39,174,96,0.3); color: #1e8449; }
        .cp-alert-error   { background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.3); color: #c0392b; }

        .cp-submit {
          width: 100%; padding: 0.9rem;
          background: #2c1f10; color: #f5ede0; border: none; border-radius: 8px;
          font-family: 'Jost', sans-serif; font-size: 0.92rem; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
          transition: all 0.25s; position: relative; overflow: hidden; margin-top: 0.5rem;
        }
        .cp-submit::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#d4af37 0%,#b8952a 100%); opacity:0; transition:opacity 0.25s; }
        .cp-submit:hover::before { opacity: 1; }
        .cp-submit:hover { color: #2c1f10; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,175,55,0.3); }
        .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .cp-submit-inner { position: relative; z-index: 1; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { width:14px;height:14px;border:2px solid rgba(245,237,224,0.3);border-top-color:#f5ede0;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;margin-right:0.4rem;vertical-align:middle; }

        .cp-hint {
          background: #fdf3e0;
          border: 1px solid #e8d4a8;
          border-radius: 10px;
          padding: 1rem 1.2rem;
          margin-bottom: 1.5rem;
        }
        .cp-hint-title { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8b5e2f; margin-bottom: 0.5rem; }
        .cp-hint-list { list-style: none; }
        .cp-hint-list li { font-size: 0.82rem; color: #7a6248; font-weight: 300; line-height: 1.7; padding-left: 1rem; position: relative; }
        .cp-hint-list li::before { content: '·'; position: absolute; left: 0; color: #d4af37; font-size: 1.2rem; line-height: 1.2; }
      `}</style>

      <header className="cp-header">
        <div className="cp-header-logo" onClick={() => navigate("/")}>
          <span style={{fontSize:'1.3rem'}}>✂️</span>
          <span className="cp-header-logo-text"><span>Artiq</span></span>
        </div>
        <button className="cp-back-btn" onClick={() => navigate("/customer-dashboard")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Dashboard
        </button>
      </header>

      <div className="cp-page">
        <div className="cp-card">
          <p className="cp-card-eyebrow">Account Security</p>
          <h2 className="cp-card-title">Change <em>Password</em></h2>
          <p className="cp-card-desc">Update your login credentials to keep your Artiq account secure.</p>

          <div className="cp-hint">
            <p className="cp-hint-title">Password Requirements</p>
            <ul className="cp-hint-list">
              <li>At least 8 characters long</li>
              <li>One uppercase and one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character (!@#$…)</li>
            </ul>
          </div>

          {successMsg && <div className="cp-alert cp-alert-success">✓ {successMsg}</div>}
          {errorMsg   && <div className="cp-alert cp-alert-error">⚠ {errorMsg}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Current Password */}
            <div className="cp-field">
              <label className="cp-label">Current Password</label>
              <div className="cp-field-wrap">
                <span className="cp-field-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type={showCurrent ? "text" : "password"} className={`cp-input${curErr ? " err" : ""}`} placeholder="Enter current password" value={currentPwd} onChange={e => { setCurrentPwd(e.target.value); setCurErr(""); }} />
                <button type="button" className="cp-eye" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <EyeOff /> : <EyeOpen />}</button>
              </div>
              {curErr && <p className="cp-err"><span>●</span> {curErr}</p>}
            </div>

            {/* New Password */}
            <div className="cp-field">
              <label className="cp-label">New Password</label>
              <div className="cp-field-wrap">
                <span className="cp-field-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input type={showNew ? "text" : "password"} className={`cp-input${newErr ? " err" : ""}`} placeholder="Enter new password" value={newPwd} onChange={e => { setNewPwd(e.target.value); setNewErr(""); }} />
                <button type="button" className="cp-eye" onClick={() => setShowNew(!showNew)}>{showNew ? <EyeOff /> : <EyeOpen />}</button>
              </div>
              {newErr && <p className="cp-err"><span>●</span> {newErr}</p>}
            </div>

            {/* Confirm Password */}
            <div className="cp-field">
              <label className="cp-label">Confirm New Password</label>
              <div className="cp-field-wrap">
                <span className="cp-field-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <input type={showConfirm ? "text" : "password"} className={`cp-input${conErr ? " err" : ""}`} placeholder="Confirm new password" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setConErr(""); }} />
                <button type="button" className="cp-eye" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff /> : <EyeOpen />}</button>
              </div>
              {conErr && <p className="cp-err"><span>●</span> {conErr}</p>}
            </div>

            <button type="submit" className="cp-submit" disabled={loading}>
              <span className="cp-submit-inner">
                {loading ? <><span className="spin" />Updating…</> : "Update Password"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}