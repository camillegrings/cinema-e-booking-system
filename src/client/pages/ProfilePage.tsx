import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProfilePage.css";

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

    return (
        <div>
            <h1>Profile</h1>
        </div>
    )
}