// src/components/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface FormData { emailid: string; pwd: string; }
interface FormErrors { emailid?: string; pwd?: string; }

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData]       = useState<FormData>({ emailid: "", pwd: "" });
  const [errors, setErrors]           = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (successMsg || serverError) {
      const t = setTimeout(() => { setSuccessMsg(""); setServerError(""); }, 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg, serverError]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!formData.emailid) e.emailid = "Email is required.";
    else if (!emailRegex.test(formData.emailid)) e.emailid = "Please enter a valid email address.";
    if (!formData.pwd) e.pwd = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("userEmail", data.user.emailid);
        sessionStorage.setItem("userType",  data.user.utype);
        setSuccessMsg(`Welcome back!`);
        setTimeout(() => {
          if (data.user.utype === "Tailor") navigate("/tailor-dashboard");
          else                              navigate("/customer-dashboard");
        }, 700);
      } else {
        setServerError(data.message || "Login failed. Please try again.");
        setFormData({ emailid: "", pwd: "" });
      }
    } catch { setServerError("Unable to connect to server."); }
    finally   { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .lr{min-height:100vh;display:flex;font-family:'Jost',sans-serif;background:#1a1410;}
        .lr-left{width:530px;min-height:100vh;background:#faf6f0;display:flex;flex-direction:column;justify-content:center;padding:3rem 3.5rem;position:relative;overflow:hidden;}
        .lr-left::before{content:'';position:absolute;top:-100px;left:-100px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.09) 0%,transparent 70%);pointer-events:none;}
        .lr-left::after{content:'';position:absolute;bottom:-80px;right:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(139,94,47,0.07) 0%,transparent 70%);pointer-events:none;}
        .lr-right{flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding:3rem;}
        .lr-right-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(20,15,10,0.6) 0%,rgba(20,15,10,0.25) 50%,rgba(20,15,10,0.75) 100%),url("https://images.unsplash.com/photo-1666112514265-a432cd607ce1?w=600&auto=format&fit=crop&q=60") center/cover no-repeat;}
        .lr-right-content{position:relative;z-index:2;max-width:400px;text-align:right;}
        .lr-logo{display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:2.5rem;}
        .lr-logo-name{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:600;color:#f5ede0;letter-spacing:0.04em;}
        .lr-logo-name span{color:#d4af37;font-style:italic;}
        .lr-tagline{font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,4vw,3.8rem);font-weight:400;color:#f5ede0;line-height:1.1;margin-bottom:1.2rem;}
        .lr-tagline em{color:#d4af37;font-style:italic;}
        .lr-sub{font-size:1.1rem;color:rgba(245,237,224,0.8);font-weight:400;line-height:1.7;letter-spacing:0.02em;}
        .fhdr{margin-bottom:2.2rem;position:relative;z-index:1;}
        .feyebrow{font-size:1rem;letter-spacing:0.2em;text-transform:uppercase;color:#d4af37;font-weight:500;margin-bottom:0.5rem;}
        .ftitle{font-family:'Cormorant Garamond',serif;font-size:2.7rem;font-weight:500;color:#2c1f10;line-height:1.1;}
        .ftitle span{font-style:italic;color:#8b5e2f;}
        .fdesc{margin-top:0.6rem;font-size:0.95rem;color:#7a6248;font-weight:300;line-height:1.6;}
        .fg{margin-bottom:1.3rem;position:relative;z-index:1;}
        .flbl{display:block;font-size:0.9rem;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:#5a4233;margin-bottom:0.5rem;}
        .fwrap{position:relative;display:flex;align-items:center;}
        .ficon{position:absolute;left:0.9rem;color:#8b7355;display:flex;align-items:center;pointer-events:none;}
        .finput{width:100%;padding:0.8rem 1rem 0.8rem 2.6rem;background:#fff;border:1.5px solid #e0d0bc;border-radius:8px;font-family:'Jost',sans-serif;font-size:1rem;color:#2c1f10;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .finput:focus{border-color:#8b5e2f;box-shadow:0 0 0 3px rgba(139,94,47,0.1);}
        .finput.err{border-color:#c0392b;}
        .eye{position:absolute;right:0.9rem;background:none;border:none;cursor:pointer;color:#8b7355;display:flex;align-items:center;}
        .ferr{display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#c0392b;margin-top:0.4rem;}
        .forg{text-align:right;margin-bottom:1.2rem;z-index:1;position:relative;}
        .forg a{font-size:0.88rem;color:#8b5e2f;text-decoration:none;font-weight:500;}
        .sbtn{width:100%;padding:0.9rem;background:#2c1f10;color:#f5ede0;border:none;border-radius:8px;font-family:'Jost',sans-serif;font-size:0.95rem;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden;z-index:1;}
        .sbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#d4af37 0%,#b8952a 100%);opacity:0;transition:opacity 0.25s;}
        .sbtn:hover::before{opacity:1;}
        .sbtn:hover{color:#2c1f10;box-shadow:0 6px 24px rgba(212,175,55,0.3);transform:translateY(-1px);}
        .sbtn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .sbtn span{position:relative;z-index:1;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spn{width:16px;height:16px;border:2px solid rgba(245,237,224,0.3);border-top-color:#f5ede0;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;margin-right:0.4rem;vertical-align:middle;}
        .div{display:flex;align-items:center;gap:0.8rem;margin:1.4rem 0;position:relative;z-index:1;}
        .div-line{flex:1;height:1px;background:#e0d0bc;}
        .div-txt{font-size:0.7rem;color:#b89060;letter-spacing:0.1em;text-transform:uppercase;}
        .ffoot{text-align:center;font-size:1rem;color:#7a6248;font-weight:300;position:relative;z-index:1;}
        .signup-link{color:#8b5e2f;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(139,94,47,0.3);transition:color 0.2s,border-color 0.2s;}
        .signup-link:hover{color:#d4af37;border-color:#d4af37;}
        .alert{padding:0.8rem 1rem;border-radius:8px;font-size:1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.5rem;position:relative;z-index:1;}
        .alert-ok{background:rgba(39,174,96,0.2);border:1px solid rgba(39,174,96,0.3);color:#1e8449;}
        .alert-err{background:rgba(192,57,43,0.2);border:1px solid rgba(192,57,43,0.3);color:#c0392b;}
        .back-btn{display:inline-flex;align-items:center;gap:0.4rem;font-size:0.82rem;color:#8b5e2f;text-decoration:none;font-weight:500;margin-bottom:1.5rem;cursor:pointer;background:none;border:none;letter-spacing:0.08em;z-index:1;position:relative;}
        .back-btn:hover{color:#d4af37;}
        @media(max-width:900px){.lr-right{display:none;}.lr-left{width:100%;padding:2.5rem 2rem;}}
      `}</style>

      <div className="lr">
        <div className="lr-left">
          <button className="back-btn" onClick={() => navigate("/")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </button>

          <div className="fhdr">
            <p className="feyebrow">Welcome Back</p>
            <h2 className="ftitle">Sign <span>In</span><br />to Your Artiq</h2>
            <p className="fdesc">Access your orders, measurements, and craft portfolio.</p>
          </div>

          {successMsg && <div className="alert alert-ok"><span>✓</span> {successMsg}</div>}
          {serverError && <div className="alert alert-err"><span>⚠</span> {serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="fg">
              <label className="flbl" htmlFor="emailid">Email Address</label>
              <div className="fwrap">
                <span className="ficon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input id="emailid" name="emailid" type="email" className={`finput${errors.emailid ? " err" : ""}`} placeholder="you@example.com" value={formData.emailid} onChange={handleChange} autoComplete="email"/>
              </div>
              {errors.emailid && <p className="ferr"><span>●</span>{errors.emailid}</p>}
            </div>

            <div className="fg">
              <label className="flbl" htmlFor="pwd">Password</label>
              <div className="fwrap">
                <span className="ficon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                <input id="pwd" name="pwd" type={showPassword ? "text" : "password"} className={`finput${errors.pwd ? " err" : ""}`} placeholder="Enter your password" value={formData.pwd} onChange={handleChange} autoComplete="current-password"/>
                <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.pwd && <p className="ferr"><span>●</span>{errors.pwd}</p>}
            </div>

            <div className="forg"><a href="#">Forgot password?</a></div>

            <button type="submit" className="sbtn" disabled={loading}>
              {loading ? <span><span className="spn"/>Signing In…</span> : <span>Sign In</span>}
            </button>
          </form>

          <div className="div"><div className="div-line"/><span className="div-txt">or</span><div className="div-line"/></div>
          <p className="ffoot">New to The Artiq? <Link to="/signup" className="signup-link">Create an account</Link></p>
        </div>

        <div className="lr-right">
          <div className="lr-right-bg"/>
          <div className="lr-right-content">
            <div className="lr-logo"><span style={{fontSize:'2rem'}}>✂️</span><span className="lr-logo-name"> <span>Artiq</span></span></div>
            <h2 className="lr-tagline">Where <em>Craft</em><br/>Meets<br/>Elegance</h2>
            <p className="lr-sub">Every stitch tells a story. Every garment is a masterpiece. Connect, create, and deliver perfection.</p>
          </div>
        </div>
      </div>
    </>
  );
}