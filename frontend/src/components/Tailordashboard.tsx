// src/components/TailorDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TailorProfile from "./TailorProfile";

type Tab = "overview" | "profile";

interface TProfile {
  name?: string; city?: string; spl?: string; worktype?: string;
  since?: string; profilepic?: string | null; contact?: string;
  category?: string; social?: string;
}

export default function TailorDashboard() {
  const navigate = useNavigate();
  const email    = sessionStorage.getItem("userEmail") || "";
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profile, setProfile]     = useState<TProfile>({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/user/tailorprofile/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailid: email }),
    })
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(d.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const displayName       = profile.name || email.split("@")[0] || "Artisan";
  const expYears          = profile.since ? new Date().getFullYear() - parseInt(profile.since) : null;
  const isProfileComplete = !!(profile.name && profile.contact && profile.city);

  function handleLogout() {
    sessionStorage.clear();
    navigate("/login");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink2:  #2c1f10;
          --cream: #faf6f0;
          --sand:  #eddfcc;
          --gold:  #d4af37;
          --brown: #8b5e2f;
          --muted: #7a6248;
        }

        .tdb {
          font-family: 'Jost', sans-serif;
          min-height: 100vh;
          background: var(--sand);
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .tdb-hdr {
          background: var(--ink2);
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 2px solid rgba(212,175,55,0.18);
        }
        .tdb-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--cream);
          letter-spacing: 0.04em;
          cursor: pointer;
        }
        .tdb-logo span { color: var(--gold); font-style: italic; }

        .tdb-logout {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.48rem 1.1rem;
          background: transparent;
          border: 1.5px solid rgba(212,175,55,0.25);
          border-radius: 6px;
          color: rgba(245,237,224,0.65);
          font-family: 'Jost', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tdb-logout:hover {
          border-color: rgba(220,60,50,0.5);
          color: #e55;
          background: rgba(220,60,50,0.07);
        }

        /* ── TABS ── */
        .tdb-tabs {
          background: var(--ink2);
          display: flex;
          padding: 0 2.5rem;
          border-bottom: 1px solid rgba(212,175,55,0.12);
        }
        .tdb-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.85rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(245,237,224,0.4);
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.22s;
          margin-bottom: -1px;
        }
        .tdb-tab:hover  { color: rgba(245,237,224,0.7); }
        .tdb-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

        /* ── BANNER ── */
        .tdb-banner {
          background:
            linear-gradient(rgba(20,15,10,0.62), rgba(20,15,10,0.62)),
            url('https://i.pinimg.com/736x/60/77/2e/60772e83c368dd66a1d6571375d9cde0.jpg') center/cover no-repeat;
          padding: 2.8rem 2.5rem 3rem;
        }
        .tdb-banner-inner {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .tdb-banner-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.55);
          margin-bottom: 0.5rem;
        }
        .tdb-banner-greeting {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 500;
          color: var(--cream);
          line-height: 1.1;
          margin-bottom: 0.6rem;
        }
        .tdb-banner-greeting em { font-style: italic; color: var(--gold); }

        .tdb-email {
          font-size: 0.83rem;
          color: rgba(245,237,224,0.38);
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        /* ── USER CARD ── */
        .tdb-user-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.15);
          border-radius: 14px;
          padding: 1rem 1.5rem;
        }
        .tdb-user-av {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 2px solid rgba(212,175,55,0.35);
          object-fit: cover;
          background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(139,94,47,0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gold);
          flex-shrink: 0;
        }
        .tdb-user-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.45rem;
          font-weight: 600;
          color: var(--cream);
        }

        /* ── BODY ── */
        .tdb-body {
          flex: 1;
          padding: 2.2rem 2.5rem;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
        }

        /* ── SECTION LABEL ── */
        .sec-label {
          font-size: 0.66rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 600;
          margin-bottom: 1.4rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .sec-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(139,94,47,0.18);
        }

        /* ── STATS ── */
        .tdb-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .tdb-stat {
          background: #fff;
          border: 1.5px solid #e8d8c4;
          border-radius: 14px;
          padding: 1.2rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeUp 0.5s ease both;
        }
        .tdb-stat:nth-child(1) { animation-delay: 0.05s; }
        .tdb-stat:nth-child(2) { animation-delay: 0.10s; }
        .tdb-stat:nth-child(3) { animation-delay: 0.15s; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tdb-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fdf3e0, #f5e6c8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .tdb-stat-lbl {
          font-size: 0.67rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 0.18rem;
        }
        .tdb-stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--ink2);
        }
        .tdb-stat-val-sm {
          font-size: 0.82rem;
          color: var(--muted);
          font-family: 'Jost', sans-serif;
          font-weight: 400;
        }

        /* ── ACTION CARDS ── */
        .tdb-actions { display: flex; flex-direction: column; gap: 1rem; }

        .tdb-action-card {
          background: #fff;
          border: 1.5px solid #e8d8c4;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: stretch;
        }
        .tdb-action-card:hover {
          transform: translateX(4px);
          box-shadow: 0 12px 40px rgba(44,31,16,0.1);
          border-color: #d4c2a8;
        }
        .tdb-action-strip {
          width: 4px;
          flex-shrink: 0;
          background: linear-gradient(to bottom, var(--gold), var(--brown));
        }
        .tdb-action-icon {
          width: 72px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fdf6ec, #f5e8d0);
          font-size: 1.9rem;
          border-right: 1px solid #f0e6d8;
          transition: background 0.25s;
        }
        .tdb-action-card:hover .tdb-action-icon {
          background: linear-gradient(135deg, #fef0d0, #f5dfa8);
        }
        .tdb-action-content {
          flex: 1;
          padding: 1.3rem 1.6rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tdb-action-eyebrow {
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,94,47,0.6);
          margin-bottom: 0.3rem;
        }
        .tdb-action-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--ink2);
          margin-bottom: 0.3rem;
        }
        .tdb-action-desc {
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.6;
        }
        .tdb-action-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.22rem 0.7rem;
          border-radius: 100px;
          margin-top: 0.5rem;
          width: fit-content;
        }
        .badge-ok   { background: rgba(39,174,96,0.1);  border: 1px solid rgba(39,174,96,0.25);  color: #1e8449; }
        .badge-warn { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3);  color: #8b6820; }

        .tdb-action-arr {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1.4rem;
          color: rgba(139,94,47,0.35);
          transition: all 0.22s;
        }
        .tdb-action-card:hover .tdb-action-arr { color: var(--gold); transform: translateX(3px); }

        /* ── SHIMMER ── */
        .shimmer {
          background: linear-gradient(90deg, #f0e6d8 25%, #faf6f0 50%, #f0e6d8 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .tdb-hdr, .tdb-tabs { padding: 0 1.5rem; }
          .tdb-banner          { padding: 2rem 1.5rem 2.5rem; }
          .tdb-body            { padding: 1.5rem; }
          .tdb-banner-inner    { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
          .tdb-stats           { grid-template-columns: 1fr 1fr; }
          .tdb-action-icon     { width: 58px; }
          .tdb-user-card       { width: 100%; }
        }
      `}</style>

      <div className="tdb">

        {/* HEADER */}
        <header className="tdb-hdr">
          <div className="tdb-logo" onClick={() => navigate("/")} spellCheck={false} translate="no">
            <span>Artiq</span>
          </div>
          <button className="tdb-logout" onClick={handleLogout}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </header>

        {/* TABS */}
        <div className="tdb-tabs">
          <button className={`tdb-tab${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Overview
          </button>
          <button className={`tdb-tab${activeTab === "profile" ? " active" : ""}`} onClick={() => setActiveTab("profile")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </button>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* BANNER */}
            <div className="tdb-banner">
              <div className="tdb-banner-inner">
                <div>
                  <p className="tdb-banner-eyebrow">Tailor Dashboard</p>
                  <h1 className="tdb-banner-greeting">
                    Welcome, <em>{displayName}</em>
                  </h1>
                  <p className="tdb-email">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {email}
                  </p>
                </div>

                {/* USER CARD */}
                <div className="tdb-user-card">
                  {loading ? (
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  ) : profile.profilepic ? (
                    <img src={profile.profilepic} alt="avatar" className="tdb-user-av" style={{ background: "none" }} />
                  ) : (
                    <div className="tdb-user-av">{displayName[0]?.toUpperCase()}</div>
                  )}
                  <div className="tdb-user-name">{loading ? "Loading…" : displayName}</div>
                </div>
              </div>
            </div>

            <div className="tdb-body">

              {/* STATS */}
              <div className="tdb-stats">
                <div className="tdb-stat">
                  <div className="tdb-stat-icon">🪡</div>
                  <div>
                    <div className="tdb-stat-lbl">Specialty</div>
                    {loading
                      ? <div className="shimmer" style={{ height: 18, width: 80 }} />
                      : <div className="tdb-stat-val">
                          {profile.spl ? profile.spl.split(",")[0].trim() : <span className="tdb-stat-val-sm">Not set</span>}
                        </div>
                    }
                  </div>
                </div>
                <div className="tdb-stat">
                  <div className="tdb-stat-icon">📍</div>
                  <div>
                    <div className="tdb-stat-lbl">City</div>
                    {loading
                      ? <div className="shimmer" style={{ height: 18, width: 70 }} />
                      : <div className="tdb-stat-val">
                          {profile.city || <span className="tdb-stat-val-sm">Not set</span>}
                        </div>
                    }
                  </div>
                </div>
                <div className="tdb-stat">
                  <div className="tdb-stat-icon">🏅</div>
                  <div>
                    <div className="tdb-stat-lbl">Experience</div>
                    {loading
                      ? <div className="shimmer" style={{ height: 18, width: 60 }} />
                      : <div className="tdb-stat-val">
                          {expYears !== null && expYears >= 0
                            ? `${expYears}+ yrs`
                            : <span className="tdb-stat-val-sm">Not set</span>
                          }
                        </div>
                    }
                  </div>
                </div>
              </div>

              {/* MANAGE */}
              <p className="sec-label">Manage</p>

              <div className="tdb-actions">
                <div className="tdb-action-card" onClick={() => setActiveTab("profile")}>
                  <div className="tdb-action-strip" />
                  <div className="tdb-action-icon">👤</div>
                  <div className="tdb-action-content">
                    <div className="tdb-action-eyebrow">Update & Manage</div>
                    <div className="tdb-action-title">My Profile</div>
                    <div className="tdb-action-desc">
                      {loading
                        ? "Loading your profile…"
                        : isProfileComplete
                          ? "Your profile is live. Keep it updated to stay discoverable."
                          : "Complete your profile so customers can find and contact you."
                      }
                    </div>
                    <span className={`tdb-action-badge ${isProfileComplete ? "badge-ok" : "badge-warn"}`}>
                      {isProfileComplete ? "● Complete" : "● Needs attention"}
                    </span>
                  </div>
                  <div className="tdb-action-arr">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={{ flex: 1 }}>
            <TailorProfile />
          </div>
        )}

      </div>
    </>
  );
}