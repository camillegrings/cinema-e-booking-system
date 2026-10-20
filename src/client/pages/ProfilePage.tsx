import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { Header } from "../components/Header.js";

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
    cardType: string;
};

export type FavoriteMovie = {
    id: number;
    title: string;
    posterUrl: string;
}

export type ProfileFormData = {
    name: string;
    email: string;
    password?: string;
    phone: string;
    subscribedToPromos: boolean;
    address: Address;
    cards: PaymentCard[];
    favoriteMovies: FavoriteMovie[];
}

export const ProfilePage: React.FC = () => {
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        email: "",
        password: "",
        phone: "",
        subscribedToPromos: false,
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
        },
        cards: [],
        favoriteMovies: []
    });

    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [newCard, setNewCard] = useState<PaymentCard>({
        cardHolderName: "",
        cardNumber: "",
        expirationDate: "",
        cardType: "Visa"
    });
    const [showAddCard, setAddCard] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:3000/users/profile", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData(data);
                } else {
                    setFormData({
                        name: "User Cards",
                        email: "user.cards@example.com",
                        password: "",
                        phone: "123-456-7890",
                        subscribedToPromos: true,
                        address: {
                            street: "123 Fake Address",
                            city: "Athens",
                            state: "GA",
                            zipCode: "30601"
                        },
                        cards: [
                            { id: 1, cardHolderName: "User Cards", cardNumber: "**** **** **** 4242", expirationDate: "12/28", cardType: "Visa" },
                            { id: 2, cardHolderName: "User Cards", cardNumber: "**** **** **** 4444", expirationDate: "10/27", cardType: "MasterCard" },
                            { id: 3, cardHolderName: "User Cards", cardNumber: "**** **** **** 1000", expirationDate: "08/29", cardType: "Amex" }
                        ],
                        favoriteMovies: [
                            { id: 1, title: "Spider-Man: Brand New Day", posterUrl: "https://img.youtube.com/vi/8TZMtslA3UY/maxresdefault.jpg" }
                        ]
                    });
                }
            } catch (err) {
                console.error("Failed to load profile: ", err);
            }
            fetchProfileData();
        };
        fetchProfileData();
    }, []);
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:3000/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ text: "Profile updated successfully!", type: "success" });
            } else {
                setMessage({ text: "Failed to update profile.", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Profile updated successfully (Local).", type: "success" });
        }
    };
    // Handle payment card change (add & delete)
    // Handle address change
    return (
        <div className="profile-page">
            <Header />
            <div className="profile-container">
                <h2> Edit Profile</h2>
                {message && (
                    <div className={`status-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-section">
                        <h3> Personal Information </h3>
                        <div className="input-group">
                            <label> Email Address (Cannot be modified) </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="disabled"
                            />
                        </div>
                        <div className="input-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                />
                            </div>
                        <div className="input-group">
                            <label> New Password </label>
                            <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="form-section">
                        <h3> Address </h3>
                        <div className="input-group">
                            <label>Street Address * Add address Change</label>
                        </div>
                    </div>
                    <div className="form-section">
                        <h3> Payment Cards </h3>
                        <div className="input-group">
                            <label> Add address Change</label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}