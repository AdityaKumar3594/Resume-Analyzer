import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";
import AuthShell from "../components/AuthShell.jsx";

const DEMO_CREDENTIALS = {
    email: "demo@resumeanalyzer.dev",
    password: "demo1234"
};

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await handleLogin({ email, password });

        // Only navigate when the session was actually created.
        if (result?.success) {
            navigate('/home');
        } else {
            setError(result?.message ?? "Login failed. Please try again.");
        }
    }

    const fillDemoCredentials = () => {
        setEmail(DEMO_CREDENTIALS.email);
        setPassword(DEMO_CREDENTIALS.password);
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue preparing for your next interview."
        >
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="btn btn--primary btn--lg submit-btn" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <button type="button" className="demo-hint" onClick={fillDemoCredentials}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                Try the demo account
            </button>

            <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Create one free</Link></p>
        </AuthShell>
    )
}

export default Login;
