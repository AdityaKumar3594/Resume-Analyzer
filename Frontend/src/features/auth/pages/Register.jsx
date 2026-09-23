import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";
import AuthShell from "../components/AuthShell.jsx";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { loading, handleRegister } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const result = await handleRegister({ username, email, password });

        // Only navigate when the account was actually created.
        if (result?.success) {
            navigate('/home');
        } else {
            setError(result?.message ?? "Registration failed. Please try again.");
        }
    }

    return (
        <AuthShell
            title="Create your account"
            subtitle="Start analyzing resumes and generating interview reports in minutes."
        >
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        id="username"
                        name="username"
                        placeholder="jane_doe"
                        required
                    />
                </div>
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
                        placeholder="Minimum 8 characters"
                        required
                    />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="btn btn--primary btn--lg submit-btn" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>

            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </AuthShell>
    )
}

export default Register;
