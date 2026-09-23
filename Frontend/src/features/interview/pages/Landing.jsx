import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/landing.scss";
import { useAuth } from "../../auth/hooks/useAuth.js";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="m9 15 2 2 4-4" /></svg>
    ),
    title: "AI Resume Parsing",
    text: "Upload a PDF and Gemini extracts your skills, experience and strengths — no manual form filling.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    ),
    title: "Job Match Analysis",
    text: "Paste any job description and get a match score plus the exact skill gaps standing between you and the role.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>
    ),
    title: "Technical & Behavioral Prep",
    text: "Purpose-built question sets with the interviewer's intention and a strong model answer for each.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></svg>
    ),
    title: "Preparation Roadmap",
    text: "A day-by-day study plan that turns your gaps into a schedule you can actually follow.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
    ),
    title: "Tailored Resume PDF",
    text: "Download a rewritten, role-specific resume aligned to the job — generated alongside your report.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    ),
    title: "Private by Design",
    text: "Your account, your documents. Reports are scoped to you and never shared across users.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Describe the role",
    text: "Paste the job description you're targeting. The analyzer reads requirements the way a recruiter would.",
  },
  {
    step: "02",
    title: "Add your resume",
    text: "Upload a PDF resume or type a quick self-summary. Gemini builds your candidate profile in seconds.",
  },
  {
    step: "03",
    title: "Get your report",
    text: "Receive a match score, skill gaps, mock questions and a preparation roadmap — usually inside a minute.",
  },
  {
    step: "04",
    title: "Practice & download",
    text: "Work through your roadmap and download the tailored resume PDF before you apply.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The match score told me exactly which skills to lead with. I restructured my resume and landed two interviews the same week.",
    name: "Priya S.",
    role: "Backend Engineer",
  },
  {
    quote: "The mock questions felt like the real panel. Practicing the 'intention' behind each one completely changed how I answered.",
    name: "Marcus T.",
    role: "Product Analyst",
  },
  {
    quote: "I used to spend evenings guessing what to prepare. Now I get a focused roadmap the moment I paste a job post.",
    name: "Aisha K.",
    role: "Frontend Developer",
  },
];

