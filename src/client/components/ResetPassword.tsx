import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "./Header.js";

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const newPassword = formData.get("newPassword");
        const confirmPassword = formData.get("confirmPassword");
        const code = formData.get("code");

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/users/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, new_password: newPassword, token: code }),
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            navigate("/login");
        } catch (err) {
            console.error("Error reseting password.", err);
            setErrorMessage("Invalid credentials or server error.");
        }
    };

    return (
        <div className="login-container">
            <Header />
            <div className="container">
                <div className="login-card">
                    <h2 className="form-title"> Reset Password </h2>
                    <p className="form-subtitle"> Add the verification code sent to your email. </p>
                    {errorMessage && (
                        <div className="error-banner"
                            style={{ color: "#ff4d4d", marginBottom: "1rem", textAlign: "center", fontSize: "0.88rem" }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} method='post' className="login-form">
                        <div className="input-group">
                            <label htmlFor='newPassword'>Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Enter your Email"
                                required />
                        </div>
                        <div className="input-group">
                            <label htmlFor='newPassword'>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                placeholder="Enter your new Password"
                                required />
                        </div>
                        <div className="input-group">
                            <label htmlFor='confirmPassword'> Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                required />
                        </div>
                        <div className="input-group">
                            <label htmlFor='code'>Verification Code</label>
                            <input
                                type="code"
                                name="code"
                                id="code"
                                placeholder="Enter your verification code"
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
