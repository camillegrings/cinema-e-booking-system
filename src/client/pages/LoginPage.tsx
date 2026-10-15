"use client";

import React from "react";
import Login from "../components/Login.js";
import { Header } from "../components/Header.js";

const handleLogin = (user) => {
    console.log("User logged in:", user.email);
};

export default function LoginPage() {
    return (
        <div>
            <Header />

            <div style={{ padding: '2rem' }}>
                <Login onLogin={handleLogin} />
            </div>
        </div>
    );
}