const FAQS = [
  {
    q: "Do I need a resume file to start?",
    a: "No. Uploading a PDF gives the deepest analysis, but you can paste a short self-description instead and still get a full report.",
  },
  {
    q: "What does the match score mean?",
    a: "It estimates how closely your profile matches the job description — based on skills, experience signals and the role's requirements.",
  },
  {
    q: "Who can see my reports?",
    a: "Only you. Every report is tied to your account, and the dashboard, interview prep and downloads are all private.",
  },
  {
    q: "How long does a report take?",
    a: "Most reports are generated in under a minute, including resume parsing, gap analysis and question generation.",
  },
];

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
    };
    if (loginOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [loginOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page">
      <header className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
            </span>
            <span className="brand-name">Resume Analyzer</span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#process">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav-actions" ref={dropdownRef}>
            <button
              className="login-toggle"
              type="button"
              aria-haspopup="true"
              aria-expanded={loginOpen}
              onClick={() => setLoginOpen((prev) => !prev)}
            >
              {user ? user.email || user.username || "Account" : "Login"}
              <span className="chevron" aria-hidden="true">▾</span>
            </button>
            <div className={`login-dropdown ${loginOpen ? "login-dropdown--open" : ""}`} role="menu">
              {user ? (
                <Link role="menuitem" to="/home" onClick={() => setLoginOpen(false)}>Continue to Dashboard</Link>
              ) : (
                <>
                  <Link role="menuitem" to="/login" onClick={() => setLoginOpen(false)}>Login</Link>
                  <Link role="menuitem" to="/register" onClick={() => setLoginOpen(false)}>Create account</Link>
                </>
              )}
            </div>
            <Link className="btn btn--primary" to="/register">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="hero">
          <div className="hero__inner">
            <div className="hero__text">
              <span className="badge badge--accent hero__kicker">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.4 2.4-7.4L2 9.4h7.6z" /></svg>
                Powered by Google Gemini
              </span>
              <h1>
                Land the interview with a resume built for the <span className="text-gradient">job you want</span>.
              </h1>
              <p className="hero__subtitle">
                Upload your resume, paste a job description, and get a match score, skill-gap
                report, mock interview questions and a tailored resume PDF — in about a minute.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--primary btn--lg" to="/register">Analyze my resume — free</Link>
                <a className="btn btn--outline btn--lg" href="#process">See how it works</a>
              </div>
              <p className="hero__note">No credit card required · Reports stay private to your account</p>

              <dl className="hero__stats">
                <div><dt>~60s</dt><dd>to a full report</dd></div>
                <div><dt>6</dt><dd>insight sections</dd></div>
                <div><dt>PDF</dt><dd>tailored resume out</dd></div>
              </dl>
            </div>

            <div className="hero__visual" aria-hidden="true">
              <div className="report-card">
                <div className="report-card__head">
                  <div>
                    <p className="report-card__eyebrow">Analysis report</p>
                    <h3>Senior Frontend Engineer</h3>
                  </div>
                  <span className="badge badge--green">Ready</span>
                </div>
                <div className="report-card__score">
                  <div className="score-ring score-ring--demo">
                    <svg viewBox="0 0 80 80">
                      <circle className="ring-track" cx="40" cy="40" r="34" />
                      <circle className="ring-value" cx="40" cy="40" r="34" />
                    </svg>
                    <span>86%</span>
                  </div>
                  <div>
                    <p className="report-card__score-title">Job match score</p>
                    <p className="report-card__score-sub">Strong alignment · 2 gaps to close</p>
                  </div>
                </div>
                <div className="report-card__rows">
                  <div className="report-row">
                    <span>System Design</span>
                    <span className="bar"><i style={{ width: "72%" }} /></span>
                    <span className="report-row__tag">Gap · Medium</span>
                  </div>
                  <div className="report-row">
                    <span>React & TypeScript</span>
                    <span className="bar"><i style={{ width: "94%" }} /></span>
                    <span className="report-row__tag report-row__tag--ok">Strength</span>
                  </div>
                  <div className="report-row">
                    <span>Testing & CI</span>
                    <span className="bar"><i style={{ width: "58%" }} /></span>
                    <span className="report-row__tag">Gap · High</span>
                  </div>
                </div>
                <div className="report-card__foot">
                  <span>12 mock questions</span>
                  <span>7-day roadmap</span>
                  <span>1 tailored resume</span>
                </div>
              </div>
              <div className="hero-glow" />
            </div>
          </div>
        </section>

        {/* ---------------- Trust bar ---------------- */}
        <section className="trustbar" aria-label="Works with">
          <div className="trustbar__inner">
            <span className="trustbar__label">Built for every kind of role</span>
            <div className="trustbar__chips">
              {["Frontend", "Backend", "Full-Stack", "Data / ML", "Product", "DevOps"].map((r) => (
                <span key={r} className="trustbar__chip">{r}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="section">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Features</span>
              <h2>Everything you need to walk in confident</h2>
              <p>From resume parsing to interview day notes — one workspace for the whole job hunt.</p>
            </div>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <article key={f.title} className="feature-card">
                  <span className="feature-card__icon">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Process ---------------- */}
        <section id="process" className="section section--tinted">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">How it works</span>
              <h2>From job post to interview-ready in four steps</h2>
              <p>A guided flow that replaces hours of guesswork with a clear plan.</p>
            </div>
            <ol className="process-grid">
              {PROCESS.map((p) => (
                <li key={p.step} className="process-card">
                  <span className="process-card__step">{p.step}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Testimonials ---------------- */}
        <section className="section">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Testimonials</span>
              <h2>Candidates who stopped guessing</h2>
            </div>
            <div className="testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="testimonial-card">
                  <blockquote>“{t.quote}”</blockquote>
                  <figcaption>
                    <span className="testimonial-card__avatar">{t.name.charAt(0)}</span>
                    <span>
                      <strong>{t.name}</strong>
                      <em>{t.role}</em>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Pricing ---------------- */}
        <section id="pricing" className="section section--tinted">
          <div className="section__inner">
            <div className="section__header">
              <span className="section__eyebrow">Pricing</span>
              <h2>Simple while we&apos;re in beta</h2>
              <p>One plan. Every feature. Free during the beta period.</p>
            </div>
            <div className="pricing-grid">
              <div className="pricing-card">
                <div className="pricing-card__head">
                  <h3>Beta</h3>
                  <span className="badge badge--accent">Free</span>
                </div>
                <p className="pricing-card__price"><strong>$0</strong><span>/ forever, while in beta</span></p>
                <ul className="pricing-card__list">
                  <li>Unlimited resume analyses</li>
                  <li>Match score & skill-gap report</li>
                  <li>Technical + behavioral question sets</li>
                  <li>Preparation roadmap</li>
                  <li>Tailored resume PDF download</li>
                </ul>
                <Link className="btn btn--primary pricing-card__cta" to="/register">Start free</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="section">
          <div className="section__inner section__inner--narrow">
            <div className="section__header">
              <span className="section__eyebrow">FAQ</span>
              <h2>Questions, answered</h2>
            </div>
            <div className="faq-list">
              {FAQS.map((item, i) => (
                <div key={item.q} className={`faq-item ${openFaq === i ? "faq-item--open" : ""}`}>
                  <button
                    type="button"
                    className="faq-item__q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {openFaq === i && <p className="faq-item__a">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="section">
          <div className="section__inner">
            <div className="cta-card">
              <div>
                <h2>Your next interview starts with the right preparation.</h2>
                <p>Create a free account and generate your first report in minutes.</p>
              </div>
              <div className="cta-card__actions">
                <Link className="btn btn--primary btn--lg" to="/register">Create free account</Link>
                <Link className="btn btn--outline btn--lg" to="/login">I already have an account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
            </span>
            <div>
              <strong>Resume Analyzer</strong>
              <p>AI-powered resume and interview preparation.</p>
            </div>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <Link to="/login">Login</Link>
          </nav>
        </div>
        <p className="landing-footer__copy">© {new Date().getFullYear()} Resume Analyzer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
