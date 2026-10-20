import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { Movie } from '../services/movie.js';
import { Header } from '../components/Header.js'
import { Link } from "react-router-dom";

import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
    return (
        <div className="admin-dashboard-container">
            <Header />
            <div className="admin-dashboard-content">
                <div className="admin-dashboard-card">
                    <h2 className="admin-dashboard-title"> Admin Dashboard </h2>
                    <p className="admin-dashboard-subtitle"> Manages everything in one place! </p>
                    <ul className="admin-dashboard-menu">
                        <li><Link to='/'>Manage Movies</Link></li>
                        <li><Link to='/'>Promotions</Link></li>
                        <li><Link to='/'>Users</Link></li>
                        <li><Link to='/'>Showtimes</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};