import React, { useState, useEffect } from "react";
import "./HomePage.css";

const Login: React.FC = () => {
	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get("username");
		const password = formData.get("password");

		useEffect(() => {
			fetch("http://localhost:3000/users/login")
				.then((res) => {
					if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
					return res.json();
				})
				.catch((err) => {
					console.error("Error logging in.", err);
				});
		}, []);
	};

	return (
		<form onSubmit={handleSubmit} method='post'>
			<label htmlFor='username'>username</label>
			<input type='text' name='username' id='username' />
			<br />
			<label htmlFor='password'>password</label>
			<input type='text' name='password' id='password' />
			<br />
			<input type='submit' value='Submit' />
		</form>
	);
};

export default Login;
