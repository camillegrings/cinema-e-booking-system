import React, { useState, ChangeEvent } from "react";
import type { ProfileFormData, PaymentCard, Message } from '../pages/ProfilePage.js'
import { useAuth } from "../context/AuthContext.js";

import "./PaymentCardForm.css";

interface Props {
    formData: ProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
    setMessage: React.Dispatch<React.SetStateAction<Message>>
}

const emptyCard = {
    cardHolderName: "", cardNumber: "", expirationDate: "", billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
    }
};

export const PaymentCardForm: React.FC<Props> = ({ formData, setFormData, setMessage }) => {
    const { token } = useAuth();
    const [cardForm, setCardForm] = useState(emptyCard);
    const [editingCardId, setEditingCardId] = useState(null);
    const [isAddingCard, setIsAddingCard] = useState(false);

    function handleCardChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target;

        let formattedValue = value;
        if (name === "cardNumber") {
            formattedValue = value.replace(/\D/g, "").substring(0, 16);
        }

        setCardForm((current) => ({
            ...current,
            [name]: formattedValue,
        }));
    }

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setCardForm((current) => ({
            ...current,
            billingAddress: {
                ...current.billingAddress,
                [name]: value,
            },
        }));
    };

    function openAddCardForm() {
        setEditingCardId(null);
        setCardForm(emptyCard);
        setIsAddingCard(true);
        setMessage(null);
    }

    function openEditCardForm(card: PaymentCard) {
        setEditingCardId(card.id);
        setCardForm({
            cardHolderName: card.cardHolderName ?? "",
            cardNumber: card.cardNumber ?? "",
            expirationDate: card.expirationDate ?? "",
            billingAddress: card.billingAddress ?? emptyCard.billingAddress
        });
        setIsAddingCard(true);
        setMessage(null);
    }

    function cancelCardForm() {
        setIsAddingCard(false);
        setEditingCardId(null);
        setCardForm(emptyCard);
    }

    async function handleAddCardSubmit(card: PaymentCard) {
        const newCard = { ...card, cardholderName: card.cardHolderName };
        const res = await fetch("http://localhost:3000/users/profile/cards", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newCard)
        });

        if (res.ok) {
            const body = await res.json();
            setFormData((current) => {
                const cards = editingCardId
                    ? current.cards.map((card) =>
                        card.id === editingCardId ? newCard : card
                    )
                    : [...current.cards, { ...newCard, id: body.cardId }];

                return { ...current, cards };
            });
            setMessage({ text: "Card updated successfully.", type: "success" });

            cancelCardForm();
        } else {
            setMessage({ text: "Failed to update card.", type: "error" });
        }
    }

    async function handleUpdateCardSubmit(card: PaymentCard) {
        const newCard = { ...card, cardholderName: card.cardHolderName };
        const res = await fetch(`http://localhost:3000/users/profile/cards/${editingCardId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newCard)
        });

        if (res.ok) {
            setFormData((current) => {
                const cards = editingCardId
                    ? current.cards.map((card) =>
                        card.id === editingCardId ? newCard : card
                    )
                    : [...current.cards, newCard];

                return { ...current, cards };
            });
            setMessage({ text: "Card updated successfully.", type: "success" });

            cancelCardForm();
        } else {
            setMessage({ text: "Failed to update card.", type: "error" });
        }
    }

    function handleCardSubmit() {
        const { cardHolderName, cardNumber, expirationDate } = cardForm;

        if (
            !cardHolderName.trim() ||
            !cardNumber ||
            !expirationDate
        ) {
            setMessage({ text: "Verify the card fields and fix any errors", type: "error" });
            return;
        }

        if (cardNumber.length < 13) {
            setMessage({ text: "Please enter a valid card number.", type: "error" });
            return;
        }

        if (editingCardId) {
            handleUpdateCardSubmit(cardForm)
        } else {
            handleAddCardSubmit(cardForm)
        }
    }

    async function removeCard(cardId: number) {
        const res = await fetch(`http://localhost:3000/users/profile/cards/${cardId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            setFormData((current) => ({
                ...current,
                cards: current.cards.filter((card) => card.id !== cardId),
            }));

            if (editingCardId === cardId) {
                cancelCardForm();
            }
        } else {
            setMessage({ text: "Failed to remove card.", type: "error" });
        }
    }

    const formatCardMask = (num: string) => {
        if (num.length <= 4) return num;
        return `**** **** **** ${num.slice(-4)}`;
    };

    return (
        <section className="payment-form-container">
            <h3>Payment Cards ({formData.cards.length}/3)</h3>

            {formData.cards.map((card) => (
                <article key={card.id} className="payment-form-card">
                    <div>
                        <p className="payment-form-card-number">
                            Number: {formatCardMask(card.cardNumber)} </p>
                        <p>Holder Name: {card.cardHolderName} </p>
                        <p>Expiration Date: {card.expirationDate}</p>
                    </div>
                    <div>
                        <button className="payment-form-card-btn-primary" type="button" onClick={() => openEditCardForm(card)}>Edit</button>
                        <button className="payment-form-card-btn-secondary" type="button" onClick={() => removeCard(card.id)}>Remove</button>
                    </div>
                </article>
            ))}

            {formData.cards.length < 3 && !isAddingCard && (
                <button className="payment-form-btn-secondary" type="button" onClick={openAddCardForm}>
                    Add New Card
                </button>
            )}

            {isAddingCard && (
                <fieldset className="payment-form-add-card-wrapper">
                    <legend>
                        {editingCardId ? "Edit Card" : "New Card"}
                    </legend>
                    <div className="payment-form-add-card-fields">
                        <div className="payment-form-add-card-inline-fields">
                            <div className="input-group">
                                <label htmlFor="cardHolderName">Holder Name</label>
                                <input
                                    id="cardHolderName"
                                    name="cardHolderName"
                                    value={cardForm.cardHolderName}
                                    onChange={handleCardChange}
                                    required
                                /> </div>

                            <div className="input-group">
                                <label htmlFor="cardNumber">Card Number</label>
                                <input
                                    id="cardNumber"
                                    name="cardNumber"
                                    inputMode="numeric"
                                    value={cardForm.cardNumber}
                                    onChange={handleCardChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="payment-form-add-card-inline-fields">
                            <div className="input-group">
                                <label htmlFor="expirationDate">Expiration Date</label>
                                <input
                                    id="expirationDate"
                                    name="expirationDate"
                                    type="text"
                                    placeholder="2030-10"
                                    value={cardForm.expirationDate}
                                    onChange={handleCardChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="payment-form-add-card-inline-fields">
                            <div className="input-group">
                                <label htmlFor="street">Billing Address - Street</label>
                                <input
                                    id="street"
                                    name="street"
                                    value={cardForm.billingAddress.street}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="city">Billing Address - City</label>
                                <input
                                    id="city"
                                    name="city"
                                    value={cardForm.billingAddress.city}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="payment-form-add-card-inline-fields">
                            <div className="input-group">
                                <label htmlFor="state">Billing Address - State</label>
                                <input
                                    id="state"
                                    name="state"
                                    value={cardForm.billingAddress.state}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="zipCode">Billing Address - ZipCode</label>
                                <input
                                    id="zipCode"
                                    name="zipCode"
                                    value={cardForm.billingAddress.zipCode}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="payment-form-add-card-btns">
                        <button type="button" onClick={handleCardSubmit} className="payment-form-card-btn-primary">
                            {editingCardId ? "Update card" : "Add card"}
                        </button>

                        <button type="button" onClick={cancelCardForm} className="payment-form-card-btn-secondary">
                            Cancel
                        </button>
                    </div>
                </fieldset>
            )}
        </section>
    );
};