import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "./Header.js";

export const VerifyCode = () => {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage("");

		const formData = new FormData(e.currentTarget);
		const code = formData.get("code");

		try {
			const res = await fetch(`http://localhost:3000/users/validate?token=${code}`, {
				method: "POST",
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || `HTTP Error: ${res.status}`);
			}

			// Role-based redirect (Admin vs Customer)
			navigate('/login');
		} catch (err: any) {
			console.error("Error validating code.", err);
			setErrorMessage(err.message || "Invalid verification code or server error.");
		}
	};
	return (
		<div className="login-container">
			<Header />
			<div className="container">
				<div className="login-card">
					<h2 className="form-title"> Verify Code </h2>
					<p className="form-subtitle"> Add the verification code sent to your email. </p>
					{errorMessage && (
						<div className="error-banner"
							style={{ color: "#ff4d4d", marginBottom: "1rem", textAlign: "center", fontSize: "0.88rem" }}>
							{errorMessage}
						</div>
					)}
					<form onSubmit={handleSubmit} method='post' className="login-form">
						<div className="input-group">
							<label htmlFor='code'>Code</label>
							<input
								type="code"
								name="code"
								id="code"
								placeholder="Enter your code"
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