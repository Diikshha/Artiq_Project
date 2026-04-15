// src/components/Home.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── animated counter that triggers on scroll into view ─── */
function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const s = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - s) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * to));
          if (p < 1) requestAnimationFrame(tick); else setVal(to);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ tailors: 0, cities: 0, reviews: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [citRes, tailorRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/user/findtailor/cities`),
          fetch(`${import.meta.env.VITE_API_URL}/user/findtailor/find-tailors`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 1, limit: 1 }),
          }),
        ]);
        const citData = await citRes.json();
        const tailorData = await tailorRes.json();
        const cityCount: number = citData.status ? citData.cities.length : 0;
        setStats({ tailors: tailorData.total ?? 0, cities: cityCount, reviews: (tailorData.total ?? 0) * 2 });
      } catch { /* backend offline */ }
      finally { setLoadingStats(false); }
    }
    loadData();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        :root{
          --ink:#1a1410; --ink2:#2c1f10; --cream:#faf6f0; --sand:#eddfcc;
          --gold:#d4af37; --gold2:#b8952a; --brown:#8b5e2f; --muted:#7a6248;
        }
        .home{font-family:'Jost',sans-serif;background:var(--ink);color:var(--cream);overflow-x:hidden;}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 3.5rem;height:70px;background:rgba(20,15,10,0.72);backdrop-filter:blur(18px);border-bottom:1px solid rgba(212,175,55,0.1);}
        .nav-logo{display:flex;align-items:center;gap:0.5rem;cursor:pointer;}
        .nav-logo-name{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:600;color:var(--cream);letter-spacing:0.05em;}
        .nav-logo-name span{color:var(--gold);font-style:italic;}
        .nav-links{display:flex;align-items:center;gap:0.5rem;}
        .nbtn{padding:0.5rem 1.3rem;border-radius:7px;font-family:'Jost',sans-serif;font-size:0.82rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;transition:all 0.22s;}
        .nbtn-ghost{background:transparent;border:1.5px solid rgba(212,175,55,0.35);color:rgba(245,237,224,0.75);}
        .nbtn-ghost:hover{border-color:var(--gold);color:var(--gold);background:rgba(212,175,55,0.08);}
        .nbtn-fill{background:var(--gold);border:1.5px solid var(--gold);color:var(--ink2);font-weight:600;}
        .nbtn-fill:hover{background:var(--gold2);border-color:var(--gold2);transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,175,55,0.35);}

        /* HERO */
        .hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .hero-bg{position:absolute;inset:0;background:linear-gradient(160deg,rgba(20,15,10,0.6) 0%,rgba(20,15,10,0.85) 55%,rgba(20,15,10,0.65) 100%),url("https://i.pinimg.com/736x/c7/82/b4/c782b42e342cf4beb1d674fce8351471.jpg") center/cover no-repeat;}
        .hero-grain{position:absolute;inset:0;opacity:0.045;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px;}
        // .hero-accent{position:absolute;top:0;right:28%;width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(212,175,55,0.15),transparent);}
        .hero-content{position:relative;z-index:2;text-align:center;padding:0 1.5rem;max-width:1000px;animation:fadeUp 1s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        // .hero-kicker{display:inline-flex;align-items:center;gap:0.8rem;font-size:0.72rem;letter-spacing:0.32em;text-transform:uppercase;color:var(--gold);font-weight:500;margin-bottom:1.8rem;animation:fadeUp 1s 0.1s ease both;}
        // .hero-kicker-line{width:2.5rem;height:1px;background:var(--gold);opacity:0.55;}
        .hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(4rem,6.5vw,8.5rem);font-weight:400;line-height:0.94;color:var(--cream);margin-bottom:1.5rem;letter-spacing:-0.02em;animation:fadeUp 1s 0.2s ease both;}
        .hero-h1 em{font-style:italic;color:var(--gold);}
        .hero-h1 .thin{font-weight:300;}
        .hero-sub{font-size:clamp(1rem,1.8vw,1.2rem);color:rgba(245,237,224,0.62);font-weight:300;line-height:1.8;letter-spacing:0.02em;max-width:560px;margin:0 auto 3rem;animation:fadeUp 1s 0.3s ease both;}
        .hero-ctas{display:flex;gap:1.2rem;justify-content:center;flex-wrap:wrap;animation:fadeUp 1s 0.4s ease both;}
        .cta-gold{padding:1rem 2.8rem;background:var(--gold);color:var(--ink2);border:none;border-radius:8px;font-family:'Jost',sans-serif;font-size:0.9rem;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;box-shadow:0 4px 28px rgba(212,175,55,0.3);}
        .cta-gold:hover{background:var(--gold2);transform:translateY(-2px);box-shadow:0 10px 36px rgba(212,175,55,0.45);}
        .cta-outline{padding:1rem 2.8rem;background:transparent;color:var(--cream);border:1.5px solid rgba(245,237,224,0.28);border-radius:8px;font-family:'Jost',sans-serif;font-size:0.9rem;font-weight:400;letter-spacing:0.16em;text-transform:uppercase;cursor:pointer;transition:all 0.25s;}
        .cta-outline:hover{border-color:rgba(245,237,224,0.65);background:rgba(245,237,224,0.06);transform:translateY(-2px);}
        // .hero-scroll{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:0.4rem;color:rgba(245,237,224,0.25);font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;}
        // .scroll-line{width:1px;height:44px;background:linear-gradient(to bottom,rgba(212,175,55,0.6),transparent);animation:sp 2s infinite;}
        // @keyframes sp{0%,100%{opacity:0.35}50%{opacity:1}}

        /* STATS */
        .stats-sec{background:var(--ink2);padding:4rem 3.5rem;position:relative;overflow:hidden;}
        .stats-sec::before{content:'';position:absolute;top:-1px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);}
        .stats-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:0;align-items:center;}
        .stat-div{width:1px;height:80px;background:rgba(212,175,55,0.1);}
        .stat-item{text-align:center;padding:0 2rem;}
        .stat-num{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,5vw,5.2rem);font-weight:300;line-height:1;color:var(--cream);margin-bottom:0.4rem;letter-spacing:-0.02em;}
        .stat-num sup{font-size:0.42em;vertical-align:super;color:var(--gold);}
        .stat-lbl{font-size:0.7rem;letter-spacing:0.24em;text-transform:uppercase;color:rgba(245,237,224,0.38);font-weight:500;}

        /* WHY */
        .why-sec{background:var(--cream);padding:4.5rem 3.5rem;}
        .sec-kicker{font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--brown);font-weight:500;margin-bottom:0.5rem;}
        .sec-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2.5rem,4.5vw,4rem);font-weight:400;line-height:1.1;color:var(--ink2);}
        .sec-title em{font-style:italic;color:var(--brown);}
        .why-grid{max-width:1100px;margin:2.5rem auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
        .why-card{border:1.5px solid #e8d8c4;border-radius:16px;padding:1.5rem 1.5rem;background:#fff;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
        .why-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--brown));transform:scaleX(0);transform-origin:left;transition:transform 0.35s ease;}
        .why-card:hover{transform:translateY(-6px);box-shadow:0 24px 56px rgba(44,31,16,0.1);border-color:#d4c4a0;}
        .why-card:hover::before{transform:scaleX(1);}
        .why-icon{width:52px;height:52px;border-radius:50%;border:1.5px solid #e8d8c4;background:#fdf3e0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.4rem;transition:all 0.3s;}
        .why-card:hover .why-icon{border-color:var(--gold);transform:scale(1.1);}
        .why-h{font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-weight:600;color:var(--ink2);margin-bottom:0.5rem;}
        .why-p{font-size:0.88rem;color:var(--muted);font-weight:300;line-height:1.75;}

        /* HOW */
        .how-sec{background:var(--cream);padding:2.5rem 3.5rem;}
        .how-grid{max-width:1100px;margin:4rem auto 0;display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
        .how-grid::before{content:'';position:absolute;top:36px;left:calc(12.5% + 18px);right:calc(12.5% + 18px);height:1px;background:linear-gradient(90deg,var(--gold),var(--brown));opacity:0.25;}
        .how-step{padding:0 1.5rem;text-align:center;}
        .how-circle{width:72px;height:72px;border-radius:50%;border:1.5px solid rgba(139,94,47,0.28);background:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:600;color:var(--ink2);margin:0 auto 1.5rem;transition:all 0.28s;}
        .how-step:hover .how-circle{border-color:var(--gold);background:var(--gold);transform:scale(1.08);}
        .how-step-title{font-family:'Cormorant Garamond',serif;font-size:1.28rem;font-weight:600;color:var(--ink2);margin-bottom:0.5rem;}
        .how-step-desc{font-size:0.84rem;color:var(--muted);font-weight:300;line-height:1.7;}

        /* JOIN */
        .join-sec{background:var(--ink2);padding:7rem 3.5rem;position:relative;overflow:hidden;}
        .join-sec::before{content:'';position:absolute;inset:0;background:url("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&auto=format&fit=crop&q=60") center/cover no-repeat;opacity:0.1;}
        .join-inner{position:relative;z-index:2;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:2rem;}
        .jcard{border-radius:20px;padding:2.5rem 2rem;display:flex;flex-direction:column;align-items:flex-start;gap:1.3rem;cursor:pointer;transition:all 0.32s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;}
        .jcard-cust{background:rgba(255,255,255,0.05);border:1.5px solid rgba(212,175,55,0.18);}
        .jcard-cust:hover{background:rgba(255,255,255,0.09);border-color:rgba(212,175,55,0.45);transform:translateY(-4px);box-shadow:0 24px 60px rgba(0,0,0,0.35);}
        .jcard-tail{background:var(--gold);border:1.5px solid var(--gold);}
        .jcard-tail:hover{background:var(--gold2);border-color:var(--gold2);transform:translateY(-4px);box-shadow:0 24px 60px rgba(212,175,55,0.35);}
        .j-icon{font-size:2.4rem;line-height:1;}
        .j-badge{font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;font-weight:600;padding:0.28rem 0.85rem;border-radius:100px;}
        .jcard-cust .j-badge{background:rgba(212,175,55,0.12);color:var(--gold);border:1px solid rgba(212,175,55,0.2);}
        .jcard-tail .j-badge{background:rgba(44,31,16,0.18);color:var(--ink2);}
        .j-h{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:600;line-height:1.15;}
        .jcard-cust .j-h{color:var(--cream);}
        .jcard-tail .j-h{color:var(--ink2);}
        .j-p{font-size:0.9rem;font-weight:300;line-height:1.7;opacity:0.74;}
        .jcard-cust .j-p{color:var(--cream);}
        .jcard-tail .j-p{color:var(--ink2);}
        .j-cta{display:inline-flex;align-items:center;gap:0.6rem;padding:0.72rem 1.9rem;border-radius:8px;font-family:'Jost',sans-serif;font-size:0.82rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;transition:all 0.22s;border:none;margin-top:0.4rem;}
        .jcard-cust .j-cta{background:var(--gold);color:var(--ink2);}
        .jcard-cust .j-cta:hover{background:var(--gold2);}
        .jcard-tail .j-cta{background:var(--ink2);color:var(--cream);}
        .jcard-tail .j-cta:hover{background:var(--ink);}

        /* FOOTER */
        .footer{background:var(--ink);padding:1.5rem 3.5rem;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(212,175,55,0.1);}
        .footer-logo-name{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;color:var(--cream);}
        .footer-logo-name span{color:var(--gold);font-style:italic;}
        .footer-copy{font-size:0.78rem;color:rgba(245,237,224,0.27);}

        /* RESPONSIVE */
        @media(max-width:900px){
          .nav{padding:0 1.5rem;}
          .stats-inner{grid-template-columns:1fr 1fr;gap:2rem;}
          .stat-div{display:none;}
          .how-grid{grid-template-columns:1fr 1fr;gap:2.5rem;}
          .how-grid::before{display:none;}
          .join-inner{grid-template-columns:1fr;}
          .why-sec,.how-sec,.join-sec{padding:4rem 1.5rem;}
          .stats-sec{padding:4rem 1.5rem;}
          .footer{flex-direction:column;gap:1rem;text-align:center;padding:2rem 1.5rem;}
        }
        @media(max-width:600px){
          .stats-inner{grid-template-columns:1fr;gap:2rem;}
          .hero-ctas{flex-direction:column;align-items:center;}
        }
      `}</style>

      <div className="home">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            {/* <span style={{fontSize:'1.5rem'}}>✂️</span> */}
            <span className="nav-logo-name"> <span>Artiq</span></span>
          </div>
          <div className="nav-links">
            <button className="nbtn nbtn-ghost" onClick={() => navigate("/login")}>Sign In</button>
            <button className="nbtn nbtn-fill"  onClick={() => navigate("/signup")}>Join Free</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg"/><div className="hero-grain"/><div className="hero-accent"/>
          <div className="hero-content">
            {/* <div className="hero-kicker">
              <span className="hero-kicker-line"/>The Premium Tailoring Platform<span className="hero-kicker-line"/>
            </div> */}
            <h1 className="hero-h1">
              <span className="thin">Where </span><em>Craft</em><br/>Meets <em>Elegance</em>
            </h1>
            <p className="hero-sub">
              Connect with master tailors across India. Every stitch a story — every garment a masterpiece built just for you.
            </p>
            <div className="hero-ctas">
              <button className="cta-gold"    onClick={() => navigate("/signup")}>Get Started Free</button>
              {/* <button className="cta-outline" onClick={() => navigate("/find-tailor")}>Browse Tailors</button> */}
            </div>
          </div>
          {/* <div className="hero-scroll"><div className="scroll-line"/></div> */}
        </section>

        {/* LIVE STATS */}
        <section className="stats-sec">
          <div className="stats-inner">
            <div className="stat-item">
              <div className="stat-num">
                {loadingStats ? <span style={{opacity:0.3}}>—</span> : <><Counter to={stats.tailors}/><sup>+</sup></>}
              </div>
              <div className="stat-lbl">Registered Tailors</div>
            </div>
            <div className="stat-div"/>
            <div className="stat-item">
              <div className="stat-num">
                {loadingStats ? <span style={{opacity:0.3}}>—</span> : <><Counter to={stats.cities}/><sup>+</sup></>}
              </div>
              <div className="stat-lbl">Cities Covered</div>
            </div>
            <div className="stat-div"/>
            <div className="stat-item">
              <div className="stat-num">
                {loadingStats ? <span style={{opacity:0.3}}>—</span> : <><Counter to={stats.reviews || stats.tailors * 2}/><sup>+</sup></>}
              </div>
              <div className="stat-lbl">Happy Customers</div>
            </div>
          </div>
        </section>

        {/* WHY ARTIQ */}
        <section className="why-sec">
          <div style={{maxWidth:'1100px',margin:'0 auto'}}>
            <p className="sec-kicker">Why Artiq</p>
            <h2 className="sec-title">Crafted for <em>Perfection</em></h2>
          </div>
          <div className="why-grid">
            {[
              {icon:"🪡",title:"Verified Artisans",    text:"Every tailor on Artiq is fully registered with contact, specialty, and city — real people, real craft, no guesswork."},
              {icon:"🗺️",title:"Find Nearby",          text:"Filter by city, garment category, and work type. The right tailor might be closer than you think."},
              {icon:"⭐",title:"Genuine Reviews",      text:"Customers rate and review after every job. Honest, unfiltered feedback that helps you choose with confidence."},
              {icon:"📋",title:"Rich Profiles",        text:"Tailor profiles cover specialty, since-year, shop address, social links, and work type — everything you need to decide."},
            ].map(c => (
              <div className="why-card" key={c.title}>
                <div className="why-icon">{c.icon}</div>
                <h3 className="why-h">{c.title}</h3>
                <p className="why-p">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-sec">
          <div style={{maxWidth:'1100px',margin:'0 auto'}}>
            <p className="sec-kicker">Simple Process</p>
            <h2 className="sec-title">How <em>Artiq</em> Works</h2>
          </div>
          <div className="how-grid">
            {[
              {n:"1",title:"Sign Up",       desc:"Create your account as a customer or tailor in under a minute. No fees, no friction."},
              {n:"2",title:"Build Profile", desc:"Set up your full profile — specialties, city, work type, measurements, and more."},
              {n:"3",title:"Connect",       desc:"Customers discover verified tailors. Tailors get found by the right clients nearby."},
              {n:"4",title:"Create",        desc:"Commission beautiful garments, leave honest reviews, and build lasting relationships."},
            ].map(s => (
              <div className="how-step" key={s.n}>
                <div className="how-circle">{s.n}</div>
                <div className="how-step-title">{s.title}</div>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* JOIN CTA */}
        <section className="join-sec">
          <div className="join-inner">
            <div className="jcard jcard-cust" onClick={() => navigate("/signup")}>
              <span className="j-icon">👗</span>
              <span className="j-badge">For Customers</span>
              <h3 className="j-h">Find Your Perfect Tailor</h3>
              <p className="j-p">Browse curated artisans in your city, read real reviews, and get garments crafted exactly to your specifications.</p>
              <button className="j-cta">
                Join as Customer
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div className="jcard jcard-tail" onClick={() => navigate("/signup")}>
              <span className="j-icon">✂️</span>
              <span className="j-badge">For Tailors</span>
              <h3 className="j-h">Showcase Your Artistry</h3>
              <p className="j-p">Create a rich profile, get discovered by customers in your city, and grow your tailoring business on a platform built for you.</p>
              <button className="j-cta">
                Join as Tailor
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div style={{display:'flex',alignItems:'center',gap:'0.45rem'}}>
            {/* <span style={{fontSize:'1.3rem'}}>✂️</span> */}
            <span className="footer-logo-name"> <span>Artiq</span></span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Artiq — Where craft meets elegance.</p>
        </footer>
      </div>
    </>
  );
}