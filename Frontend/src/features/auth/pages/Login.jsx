import React from "react";
import "../auth.form.scss";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router";

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

    if (loading) {
        return (<main>
            <h1>Loading...</h1>
        </main>)
    }

    return (
        <main>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input onChange={(e) => setEmail(e.target.value)} type="email" id="email" name="email" required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" name="password" required />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button primary-button">Login</button>
            </form>

            <button type="button" className="demo-hint" onClick={fillDemoCredentials}>
                Try the demo account
            </button>

            <p>Don't have an account? <Link to="/register">Register</Link></p>

        </main>
    )
}

export default Login;
