// src/components/Signup.tsx
// Changes from original:
//  1. On successful signup → show success msg then navigate to /login
//  2. "Sign in here" link → uses React Router Link

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface FormData { emailid: string; pwd: string; utype: string; }
interface FormErrors { emailid?: string; pwd?: string; utype?: string; }

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData]         = useState<FormData>({ emailid: "", pwd: "", utype: "" });
  const [errors, setErrors]             = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");
  const [serverError, setServerError]   = useState("");

  useEffect(() => {
    if (successMsg || serverError) {
      const timer = setTimeout(() => { setSuccessMsg(""); setServerError(""); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, serverError]);

  const emailRegex   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.emailid) newErrors.emailid = "Email is required.";
    else if (!emailRegex.test(formData.emailid)) newErrors.emailid = "Please enter a valid email address.";
    if (!formData.pwd) newErrors.pwd = "Password is required.";
    else if (!passwordRegex.test(formData.pwd))
      newErrors.pwd = "Minimum 8 chars required with uppercase, lowercase, number & special character.";
    if (!formData.utype) newErrors.utype = "Please select your account type.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev  => ({ ...prev, [name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Account created! Redirecting to login…");
        setFormData({ emailid: "", pwd: "", utype: "" });
        // ── Redirect to login after a short delay ──
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setServerError(data.message || "Something went wrong.");
        setFormData({ emailid: "", pwd: "", utype: "" });
      }
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .signup-root { min-height:100vh; display:flex; font-family:'Jost',sans-serif; background:#1a1410; }
        .left-panel { flex:1; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; padding:3rem; min-height:100vh; }
        .left-bg { position:absolute; inset:0; background:linear-gradient(160deg,rgba(20,15,10,0.72) 0%,rgba(20,15,10,0.35) 50%,rgba(20,15,10,0.8) 100%),url("https://i.pinimg.com/736x/39/25/75/3925753a4c493986d7f98710cdaf561f.jpg") center/cover no-repeat; }
        .left-content { position:relative; z-index:2; }
        .brand-badge { display:inline-flex; align-items:center; gap:0.5rem; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.35); backdrop-filter:blur(8px); padding:0.4rem 1rem; border-radius:100px; margin-bottom:2rem; width:fit-content; }
        .brand-dot { width:7px; height:7px; border-radius:50%; background:#d4af37; }
        .brand-text { font-size:1.4rem; letter-spacing:0.18em; text-transform:uppercase; color:#d4af37; font-weight:500; }
        .left-headline { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,5vw,4.5rem); font-weight:500; line-height:1.05; color:#f5ede0; margin-bottom:1.5rem; }
        .left-headline em { font-style:italic; color:#d4af37; }
        .left-sub { font-size:1.2rem; color:rgba(245,237,224,0.85); line-height:1.7; max-width:360px; font-weight:400; margin-bottom:2.5rem; }
        .right-panel { width:530px; min-height:100vh; background:#faf6f0; display:flex; flex-direction:column; justify-content:center; padding:3rem 3.5rem; position:relative; overflow:hidden; }
        .right-panel::before { content:''; position:absolute; top:-120px; right:-120px; width:350px; height:350px; border-radius:50%; background:radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%); pointer-events:none; }
        .right-panel::after  { content:''; position:absolute; bottom:-80px; left:-80px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(160,100,60,0.06) 0%,transparent 70%); pointer-events:none; }
        .form-header { margin-bottom:2.2rem; position:relative; z-index:1; }
        .form-eyebrow { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:#d4af37; font-weight:500; margin-bottom:0.5rem; }
        .form-title { font-family:'Cormorant Garamond',serif; font-size:2.6rem; font-weight:500; color:#2c1f10; line-height:1.1; }
        .form-title span { font-style:italic; color:#8b5e2f; }
        .form-desc { margin-top:0.6rem; font-size:0.85rem; color:#7a6248; font-weight:300; line-height:1.6; }
        .field-group { margin-bottom:1.3rem; position:relative; z-index:1; }
        .field-label { display:block; font-size:0.9rem; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#5a4233; margin-bottom:0.45rem; }
        .field-wrap { position:relative; display:flex; align-items:center; }
        .field-icon { position:absolute; left:0.9rem; color:#b89060; font-size:1rem; pointer-events:none; }
        .field-input { width:100%; padding:0.8rem 1rem 0.8rem 2.6rem; border:1.5px solid #e0d0bc; border-radius:10px; background:#fff; font-family:'Jost',sans-serif; font-size:0.9rem; color:#2c1f10; transition:border-color 0.2s,box-shadow 0.2s; outline:none; }
        .field-input::placeholder { color:#c0a880; font-weight:300; }
        .field-input:focus { border-color:#d4af37; box-shadow:0 0 0 3px rgba(212,175,55,0.12); }
        .field-input.error { border-color:#c0392b; box-shadow:0 0 0 3px rgba(192,57,43,0.08); }
        .field-select { width:100%; padding:0.8rem 1rem 0.8rem 2.6rem; border:1.5px solid #e0d0bc; border-radius:10px; background:#fff; font-family:'Jost',sans-serif; font-size:0.9rem; color:#2c1f10; transition:border-color 0.2s,box-shadow 0.2s; outline:none; appearance:none; cursor:pointer; }
        .field-select:focus { border-color:#d4af37; box-shadow:0 0 0 3px rgba(212,175,55,0.12); }
        .field-select.error { border-color:#c0392b; }
        .select-arrow { position:absolute; right:0.9rem; color:#b89060; pointer-events:none; font-size:0.75rem; }
        .eye-btn { position:absolute; right:0.9rem; background:none; border:none; cursor:pointer; color:#b89060; display:flex; align-items:center; padding:0.2rem; }
        .eye-btn:hover { color:#8b5e2f; }
        .error-msg { margin-top:0.3rem; font-size:1rem; color:#c0392b; display:flex; align-items:center; gap:0.3rem; }
        .submit-btn { width:100%; padding:0.95rem; margin-top:0.4rem; background:linear-gradient(135deg,#2c1f10 0%,#4a2e14 100%); color:#f5ede0; border:none; border-radius:10px; font-family:'Jost',sans-serif; font-size:0.85rem; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; cursor:pointer; transition:all 0.25s; position:relative; overflow:hidden; z-index:1; }
        .submit-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#d4af37 0%,#b8952a 100%); opacity:0; transition:opacity 0.25s; }
        .submit-btn:hover::before { opacity:1; }
        .submit-btn:hover { color:#2c1f10; box-shadow:0 6px 24px rgba(212,175,55,0.3); transform:translateY(-1px); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .submit-btn span { position:relative; z-index:1; }
        .divider { display:flex; align-items:center; gap:0.8rem; margin:1.4rem 0; position:relative; z-index:1; }
        .divider-line { flex:1; height:1px; background:#e0d0bc; }
        .divider-text { font-size:0.7rem; color:#b89060; letter-spacing:0.1em; text-transform:uppercase; }
        .form-footer { text-align:center; font-size:1rem; color:#7a6248; font-weight:300; position:relative; z-index:1; }
        .login-link { color:#8b5e2f; font-weight:600; text-decoration:none; border-bottom:1px solid rgba(139,94,47,0.3); transition:border-color 0.2s,color 0.2s; }
        .login-link:hover { color:#d4af37; border-color:#d4af37; }
        .alert-signup { padding:0.7rem 0.8rem; border-radius:8px; font-size:1rem; margin-bottom:1.2rem; display:flex; align-items:center; gap:0.5rem; position:relative; z-index:1; }
        .alert-success-signup { background:rgba(39,174,96,0.2); border:1px solid rgba(39,174,96,0.3); color:#1e8449; }
        .alert-error-signup   { background:rgba(192,57,43,0.2); border:1px solid rgba(192,57,43,0.3); color:#c0392b; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner { width:16px; height:16px; border:2px solid rgba(245,237,224,0.3); border-top-color:#f5ede0; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; margin-right:0.4rem; vertical-align:middle; }
        @media (max-width:900px) { .left-panel { display:none; } .right-panel { width:100%; padding:2.5rem 2rem; } }
      `}</style>

      <div className="signup-root">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="left-bg" />
          <div className="left-content">
            <div className="brand-badge">
              <div className="brand-dot" />
              <span className="brand-text">Artiq</span>
            </div>
            <h1 className="left-headline">Weaving Hidden Talent<br />into <em>Opportunity</em></h1>
            <p className="left-sub">Join a premium platform where skilled talent meets opportunity. Showcase your craft, reach the right audience.</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-header">
            <p className="form-eyebrow">Begin Your Journey</p>
            <h2 className="form-title">Create Your<br /><span>Account</span></h2>
            <p className="form-desc">Be part of a network built for creators and clients.</p>
          </div>

          {successMsg && <div className="alert-signup alert-success-signup"><span>✓</span> {successMsg}</div>}
          {serverError && <div className="alert-signup alert-error-signup"><span>⚠</span> {serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label className="field-label" htmlFor="emailid">Email Address</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="emailid" name="emailid" type="email" className={`field-input${errors.emailid ? " error" : ""}`} placeholder="you@example.com" value={formData.emailid} onChange={handleChange} autoComplete="email" />
              </div>
              {errors.emailid && <p className="error-msg"><span>●</span>{errors.emailid}</p>}
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="pwd">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="pwd" name="pwd" type={showPassword ? "text" : "password"} className={`field-input${errors.pwd ? " error" : ""}`} placeholder="Create a strong password" value={formData.pwd} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.pwd && <p className="error-msg"><span>●</span>{errors.pwd}</p>}
            </div>

            {/* User Type */}
            <div className="field-group">
              <label className="field-label" htmlFor="utype">Account Type</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <select id="utype" name="utype" className={`field-select${errors.utype ? " error" : ""}`} value={formData.utype} onChange={handleChange}>
                  <option value="" disabled>Choose your role…</option>
                  <option value="Tailor">✂️ Tailor / Artisan</option>
                  <option value="Customer">🛍️ Customer</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
              {errors.utype && <p className="error-msg"><span>●</span>{errors.utype}</p>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span><span className="spinner" />Creating Account…</span> : <span>Create Account</span>}
            </button>
          </form>

          <div className="divider"><div className="divider-line" /><span className="divider-text">or</span><div className="divider-line" /></div>

          <p className="form-footer">
            Already have an account?{" "}
            {/* ── Link to Login page ── */}
            <Link to="/login" className="login-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </>
  );
}