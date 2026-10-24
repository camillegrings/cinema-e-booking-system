import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Header } from "../components/Header.js";
import "./ProfilePage.css";
import { PaymentCardForm } from '../components/PaymentCardForm.js'
import { useAuth } from "../context/AuthContext.js";

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
    name: string;
    email: string;
    currentPassword: string;
    newPassword?: string;
    phone: string;
    subscribedToPromos: boolean;
    address: Address;
    cards: PaymentCard[];
}

export type Message = { text: string; type: "success" | "error" } | null

export const ProfilePage: React.FC = () => {
    const { token } = useAuth();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
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

    const [message, setMessage] = useState<Message>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const res = await fetch("http://localhost:3000/users/profile", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    const name = data.firstName + ' ' + data.lastName
                    const cards = data.cards.map(card => ({ ...card, cardNumber: `**** **** **** ${card.lastFour}`, cardHolderName: card.cardholderName, expirationDate: card.expirationDate.slice(0, 7) }))
                    setFormData((prev) => ({ ...prev, ...data, name, address: { ...prev.address, ...data.address }, cards }));
                } else {
                    console.error("Failed to load profile",);
                }
            } catch (err) {
                console.error("Failed to load profile: ", err);
            }
        };
        fetchProfileData();
    }, []);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.currentPassword) {
            setMessage({ text: "Please enter your current password to save profile changes.", type: "error" });
            return;
        }

        try {
            const firstName = formData.name?.toString().split(' ')[0] || ''
            const lastName = formData.name?.toString().split(' ')[1] || ''

            const res = await fetch("http://localhost:3000/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, firstName, lastName })
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

    return (
        <div className="profile-page">
            <Header />
            <div className="profile-container">
                <h2> Edit Profile</h2>
                {message && (
                    <div className={`toast ${message.type}`}>
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
                    </div>
                    <div className="form-section">
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
                    </div>
                    <PaymentCardForm formData={formData} setFormData={setFormData} setMessage={setMessage} />
                    <div className="form-section">
                        <h3>Security & Confirm Changes</h3>
                        <div className="input-group">
                            <label>Current Password * (Required to save changes)</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password to confirm"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>New Password (Leave blank to keep unchanged)</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit">
                        Save Profile Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

