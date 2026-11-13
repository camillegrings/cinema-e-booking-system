import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Header } from "../components/Header.js";
import "./PaymentPage.css";

interface OrderSummary {
	showtimeId: number;
	movieTitle: string;
	showroom: string;
	showTime: string;
	tickets: {
		adult: number;
		senior: number;
		child: number;
	};
	selectedSeats: string[];
	subtotal: number;
}

interface SavedCard {
	id: number;
	slot: number;
	four_digits: string;
	name: string;
	exp_date: string;
}

export const PaymentPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, token } = useAuth();

	// Session restoration
	const [order] = useState<OrderSummary>(() => {
		const saved = sessionStorage.getItem("current_checkout_order");
		if (saved) return JSON.parse(saved);
		return {};
	});

	const prices = {
		adult: 12.0,
		senior: 10.0,
		child: 8.0,
	};

	// Confirmation email (prefilled)
	const [email, setEmail] = useState<string>(user?.email || "");
	const [emailError, setEmailError] = useState<string>("");

	const [step, setStep] = useState<"SUMMARY" | "PAYMENT" | "CONFIRMED">(
		"SUMMARY",
	);

	// Mock Payment
	const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
	const [paymentMode, setPaymentMode] = useState<"SAVED" | "NEW">("NEW");
	const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

	// Create a new card
	const [newCard, setNewCard] = useState({
		name: "",
		cardNumber: "",
		exp: "",
		cvv: "",
		zipCode: "",
	});
	const [paymentError, setPaymentError] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [bookingReference, setBookingReference] = useState<string>("");

	// If user logged in -> return saved cards
	useEffect(() => {
		if (!user?.id || !token) return;

		fetch(`http://localhost:3000/users/cards/${user.id}`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => (res.ok ? res.json() : []))
			.then((cards: SavedCard[]) => {
				if (Array.isArray(cards) && cards.length > 0) {
					setSavedCards(cards);
					setSelectedCardId(cards[0].id);
					setPaymentMode("SAVED");
				}
			})
			.catch(() => {
				// Keep default NEW card mode if fetch fails or user has no cards
			});
	}, [user, token]);

	const parseDate = (dateStr: string) => {
		const normalized = dateStr.includes("T")
			? dateStr
			: dateStr.replace(" ", "T");
		return new Date(normalized);
	};

	const formattedDate = (() => {
		const d = parseDate(order.showTime);
		return isNaN(d.getTime())
			? order.showTime
			: d.toLocaleDateString("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
					year: "numeric",
				});
	})();

	const formattedTime = (() => {
		const d = parseDate(order.showTime);
		return isNaN(d.getTime())
			? ""
			: d.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
				});
	})();

	const handleProceedToPayment = (e: React.FormEvent) => {
		e.preventDefault();
		setEmailError("");

		if (!email.trim() || !email.includes("@")) {
			setEmailError(
				"Please enter a valid email address for your booking confirmation.",
			);
			return;
		}

		setStep("PAYMENT");
	};

	/* Payment submission (requires form submission)
    const handleCompletePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentError('');

        if (paymentMode === 'SAVED' && !selectedCardId) {
            setPaymentError('Please select a saved payment card.');
            return;
        }

        if (paymentMode === 'NEW') {
            if (!newCard.name.trim() || newCard.cardNumber.replace(/\s/g, '').length < 13 || !newCard.exp.trim() || newCard.cvv.length < 3) {
                setPaymentError('Please fill out all card details accurately.');
                return;
            }
        }
        setIsProcessing(true);
    };
    */

	// Payment submission (no requirements)
	const handleCompletePayment = (e: React.FormEvent) => {
		e.preventDefault();
		setPaymentError("");

		const mockRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
		setBookingReference(mockRef);
		setStep("CONFIRMED");

		sessionStorage.clear();
	};

	return (
		<div className='payment-page-container'>
			<Header />

			<main className='payment-main-wrapper'>
				{step === "CONFIRMED" ? (
					<section className='payment-card confirmation-box'>
						<div className='confirm-icon'>✓</div>
						<h2>Booking Confirmed!</h2>
						<p className='confirm-subtitle'>
							Your confirmation and e-tickets have been sent to{" "}
							<strong>{email}</strong>.
						</p>

						<div className='confirm-receipt'>
							<div className='receipt-row'>
								<span>Booking Reference:</span>
								<strong>{bookingReference}</strong>
							</div>
							<div className='receipt-row'>
								<span>Movie:</span>
								<strong>{order.movieTitle}</strong>
							</div>
							<div className='receipt-row'>
								<span>Showroom & Time:</span>
								<strong>
									{order.showroom} • {formattedDate} at {formattedTime}
								</strong>
							</div>
							<div className='receipt-row'>
								<span>Seats:</span>
								<strong>{order.selectedSeats.join(", ")}</strong>
							</div>
							<div className='receipt-row total'>
								<span>Amount Paid (Pre-Tax Subtotal):</span>
								<strong>${order.subtotal.toFixed(2)}</strong>
							</div>
						</div>
						<button
							className='primary-action-btn'
							onClick={() => navigate("/")}
						>
							Return to Home
						</button>
					</section>
				) : (
					<div className='checkout-grid'>
						<section className='payment-card order-summary-card'>
							<h2 className='card-heading'>Order Summary</h2>

							<div className='summary-movie-block'>
								<h3 className='summary-movie-title'>{order.movieTitle}</h3>
								<p className='summary-meta'>{order.showroom}</p>
								<p className='summary-meta'>
									{formattedDate} at {formattedTime}
								</p>
							</div>

							<div className='summary-divider' />

							<div className='summary-detail-group'>
								<span className='detail-label'>Selected Seats</span>
								<div className='seat-pills-list'>
									{order.selectedSeats.map((seat) => (
										<span key={seat} className='seat-pill'>
											{seat}
										</span>
									))}
								</div>
							</div>

							<div className='summary-divider' />

							<div className='summary-detail-group'>
								<span className='detail-label'>Itemized Tickets</span>
								<div className='itemized-list'>
									{order.tickets.adult > 0 && (
										<div className='item-row'>
											<span>
												Adult × {order.tickets.adult} ($
												{prices.adult.toFixed(2)} ea)
											</span>
											<span>
												${(order.tickets.adult * prices.adult).toFixed(2)}
											</span>
										</div>
									)}
									{order.tickets.senior > 0 && (
										<div className='item-row'>
											<span>
												Senior × {order.tickets.senior} ($
												{prices.senior.toFixed(2)} ea)
											</span>
											<span>
												${(order.tickets.senior * prices.senior).toFixed(2)}
											</span>
										</div>
									)}
									{order.tickets.child > 0 && (
										<div className='item-row'>
											<span>
												Child × {order.tickets.child} ($
												{prices.child.toFixed(2)} ea)
											</span>
											<span>
												${(order.tickets.child * prices.child).toFixed(2)}
											</span>
										</div>
									)}
								</div>
							</div>
							<div className='summary-divider' />

							<div className='subtotal-row'>
								<span>Subtotal (Before Tax)</span>
								<span className='subtotal-amount'>
									${order.subtotal.toFixed(2)}
								</span>
							</div>
						</section>
						<div className='checkout-right-column'>
							{step === "SUMMARY" ? (
								<form
									className='payment-card'
									onSubmit={handleProceedToPayment}
								>
									<h2 className='card-heading'>Confirm Contact Email</h2>
									<p className='card-subtext'>
										We will send your digital tickets and receipt to this
										address.
									</p>

									<div className='form-group'>
										<label htmlFor='confirm-email'>Email Address</label>
										<input
											id='confirm-email'
											type='email'
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder='Enter your email address'
											required
										/>
										{emailError && (
											<span className='field-error'>{emailError}</span>
										)}
									</div>

									<div className='button-row'>
										<button
											type='button'
											className='secondary-action-btn'
											onClick={() => navigate(-1)}
										>
											← Back to Seats
										</button>
										<button type='submit' className='primary-action-btn'>
											Proceed to Payment →
										</button>
									</div>
								</form>
							) : (
								<form
									className='payment-card'
									onSubmit={handleCompletePayment}
									noValidate
								>
									<div className='payment-header-row'>
										<h2 className='card-heading'>Payment Details</h2>
										<button
											type='button'
											className='link-edit-btn'
											onClick={() => setStep("SUMMARY")}
										>
											Edit Email ({email})
										</button>
									</div>
									<div className='payment-mode-tabs'>
										{savedCards.length > 0 && (
											<button
												type='button'
												className={`mode-tab ${paymentMode === "SAVED" ? "active" : ""}`}
												onClick={() => setPaymentMode("SAVED")}
											>
												Saved Cards ({savedCards.length})
											</button>
										)}
										<button
											type='button'
											className={`mode-tab ${paymentMode === "NEW" ? "active" : ""}`}
											onClick={() => setPaymentMode("NEW")}
										>
											+ New Credit / Debit Card
										</button>
									</div>

									{paymentError && (
										<div className='error-alert'>{paymentError}</div>
									)}

									{paymentMode === "SAVED" && savedCards.length > 0 ? (
										<div className='saved-cards-list'>
											{savedCards.map((card) => (
												<label
													key={card.id}
													className={`saved-card-option ${selectedCardId === card.id ? "selected" : ""}`}
												>
													<input
														type='radio'
														name='savedCard'
														checked={selectedCardId === card.id}
														onChange={() => setSelectedCardId(card.id)}
													/>
													<div className='saved-card-info'>
														<span className='card-number-mask'>
															•••• •••• •••• {card.four_digits}
														</span>
														<span className='card-holder-meta'>
															{card.name} • Expires {card.exp_date?.slice(0, 7)}
														</span>
													</div>
												</label>
											))}
										</div>
									) : (
										<div className='new-card-form'>
											<div className='form-group'>
												<label>Cardholder Name</label>
												<input
													type='text'
													placeholder='Jane Doe'
													value={newCard.name}
													onChange={(e) =>
														setNewCard({ ...newCard, name: e.target.value })
													}
													required
												/>
											</div>

											<div className='form-group'>
												<label>Card Number</label>
												<input
													type='text'
													maxLength={19}
													placeholder='4111 2222 3333 4444'
													value={newCard.cardNumber}
													onChange={(e) =>
														setNewCard({
															...newCard,
															cardNumber: e.target.value,
														})
													}
													required
												/>
											</div>

											<div className='form-split-row'>
												<div className='form-group'>
													<label>Expiration (MM/YY)</label>
													<input
														type='text'
														maxLength={5}
														placeholder='12/29'
														value={newCard.exp}
														onChange={(e) =>
															setNewCard({ ...newCard, exp: e.target.value })
														}
														required
													/>
												</div>

												<div className='form-group'>
													<label>CVV</label>
													<input
														type='password'
														maxLength={4}
														placeholder='123'
														value={newCard.cvv}
														onChange={(e) =>
															setNewCard({ ...newCard, cvv: e.target.value })
														}
														required
													/>
												</div>

												<div className='form-group'>
													<label>Zipcode</label>
													<input
														type='text'
														maxLength={10}
														placeholder='30601'
														value={newCard.zipCode}
														onChange={(e) =>
															setNewCard({
																...newCard,
																zipCode: e.target.value,
															})
														}
														required
													/>
												</div>
											</div>
										</div>
									)}

									<div className='button-row'>
										<button
											type='button'
											className='secondary-action-btn'
											onClick={() => setStep("SUMMARY")}
											disabled={isProcessing}
										>
											← Back
										</button>
										<button
											type='submit'
											className='primary-action-btn'
											disabled={isProcessing}
										>
											{isProcessing
												? "Processing Payment..."
												: `Pay $${order.subtotal.toFixed(2)}`}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default PaymentPage;
