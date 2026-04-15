import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Tailor {
  _id: string; name: string; specialty: string; city: string;
  profilepic: string; worktype: string; shopCity: string;
  since: string; contact: string; social: string;
}
interface Form { city: string; category: string; specialty: string; }

const BASE = "${import.meta.env.VITE_API_URL}/user/findtailor";

const CATS = [
  { val:"Men",      ico:"👔", label:"Men's Wear"      },
  { val:"Women",    ico:"👗", label:"Women's Wear"    },
  { val:"Children", ico:"🧒", label:"Children's Wear" },
  { val:"Both",     ico:"✂️", label:"All Categories"  },
];

const INDIAN_CITIES = [
  "Agra","Ahmedabad","Allahabad","Amritsar","Aurangabad",
  "Bengaluru","Bhopal","Bhubaneswar","Chandigarh","Chennai",
  "Coimbatore","Dehradun","Delhi","Dhanbad","Faridabad",
  "Ghaziabad","Gurugram","Guwahati","Gwalior","Howrah",
  "Hubli","Hyderabad","Indore","Jabalpur","Jaipur",
  "Jalandhar","Jodhpur","Kalyan","Kanpur","Kochi",
  "Kolkata","Kota","Lucknow","Ludhiana","Madurai",
  "Meerut","Mohali","Mumbai","Mysuru","Nagpur",
  "Nashik","Noida","Patna","Patiala","Phagwara",
  "Pimpri","Pune","Raipur","Rajkot","Ranchi",
  "Solapur","Srinagar","Surat","Thane","Vadodara",
  "Varanasi","Vasai","Vijayawada","Visakhapatnam",
];

function calcExp(since: string) {
  if (!since) return null;
  const n = new Date().getFullYear() - parseInt(since);
  return isNaN(n) || n < 0 ? null : n;
}

function splitSpecialties(raw: string): string[] {
  if (!raw) return [];
  return raw.split(/[,،;\/\n]+/).map(s => s.trim()).filter(Boolean);
}

