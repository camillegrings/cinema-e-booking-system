import React from 'react';
import { Link } from "react-router";
import './Header.css';
import logo from '../public/logo.png'

export const Header: React.FC = () => {
    return (
        <header className="header">
            <Link to='/' className="header-logo"><img src={logo} /></Link>
        </header>
    );
};