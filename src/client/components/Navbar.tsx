"use client";

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { style } from "./Header.css";

export default function Navbar() {

    // useState variables for if the user is logged in or not
    // default is false
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Login tokens
    useEffect(() => {
        const interval = setInterval(() => {
            if (!localStorage.getItem("token")) {
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <nav>
            <div className="flex justify-between items-center h-20 px-6 md:px-16">
                <div className="flex items-center text-white font-medium">
                    <Link className="cursor-pointer hover:underline" to="">
                        Home
                    </Link>
                </div>
            </div>
        </nav>
    )
}