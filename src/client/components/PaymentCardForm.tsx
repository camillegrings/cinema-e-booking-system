import React, { useState } from "react";
import type { ProfileFormData, PaymentCard } from '../pages/ProfilePage.js'

interface Props {
    formData: ProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>
}

const emptyCard = { cardHolderName: "", cardNumber: "", expirationDate: "", cardType: "" };

export const PaymentCardForm: React.FC<Props> = ({ formData, setFormData }) => {
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
        // setError("");
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
        // setError("");
    }

    function cancelCardForm() {
        setIsAddingCard(false);
        setEditingCardId(null);
        setCardForm(emptyCard);
    }

    function handleCardSubmit() {
        const { cardHolderName, cardNumber, expirationDate, cardType } =
            cardForm;

        if (
            !cardHolderName.trim() ||
            !cardType ||
            !cardNumber ||
            !expirationDate
        ) {
            // setError("Confira os dados do cartão.");
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
        <section>
            <h3>Payment Cards ({formData.cards.length}/3)</h3>

            {formData.cards.length === 0 && (
                <p>No payment cards saved!</p>
            )}

            {formData.cards.map((card) => (
                <article key={card.id}>
                    <p>
                        {card.cardType} {card.cardNumber}
                    </p>
                    <p>
                        Holder Name: {card.cardHolderName}
                    </p>
                    <p>
                        Expiration Date: {card.expirationDate}
                    </p>

                    <button
                        type="button"
                        onClick={() => openEditCardForm(card)}
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => removeCard(card.id)}
                    >
                        Remove
                    </button>
                </article>
            ))}

            {formData.cards.length < 3 && !isAddingCard && (
                <button type="button" onClick={openAddCardForm}>
                    Add New Card
                </button>
            )}

            {isAddingCard && (
                <fieldset>
                    <legend>
                        {editingCardId ? "Edit Card" : "New Card"}
                    </legend>

                    <label htmlFor="cardHolderName">Holder Name</label>
                    <input
                        id="cardHolderName"
                        name="cardHolderName"
                        value={cardForm.cardHolderName}
                        onChange={handleCardChange}
                        required
                    />

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

                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        id="cardNumber"
                        name="cardNumber"
                        inputMode="numeric"
                        value={cardForm.cardNumber}
                        onChange={handleCardChange}
                        required
                    />
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

                    <button type="button" onClick={handleCardSubmit}>
                        {editingCardId ? "Update card" : "Add card"}
                    </button>

                    <button type="button" onClick={cancelCardForm}>
                        Cancel
                    </button>
                </fieldset>
            )}
        </section>
    );
};