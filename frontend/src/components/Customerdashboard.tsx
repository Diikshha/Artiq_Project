// src/components/CustomerDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerProfile from "./custProfile";

type Tab = "overview" | "profile";

interface ProfileData {
  name?: string;
  city?: string;
  profilepic?: string | null;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("userEmail") || "";
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/user/custprofile/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailid: email }),
    })
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(d.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const displayName = profile.name || email.split("@")[0] || "Customer";
  const isProfileComplete = !!(profile.name && profile.city);

  function handleLogout() {
    sessionStorage.clear();
    navigate("/login");
  }

  const actions = [
    {
      id: "profile",
      icon: "👤",
      eyebrow: "Update & Manage",
      title: "My Profile",
      desc: loading
        ? "Loading your profile…"
        : isProfileComplete
        ? "Your profile is complete. Keep it updated for a better experience."
        : "Add your name, city and photo so tailors can recognise you.",
      badge: isProfileComplete ? "ok" : "warn",
      badgeText: isProfileComplete ? "● Complete" : "● Needs attention",
      onClick: () => setActiveTab("profile"),
    },
    {
      id: "findtailor",
      icon: "🗺️",
      eyebrow: "Discover Artisans",
      title: "Find a Tailor",
      desc: "Search verified tailors by city, specialty, and work type.",
      badge: null,
      badgeText: null,
      onClick: () => navigate("/find-tailor"),
    },
    {
      id: "review",
      icon: "⭐",
      eyebrow: "Share Experience",
      title: "Rate & Review",
      desc: "Leave honest ratings and feedback for tailors you've worked with.",
      badge: null,
      badgeText: null,
      onClick: () => navigate("/rate-review"),
    },
    {
      id: "password",
      icon: "🔒",
      eyebrow: "Security",
      title: "Change Password",
      desc: "Update your login credentials to keep your account secure.",
      badge: null,
      badgeText: null,
      onClick: () => navigate("/change-password"),
    },
  ];

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

        .cdb {
          font-family: 'Jost', sans-serif;
          min-height: 100vh;
          background: var(--sand);
          display: flex;
          flex-direction: column;
        }

        .cdb-hdr {
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
        .cdb-logo { display: flex; align-items: center; gap: 0.45rem; cursor: pointer; }
        .cdb-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--cream);
          letter-spacing: 0.04em;
        }
        .cdb-logo-text span { color: var(--gold); font-style: italic; }

        .cdb-logout {
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
        .cdb-logout:hover {
          border-color: rgba(220,60,50,0.5);
          color: #e55;
          background: rgba(220,60,50,0.07);
        }

        .cdb-tabs {
          background: var(--ink2);
          display: flex;
          padding: 0 2.5rem;
          border-bottom: 1px solid rgba(212,175,55,0.12);
        }
        .cdb-tab {
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
        .cdb-tab:hover  { color: rgba(245,237,224,0.7); }
        .cdb-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

        .cdb-banner {
          background:
            linear-gradient(rgba(20,15,10,0.62), rgba(20,15,10,0.62)),
            url('https://i.pinimg.com/736x/60/77/2e/60772e83c368dd66a1d6571375d9cde0.jpg') center/cover no-repeat;
          padding: 2.8rem 2.5rem 3rem;
        }
        .cdb-banner-inner {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .cdb-banner-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.55);
          margin-bottom: 0.5rem;
        }
        .cdb-banner-greeting {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 500;
          color: var(--cream);
          line-height: 1.1;
          margin-bottom: 0.6rem;
        }
        .cdb-banner-greeting em { font-style: italic; color: var(--gold); }

        .cdb-email {
          font-size: 0.83rem;
          color: rgba(245,237,224,0.38);
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .cdb-user-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(212,175,55,0.15);
          border-radius: 14px;
          padding: 1rem 1.5rem;
        }
        .cdb-user-av {
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
        .cdb-user-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.45rem;
          font-weight: 600;
          color: var(--cream);
        }

        .cdb-body {
          flex: 1;
          padding: 2.2rem 2.5rem;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
        }

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

        .cdb-actions { display: flex; flex-direction: column; gap: 1rem; }

        .cdb-action-card {
          background: #fff;
          border: 1.5px solid #e8d8c4;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: stretch;
        }
        .cdb-action-card:hover {
          transform: translateX(4px);
          box-shadow: 0 12px 40px rgba(44,31,16,0.1);
          border-color: #d4c2a8;
        }
        .cdb-action-strip {
          width: 4px;
          flex-shrink: 0;
          background: linear-gradient(to bottom, var(--gold), var(--brown));
        }
        .cdb-action-icon {
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
        .cdb-action-card:hover .cdb-action-icon {
          background: linear-gradient(135deg, #fef0d0, #f5dfa8);
        }
        .cdb-action-content {
          flex: 1;
          padding: 1.3rem 1.6rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cdb-action-eyebrow {
          font-size: 0.66rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(139,94,47,0.6);
          margin-bottom: 0.3rem;
        }
        .cdb-action-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--ink2);
          margin-bottom: 0.3rem;
        }
        .cdb-action-desc {
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.6;
        }
        .cdb-action-badge {
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

        .cdb-action-arr {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 1.4rem;
          color: rgba(139,94,47,0.35);
          transition: all 0.22s;
        }
        .cdb-action-card:hover .cdb-action-arr { color: var(--gold); transform: translateX(3px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .cdb-hdr, .cdb-tabs { padding: 0 1.5rem; }
          .cdb-banner          { padding: 2rem 1.5rem 2.5rem; }
          .cdb-body            { padding: 1.5rem; }
          .cdb-banner-inner    { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
          .cdb-action-icon     { width: 58px; }
          .cdb-user-card       { width: 100%; }
        }
      `}</style>

      <div className="cdb">

        <header className="cdb-hdr">
          <div className="cdb-logo" onClick={() => navigate("/")}>
            <span className="cdb-logo-text"><span>Artiq</span></span>
          </div>
          <button className="cdb-logout" onClick={handleLogout}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </header>

        <div className="cdb-tabs">
          <button
            className={`cdb-tab${activeTab === "overview" ? " active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Overview
          </button>
          <button
            className={`cdb-tab${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </button>
        </div>

        {activeTab === "overview" && (
          <>
            <div className="cdb-banner">
              <div className="cdb-banner-inner">
                <div>
                  <p className="cdb-banner-eyebrow">Customer Dashboard</p>
                  <h1 className="cdb-banner-greeting">
                    Welcome, <em>{displayName}</em>
                  </h1>
                  <p className="cdb-email">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {email}
                  </p>
                </div>

                <div className="cdb-user-card">
                  {loading ? (
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  ) : profile.profilepic ? (
                    <img src={profile.profilepic} alt="avatar" className="cdb-user-av" style={{ background: "none" }} />
                  ) : (
                    <div className="cdb-user-av">{displayName[0]?.toUpperCase()}</div>
                  )}
                  <div className="cdb-user-name">{loading ? "Loading…" : displayName}</div>
                </div>
              </div>
            </div>

            <div className="cdb-body">
              <p className="sec-label">Quick Access</p>
              <div className="cdb-actions">
                {actions.map(action => (
                  <div key={action.id} className="cdb-action-card" onClick={action.onClick}>
                    <div className="cdb-action-strip" />
                    <div className="cdb-action-icon">{action.icon}</div>
                    <div className="cdb-action-content">
                      <div className="cdb-action-eyebrow">{action.eyebrow}</div>
                      <div className="cdb-action-title">{action.title}</div>
                      <div className="cdb-action-desc">{action.desc}</div>
                      {action.badge && (
                        <span className={`cdb-action-badge badge-${action.badge}`}>
                          {action.badgeText}
                        </span>
                      )}
                    </div>
                    <div className="cdb-action-arr">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <div style={{ flex: 1 }}>
            <CustomerProfile />
          </div>
        )}

      </div>
    </>
  );
}