import React from 'react';
import { Link } from "react-router-dom";
import './Header.css';


export const Header: React.FC = () => {
    return (
        <header className="header">
            <Link to='/' className="header-logo">
            <img src="/logo.png" alt="Cinema Logo" />
            </Link>
        </header>
    );
};