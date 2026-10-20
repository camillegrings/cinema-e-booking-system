import React, { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";

export const Register = () => {
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		const formData = new FormData(e.currentTarget);
		const email = formData.get("email");
		const confirmEmail = formData.get("confirmEmail");
		const name = formData.get("name");
		const phone = formData.get("phone");
		const password = formData.get("password");
		const confirmPassword = formData.get("confirmPassword");

		if (email !== confirmEmail) {
			setErrorMessage("Email addresses do not match.");
			return;
		}

		if (password !== confirmPassword) {
			setErrorMessage("Passwords do not match.");
			return;
		}

		fetch("http://localhost:3000/users/register", {
			method: "POST",
			body: JSON.stringify({ email, name, phone, password }),
		})
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

				navigate("/login");
			})
			.catch((err) => {
				console.error("Error registering.", err);
				setErrorMessage("Invalid credentials, please check your details and try again.");
			});
		navigate("/");
	};

	return (
		<div className="login-container">
			<Header />
			<div className="container">
				<div className="register-card">
					<h2 className="form-title"> Welcome </h2>
					<p className="form-subtitle"> Continue to create your account. </p>
					<form onSubmit={handleSubmit} method='post' className="register-form">
						<div className="input-group">
							<label htmlFor='email'>Email *</label>
							<input
								type="email"
								name="email"
								id="email"
								placeholder="Enter your email"
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
						<div className="input-group">
							<label htmlFor='name'>Name *</label>
							<input
								type="text"
								name="name"
								id="name"
								placeholder="Enter your name"
								required />
						</div>
						<div className="input-group">
							<label htmlFor='phone'>Phone Number *</label>
							<input
								type="tel"
								name="phone"
								id="phone"
								placeholder="123-456-7890"
								pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
								required />
						</div>
						<div className="input-group">
							<label htmlFor='password'>Password *</label>
							<input
								type="password"
								name="password"
								id="password"
								placeholder="Enter your password"
								pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
								title="Must contain at least one uppercase letter, one lowercase letter, and one number."
								minLength={8}
								required />
						</div>
						<div className="input-group">
							<label htmlFor="confirmPassword">Confirm Password *</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								placeholder="Enter your password"
								required />
						</div>
						<button type="submit" className="btn-submit">
							Register
						</button>
					</form>
					<p className="signup-prompt">
						Already have an account? <Link to="/login">Login</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
