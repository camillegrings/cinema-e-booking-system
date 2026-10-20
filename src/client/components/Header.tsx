"use client";

import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./Header.css";

export const Header: React.FC = () => {

    // useState variables for if the user is logged in or not
    // default is false
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    // Login tokens
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        checkAuth();
        const interval = setInterval(checkAuth, 500);
        return () => clearInterval(interval);
    }, []);

    // Logout event
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <div className="header">
            <header className="navbar-header">
                <div className="navbar-container">
                    <div className="title">
                        Cinema Booking
                    </div>
                    <nav className="nav-links">
                        <Link to="/" className="nav-item"> Home </Link>

                        {isLoggedIn ? (
                            <>
                                <Link to="/favorites" className="nav-item"> Favorites </Link>
                                <Link to="/profile" className="nav-item"> Profile </Link>
                                <button onClick={handleLogout} className="logout-btn"> Logout </button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-item"> Login </Link>
                        )}
                    </nav>
                </div>
            </header>
        </div>
    );
};