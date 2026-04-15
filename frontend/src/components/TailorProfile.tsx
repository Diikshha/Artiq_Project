import { useState, useRef, useEffect } from "react";

export default function TailorProfile() {

  // ── Session email ────────────────────────────────────────────────────────────
  const sessionEmail = sessionStorage.getItem("userEmail") || "";

  // ── Search ──────────────────────────────────────────────────────────────────
  const [searchEmail,   setSearchEmail]   = useState(sessionEmail);
  const [searchError,   setSearchError]   = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Profile fields ───────────────────────────────────────────────────────────
  const [emailid,   setEmailid]   = useState("");
  const [name,      setName]      = useState("");
  const [contact,   setContact]   = useState("");
  const [address,   setAddress]   = useState("");
  const [city,      setCity]      = useState("");
  const [aadharno,  setAadharno]  = useState("");
  const [dob,       setDob]       = useState("");
  const [gender,    setGender]    = useState("");
  const [category,  setCategory]  = useState("");
  const [spl,       setSpl]       = useState("");
  const [social,    setSocial]    = useState("");
  const [since,     setSince]     = useState("");
  const [worktype,  setWorktype]  = useState("");
  const [shopadr,   setShopadr]   = useState("");
  const [shopcity,  setShopcity]  = useState("");
  const [otherinfo, setOtherinfo] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // ── Aadhaar — persisted in sessionStorage ────────────────────────────────────
  const [aadharImg,    setAadharImg]    = useState<string | null>(
    () => sessionStorage.getItem("aadharImg") || null
  );
  const [aadharLocked, setAadharLocked] = useState<boolean>(
    () => sessionStorage.getItem("aadharLocked") === "true"
  );

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTab,      setActiveTab]      = useState<"personal"|"professional"|"contact">("personal");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");
  const [errorMsg,       setErrorMsg]       = useState("");
  const [infoMsg,        setInfoMsg]        = useState("");
  const [aadharScanning, setAadharScanning] = useState(false);
  const [aadharScanMsg,  setAadharScanMsg]  = useState(
    () => sessionStorage.getItem("aadharLocked") === "true"
      ? `✓ Aadhaar fields locked from previous scan`
      : ""
  );
  const [initialLoading, setInitialLoading] = useState(false);

  // ── Field errors ─────────────────────────────────────────────────────────────
  const [nameErr,     setNameErr]     = useState("");
  const [contactErr,  setContactErr]  = useState("");
  const [addressErr,  setAddressErr]  = useState("");
  const [cityErr,     setCityErr]     = useState("");
  const [categoryErr, setCategoryErr] = useState("");
  const [splErr,      setSplErr]      = useState("");
  const [sinceErr,    setSinceErr]    = useState("");
  const [worktypeErr, setWorktypeErr] = useState("");

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  // ── Persist aadharImg to sessionStorage whenever it changes ──────────────────
  useEffect(() => {
    if (aadharImg) {
      sessionStorage.setItem("aadharImg", aadharImg);
    } else {
      sessionStorage.removeItem("aadharImg");
    }
  }, [aadharImg]);

  // ── Persist aadharLocked to sessionStorage whenever it changes ───────────────
  useEffect(() => {
    sessionStorage.setItem("aadharLocked", String(aadharLocked));
  }, [aadharLocked]);

  // ── Auto-load profile on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!sessionEmail) return;
    setInitialLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/user/tailorprofile/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailid: sessionEmail }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          const p = d.profile;
          setEmailid(p.emailid || "");   setName(p.name || "");
          setContact(p.contact || "");   setAddress(p.address || "");
          setCity(p.city || "");         setAadharno(p.aadharno || "");
          setDob(p.dob || "");           setGender(p.gender || "");
          setCategory(p.category || ""); setSpl(p.spl || "");
          setSocial(p.social || "");     setSince(p.since || "");
          setWorktype(p.worktype || ""); setShopadr(p.shopadr || "");
          setShopcity(p.shopcity || ""); setOtherinfo(p.otherinfo || "");
          setProfilePic(p.profilepic || null);
          setIsExistingUser(true);
        } else {
          setEmailid(sessionEmail);
          setIsExistingUser(false);
        }
      })
      .catch(() => { setEmailid(sessionEmail); })
      .finally(() => setInitialLoading(false));
  }, []);

  // ── Auto-dismiss toasts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!successMsg && !errorMsg && !infoMsg) return;
    const t = setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); setInfoMsg(""); }, 5000);
    return () => clearTimeout(t);
  }, [successMsg, errorMsg, infoMsg]);

  function clearMsgs() { setSuccessMsg(""); setErrorMsg(""); setInfoMsg(""); }
  function clearErrs() {
    setNameErr(""); setContactErr(""); setAddressErr(""); setCityErr("");
    setCategoryErr(""); setSplErr(""); setSinceErr(""); setWorktypeErr("");
  }

  // ── Profile photo ────────────────────────────────────────────────────────────
  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  }

  // ── Aadhaar AI OCR ───────────────────────────────────────────────────────────
  async function handleAadharChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAadharImg(base64); // persisted via useEffect
      setAadharScanning(true);
      setAadharScanMsg("Scanning Aadhaar card…");

      try {
        const base64Data = base64.split(",")[1];
        const mediaType  = file.type || "image/jpeg";

        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/scan-aadhaar`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data, mediaType }),
        });

        const parsed = await response.json();

        if (!response.ok) {
          setAadharScanMsg(parsed.message || "Could not read card — please fill manually");
          return;
        }

        let filled = 0;
        if (parsed.aadharno) { setAadharno(parsed.aadharno); filled++; }
        if (parsed.dob)      { setDob(parsed.dob);           filled++; }
        if (parsed.gender)   { setGender(parsed.gender);     filled++; }

        if (filled > 0) {
          setAadharLocked(true); // persisted via useEffect
        }

        setAadharScanMsg(
          filled > 0
            ? `✓ Auto-filled ${filled} field${filled > 1 ? "s" : ""} from Aadhaar`
            : "Could not extract details — please fill manually"
        );
        setActiveTab("personal");
      } catch {
        setAadharScanMsg("Server error — please fill details manually");
      } finally {
        setAadharScanning(false);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Clear Aadhaar lock (optional reset button) ────────────────────────────────
  function clearAadharLock() {
    setAadharLocked(false);
    setAadharImg(null);
    setAadharno("");
    setDob("");
    setGender("");
    setAadharScanMsg("");
    sessionStorage.removeItem("aadharImg");
    sessionStorage.removeItem("aadharLocked");
  }

  // ── Search profile by email ───────────────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    clearMsgs(); clearErrs();
    if (!searchEmail.trim()) { setSearchError("Enter an email to search."); return; }
    setSearchLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/tailorprofile/get`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ emailid: searchEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        const p = data.profile;
        setEmailid(p.emailid || "");   setName(p.name || "");
        setContact(p.contact || "");   setAddress(p.address || "");
        setCity(p.city || "");         setAadharno(p.aadharno || "");
        setDob(p.dob || "");           setGender(p.gender || "");
        setCategory(p.category || ""); setSpl(p.spl || "");
        setSocial(p.social || "");     setSince(p.since || "");
        setWorktype(p.worktype || ""); setShopadr(p.shopadr || "");
        setShopcity(p.shopcity || ""); setOtherinfo(p.otherinfo || "");
        setProfilePic(p.profilepic || null);
        setIsExistingUser(true);
        setSuccessMsg("Profile loaded — update the details below.");
      } else {
        setEmailid(searchEmail.trim());
        setIsExistingUser(false);
        setInfoMsg("No profile found. Fill in the details and save.");
      }
    } catch {
      setErrorMsg("Cannot connect to server. Make sure backend is running.");
    } finally {
      setSearchLoading(false);
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  function validate() {
    let ok = true; clearErrs();
    if (!name.trim())    { setNameErr("Full name is required.");         ok = false; setActiveTab("personal"); }
    if (!city.trim())    { setCityErr("City is required.");              ok = false; setActiveTab("personal"); }
    if (!address.trim()) { setAddressErr("Address is required.");        ok = false; setActiveTab("personal"); }
    if (!category)       { setCategoryErr("Please select a category.");  ok = false; if (name.trim() && city.trim() && address.trim()) setActiveTab("professional"); }
    if (!spl.trim())     { setSplErr("Speciality is required.");         ok = false; }
    if (!since.trim())   { setSinceErr("Year is required.");             ok = false; }
    if (!worktype)       { setWorktypeErr("Please select work type.");   ok = false; }
    if (!contact.trim()) { setContactErr("Contact number is required."); ok = false; if (name.trim() && city.trim() && address.trim() && category && spl.trim() && since.trim() && worktype) setActiveTab("contact"); }
    return ok;
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/tailorprofile/save`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailid: emailid || sessionEmail,
          name, contact, address, city,
          aadharno, dob, gender,
          category, spl, social, since, worktype,
          shopadr, shopcity, otherinfo,
          profilepic: profilePic,
        }),
      });
      const data = await res.json();
      if (res.ok) { setSuccessMsg("Profile saved successfully! ✓"); setIsExistingUser(true); }
      else         setErrorMsg(data.message || "Failed to save profile.");
    } catch {
      setErrorMsg("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/tailorprofile/update`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailid: emailid || sessionEmail,
          name, contact, address, city,
          aadharno, dob, gender,
          category, spl, social, since, worktype,
          shopadr, shopcity, otherinfo,
          profilepic: profilePic,
        }),
      });
      const data = await res.json();
      if (res.ok) setSuccessMsg("Profile updated successfully! ✓");
      else        setErrorMsg(data.message || "Failed to update profile.");
    } catch {
      setErrorMsg("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  const indianCities = [
    "Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad","Chennai","Kolkata",
    "Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane",
    "Bhopal","Visakhapatnam","Pimpri","Patna","Vadodara","Ghaziabad","Ludhiana",
    "Agra","Nashik","Faridabad","Meerut","Rajkot","Kalyan","Vasai","Varanasi",
    "Srinagar","Aurangabad","Dhanbad","Amritsar","Allahabad","Ranchi","Howrah",
    "Coimbatore","Jabalpur","Gwalior","Vijayawada","Jodhpur","Madurai","Raipur",
    "Kota","Guwahati","Chandigarh","Solapur","Hubli","Mysuru","Mohali","Patiala",
    "Bathinda","Hoshiarpur","Jalandhar","Phagwara","Gurugram","Noida","Dehradun",
  ];

  const lockedStyle: React.CSSProperties = {
    background: "#f0ebe3",
    cursor: "not-allowed",
    color: "#7a6248",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--ink:#2c1f10;--gold:#d4af37;--brown:#8b5e2f;--cream:#faf6f0;--sand:#eddfcc;--muted:#7a6248;}

        .tp-wrap{font-family:'Jost',sans-serif;background:var(--sand);min-height:100vh;padding:2rem;}

        .tp-loading-overlay{display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:1rem;}
        .tp-loading-spinner{width:40px;height:40px;border:3px solid rgba(212,175,55,0.2);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite;}

        .tp-search-card{background:#fff;border:1.5px solid #e8d8c4;border-radius:16px;padding:1.8rem 2rem;margin-bottom:1.8rem;display:flex;gap:0.8rem;align-items:flex-end;flex-wrap:wrap;}
        .tp-search-group{flex:1;min-width:240px;}
        .tp-search-lbl{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:0.5rem;display:block;}
        .tp-search-inp{width:100%;padding:0.75rem 1rem;border:1.5px solid #e0d0bc;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.95rem;color:var(--ink);outline:none;background:#faf6f0;transition:border-color 0.2s,box-shadow 0.2s;}
        .tp-search-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(212,175,55,0.12);}
        .tp-search-btn{padding:0.78rem 1.8rem;background:var(--ink);color:var(--cream);border:none;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.85rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.22s;white-space:nowrap;}
        .tp-search-btn:hover{background:var(--gold);color:var(--ink);}
        .tp-search-err{font-size:0.8rem;color:#c0392b;margin-top:0.35rem;}

        .tp-header-card{background:var(--ink);border-radius:18px;padding:2rem;margin-bottom:1.5rem;display:flex;gap:2rem;align-items:center;flex-wrap:wrap;position:relative;overflow:hidden;}
        .tp-header-card::after{content:'✂️';position:absolute;right:1.5rem;bottom:-1rem;font-size:7rem;opacity:0.05;pointer-events:none;}
        .tp-avatar-zone{display:flex;flex-direction:column;align-items:center;gap:0.75rem;position:relative;z-index:2;}
        .tp-avatar{width:100px;height:100px;border-radius:50%;border:2.5px solid rgba(212,175,55,0.5);object-fit:cover;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:600;color:var(--gold);cursor:pointer;overflow:hidden;transition:border-color 0.22s;}
        .tp-avatar:hover{border-color:var(--gold);}
        .tp-avatar-hint{font-size:0.7rem;color:rgba(245,237,224,0.4);text-align:center;letter-spacing:0.06em;cursor:pointer}
        .tp-header-info{flex:1;position:relative;z-index:2;}
        .tp-hdr-eyebrow{font-size:0.68rem;letter-spacing:0.28em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin-bottom:0.4rem;}
        .tp-hdr-name{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;color:var(--cream);line-height:1.15;margin-bottom:0.35rem;}
        .tp-hdr-meta{display:flex;gap:0.8rem;flex-wrap:wrap;margin-top:0.6rem;}
        .tp-hdr-status{font-size:0.72rem;padding:0.25rem 0.8rem;border-radius:100px;background:rgba(39,174,96,0.15);border:1px solid rgba(39,174,96,0.3);color:#27ae60;letter-spacing:0.08em;}
        .tp-hdr-status.new{background:rgba(212,175,55,0.1);border-color:rgba(212,175,55,0.25);color:var(--gold);}

        /* AADHAAR ZONE */
        .tp-aadhar-zone{background:linear-gradient(135deg,rgba(212,175,55,0.06),rgba(139,94,47,0.06));border:1.5px dashed rgba(212,175,55,0.3);border-radius:14px;padding:1.5rem 2rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;cursor:pointer;transition:all 0.25s;}
        .tp-aadhar-zone:hover{border-color:var(--gold);background:rgba(212,175,55,0.08);}
        .tp-aadhar-zone.scanning{border-color:var(--gold);background:rgba(212,175,55,0.1);animation:pulse 1.5s ease-in-out infinite;}
        .tp-aadhar-zone.locked{cursor:default;border-color:rgba(39,174,96,0.35);background:rgba(39,174,96,0.04);}
        .tp-aadhar-zone.locked:hover{border-color:rgba(39,174,96,0.35);background:rgba(39,174,96,0.04);}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}
        .tp-aadhar-icon-wrap{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(139,94,47,0.1));display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .tp-aadhar-title{font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:600;color:var(--ink);margin-bottom:0.2rem;}
        .tp-aadhar-sub{font-size:0.82rem;color:var(--muted);font-weight:300;}
        .tp-aadhar-scan-msg{font-size:0.82rem;font-weight:500;margin-top:0.35rem;}
        .tp-aadhar-scan-msg.ok{color:#27ae60;}
        .tp-aadhar-scan-msg.info{color:var(--muted);}

        /* Aadhaar image preview — always shown when locked */
        .tp-aadhar-preview{width:130px;height:80px;border-radius:8px;object-fit:cover;border:1.5px solid rgba(212,175,55,0.3);margin-left:auto;flex-shrink:0;}

        /* Clear lock button */
        .tp-aadhar-clear{margin-left:auto;padding:0.35rem 0.85rem;border:1.5px solid rgba(192,57,43,0.3);border-radius:8px;background:transparent;color:#c0392b;font-family:'Jost',sans-serif;font-size:0.75rem;font-weight:500;letter-spacing:0.08em;cursor:pointer;transition:all 0.2s;white-space:nowrap;flex-shrink:0;}
        .tp-aadhar-clear:hover{background:rgba(192,57,43,0.08);border-color:rgba(192,57,43,0.5);}

        .tp-scan-spinner{width:20px;height:20px;border:2px solid rgba(212,175,55,0.25);border-top-color:var(--gold);border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;margin-right:0.5rem;vertical-align:middle;}

        .tp-tabs{display:flex;gap:0;background:#fff;border:1.5px solid #e8d8c4;border-radius:14px;overflow:hidden;margin-bottom:1.2rem;}
        .tp-tab{flex:1;padding:0.85rem 1rem;background:transparent;border:none;cursor:pointer;font-family:'Jost',sans-serif;font-size:0.8rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);transition:all 0.2s;border-right:1px solid #f0e6d8;display:flex;align-items:center;justify-content:center;gap:0.4rem;}
        .tp-tab:last-child{border-right:none;}
        .tp-tab:hover{background:#fdf6ee;color:var(--brown);}
        .tp-tab.active{background:var(--ink);color:var(--gold);}

        .tp-sec{background:#fff;border:1.5px solid #e8d8c4;border-radius:16px;padding:2rem;margin-bottom:1.2rem;}
        .tp-sec-title{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:var(--ink);margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;}
        .tp-sec-title::after{content:'';flex:1;height:1px;background:#f0e6d8;}

        .tp-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;}
        .tp-field{display:flex;flex-direction:column;gap:0.4rem;}
        .tp-field.full{grid-column:1/-1;}
        .tp-lbl{font-size:0.75rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#5a4233;}
        .tp-inp{padding:0.75rem 1rem;border:1.5px solid #e0d0bc;border-radius:8px;font-family:'Jost',sans-serif;font-size:0.92rem;color:var(--ink);background:#faf6f0;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .tp-inp:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(139,94,47,0.1);background:#fff;}
        .tp-inp.err{border-color:#c0392b;}
        .tp-sel{padding:0.75rem 1rem;border:1.5px solid #e0d0bc;border-radius:8px;font-family:'Jost',sans-serif;font-size:0.92rem;color:var(--ink);background:#faf6f0;outline:none;cursor:pointer;appearance:none;transition:border-color 0.2s,box-shadow 0.2s;}
        .tp-sel:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(139,94,47,0.1);background:#fff;}
        .tp-sel.err{border-color:#c0392b;}
        .tp-ferr{font-size:0.75rem;color:#c0392b;}
        .tp-hint{font-size:0.75rem;color:var(--muted);font-weight:300;}
        .tp-auto-badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.68rem;padding:0.15rem 0.5rem;background:rgba(39,174,96,0.12);border:1px solid rgba(39,174,96,0.3);border-radius:100px;color:#27ae60;margin-left:0.5rem;}
        .tp-locked-hint{font-size:0.72rem;color:#8b5e2f;font-weight:500;margin-top:0.2rem;}

        .tp-toast{padding:0.85rem 1.2rem;border-radius:10px;font-size:0.9rem;margin-bottom:1rem;display:flex;align-items:center;gap:0.6rem;}
        .tp-toast-ok{background:rgba(39,174,96,0.12);border:1px solid rgba(39,174,96,0.3);color:#1e8449;}
        .tp-toast-err{background:rgba(192,57,43,0.12);border:1px solid rgba(192,57,43,0.3);color:#c0392b;}
        .tp-toast-info{background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);color:#8b6820;}

        .tp-actions{display:flex;gap:1rem;justify-content:flex-end;margin-top:0.5rem;}
        .tp-btn{padding:0.85rem 2.2rem;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.88rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;border:none;display:flex;align-items:center;gap:0.5rem;}
        .tp-btn-save{background:var(--gold);color:var(--ink);}
        .tp-btn-save:hover{background:#b8952a;transform:translateY(-1px);box-shadow:0 6px 24px rgba(212,175,55,0.35);}
        .tp-btn-update{background:var(--ink);color:var(--cream);}
        .tp-btn-update:hover{background:#4a2e14;transform:translateY(-1px);box-shadow:0 6px 24px rgba(44,31,16,0.3);}
        .tp-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;}
        .spin-dark{border-color:rgba(44,31,16,0.2);border-top-color:var(--ink);}

        @media(max-width:640px){
          .tp-grid{grid-template-columns:1fr;}
          .tp-field.full{grid-column:1;}
          .tp-actions{flex-direction:column;}
          .tp-btn{width:100%;justify-content:center;}
          .tp-header-card{flex-direction:column;}
          .tp-aadhar-preview{display:none;}
        }
      `}</style>

      <div className="tp-wrap">
        {initialLoading ? (
          <div className="tp-loading-overlay">
            <div className="tp-loading-spinner" />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading your profile…</span>
          </div>
        ) : (
          <>
            {/* SEARCH */}
            <form className="tp-search-card" onSubmit={handleSearch}>
              <div className="tp-search-group">
                <label className="tp-search-lbl">Search Profile by Email</label>
                <input
                  className="tp-search-inp"
                  value={searchEmail}
                  onChange={e => { setSearchEmail(e.target.value); setSearchError(""); }}
                  placeholder="Enter registered email…"
                  type="email"
                />
                {searchError && <p className="tp-search-err">{searchError}</p>}
              </div>
              <button type="submit" className="tp-search-btn" disabled={searchLoading}>
                {searchLoading
                  ? <><span className="spin" style={{ borderTopColor: "var(--cream)" }} /> Loading…</>
                  : "Load Profile"
                }
              </button>
            </form>

            {/* TOASTS */}
            {successMsg && <div className="tp-toast tp-toast-ok">✓ {successMsg}</div>}
            {errorMsg   && <div className="tp-toast tp-toast-err">⚠ {errorMsg}</div>}
            {infoMsg    && <div className="tp-toast tp-toast-info">ℹ {infoMsg}</div>}

            {/* PROFILE HEADER */}
            {(emailid || sessionEmail || name) && (
              <div className="tp-header-card">
                <div className="tp-avatar-zone" onClick={() => fileInputRef.current?.click()}>
                  <div className="tp-avatar" style={profilePic ? { background: "none" } : {}}>
                    {profilePic
                      ? <img src={profilePic} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (name ? name[0].toUpperCase() : "?")}
                  </div>
                  <span className="tp-avatar-hint">Click to change photo</span>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePicChange} />
                </div>
                <div className="tp-header-info">
                  <p className="tp-hdr-eyebrow">Tailor Profile</p>
                  <div className="tp-hdr-name">{name || "New Profile"}</div>
                  {(emailid || sessionEmail) && (
                    <div style={{ fontSize: "0.85rem", color: "rgba(245,237,224,0.45)", marginBottom: "0.4rem" }}>
                      {emailid || sessionEmail}
                    </div>
                  )}
                  <div className="tp-hdr-meta">
                    <span className={`tp-hdr-status${isExistingUser ? "" : " new"}`}>
                      {isExistingUser ? "● Existing Profile" : "● New Profile"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AADHAAR SCAN ZONE */}
            <div
              className={`tp-aadhar-zone${aadharScanning ? " scanning" : ""}${aadharLocked ? " locked" : ""}`}
              onClick={() => !aadharScanning && !aadharLocked && aadharInputRef.current?.click()}
            >
              <div className="tp-aadhar-icon-wrap">
                {aadharScanning
                  ? <span className="tp-scan-spinner" />
                  : aadharLocked
                    ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 21h10M12 17v4"/><path d="M7 8h4M7 11h2"/>
                        <circle cx="16" cy="8" r="1.5" fill="#d4af37" stroke="none"/>
                      </svg>
                }
              </div>

              <div className="tp-aadhar-text" style={{ flex: 1 }}>
                <div className="tp-aadhar-title">
                  {aadharScanning
                    ? "Scanning Aadhaar…"
                    : aadharLocked
                      ? "Aadhaar Verified & Locked"
                      : "Upload Aadhaar Card — AI Auto-fill"
                  }
                </div>
                <div className="tp-aadhar-sub">
                  {aadharLocked
                    ? "Aadhaar number, date of birth, and gender are locked. Click Remove to re-scan."
                    : "Upload a photo of your Aadhaar card. AI will auto-extract Aadhaar number, date of birth, and gender."
                  }
                </div>
                {aadharScanMsg && (
                  <div className={`tp-aadhar-scan-msg ${aadharScanMsg.startsWith("✓") ? "ok" : "info"}`}>
                    {aadharScanMsg}
                  </div>
                )}
              </div>

              {/* Always show preview when locked and image exists */}
              {aadharImg && (
                <img src={aadharImg} className="tp-aadhar-preview" alt="Aadhaar preview" />
              )}

              {/* Clear lock button */}
              {aadharLocked && (
                <button
                  className="tp-aadhar-clear"
                  onClick={e => { e.stopPropagation(); clearAadharLock(); }}
                >
                  🗑 Remove
                </button>
              )}

              <input ref={aadharInputRef} type="file" accept="image/*" hidden onChange={handleAadharChange} />
            </div>

            {/* TABS */}
            <div className="tp-tabs">
              {(["personal", "professional", "contact"] as const).map(tab => (
                <button
                  key={tab}
                  className={`tp-tab${activeTab === tab ? " active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "personal"     && <>👤 Personal</>}
                  {tab === "professional" && <>🪡 Professional</>}
                  {tab === "contact"      && <>📱 Contact & More</>}
                </button>
              ))}
            </div>

            {/* PERSONAL TAB */}
            {activeTab === "personal" && (
              <div className="tp-sec">
                <div className="tp-sec-title">Personal Information</div>
                <div className="tp-grid">
                  <div className="tp-field full">
                    <label className="tp-lbl">Full Name *</label>
                    <input className={`tp-inp${nameErr ? " err" : ""}`} value={name} onChange={e => { setName(e.target.value); setNameErr(""); }} placeholder="Your full name" />
                    {nameErr && <span className="tp-ferr">{nameErr}</span>}
                  </div>

                  <div className="tp-field">
                    <label className="tp-lbl">
                      Aadhaar Number
                      {aadharLocked && <span className="tp-auto-badge">✓ AI filled</span>}
                    </label>
                    <input
                      className="tp-inp"
                      value={aadharno}
                      onChange={e => { if (!aadharLocked) setAadharno(e.target.value); }}
                      placeholder="12-digit number"
                      maxLength={12}
                      readOnly={aadharLocked}
                      style={aadharLocked ? lockedStyle : {}}
                    />
                    {aadharLocked
                      ? <span className="tp-locked-hint">🔒 Locked from Aadhaar scan</span>
                      : <span className="tp-hint">Optional — scanned from Aadhaar if uploaded</span>
                    }
                  </div>

                  <div className="tp-field">
                    <label className="tp-lbl">
                      Date of Birth
                      {aadharLocked && dob && <span className="tp-auto-badge">✓ AI filled</span>}
                    </label>
                    <input
                      type="date"
                      className="tp-inp"
                      value={dob}
                      onChange={e => { if (!aadharLocked) setDob(e.target.value); }}
                      readOnly={aadharLocked}
                      style={aadharLocked ? lockedStyle : {}}
                    />
                    {aadharLocked
                      ? <span className="tp-locked-hint">🔒 Locked from Aadhaar scan</span>
                      : <span className="tp-hint">Auto-filled from Aadhaar scan</span>
                    }
                  </div>

                  <div className="tp-field">
                    <label className="tp-lbl">
                      Gender
                      {aadharLocked && gender && <span className="tp-auto-badge">✓ AI filled</span>}
                    </label>
                    <select
                      className="tp-sel"
                      value={gender}
                      onChange={e => { if (!aadharLocked) setGender(e.target.value); }}
                      disabled={aadharLocked}
                      style={aadharLocked ? lockedStyle : {}}
                    >
                      <option value="">Select gender…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {aadharLocked && <span className="tp-locked-hint">🔒 Locked from Aadhaar scan</span>}
                  </div>

                  <div className="tp-field full">
                    <label className="tp-lbl">Address *</label>
                    <input className={`tp-inp${addressErr ? " err" : ""}`} value={address} onChange={e => { setAddress(e.target.value); setAddressErr(""); }} placeholder="Full residential address" />
                    {addressErr && <span className="tp-ferr">{addressErr}</span>}
                  </div>
                  <div className="tp-field">
                    <label className="tp-lbl">City *</label>
                    <select className={`tp-sel${cityErr ? " err" : ""}`} value={city} onChange={e => { setCity(e.target.value); setCityErr(""); }}>
                      <option value="">Select city…</option>
                      {indianCities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {cityErr && <span className="tp-ferr">{cityErr}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* PROFESSIONAL TAB */}
            {activeTab === "professional" && (
              <div className="tp-sec">
                <div className="tp-sec-title">Professional Details</div>
                <div className="tp-grid">
                  <div className="tp-field">
                    <label className="tp-lbl">Category *</label>
                    <select className={`tp-sel${categoryErr ? " err" : ""}`} value={category} onChange={e => { setCategory(e.target.value); setCategoryErr(""); }}>
                      <option value="">Select category…</option>
                      <option value="Men">👔 Men's Wear</option>
                      <option value="Women">👗 Women's Wear</option>
                      <option value="Children">🧒 Children's Wear</option>
                      <option value="Both">✂️ Men & Women</option>
                      <option value="All">🌟 All Categories</option>
                    </select>
                    {categoryErr && <span className="tp-ferr">{categoryErr}</span>}
                  </div>
                  <div className="tp-field">
                    <label className="tp-lbl">Speciality / Dress Type *</label>
                    <input className={`tp-inp${splErr ? " err" : ""}`} value={spl} onChange={e => { setSpl(e.target.value); setSplErr(""); }} placeholder="e.g. Sherwani, Lehenga, Suit…" />
                    {splErr && <span className="tp-ferr">{splErr}</span>}
                    <span className="tp-hint">e.g. Sherwani, Saree Blouse, Kurta, Coat</span>
                  </div>
                  <div className="tp-field">
                    <label className="tp-lbl">In Business Since *</label>
                    <input className={`tp-inp${sinceErr ? " err" : ""}`} value={since} onChange={e => { setSince(e.target.value); setSinceErr(""); }} placeholder="e.g. 2010" maxLength={4} />
                    {sinceErr && <span className="tp-ferr">{sinceErr}</span>}
                  </div>
                  <div className="tp-field">
                    <label className="tp-lbl">Work Type *</label>
                    <select className={`tp-sel${worktypeErr ? " err" : ""}`} value={worktype} onChange={e => { setWorktype(e.target.value); setWorktypeErr(""); }}>
                      <option value="">Select work type…</option>
                      <option value="Home">🏠 Home Visit</option>
                      <option value="Shop">🏪 Shop / Studio</option>
                      <option value="Both">🔀 Home & Shop</option>
                    </select>
                    {worktypeErr && <span className="tp-ferr">{worktypeErr}</span>}
                  </div>
                  {(worktype === "Shop" || worktype === "Both") && (
                    <>
                      <div className="tp-field full">
                        <label className="tp-lbl">Shop Address</label>
                        <input className="tp-inp" value={shopadr} onChange={e => setShopadr(e.target.value)} placeholder="Full shop/studio address" />
                      </div>
                      <div className="tp-field">
                        <label className="tp-lbl">Shop City</label>
                        <select className="tp-sel" value={shopcity} onChange={e => setShopcity(e.target.value)}>
                          <option value="">Select city…</option>
                          {indianCities.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <div className="tp-field full">
                    <label className="tp-lbl">Other Info</label>
                    <textarea
                      className="tp-inp" rows={3}
                      value={otherinfo} onChange={e => setOtherinfo(e.target.value)}
                      placeholder="Any additional information about your services…"
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT TAB */}
            {activeTab === "contact" && (
              <div className="tp-sec">
                <div className="tp-sec-title">Contact Details</div>
                <div className="tp-grid">
                  <div className="tp-field">
                    <label className="tp-lbl">Mobile Number *</label>
                    <input className={`tp-inp${contactErr ? " err" : ""}`} value={contact} onChange={e => { setContact(e.target.value); setContactErr(""); }} placeholder="10-digit mobile number" maxLength={10} />
                    {contactErr && <span className="tp-ferr">{contactErr}</span>}
                    <span className="tp-hint">Used by customers to find and review you</span>
                  </div>
                  <div className="tp-field">
                    <label className="tp-lbl">Social / Website Link</label>
                    <input className="tp-inp" value={social} onChange={e => setSocial(e.target.value)} placeholder="Instagram, Facebook, or website URL" />
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            {(emailid || sessionEmail || name || isExistingUser) && (
              <div className="tp-actions">
                {!isExistingUser ? (
                  <button className="tp-btn tp-btn-save" onClick={handleSave} disabled={loading}>
                    {loading ? <><span className="spin spin-dark" style={{ borderTopColor: "var(--ink)" }} /> Saving…</> : "Save Profile"}
                  </button>
                ) : (
                  <button className="tp-btn tp-btn-update" onClick={handleUpdate} disabled={loading}>
                    {loading ? <><span className="spin" /> Updating…</> : "Update Profile"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}