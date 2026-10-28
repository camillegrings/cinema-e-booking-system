import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Form.css";
import { Header } from "../components/Header.js";
import { PaymentCardForm } from '../components/PaymentCardForm.js'

export type Address = {
	street: string;
	city: string;
	state: string;
	zipCode: string;
};

export type PaymentCard = {
	id?: number;
	cardHolderName: string;
	cardNumber: string;
	expirationDate: string;
	billingAddress: Address;
};

export type ProfileFormData = {
	firstName: string;
	lastName: string;
	email: string;
	confirmEmail: string;
	password: string;
	confirmPassword?: string;
	phone: string;
	subscribedToPromos: boolean;
	address: Address;
	cards: PaymentCard[];
}

export type Message = { text: string; type: "success" | "error" } | null

export const Register = () => {
	const navigate = useNavigate();
	const [message, setMessage] = useState<Message>(null);
	const [formData, setFormData] = useState<ProfileFormData>({
		firstName: "",
		lastName: "",
		email: "",
		confirmEmail: "",
		password: "",
		confirmPassword: "",
		phone: "",
		subscribedToPromos: false,
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
		},
		cards: [],
	});

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;

		setMessage(null);
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value
		}));
	};

	const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setMessage(null);
		setFormData((prev) => ({
			...prev,
			address: {
				...prev.address,
				[name]: value,
			},
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.email !== formData.confirmEmail) {
			setMessage({ text: "Email addresses do not match.", type: "error" });
			window.scrollTo({ top: 0, behavior: 'smooth' })
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setMessage({ text: "Passwords do not match.", type: "error" });
			window.scrollTo({ top: 0, behavior: 'smooth' })
			return;
		}

		fetch("http://localhost:3000/users/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		})
			.then((res) => {
				requestVerificationEmail(formData.email)
			})
			.catch((err) => {
				console.error("Error registering.", err);
				setMessage({ text: "Invalid credentials, please check your details and try again.", type: "error" })
			});
	};

	async function requestVerificationEmail(email) {
		fetch("http://localhost:3000/users/requestCode", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		})
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

				navigate("/verify-code");
			})
			.catch((err) => {
				console.error("Error registering.", err);
				setMessage({ text: "Error registering, please try again.", type: "error" });
			});
	}

	return (
		<div className="login-container">
			<Header />
			<div className="container">
				<div className="register-card">
					<h2 className="form-title"> Welcome </h2>
					<p className="form-subtitle"> Continue to create your account. </p>
					{message && (
						<div className="error-banner"
							style={{ color: "#ff4d4d", marginBottom: "1rem", textAlign: "center", fontSize: "0.88rem" }}>
							{message.text}
						</div>
					)}
					<form onSubmit={handleSubmit} method='post' className="register-form">
						<div className="input-group">
							<label htmlFor='email'>Email *</label>
							<input
								type="email"
								name="email"
								id="email"
								value={formData.email}
								placeholder="Enter your email"
								onChange={handleInputChange}
								required />
						</div>
						<div className="input-group">
							<label htmlFor='confirmEmail'> Confirm Email *</label>
							<input
								type="email"
								name="confirmEmail"
								id="confirmEmail"
								placeholder="you@example.com"
								value={formData.confirmEmail}
								onChange={handleInputChange}
								required />
						</div>
						<div className="input-group">
							<label>First name *</label>
							<input
								type="text"
								name="firstName"
								value={formData.firstName}
								onChange={handleInputChange}
								placeholder="Enter your first name"
								required
							/>
						</div>
						<div className="input-group">
							<label>Last name *</label>
							<input
								type="text"
								name="lastName"
								value={formData.lastName}
								onChange={handleInputChange}
								placeholder="Enter your last name"
								required
							/>
						</div>
						<div className="input-group">
							<label htmlFor='phone'>Phone Number *</label>
							<input
								type="tel"
								name="phone"
								id="phone"
								placeholder="123-456-7890"
								pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
								onChange={handleInputChange}
								value={formData.phone}
								required />
						</div>
						<h3> Address </h3>
						<div className="input-group">
							<label> Street </label>
							<input
								type="text"
								name="street"
								value={formData.address.street}
								onChange={handleAddressChange}
							/>
						</div>
						<div className="input-group">
							<label> City </label>
							<input
								type="text"
								name="city"
								value={formData.address.city}
								onChange={handleAddressChange}
							/>
						</div>
						<div className="input-group">
							<label> State </label>
							<input
								type="text"
								name="state"
								value={formData.address.state}
								onChange={handleAddressChange}
							/>
						</div>
						<div className="input-group">
							<label> Zipcode </label>
							<input
								type="text"
								name="zipCode"
								value={formData.address.zipCode}
								onChange={handleAddressChange}
							/>
						</div>
						<PaymentCardForm formData={formData} setFormData={setFormData} setMessage={setMessage} />
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
								onChange={handleInputChange}
								value={formData.password}
								required />
						</div>
						<div className="input-group">
							<label htmlFor="confirmPassword">Confirm Password *</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								placeholder="Enter your password"
								onChange={handleInputChange}
								value={formData.confirmPassword}
								required />
						</div>
						<div className="checkbox">
							<input
								type="checkbox"
								id="subscribedToPromos"
								name="subscribedToPromos"
								checked={formData.subscribedToPromos}
								onChange={handleInputChange}
							/>
							<label>I would like to subscribe for promotions.</label>
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
