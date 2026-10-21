import React, { useState } from "react";
import type { ProfileFormData, PaymentCard, Message } from '../pages/ProfilePage.js'

import "./PaymentCardForm.css";

interface Props {
    formData: ProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
    setMessage: React.Dispatch<React.SetStateAction<Message>>
}

const emptyCard = { cardHolderName: "", cardNumber: "", expirationDate: "", cardType: "Visa" };

export const PaymentCardForm: React.FC<Props> = ({ formData, setFormData, setMessage }) => {
    const [cardForm, setCardForm] = useState(emptyCard);
    const [editingCardId, setEditingCardId] = useState(null);
    const [isAddingCard, setIsAddingCard] = useState(false);

    function handleCardChange(event) {
        const { name, value } = event.target;

        setCardForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

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
            cardType: card.cardType ?? "Visa",
            cardNumber: card.cardNumber ?? "",
            expirationDate: card.expirationDate ?? "",
        });
        setIsAddingCard(true);
        setMessage(null);
    }

    function cancelCardForm() {
        setIsAddingCard(false);
        setEditingCardId(null);
        setCardForm(emptyCard);
    }

    function handleCardSubmit() {
        const { cardHolderName, cardNumber, expirationDate, cardType } = cardForm;

        if (
            !cardHolderName.trim() ||
            !cardType ||
            !cardNumber ||
            !expirationDate
        ) {
            setMessage({ text: "Verify the card fields and fix any errors", type: "error" });
            return;
        }

        const newCard = {
            id: editingCardId ?? crypto.randomUUID(),
            cardHolderName: cardHolderName.trim(),
            cardNumber,
            expirationDate,
            cardType,
        };

        setFormData((current) => {
            const cards = editingCardId
                ? current.cards.map((card) =>
                    card.id === editingCardId ? newCard : card
                )
                : [...current.cards, newCard];

            return { ...current, cards };
        });

        cancelCardForm();
    }

    function removeCard(cardId: number) {
        setFormData((current) => ({
            ...current,
            cards: current.cards.filter((card) => card.id !== cardId),
        }));

        if (editingCardId === cardId) {
            cancelCardForm();
        }
    }

    return (
        <section className="payment-form-container">
            <h3>Payment Cards ({formData.cards.length}/3)</h3>

            {formData.cards.length === 0 && (
                <p className="payment-form-no-cards-message">No payment cards saved!</p>
            )}

            {formData.cards.map((card) => (
                <article key={card.id} className="payment-form-card">
                    <div>
                        <p className="payment-form-card-number">{card.cardType} {card.cardNumber} </p>
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
                                <label htmlFor="cardType">Type</label>
                                <select
                                    id="cardType"
                                    name="cardType"
                                    value={cardForm.cardType}
                                    onChange={handleCardChange}
                                >
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="American Express">American Express</option>
                                    <option value="Discover">Discover</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="expirationDate">Expiration Date</label>
                                <input
                                    id="expirationDate"
                                    name="expirationDate"
                                    type="text"
                                    placeholder="01/30"
                                    value={cardForm.expirationDate}
                                    onChange={handleCardChange}
                                    required
                                />
                            </div>

                        </div>
                    </div>
                    <div>
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