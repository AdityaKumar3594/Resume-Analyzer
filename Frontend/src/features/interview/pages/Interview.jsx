import React, { useState } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.jsx";
import { useNavigate } from "react-router-dom";



const navItems = [
    { id: "technical", label: "Technical Questions" },
    { id: "behavioral", label: "Behavioral Questions" },
    { id: "roadmap", label: "Road Map" }
];

function Interview() {
    const [active, setActive] = useState("technical");
    const { report, loading, getResumePdf } = useInterview()
    const navigate = useNavigate()
    const [downloading, setDownloading] = useState(false)
    


    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading your report…</h1>
            </main>
        )
    }

    if (!report) {
        return (
            <main className="loading-screen">
                <h1>Report not available — please generate one first.</h1>
            </main>
        )
    }


    const renderCenter = () => {
        if (active === "technical") {
            return (
                <>
                    <div className="section-header">
                        <h2>Technical Questions</h2>
                        <span>{report.technicalQuestions.length} questions</span>
                    </div>
                    {report.technicalQuestions.map((item, i) => (
                        <div className="card" key={`tech-${i}`}>
                            <p className="card-title">Q{i + 1}: {item.question}</p>
                            <p className="card-intent">Intention: {item.intention}</p>
                            <p className="card-answer">Answer: {item.answer}</p>
                        </div>
                    ))}
                </>
            );
        }

        if (active === "behavioral") {
            return (
                <>
                    <div className="section-header">
                        <h2>Behavioral Questions</h2>
                        <span>{report.behavioralQuestions.length} questions</span>
                    </div>
                    {report.behavioralQuestions.map((item, i) => (
                        <div className="card" key={`beh-${i}`}>
                            <p className="card-title">Q{i + 1}: {item.question}</p>
                            <p className="card-intent">Intention: {item.intention}</p>
                            <p className="card-answer">Answer: {item.answer}</p>
                        </div>
                    ))}
                </>
            );
        }

        return (
            <>
                <div className="section-header">
                    <h2>Road Map</h2>
                    <span>{report.preparationPlan.length}-day plan</span>
                </div>
                <div className="roadmap-grid">
                    {report.preparationPlan.map((day) => (
                        <div className="card" key={day.day}>
                            <p className="card-title">Day {day.day}: {day.focus}</p>
                            <ul>
                                {day.tasks.map((task, idx) => <li key={idx}>{task}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    return (
        <main className="interview-layout-page">
            <button
                className="nav-arrow nav-arrow--left"
                onClick={() => navigate("/")}
                aria-label="Back to Home"
                title="Back to Home"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /><line x1="9" y1="12" x2="22" y2="12" /></svg>
            </button>
            <div className="interview-layout">
                <aside className="left-nav">
                    <h3>Sections</h3>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={active === item.id ? "nav-item active" : "nav-item"}
                            onClick={() => setActive(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="score-box">
                        <p>Match Score</p>
                        <div
                            className="score-ring"
                            style={{ "--score": String(report.matchScore ?? 0) }}
                        >
                            <span>{report.matchScore}%</span>
                        </div>
                        <p className="score-text">Great match for this role.</p>
                    </div>
                </aside>

                <section className="content-column">
                    <div className="report-heading">
                        <span className="badge badge--accent">Interview Report</span>
                        <h1>{report.title || "Untitled Position"}</h1>
                    </div>
                    {renderCenter()}
                </section>

                <aside className="right-panel">
                    <div className="panel-head">
                        <h3>Skill Gaps</h3>
                        <p>Areas to improve before interview</p>
                    </div>
                    <div className="tags">
                        {report.skillGaps.map((gap) => (
                            <span key={gap.skill} className={`tag ${gap.severity}`}>{gap.skill}</span>
                        ))}
                    </div>
                    <div className="panel-head">
                        <h3>Self Summary</h3>
                    </div>
                    <p className="small">AI & Data Science student experienced in scalable solutions and ML projects.</p>
                    <button
                        className="download-btn"
                        disabled={downloading}
                        onClick={async () => {
                            if (downloading) return
                            setDownloading(true)
                            try {
                                await getResumePdf(report._id)
                            } finally {
                                setDownloading(false)
                            }
                        }}
                    >
                        {downloading ? "Downloading..." : "Download Report"}
                    </button>
                </aside>
            </div>
        </main>
    );
}

export default Interview;
