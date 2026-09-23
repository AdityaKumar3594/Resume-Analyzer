import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInterview } from "../hooks/useInterview.jsx";
import "../style/allReports.scss";

const AllReports = () => {
  const { reports, loading } = useInterview();
  const navigate = useNavigate();

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your reports…</h1>
      </main>
    );
  }

  return (
    <main className="all-reports">
      <header className="all-reports__topbar">
        <Link to="/home" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
          </span>
          <span className="brand-name">Resume Analyzer</span>
        </Link>
      </header>
      <div className="all-reports__card">
        <div className="all-reports__header">
          <div>
            <p className="eyebrow">Reports</p>
            <h1>All Interview Reports</h1>
            <p className="subtitle">Your generated interview strategies in one place.</p>
          </div>
          <button className="ghost-btn" onClick={() => navigate("/home")}>Back to Dashboard</button>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <p>No reports yet. Generate your first interview plan from the dashboard.</p>
            <div className="empty-actions">
              <button className="primary-btn" onClick={() => navigate("/home")}>Generate Report</button>
              <button className="ghost-btn" onClick={() => navigate("/home")}>Back to Dashboard</button>
            </div>
          </div>
        ) : (
          <ul className="reports-grid">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-card"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <h3>{report.title || "Untitled Position"}</h3>
                <p className="meta">Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                <p className={`score ${report.matchScore >= 80 ? "high" : report.matchScore >= 60 ? "mid" : "low"}`}>
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default AllReports;
