import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

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

    if (loading) {
        return (<main>
            <h1>Loading...</h1>
        </main>)
    }

    return (

        <main>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        onChange={(e) => setUsername(e.target.value)}
                        type="text" id="username" name="username" placeholder="Enter username" required />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        type="email" id="email" name="email" placeholder="Enter email" required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        type="password" id="password" name="password" placeholder="Enter password (min 8 characters)" required />
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button primary-button">Register</button>
            </form>

            <p>Already have an account? <Link to="/login">Login</Link></p>
        </main>
    )
}

export default Register;
