import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";

export const Login = () => {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");

		const formData = new FormData(e.currentTarget);
		const username = formData.get("username");
		const password = formData.get("password");

		try {
			const res = await fetch("http://localhost:3000/users/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

			const data = await res.json();

			// Store token for Header session check
			if (data.token) {
				localStorage.setItem("token", data.token);
			}

			// Role-based redirect (Admin vs Customer)
			if (data.role === "admin") {
				navigate("/admin/dashboard");
			} else {
				navigate("/");
			}
		} catch (err) {
			console.error("Error logging in.", err);
			setErrorMessage("Invalid credentials or server error.");
		}
	};

	return (
		<div className="container">
			<Header />
			<div className="login-card">
				<h2 className="form-title"> Welcome </h2>
				<p className="form-subtitle"> Continue to access your account. </p>

				<form onSubmit={handleSubmit} method='post' className="login-form">
					<div className="input-group">
						<label htmlFor='username'>username</label>
						<input
							type="text"
							name="username"
							id="username"
							placeholder="Enter your username"
							required />
					</div>
					<div className="input-group">
						<div className="label-row">
							<label htmlFor='password'>password</label>
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

	);
};

export default Login;
