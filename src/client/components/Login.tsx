import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";
import { useAuth } from "../context/AuthContext.js";

export const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		try {
			const res = await fetch("http://localhost:3000/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || `HTTP Error: ${res.status}`);
			}

			// Store token and user data for Header session check 
			login(data.user, data.token);

			// Role-based redirect (Admin vs Customer)
			navigate(data.user?.role?.toLowerCase() === "admin" ? "/admin/dashboard" : "/", { replace: true });
		} catch (err: any) {
			console.error("Error logging in.", err);
			setErrorMessage(err.message || "Invalid credentials or server error.");
		}
	};
	return (
		<div className="login-container">
			<Header />
			<div className="container">
				<div className="login-card">
					<h2 className="form-title"> Welcome </h2>
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
								placeholder="Enter your email"
								required />
						</div>
						<div className="input-group">
							<div className="label-row">
								<label htmlFor='password'>Password</label>
								<Link to="/forgot-password" className="forgot-link">
									Forgot password?
								</Link>
							</div>
							<input
								type="password"
								name="password"
								id="password"
								placeholder="Enter your password"
								required
							/>
						</div>
						<button type="submit" className="btn-submit">
							Submit
						</button>
					</form>
					<p className="signup-prompt">
						Don't have an account? <Link to="/register">Sign up</Link>
					</p>
				</div>
			</div>
		</div>

	);
};

export default Login;