// ── Specialty Select ──────────────────────────────────────────────────────────
function SpecialtySelect({ category, value, onChange }: {
  category: string; value: string; onChange: (v: string) => void;
}) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category) { setOptions([]); onChange(""); return; }
    setLoading(true);
    axios.post(`${BASE}/specialties`, { category })
      .then(r => {
        if (r.data.status) {
          const all = r.data.specialties as string[];
          const split = Array.from(new Set(
            all.flatMap(s => splitSpecialties(s))
               .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
               .filter(Boolean)
          )).sort();
          setOptions(split);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  if (!category) return null;

  return (
    <div className="spl-wrap">
      <label className="ft-lbl">Speciality / Dress Type</label>
      <div className="sel-wrap">
        <span className="sel-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </span>
        <select className="ft-select" value={value} onChange={e => onChange(e.target.value)} disabled={loading}>
          <option value="">{loading ? "Loading…" : "All Specialities"}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <span className="sel-arrow">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

// ── Tailor Detail Modal ───────────────────────────────────────────────────────
function TailorModal({ tailor, onClose }: { tailor: Tailor; onClose: () => void }) {
  const exp = calcExp(tailor.since);
  const displayCity = tailor.worktype === "Shop" && tailor.shopCity ? tailor.shopCity : tailor.city;
  const specialties = splitSpecialties(tailor.specialty);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, []);

  return (
    <div className="modal-overlay" onClick={e => { if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose(); }}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="modal-hero">
          <div className="modal-photo">
            {tailor.profilepic
              ? <img src={tailor.profilepic} alt={tailor.name} />
              : <div className="modal-ph">{tailor.name?.[0]?.toUpperCase() || "?"}</div>
            }
          </div>
          <div className="modal-hero-overlay" />
          <div className="modal-hero-info">
            <h2 className="modal-name">{tailor.name}</h2>
            <p className="modal-city">📍 {displayCity}</p>
          </div>
        </div>
        <div className="modal-body">
          <div className="modal-badges">
            {specialties.map(s => <span key={s} className="modal-badge mod-specialty">🪡 {s}</span>)}
            {tailor.worktype && (
              <span className="modal-badge mod-worktype">
                {tailor.worktype === "Home" ? "🏠 Home Visit" : tailor.worktype === "Shop" ? "🏪 Shop" : "🔀 Home & Shop"}
              </span>
            )}
            {exp !== null && <span className="modal-badge mod-exp">🏅 {exp}+ Years Exp.</span>}
          </div>
          <div className="modal-grid">
            {tailor.since && (
              <div className="modal-detail">
                <span className="modal-detail-lbl">In Business Since</span>
                <span className="modal-detail-val">{tailor.since}</span>
              </div>
            )}
            {tailor.city && (
              <div className="modal-detail">
                <span className="modal-detail-lbl">Home City</span>
                <span className="modal-detail-val">{tailor.city}</span>
              </div>
            )}
            {tailor.shopCity && tailor.worktype !== "Home" && (
              <div className="modal-detail">
                <span className="modal-detail-lbl">Shop City</span>
                <span className="modal-detail-val">{tailor.shopCity}</span>
              </div>
            )}
            {tailor.contact && (
              <div className="modal-detail">
                <span className="modal-detail-lbl">Contact</span>
                <a href={`tel:${tailor.contact}`} className="modal-detail-val modal-link">📞 {tailor.contact}</a>
              </div>
            )}
          </div>
          {(tailor.contact || tailor.social) && (
            <div className="modal-ctas">
              {tailor.contact && (
                <a href={`https://wa.me/91${tailor.contact}`} target="_blank" rel="noopener noreferrer" className="modal-cta modal-cta-whatsapp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {tailor.social && (
                <a href={tailor.social.startsWith("http") ? tailor.social : `https://${tailor.social}`} target="_blank" rel="noopener noreferrer" className="modal-cta modal-cta-social">
                  🔗 View Portfolio
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tailor Card ───────────────────────────────────────────────────────────────
function TailorCard({ t, idx, onClick }: { t: Tailor; idx: number; onClick: () => void }) {
  const exp = calcExp(t.since);
  const city = t.worktype === "Shop" && t.shopCity ? t.shopCity : t.city;
  const specialties = splitSpecialties(t.specialty);
  const wtMeta: Record<string,{label:string;cls:string}> = {
    Home: { label:"Home Visit", cls:"wt-home" },
    Shop: { label:"Shop",       cls:"wt-shop" },
    Both: { label:"Home & Shop",cls:"wt-both" },
  };
  const wt = wtMeta[t.worktype] || { label: t.worktype || "Home", cls:"wt-home" };

  return (
    <div className="tc" style={{ animationDelay:`${idx * 0.06}s` }} onClick={onClick}>
      <div className="tc-photo">
        {t.profilepic
          ? <img src={t.profilepic} alt={t.name} onError={(e:any) => { e.target.src="/nopic.jpg"; }} className="tc-img" />
          : <div className="tc-ph">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
        }
        <div className="tc-photo-overlay" />
        <span className={`tc-wt ${wt.cls}`}>{wt.label}</span>
        {exp !== null && <span className="tc-exp">🏅 {exp}+ yrs</span>}
      </div>
      <div className="tc-body">
        <h3 className="tc-name">{t.name || "—"}</h3>
        <div className="tc-spl-tags">
          {specialties.slice(0, 3).map(s => (
            <span key={s} className="tc-spl-tag">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {s}
            </span>
          ))}
          {specialties.length > 3 && <span className="tc-spl-more">+{specialties.length - 3} more</span>}
        </div>
        <div className="tc-city">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {city || "—"}
        </div>
        <div className="tc-view-btn">View Details →</div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="ft-pagination">
      <button className="pg-btn pg-arrow" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Prev
      </button>
      <div className="pg-numbers">
        {getPages().map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="pg-ellipsis">…</span>
            : <button key={p} className={`pg-btn pg-num${page === p ? " active" : ""}`} onClick={() => onPageChange(p as number)}>{p}</button>
        )}
      </div>
      <button className="pg-btn pg-arrow" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FindTailor() {
  const [form, setForm]           = useState<Form>({ city:"", category:"", specialty:"" });
  const [tailors, setTailors]     = useState<Tailor[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage]           = useState(1);
  const pageSize = 6;
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);

  // Store the filters that were last submitted so pagination uses them
  const activeFilters = useRef<Form & { pageSize: number }>({ city:"", category:"", specialty:"", pageSize: 6 });

  async function runSearch(filters: Form, pg: number, limit: number) {
    setLoading(true); setSearched(true);
    try {
      const r = await axios.post(`${BASE}/find-tailors`, {
        city:      filters.city      || undefined,
        category:  filters.category  || undefined,
        specialty: filters.specialty || undefined,
        page: pg, limit,
      });
      if (r.data.status) {
        setTailors(r.data.docs as Tailor[]);
        setTotal(r.data.total ?? 0);
        setTotalPages(r.data.totalPages ?? Math.ceil((r.data.total ?? 0) / limit));
        setPage(pg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch { } finally { setLoading(false); }
  }

  function handleSearch() {
    activeFilters.current = { ...form, pageSize };
    runSearch(form, 1, pageSize);
  }

  function handleReset() {
    setForm({ city:"", category:"", specialty:"" });
    activeFilters.current = { city:"", category:"", specialty:"", pageSize };
    setTailors([]); setSearched(false); setTotal(0); setTotalPages(0); setPage(1);
  }

  function handlePageChange(pg: number) {
    const f = activeFilters.current;
    runSearch({ city: f.city, category: f.category, specialty: f.specialty }, pg, f.pageSize);
  }

  const hasFilter = form.city || form.category || form.specialty;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--ink:#2c1f10;--ink2:#1a1410;--gold:#d4af37;--gold2:#b8952a;--brown:#8b5e2f;--cream:#faf6f0;--sand:#eddfcc;--muted:#7a6248;}
        .ft{font-family:'Jost',sans-serif;background:var(--sand);min-height:100vh;}

        /* HEADER */
        .ft-hdr{background:var(--ink2);height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;position:sticky;top:0;z-index:100;border-bottom:2px solid rgba(212,175,55,0.18);}
        .ft-logo{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--cream);letter-spacing:0.04em;cursor:pointer;}
        .ft-logo span{color:var(--gold);font-style:italic;}
        .ft-back{display:flex;align-items:center;gap:0.4rem;padding:0.48rem 1.1rem;background:transparent;border:1.5px solid rgba(212,175,55,0.25);border-radius:6px;color:rgba(245,237,224,0.65);font-family:'Jost',sans-serif;font-size:0.8rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
        .ft-back:hover{border-color:rgba(212,175,55,0.5);color:var(--gold);}

        /* BANNER */
        .ft-banner{background:var(--ink2);padding:3rem 2.5rem;position:relative;overflow:hidden;}
        .ft-banner::after{content:'🗺️';position:absolute;right:2rem;bottom:-1rem;font-size:9rem;opacity:0.05;pointer-events:none;}
        .ft-banner-glow{position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,0.07),transparent 70%);}
        .ft-kicker{font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin-bottom:0.5rem;}
        .ft-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,3rem);font-weight:500;color:var(--cream);line-height:1.1;}
        .ft-title em{font-style:italic;color:var(--gold);}
        .ft-sub{font-size:0.9rem;color:rgba(245,237,224,0.45);margin-top:0.5rem;font-weight:300;}

        /* BODY */
        .ft-body{max-width:1200px;margin:0 auto;padding:2rem 2.5rem;}

        /* FILTER CARD */
        .ft-filter{background:#fff;border:1.5px solid #e8d8c4;border-radius:18px;padding:2rem;margin-bottom:2rem;}
        .ft-filter-title{font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.5rem;}
        .ft-filter-title::after{content:'';flex:1;height:1px;background:#f0e6d8;}

        /* CATEGORY PILLS */
        .cat-pills{display:flex;gap:0.65rem;flex-wrap:wrap;margin-bottom:1.6rem;}
        .cat-pill{display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.1rem;border-radius:100px;border:1.5px solid #e0d0bc;background:#faf6f0;color:var(--muted);font-size:0.83rem;cursor:pointer;transition:all 0.2s;font-family:'Jost',sans-serif;font-weight:500;}
        .cat-pill:hover{border-color:var(--brown);color:var(--brown);}
        .cat-pill.active{background:var(--ink2);border-color:var(--ink2);color:var(--gold);}

        /* FILTER GRID */
        .ft-filter-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-bottom:1.4rem;}
        .ft-lbl{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted);margin-bottom:0.4rem;display:block;font-weight:600;}
        .sel-wrap{position:relative;display:flex;align-items:center;}
        .sel-icon{position:absolute;left:0.9rem;color:var(--brown);display:flex;align-items:center;pointer-events:none;z-index:1;}
        .sel-arrow{position:absolute;right:0.9rem;color:var(--muted);display:flex;align-items:center;pointer-events:none;}
        .ft-select{width:100%;padding:0.78rem 2.4rem 0.78rem 2.5rem;border:1.5px solid #e0d0bc;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.9rem;color:var(--ink);background:#faf6f0;outline:none;appearance:none;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s;}
        .ft-select:focus{border-color:var(--brown);box-shadow:0 0 0 3px rgba(139,94,47,0.1);background:#fff;}
        .ft-select:disabled{opacity:0.6;cursor:not-allowed;}

        /* FILTER ACTIONS */
        .ft-actions{display:flex;gap:0.8rem;justify-content:flex-end;margin-top:0.5rem;}
        .ft-search-btn{padding:0.78rem 2rem;background:var(--ink2);color:var(--cream);border:none;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.85rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;cursor:pointer;transition:all 0.22s;white-space:nowrap;position:relative;overflow:hidden;}
        .ft-search-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold),var(--gold2));opacity:0;transition:opacity 0.22s;}
        .ft-search-btn:hover::before{opacity:1;}
        .ft-search-btn:hover{color:var(--ink2);}
        .ft-search-btn span{position:relative;z-index:1;}
        .ft-search-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .ft-reset-btn{padding:0.78rem 1.4rem;background:transparent;color:var(--muted);border:1.5px solid #e0d0bc;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.85rem;cursor:pointer;transition:all 0.22s;white-space:nowrap;}
        .ft-reset-btn:hover{border-color:var(--brown);color:var(--brown);}

        /* ACTIVE FILTERS */
        .active-filters{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.2rem;}
        .af-pill{display:inline-flex;align-items:center;gap:0.35rem;padding:0.28rem 0.75rem;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);border-radius:100px;font-size:0.75rem;color:var(--brown);}
        .af-label{font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:600;}

        /* RESULTS HEADER */
        .ft-results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.4rem;flex-wrap:wrap;gap:0.8rem;}
        .ft-results-count{font-size:0.82rem;color:var(--muted);}
        .ft-results-count strong{color:var(--ink);font-weight:600;}

        /* GRID */
        .ft-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.4rem;}

        /* TAILOR CARD */
        .tc{background:#fff;border:1.5px solid #e8d8c4;border-radius:18px;overflow:hidden;cursor:pointer;transition:all 0.32s cubic-bezier(0.4,0,0.2,1);animation:fadeUp 0.5s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .tc:hover{transform:translateY(-6px);box-shadow:0 24px 56px rgba(44,31,16,0.12);border-color:#d4c2a8;}
        .tc-photo{position:relative;height:200px;background:linear-gradient(135deg,#f5e6c8,#e8d8c4);overflow:hidden;}
        .tc-img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;}
        .tc:hover .tc-img{transform:scale(1.04);}
        .tc-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(139,94,47,0.3);}
        .tc-photo-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(20,15,10,0.6));}
        .tc-wt{position:absolute;top:0.75rem;left:0.75rem;font-size:0.68rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:0.28rem 0.75rem;border-radius:100px;backdrop-filter:blur(4px);color:#fff;}
        .wt-home{background:rgba(39,174,96,0.85);}
        .wt-shop{background:rgba(52,152,219,0.85);}
        .wt-both{background:rgba(155,89,182,0.85);}
        .tc-exp{position:absolute;bottom:0.75rem;right:0.75rem;font-size:0.72rem;color:#fff;background:rgba(212,175,55,0.85);padding:0.2rem 0.6rem;border-radius:100px;font-weight:600;}
        .tc-body{padding:1.4rem;}
        .tc-name{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;color:var(--ink);margin-bottom:0.6rem;}
        .tc-spl-tags{display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.6rem;}
        .tc-spl-tag{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.72rem;color:var(--brown);background:rgba(139,94,47,0.08);border:1px solid rgba(139,94,47,0.15);padding:0.18rem 0.6rem;border-radius:100px;}
        .tc-spl-more{font-size:0.7rem;color:var(--muted);padding:0.18rem 0.5rem;border-radius:100px;border:1px dashed #e0d0bc;}
        .tc-city{font-size:0.83rem;color:var(--muted);display:flex;align-items:center;gap:0.35rem;font-weight:300;margin-bottom:0.8rem;}
        .tc-view-btn{font-size:0.75rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--brown);transition:color 0.2s;}
        .tc:hover .tc-view-btn{color:var(--gold);}

        /* PAGINATION */
        .ft-pagination{display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-top:3rem;padding-bottom:1rem;}
        .pg-numbers{display:flex;align-items:center;gap:0.4rem;}
        .pg-btn{display:inline-flex;align-items:center;gap:0.4rem;padding:0.6rem 1.1rem;border:1.5px solid #e0d0bc;border-radius:10px;background:#fff;color:var(--muted);font-family:'Jost',sans-serif;font-size:0.85rem;font-weight:500;cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .pg-btn:hover:not(:disabled){border-color:var(--brown);color:var(--brown);background:#fdf6ec;}
        .pg-btn.active{background:var(--ink2);border-color:var(--ink2);color:var(--gold);font-weight:600;}
        .pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
        .pg-num{padding:0.6rem 0.95rem;min-width:42px;justify-content:center;}
        .pg-arrow{padding:0.6rem 1.2rem;}
        .pg-ellipsis{padding:0.6rem 0.4rem;color:var(--muted);font-size:0.9rem;user-select:none;}

        /* EMPTY / LOADING */
        .ft-empty{text-align:center;padding:4rem 2rem;}
        .ft-empty-icon{font-size:4rem;margin-bottom:1rem;opacity:0.5;}
        .ft-empty-title{font-family:'Cormorant Garamond',serif;font-size:1.6rem;color:var(--ink);margin-bottom:0.5rem;}
        .ft-empty-sub{font-size:0.9rem;color:var(--muted);font-weight:300;}
        .ft-loading-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.4rem;}
        .ft-skel{height:320px;border-radius:18px;background:linear-gradient(90deg,#f0e6d8 25%,#faf6f0 50%,#f0e6d8 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* MODAL */
        .modal-overlay{position:fixed;inset:0;background:rgba(20,15,10,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(4px);animation:fadeIn 0.2s ease;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal-card{background:#fff;border-radius:22px;max-width:480px;width:100%;overflow:hidden;position:relative;animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1);}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .modal-close{position:absolute;top:1rem;right:1rem;z-index:10;background:rgba(20,15,10,0.6);border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:background 0.2s;}
        .modal-close:hover{background:rgba(192,57,43,0.8);}
        .modal-hero{position:relative;height:220px;background:linear-gradient(135deg,#f5e6c8,#e8d8c4);}
        .modal-photo{width:100%;height:100%;}
        .modal-hero img{width:100%;height:100%;object-fit:cover;}
        .modal-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:4rem;font-weight:600;color:rgba(139,94,47,0.4);}
        .modal-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,15,10,0.8) 0%,transparent 60%);}
        .modal-hero-info{position:absolute;bottom:1.2rem;left:1.5rem;right:1.5rem;}
        .modal-name{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:#fff;line-height:1.1;margin-bottom:0.25rem;}
        .modal-city{font-size:0.85rem;color:rgba(245,237,224,0.7);}
        .modal-body{padding:1.5rem;}
        .modal-badges{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.4rem;}
        .modal-badge{font-size:0.73rem;padding:0.3rem 0.85rem;border-radius:100px;font-weight:600;}
        .mod-specialty{background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.3);color:#8b6820;}
        .mod-worktype{background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.25);color:#1a6fa8;}
        .mod-exp{background:rgba(39,174,96,0.1);border:1px solid rgba(39,174,96,0.25);color:#1e8449;}
        .modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-bottom:1.4rem;}
        .modal-detail{background:#faf6f0;border-radius:10px;padding:0.75rem 1rem;}
        .modal-detail-lbl{display:block;font-size:0.67rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);margin-bottom:0.2rem;}
        .modal-detail-val{font-size:0.9rem;font-weight:500;color:var(--ink);}
        .modal-link{color:var(--brown);text-decoration:none;}
        .modal-link:hover{color:var(--gold);}
        .modal-ctas{display:flex;gap:0.75rem;flex-wrap:wrap;}
        .modal-cta{display:inline-flex;align-items:center;gap:0.5rem;padding:0.7rem 1.4rem;border-radius:10px;font-family:'Jost',sans-serif;font-size:0.83rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;transition:all 0.22s;}
        .modal-cta-whatsapp{background:#25d366;color:#fff;}
        .modal-cta-whatsapp:hover{background:#1ebe5b;transform:translateY(-1px);box-shadow:0 6px 20px rgba(37,211,102,0.35);}
        .modal-cta-social{background:var(--ink2);color:var(--cream);}
        .modal-cta-social:hover{background:var(--gold);color:var(--ink2);}

        @media(max-width:768px){
          .ft-hdr,.ft-banner,.ft-body{padding-left:1.5rem;padding-right:1.5rem;}
          .ft-filter-grid{grid-template-columns:1fr;}
          .modal-card{max-width:100%;margin:0.5rem;}
          .ft-pagination{gap:0.4rem;}
          .pg-arrow{padding:0.6rem 0.85rem;}
        }
      `}</style>

      <div className="ft">
        {/* HEADER */}
        <header className="ft-hdr">
          <span className="ft-logo" onClick={() => history.back()}> <span>Artiq</span></span>
          <button className="ft-back" onClick={() => history.back()}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
        </header>

        {/* BANNER */}
        <div className="ft-banner">
          <div className="ft-banner-glow" />
          <p className="ft-kicker">Discover Artisans</p>
          <h1 className="ft-title">Find a <em>Tailor</em></h1>
          <p className="ft-sub">Filter by city, garment type, and specialty to find your perfect match.</p>
        </div>

        <div className="ft-body">
          {/* FILTER CARD */}
          <div className="ft-filter">
            <p className="ft-filter-title">Filter Tailors</p>
            <div className="cat-pills">
              {CATS.map(c => (
                <button
                  key={c.val}
                  className={`cat-pill${form.category === c.val ? " active" : ""}`}
                  onClick={() => setForm(f => ({ ...f, category: f.category === c.val ? "" : c.val, specialty: "" }))}
                >
                  <span>{c.ico}</span> {c.label}
                </button>
              ))}
            </div>
            <div className="ft-filter-grid">
              <div>
                <label className="ft-lbl">City</label>
                <div className="sel-wrap">
                  <span className="sel-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <select className="ft-select" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                    <option value="">All Cities</option>
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="sel-arrow">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
              </div>
              <SpecialtySelect
                category={form.category}
                value={form.specialty}
                onChange={v => setForm(f => ({ ...f, specialty: v }))}
              />
            </div>
            <div className="ft-actions">
              {hasFilter && <button className="ft-reset-btn" onClick={handleReset}>Reset Filters</button>}
              <button className="ft-search-btn" onClick={handleSearch} disabled={loading}>
                <span>{loading ? "Searching…" : "🔍 Search Tailors"}</span>
              </button>
            </div>
          </div>

          {/* ACTIVE FILTERS */}
          {(form.category || form.specialty || form.city) && (
            <div className="active-filters">
              <span className="af-label">Active:</span>
              {form.category  && <span className="af-pill">📋 {form.category}</span>}
              {form.specialty && <span className="af-pill">🪡 {form.specialty}</span>}
              {form.city      && <span className="af-pill">📍 {form.city}</span>}
            </div>
          )}

          {/* RESULTS */}
          {loading ? (
            <div className="ft-loading-grid">
              {[...Array(pageSize)].map((_, i) => <div key={i} className="ft-skel" />)}
            </div>
          ) : searched && tailors.length === 0 ? (
            <div className="ft-empty">
              <div className="ft-empty-icon">🔍</div>
              <div className="ft-empty-title">No Tailors Found</div>
              <p className="ft-empty-sub">Try adjusting your filters or search in a different city.</p>
            </div>
          ) : tailors.length > 0 ? (
            <>
              <div className="ft-results-header">
                <p className="ft-results-count">
                  Showing <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> tailors
                </p>
                {totalPages > 1 && (
                  <p className="ft-results-count">Page <strong>{page}</strong> of <strong>{totalPages}</strong></p>
                )}
              </div>

              <div className="ft-grid">
                {tailors.map((t, i) => (
                  <TailorCard key={t._id} t={t} idx={i} onClick={() => setSelectedTailor(t)} />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <div className="ft-empty">
              <div className="ft-empty-icon">✂️</div>
              <div className="ft-empty-title">Ready to Discover Tailors?</div>
              <p className="ft-empty-sub">Use the filters above to find verified tailors in your city.</p>
            </div>
          )}
        </div>
      </div>

      {selectedTailor && (
        <TailorModal tailor={selectedTailor} onClose={() => setSelectedTailor(null)} />
      )}
    </>
  );
}