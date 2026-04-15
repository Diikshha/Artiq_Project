import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const STAR_COLORS = ["", "#e74c3c", "#e67e22", "#f0b040", "#8bc34a", "#27ae60"];
const MAX_CHARS   = 300;
const API         = "${import.meta.env.VITE_API_URL}/user";
type Screen       = "form" | "success";

const CELEBRATIONS = [
  { emoji: "🎉", line1: "Review Published!",     line2: "You're helping the craft community grow."  },
  { emoji: "✂️", line1: "Stitched with honesty!", line2: "Your words will guide future customers."  },
  { emoji: "🏆", line1: "Community Hero!",        line2: "Honest reviews make great tailors shine." },
  { emoji: "💛", line1: "Thank you!",             line2: "You've made a tailor's day brighter."     },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CANVAS PARTY POPPER PHYSICS
───────────────────────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  "#d4af37","#f5ede0","#2c1f10","#27ae60","#e74c3c",
  "#3498db","#e67e22","#f8d347","#ff6b9d","#a855f7","#06b6d4",
];

interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; shape: 0|1|2|3; // rect|circle|ribbon|star
  w: number; h: number;
  rot: number; rotV: number;
  alpha: number; fadeDelay: number;
  grav: number; wobble: number; wobbleV: number;
}

