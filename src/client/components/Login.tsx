import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";

export const Login = () => {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		// Mock Account Login
		setTimeout(() => {
			// 1. Test Customer Credentials
			if (email === "test.customer@example.com" && password === "Password123!") {
				localStorage.setItem("token", "mock-jwt-token-customer");
				localStorage.setItem("role", "CUSTOMER");
				navigate("/"); // Redirect to home/customer dashboard
			}
			// 2. Test Admin Credentials
			else if (email === "admin@cinema.com" && password === "Password123!") {
				localStorage.setItem("token", "mock-jwt-token-admin");
				localStorage.setItem("role", "ADMIN");
				navigate("/admin/dashboard"); // Redirect to admin dashboard
			}
			// 3. Invalid Credentials
			else {
				setErrorMessage("Invalid credentials. Try test.customer@example.com / Password123!");
			}
		}, 500); // 500ms fake network delay
	};

	/*
	try {
		const res = await fetch("http://localhost:3000/users/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error || `HTTP Error: ${res.status}`);
		}

		const data = await res.json();

		// Store token for Header session check
		if (data.token) {
			localStorage.setItem("token", data.token);
		}

		// Role-based redirect (Admin vs Customer)
		if (data.role && data.role.toUpperCase() === "ADMIN") {
			navigate("/admin/dashboard");
		} else {
			navigate("/");
		}
	} catch (err: any) {
		console.error("Error logging in.", err);
		setErrorMessage("Invalid credentials or server error.");
	}
};
*/

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
