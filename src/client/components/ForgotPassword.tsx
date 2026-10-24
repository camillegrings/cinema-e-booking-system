import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const confirmEmail = formData.get("confirmEmail");

        if (email !== confirmEmail) {
            setErrorMessage("Email addresses do not match.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/users/requestReset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            navigate("/reset-password");
        } catch (err) {
            console.error("Error logging in.", err);
            setErrorMessage("Invalid credentials or server error.");
        }
    };

    return (
        <div className="login-container">
            <Header />
            <div className="container">
                <div className="login-card">
                    <h2 className="form-title"> Forgot Password? </h2>
                    <p className="form-subtitle"> Continue to access your account. </p>
                    {errorMessage && (
                        <div className="error-banner"
                            style={{ color: "#ff4d4d", marginBottom: "1rem", textAlign: "center", fontSize: "0.88rem" }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} method='post' className="login-form">
                        <div className="input-group">
                            <label htmlFor='email'>Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="you@example.com"
                                required />
                        </div>
                        <div className="input-group">
                            <label htmlFor='confirmEmail'> Confirm Email *</label>
                            <input
                                type="email"
                                name="confirmEmail"
                                id="confirmEmail"
                                placeholder="you@example.com"
                                required />
                        </div>
                        <button type="submit" className="btn-submit">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default ForgotPassword;
