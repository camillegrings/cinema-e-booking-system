import { Link } from "react-router-dom";
import React from "react";
import "./Header.css";
import { useAuth } from "../context/AuthContext.js";

export const Header: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <div className="header">
            <header className="navbar-header">
                <div className="navbar-container">
                    <div className="title">
                        Cinema Booking
                    </div>
                    <nav className="nav-links">
                        <Link to="/" className="nav-item"> Home </Link>
                        {isAuthenticated ? (
                            <>
                                {user?.role === "admin" && (<Link to="/admin/dashboard" className="nav-item"> Dashboard </Link>)}
                                {user?.role === "customer" && (
                                    <>
                                        <Link to="/favorites" className="nav-item"> Favorites </Link>
                                        <Link to="/profile" className="nav-item"> Profile </Link>
                                    </>
                                )}
                                <button onClick={logout} className="logout-btn"> Logout </button>
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