function makeBurst(ox: number, oy: number, count: number, baseAngle: number, spread: number): Particle[] {
  return Array.from({ length: count }, () => {
    const a = baseAngle + (Math.random() - 0.5) * spread;
    const s = 4 + Math.random() * 13;
    return {
      x: ox, y: oy, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
      color:      CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
      shape:      Math.floor(Math.random()*4) as 0|1|2|3,
      w: 5 + Math.random()*9, h: 3 + Math.random()*7,
      rot: Math.random()*Math.PI*2, rotV: (Math.random()-0.5)*0.24,
      alpha: 1, fadeDelay: 18 + Math.floor(Math.random()*20),
      grav: 0.16 + Math.random()*0.14,
      wobble: Math.random()*Math.PI*2, wobbleV: 0.04 + Math.random()*0.09,
    };
  });
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const ri = i % 2 === 0 ? r : r * 0.42;
    i === 0 ? ctx.moveTo(Math.cos(a)*ri, Math.sin(a)*ri)
            : ctx.lineTo(Math.cos(a)*ri, Math.sin(a)*ri);
  }
  ctx.closePath(); ctx.fill();
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function RateAndReview() {
  const [screen,     setScreen]     = useState<Screen>("form");
  const [mobile,     setMobile]     = useState("");
  const [tailorName, setTailorName] = useState("");
  const [tailorCity, setTailorCity] = useState("");
  const [nameStatus, setNameStatus] = useState<"idle"|"loading"|"found"|"notfound">("idle");
  const [star,       setStar]       = useState(0);
  const [hoverStar,  setHoverStar]  = useState(0);
  const [review,     setReview]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mobileErr,  setMobileErr]  = useState("");
  const [starErr,    setStarErr]    = useState("");
  const [reviewErr,  setReviewErr]  = useState("");
  const [subStar,    setSubStar]    = useState(0);
  const [subText,    setSubText]    = useState("");
  const [subName,    setSubName]    = useState("");
  const [celeb,      setCeleb]      = useState(CELEBRATIONS[0]);

  const mobileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptcls     = useRef<Particle[]>([]);
  const raf       = useRef<number>(0);
  const alive     = useRef(false);
  const tick      = useRef(0);

  /* ── Lookup ── */
  async function handleMobileBlur() {
    if (mobile.length !== 10) return;
    setNameStatus("loading"); setTailorName(""); setTailorCity("");
    try {
      const res  = await fetch(`${API}/getTailorByMobile`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (data.status) { setTailorName(data.name); setTailorCity(data.city||""); setNameStatus("found"); setMobileErr(""); }
      else             { setTailorName(data.message||"Not found"); setNameStatus("notfound"); }
    } catch { setTailorName("Server not reachable"); setNameStatus("notfound"); }
  }

  /* ── Submit ── */
  async function handleSubmit() {
    let ok = true;
    setMobileErr(""); setStarErr(""); setReviewErr("");
    if (mobile.length !== 10)   { setMobileErr("Enter a valid 10-digit number."); ok = false; }
    if (nameStatus !== "found") { setMobileErr("Verify a tailor before submitting."); ok = false; }
    if (star === 0)             { setStarErr("Please select a star rating."); ok = false; }
    if (!review.trim())         { setReviewErr("Please write your review."); ok = false; }
    if (!ok) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/saveReview`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mobile, star, review: review.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubStar(star); setSubText(review.trim()); setSubName(tailorName);
        setCeleb(CELEBRATIONS[Math.floor(Math.random()*CELEBRATIONS.length)]);
        setScreen("success");
        setTimeout(firePoppers, 80);
      } else { setReviewErr(data.message||"Failed to publish."); }
    } catch { setReviewErr("Cannot connect to server."); }
    finally  { setSubmitting(false); }
  }

  /* ── Party Poppers ── */
  function firePoppers() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || 420;
    canvas.height = canvas.offsetHeight || 500;
    const W = canvas.width, H = canvas.height;
    tick.current = 0;

    // Wave 1: two bottom-corner poppers + center burst
    ptcls.current = [
      ...makeBurst(W*0.04, H*0.98, 75, -Math.PI*0.62, Math.PI*0.55),  // BL popper
      ...makeBurst(W*0.96, H*0.98, 75, -Math.PI*0.38, Math.PI*0.55),  // BR popper
      ...makeBurst(W*0.5,  H*0.52, 55, -Math.PI/2,    Math.PI*0.8),   // center
    ];

    alive.current = true;
    cancelAnimationFrame(raf.current);
    loop();

    // Wave 2: second popper burst
    setTimeout(() => {
      if (!alive.current) return;
      ptcls.current.push(
        ...makeBurst(W*0.1,  H*0.9,  50, -Math.PI*0.58, Math.PI*0.5),
        ...makeBurst(W*0.9,  H*0.9,  50, -Math.PI*0.42, Math.PI*0.5),
        ...makeBurst(W*0.25, H*0.05, 30,  Math.PI*0.55, Math.PI*0.6),
        ...makeBurst(W*0.75, H*0.05, 30,  Math.PI*0.45, Math.PI*0.6),
      );
    }, 550);

    // Wave 3: finale shower
    setTimeout(() => {
      if (!alive.current) return;
      ptcls.current.push(
        ...makeBurst(W*0.5, H*0.05, 80, Math.PI*0.5, Math.PI*1.6),
      );
    }, 1100);

    setTimeout(() => { alive.current = false; }, 5000);
  }

  function loop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx)   return;
    tick.current++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ptcls.current = ptcls.current.filter(p => p.alpha > 0.01);

    for (const p of ptcls.current) {
      p.wobble += p.wobbleV;
      p.x      += p.vx + Math.sin(p.wobble) * 1.8;
      p.y      += p.vy;
      p.vy     += p.grav;
      p.vx     *= 0.993;
      p.rot    += p.rotV;
      if (tick.current > p.fadeDelay) p.alpha -= 0.007;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle   = p.color;
      ctx.strokeStyle = p.color;

      switch (p.shape) {
        case 1: // circle
          ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill();
          break;
        case 2: // ribbon
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-p.w/2, 0);
          ctx.bezierCurveTo(-p.w/4,-p.h*1.3, p.w/4,p.h*1.3, p.w/2, 0);
          ctx.stroke();
          break;
        case 3: // star
          drawStar(ctx, p.w/2);
          break;
        default: // rect
          ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      }
      ctx.restore();
    }

    if (ptcls.current.length > 0) {
      raf.current = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  useEffect(() => () => { cancelAnimationFrame(raf.current); alive.current = false; }, []);

  /* ── Reset ── */
  function handleReset() {
    cancelAnimationFrame(raf.current); alive.current = false;
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext("2d"); ctx?.clearRect(0,0,canvas.width,canvas.height); }
    setScreen("form"); setMobile(""); setTailorName(""); setTailorCity("");
    setNameStatus("idle"); setStar(0); setHoverStar(0); setReview("");
    setMobileErr(""); setStarErr(""); setReviewErr("");
    setTimeout(()=>mobileRef.current?.focus(), 80);
  }

  const disp = hoverStar || star;

  /* ─────────────────────────────────────────────────────────────────────────
     JSX
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .rr-page{min-height:100vh;background:#eddfcc;font-family:'Jost',sans-serif}

        /* HERO */
        .rr-hero{position:relative;height:420px;overflow:hidden}
        .rr-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(158deg,rgba(20,12,5,.9) 0%,rgba(44,31,16,.44) 50%,rgba(20,12,5,.92) 100%),url("https://i.pinimg.com/1200x/47/8f/38/478f38120b17e068d5e0a00b1ee95f27.jpg") center/cover no-repeat}
        .rr-hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to bottom,transparent,#eddfcc)}
        .rr-hero-inner{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;gap:.28rem}
        .hero-icon{font-size:2.2rem;margin-bottom:.15rem}
        .hero-tag{font-size:.8rem;letter-spacing:.28em;text-transform:uppercase;color:#d4af37;font-weight:500;display:flex;align-items:center;gap:.65rem}
        .hero-tag::before,.hero-tag::after{content:'';width:38px;height:1px;background:rgba(212,175,55,.45)}
        .hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2.6rem,5.5vw,5rem);font-weight:600;color:#f5ede0;line-height:1.04}
        .hero-title em{font-style:italic;color:#d4af37}
        .hero-sub{font-size:.92rem;color:rgba(245,237,224,.62);letter-spacing:.05em}

        /* OUTER */
        .rr-outer{max-width:1060px;margin:0 auto;padding:0 1.4rem 4rem}

        /* FINDER */
        .finder-card{background:#faf6f0;border-radius:18px;box-shadow:0 4px 28px rgba(44,31,16,.11);margin-top:-58px;position:relative;z-index:10;padding:1.6rem 2rem 1.5rem;margin-bottom:1.6rem;overflow:hidden}
        .finder-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3.5px;background:linear-gradient(90deg,transparent 3%,#d4af37 26%,#d4af37 74%,transparent 97%)}
        .finder-row{display:flex;align-items:flex-start;gap:1.6rem}
        .finder-main{flex:1}
        .field-lbl{font-size:.74rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#5a4233;margin-bottom:.45rem;display:flex;align-items:center;gap:.4rem}
        .field-lbl svg{color:#b89060}
        .finder-ig{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
        .finder-wrap{position:relative}
        .finder-input{padding:.76rem 2.6rem .76rem 2.5rem;border:1.5px solid #e0d0bc;border-radius:10px;background:#fff;font-family:'Jost',sans-serif;font-size:.92rem;color:#2c1f10;outline:none;width:240px;transition:border-color .2s,box-shadow .2s}
        .finder-input::placeholder{color:#c0a880;font-weight:300}
        .finder-input:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.13)}
        .finder-input.err{border-color:#c0392b}
        .fi-l{position:absolute;left:.78rem;top:50%;transform:translateY(-50%);color:#b89060;display:flex;pointer-events:none}
        @keyframes fspin{to{transform:translateY(-50%) rotate(360deg)}}
        .spin-xs{width:13px;height:13px;border:2px solid rgba(139,94,47,.2);border-top-color:#b89060;border-radius:50%;animation:fspin .7s linear infinite;position:absolute;right:.78rem;top:50%;transform:translateY(-50%)}
        .ferr{font-size:.71rem;color:#c0392b;margin-top:.28rem;display:flex;align-items:center;gap:.22rem}
        @keyframes chipIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .tailor-chip{display:flex;align-items:center;gap:.6rem;padding:.44rem 1rem .44rem .7rem;border-radius:100px;animation:chipIn .24s ease}
        .tailor-chip.found{background:rgba(39,174,96,.1);border:1.5px solid rgba(39,174,96,.3)}
        .tailor-chip.notfound{background:rgba(192,57,43,.07);border:1.5px solid rgba(192,57,43,.22)}
        .chip-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#b8952a);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#2c1f10;flex-shrink:0}
        .chip-info{display:flex;flex-direction:column}
        .chip-name{font-family:'Cormorant Garamond',serif;font-size:.98rem;font-weight:600;color:#2c1f10;line-height:1.2}
        .chip-sub{font-size:.62rem;font-weight:500;letter-spacing:.06em}
        .chip-sub.ok{color:#1e8449}.chip-sub.er{color:#c0392b}
        .finder-tips{flex-shrink:0;padding-left:1.5rem;border-left:1.5px solid #e8d8c4}
        .finder-tips-title{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#b89060;margin-bottom:.5rem}
        .finder-tips-list{list-style:none;display:flex;flex-direction:column;gap:.28rem}
        .finder-tips-list li{font-size:.74rem;color:#9a8070;font-weight:300;display:flex;gap:.4rem;line-height:1.45}
        .finder-tips-list li::before{content:'·';color:#d4af37;font-size:1.1rem;line-height:1;flex-shrink:0}

        /* GRID */
        .rr-grid{display:grid;grid-template-columns:1fr 430px;gap:1.6rem;align-items:start}

        /* CARD WRAP — needed so canvas can overlay */
        .card-wrap{position:relative}
        .party-canvas{position:absolute;inset:0;pointer-events:none;z-index:200;border-radius:20px;width:100%;height:100%}

        .rr-card{background:#faf6f0;border-radius:20px;box-shadow:0 6px 36px rgba(44,31,16,.1);overflow:hidden}
        .card-bar{height:4px;background:linear-gradient(90deg,transparent 5%,#d4af37 28%,#d4af37 72%,transparent 95%)}
        .card-body{padding:1.8rem 2rem 2rem}
        .sec-head{display:flex;align-items:center;gap:.7rem;margin-bottom:1.5rem}
        .sec-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,.28),rgba(212,175,55,.14));border:1px solid rgba(212,175,55,.45);display:flex;align-items:center;justify-content:center;color:#8b5e2f;flex-shrink:0}
        .sec-title{font-family:'Cormorant Garamond',serif;font-size:1.28rem;font-weight:600;color:#2c1f10}
        .sec-line{flex:1;height:1.5px;background:#e8d8c4}

        /* STARS */
        .stars-section{margin-bottom:1.3rem}
        .stars-row{display:flex;align-items:center;gap:.1rem;padding:.65rem .9rem;margin-top:.35rem;background:#fff;border:1.5px solid #e0d0bc;border-radius:12px;transition:border-color .2s}
        .stars-row:hover{border-color:rgba(212,175,55,.5)}
        .star-btn{background:none;border:none;cursor:pointer;padding:.05rem;transition:transform .12s;line-height:0}
        .star-btn:hover{transform:scale(1.2)}
        .star-sep{width:1px;height:26px;background:#e8d8c4;margin:0 .6rem;flex-shrink:0}
        .star-meta{display:flex;flex-direction:column}
        .star-meta-lbl{font-family:'Cormorant Garamond',serif;font-size:.95rem;font-weight:600;line-height:1.1}
        .star-meta-sub{font-size:.62rem;color:#b89060;letter-spacing:.06em;text-transform:uppercase}

        /* TEXTAREA */
        .field-block{margin-bottom:1.2rem}
        .rr-textarea{width:100%;padding:.78rem 1rem;margin-top:.3rem;border:1.5px solid #e0d0bc;border-radius:10px;background:#fff;font-family:'Jost',sans-serif;font-size:.88rem;color:#2c1f10;outline:none;resize:none;height:115px;line-height:1.68;transition:border-color .2s,box-shadow .2s}
        .rr-textarea::placeholder{color:#c0a880;font-weight:300}
        .rr-textarea:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.12)}
        .rr-textarea.err{border-color:#c0392b}
        .char-row{display:flex;justify-content:flex-end;margin-top:.22rem}
        .char-ct{font-size:.65rem;color:#b89060;font-weight:300}
        .char-ct.warn{color:#c0392b}

        /* SUBMIT */
        .btn-publish{width:100%;padding:.9rem 1rem;background:linear-gradient(135deg,#2c1f10,#4a2e14);color:#f5ede0;border:none;border-radius:100px;font-family:'Jost',sans-serif;font-size:.8rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:all .25s;box-shadow:0 4px 18px rgba(44,31,16,.2);display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-publish:hover{background:linear-gradient(135deg,#d4af37,#b8952a);color:#2c1f10;box-shadow:0 6px 24px rgba(212,175,55,.38);transform:translateY(-2px)}
        .btn-publish:active{transform:translateY(0)}
        .btn-publish:disabled{opacity:.5;cursor:not-allowed;transform:none}
        @keyframes bs{to{transform:rotate(360deg)}}
        .btn-spin{width:13px;height:13px;border:2px solid rgba(245,237,224,.3);border-top-color:#f5ede0;border-radius:50%;animation:bs .7s linear infinite}

        /* LEFT INFO */
        .info-panel{display:flex;flex-direction:column;gap:1.3rem;padding-top:.3rem}
        .how-card{background:#faf6f0;border-radius:18px;box-shadow:0 3px 18px rgba(44,31,16,.08);padding:1.5rem 1.6rem;position:relative;overflow:hidden}
        .how-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(to bottom,#d4af37,rgba(212,175,55,.08))}
        .how-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:#2c1f10;margin-bottom:1.1rem;padding-left:.6rem}
        .how-step{display:flex;align-items:flex-start;gap:.85rem;margin-bottom:.9rem;padding-left:.6rem}
        .how-step:last-child{margin-bottom:0}
        .how-num{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#b8952a);display:flex;align-items:center;justify-content:center;font-size:.66rem;font-weight:700;color:#2c1f10;flex-shrink:0;margin-top:1px}
        .how-text h4{font-size:.84rem;font-weight:600;color:#2c1f10;margin-bottom:.1rem}
        .how-text p{font-size:.73rem;color:#9a8070;font-weight:300;line-height:1.5}
        .dark-card{background:linear-gradient(135deg,#2c1f10,#3d2710);border-radius:18px;padding:1.4rem 1.6rem;position:relative;overflow:hidden}
        .dark-card::after{content:'✂';position:absolute;right:1rem;bottom:-.2rem;font-size:5.5rem;opacity:.05;color:#d4af37;pointer-events:none}
        .dark-title{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:500;color:#d4af37;margin-bottom:.65rem;display:flex;align-items:center;gap:.4rem}
        .dark-list{list-style:none;display:flex;flex-direction:column;gap:.32rem}
        .dark-list li{font-size:.74rem;color:rgba(245,237,224,.65);font-weight:300;line-height:1.5;display:flex;gap:.45rem}
        .dark-list li::before{content:'—';color:#d4af37;flex-shrink:0}

        /* ══ SUCCESS ══ */
        @keyframes popIn{0%{transform:scale(.82);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes ripOut{0%{transform:scale(.5);opacity:.85}100%{transform:scale(3.2);opacity:0}}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes badgePop{0%{transform:scale(0) rotate(-18deg);opacity:0}55%{transform:scale(1.18) rotate(6deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        .success-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;padding:.4rem 0 .2rem;animation:popIn .42s cubic-bezier(.34,1.4,.64,1)}
        .badge-zone{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;animation:badgePop .55s cubic-bezier(.34,1.5,.64,1) .08s both}
        .ripple{position:absolute;width:72px;height:72px;border-radius:50%;border:2px solid rgba(212,175,55,.6);animation:ripOut 1.7s ease-out infinite;pointer-events:none}
        .ripple:nth-child(2){animation-delay:.55s;border-color:rgba(212,175,55,.35)}
        .ripple:nth-child(3){animation-delay:1.1s;border-color:rgba(212,175,55,.18)}
        .success-badge{position:relative;z-index:2;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(212,175,55,.22),rgba(212,175,55,.06));border:2px solid rgba(212,175,55,.42);display:flex;align-items:center;justify-content:center;font-size:2.2rem;box-shadow:0 8px 30px rgba(212,175,55,.22);animation:bob 3s ease-in-out .65s infinite}
        .success-title{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;color:#2c1f10;margin-bottom:.16rem;animation:up .45s ease .28s both}
        .success-sub{font-size:.84rem;color:#9a8070;font-weight:300;line-height:1.65;margin-bottom:.8rem;animation:up .45s ease .4s both}
        .success-sub strong{color:#2c1f10;font-weight:600;font-family:'Cormorant Garamond',serif;font-size:.96rem}
        .chips-row{display:flex;gap:.45rem;flex-wrap:wrap;justify-content:center;margin-bottom:.85rem;animation:up .4s ease .5s both}
        .chip{padding:.26rem .65rem;border-radius:100px;font-size:.67rem;font-weight:500;letter-spacing:.05em;display:flex;align-items:center;gap:.25rem}
        .c-gold{background:rgba(212,175,55,.12);border:1.5px solid rgba(212,175,55,.35);color:#7a5510}
        .c-green{background:rgba(39,174,96,.1);border:1.5px solid rgba(39,174,96,.28);color:#1a6b36}
        .c-dark{background:rgba(44,31,16,.07);border:1.5px solid rgba(44,31,16,.18);color:#5a4233}
        .src-card{width:100%;background:#fff;border-radius:14px;border:1.5px solid #e8d8c4;padding:1rem 1.1rem;margin-bottom:.85rem;text-align:left;box-shadow:0 2px 12px rgba(44,31,16,.06);position:relative;overflow:hidden;animation:up .45s ease .6s both}
        .src-card::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(212,175,55,.13) 50%,transparent 62%);background-size:250% 100%;animation:shimmer 2s ease .85s 3}
        .src-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.55rem}
        .src-tailor{display:flex;align-items:center;gap:.5rem}
        .src-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#d4af37,#b8952a);display:flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:700;color:#2c1f10;flex-shrink:0}
        .src-name{font-family:'Cormorant Garamond',serif;font-size:.96rem;font-weight:600;color:#2c1f10}
        .src-stars{display:flex;gap:.12rem}
        .src-text{font-size:.79rem;font-style:italic;font-weight:300;color:#9a8070;line-height:1.6}
        .src-text::before{content:'"'}.src-text::after{content:'"'}
        .btn-another{width:100%;padding:.88rem 1rem;background:linear-gradient(135deg,#d4af37,#b8952a);color:#2c1f10;border:none;border-radius:100px;font-family:'Jost',sans-serif;font-size:.8rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:all .25s;box-shadow:0 4px 16px rgba(212,175,55,.28);display:flex;align-items:center;justify-content:center;gap:.45rem;animation:up .45s ease .72s both}
        .btn-another:hover{background:linear-gradient(135deg,#2c1f10,#4a2e14);color:#f5ede0;transform:translateY(-2px);box-shadow:0 6px 22px rgba(44,31,16,.28)}
        .btn-another:active{transform:translateY(0)}

        /* RESPONSIVE */
        @media(max-width:820px){.rr-grid{grid-template-columns:1fr}.info-panel{display:none}.finder-tips{display:none}}
        @media(max-width:520px){.card-body{padding:1.4rem 1.2rem 1.6rem}.finder-card{padding:1.2rem;margin-top:-28px}.finder-input{width:100%}}
      `}</style>

      <div className="rr-page">

        {/* HERO */}
        <div className="rr-hero">
          <div className="rr-hero-inner">
            <div className="hero-icon">⭐</div>
            <p className="hero-tag">Artiq Platform</p>
            <h1 className="hero-title">Rate &amp; <em>Review</em></h1>
            <p className="hero-sub">Your honest words help great tailors shine</p>
          </div>
        </div>

        <div className="rr-outer">

          {/* FINDER */}
          <div className="finder-card">
            <div className="finder-row">
              <div className="finder-main">
                <p className="field-lbl">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Find Tailor by Mobile Number
                </p>
                <div className="finder-ig">
                  <div className="finder-wrap">
                    <span className="fi-l">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 19.8 19.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45 19.8 19.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </span>
                    <input
                      ref={mobileRef}
                      className={`finder-input${mobileErr?" err":""}`}
                      type="tel" placeholder="Enter 10-digit number" maxLength={10}
                      value={mobile}
                      onChange={e=>{setMobile(e.target.value.replace(/\D/g,""));setMobileErr("");setTailorName("");setNameStatus("idle");}}
                      onBlur={handleMobileBlur}
                    />
                    {nameStatus==="loading" && <div className="spin-xs"/>}
                  </div>

                  {nameStatus==="found" && (
                    <div className="tailor-chip found">
                      <div className="chip-avatar">{tailorName.charAt(0).toUpperCase()}</div>
                      <div className="chip-info">
                        <span className="chip-name">{tailorName}</span>
                        <span className="chip-sub ok">✓ Verified Tailor{tailorCity?` · ${tailorCity}`:""}</span>
                      </div>
                    </div>
                  )}
                  {nameStatus==="notfound" && (
                    <div className="tailor-chip notfound">
                      <div className="chip-info">
                        <span className="chip-name" style={{color:"#c0392b"}}>Not Found</span>
                        <span className="chip-sub er">No tailor with this number</span>
                      </div>
                    </div>
                  )}
                </div>
                {mobileErr && <p className="ferr">● {mobileErr}</p>}
              </div>

              <div className="finder-tips">
                <p className="finder-tips-title">Quick Tips</p>
                <ul className="finder-tips-list">
                  <li>Enter the tailor's registered mobile number</li>
                  <li>Name appears automatically after verification</li>
                  <li>Only registered Artiq tailors can be reviewed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="rr-grid">

            {/* LEFT */}
            <div className="info-panel">
              <div className="how-card">
                <p className="how-title">How to write a review</p>
                {[
                  ["Verify the Tailor","Enter their mobile number above — name appears instantly once found."],
                  ["Rate the Experience","Pick 1–5 stars based on quality, punctuality, and communication."],
                  ["Write & Publish","Share honest details — what went great, what could improve."],
                ].map(([h,p],i)=>(
                  <div className="how-step" key={i}>
                    <div className="how-num">{i+1}</div>
                    <div className="how-text"><h4>{h}</h4><p>{p}</p></div>
                  </div>
                ))}
              </div>
              <div className="dark-card">
                <p className="dark-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Why Your Review Matters
                </p>
                <ul className="dark-list">
                  {["Helps skilled tailors earn more customers","Guides new customers to the right craftsman","Builds an honest, trusted platform","Motivates tailors to always do their best"].map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
              </div>
            </div>

            {/* RIGHT — canvas wraps the card */}
            <div className="card-wrap">
              <canvas ref={canvasRef} className="party-canvas"/>
              <div className="rr-card">
                <div className="card-bar"/>
                <div className="card-body">

                  <div className="sec-head">
                    <div className="sec-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                    <span className="sec-title">{screen==="form"?"Write a Review":"Published!"}</span>
                    <div className="sec-line"/>
                  </div>

                  {/* FORM */}
                  {screen==="form" && (
                    <>
                      <div className="stars-section">
                        <span className="field-lbl" style={{marginBottom:0}}>Your Rating</span>
                        <div className="stars-row">
                          {[1,2,3,4,5].map(n=>(
                            <button key={n} type="button" className="star-btn"
                              onMouseEnter={()=>setHoverStar(n)} onMouseLeave={()=>setHoverStar(0)}
                              onClick={()=>{setStar(n);setStarErr("");}}>
                              <svg width="38" height="38" viewBox="0 0 24 24" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
                                fill={n<=disp?STAR_COLORS[disp]:"none"} stroke={n<=disp?STAR_COLORS[disp]:"#d8c8b4"}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            </button>
                          ))}
                          {disp>0&&<><div className="star-sep"/>
                            <div className="star-meta">
                              <span className="star-meta-lbl" style={{color:STAR_COLORS[disp]}}>{STAR_LABELS[disp]}</span>
                              <span className="star-meta-sub">{disp} / 5 stars</span>
                            </div></>}
                        </div>
                        {starErr && <p className="ferr">● {starErr}</p>}
                      </div>

                      <div className="field-block">
                        <span className="field-lbl" style={{marginBottom:0}}>Your Review</span>
                        <textarea className={`rr-textarea${reviewErr?" err":""}`}
                          placeholder="Share details about quality of work, stitching precision, delivery time, communication, and overall experience…"
                          maxLength={MAX_CHARS} value={review}
                          onChange={e=>{setReview(e.target.value);setReviewErr("");}}/>
                        <div className="char-row">
                          <span className={`char-ct${review.length>260?" warn":""}`}>{review.length}/{MAX_CHARS}</span>
                        </div>
                        {reviewErr && <p className="ferr">● {reviewErr}</p>}
                      </div>

                      <button className="btn-publish" disabled={submitting} onClick={handleSubmit}>
                        {submitting
                          ? <><div className="btn-spin"/> Publishing…</>
                          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Publish Review</>}
                      </button>
                    </>
                  )}

                  {/* SUCCESS */}
                  {screen==="success" && (
                    <div className="success-wrap">

                      {/* Floating badge + 3 expanding rings */}
                      <div className="badge-zone">
                        {/* <div className="ripple"/><div className="ripple"/><div className="ripple"/> */}
                        <div className="success-badge">{celeb.emoji}</div>
                      </div>

                      <h2 className="success-title">{celeb.line1}</h2>
                      <p className="success-sub">{celeb.line2}<br/>You reviewed <strong>{subName}</strong>.</p>

                      <div className="chips-row">
                        <span className="chip c-gold">🎊 Review Live</span>
                        <span className="chip c-green">✓ Verified</span>
                        <span className="chip c-dark">✂️ Artiq</span>
                      </div>

                      {/* Review preview with shimmer */}
                      <div className="src-card">
                        <div className="src-top">
                          <div className="src-tailor">
                            <div className="src-avatar">{subName.charAt(0).toUpperCase()}</div>
                            <span className="src-name">{subName}</span>
                          </div>
                          <div className="src-stars">
                            {[1,2,3,4,5].map(n=>(
                              <svg key={n} width="14" height="14" viewBox="0 0 24 24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                                fill={n<=subStar?STAR_COLORS[subStar]:"none"} stroke={n<=subStar?STAR_COLORS[subStar]:"#d8c8b4"}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="src-text">{subText}</p>
                      </div>

                      <button className="btn-another" onClick={handleReset}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Write Another Review
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}