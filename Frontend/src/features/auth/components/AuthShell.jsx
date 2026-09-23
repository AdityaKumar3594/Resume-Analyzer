import { Link } from "react-router-dom";
import "../auth.form.scss";

const HIGHLIGHTS = [
    "Match score & skill-gap analysis for any job description",
    "Technical and behavioral questions with model answers",
    "Day-by-day preparation roadmap you can follow",
    "Tailored resume PDF generated for the role",
];

const AuthShell = ({ title, subtitle, children }) => (
    <main className="auth-page">
        {/* Brand panel */}
        <section className="auth-brand" aria-hidden="true">
            <Link to="/" className="brand auth-brand__logo">
                <span className="brand-mark">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
                </span>
                <span className="brand-name">Resume Analyzer</span>
            </Link>

            <div className="auth-brand__body">
                <h2>Walk into every interview prepared.</h2>
                <p>Your resume, the job description, and AI — working together on one focused plan.</p>
                <ul className="auth-brand__list">
                    {HIGHLIGHTS.map((h) => (
                        <li key={h}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
                            {h}
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* Form panel */}
        <section className="auth-panel">
            <Link to="/" className="brand auth-panel__logo">
                <span className="brand-mark">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
                </span>
                <span className="brand-name">Resume Analyzer</span>
            </Link>

            <div className="auth-panel__content">
                <h1>{title}</h1>
                <p className="auth-panel__subtitle">{subtitle}</p>
                {children}
            </div>
        </section>
    </main>
);

export default AuthShell;
