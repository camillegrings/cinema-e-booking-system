import React, { useState, useMemo } from 'react';
import './BookingPage.css'
import { Header } from '../components/Header.js'

const ReclinerSeatSVG = () => (
    <svg className="seat-svg" viewBox="0 0 32 34">
        <rect className="seat-main" x="6" y="3" width="20" height="18" rx="4" />
        <rect className="seat-detail" x="9" y="5" width="14" height="6" rx="2" />
        <rect className="seat-main" x="7" y="21" width="18" height="10" rx="3" />
        <rect className="seat-main" x="1" y="11" width="4" height="16" rx="2" />
        <rect className="seat-main" x="27" y="11" width="4" height="16" rx="2" />
    </svg>
);

type ITickets = {
    adult: number;
    senior: number;
    child: number;
}

export const BookingPage: React.FC = () => {
    // Ticket Prices setup
    const TICKET_PRICES = {
        adult: 16.50,
        senior: 13.50,
        child: 11.50
    };

    // State for ticket quantities (Default 1 adult ticket)
    const [tickets, setTickets] = useState<ITickets>({
        adult: 1,
        senior: 0,
        child: 0
    });

    // Calculate total tickets needed
    const totalTicketsNeeded = tickets.adult + tickets.senior + tickets.child;

    // Pre-occupied seats matching typical cinema state
    const occupiedSeats = useMemo(() => new Set(['D5', 'C3', 'C4', 'A1', 'A2']), []);

    // Selected seat IDs
    const [selectedSeats, setSelectedSeats] = useState(['E3']);
    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3200);
    };

    const handleTicketChange = (category: keyof ITickets, delta: number) => {
        const currentCount = tickets[category];
        const newCount = Math.max(0, currentCount + delta);

        const updatedTickets = { ...tickets, [category]: newCount };
        const newTotalNeeded = updatedTickets.adult + updatedTickets.senior + updatedTickets.child;

        if (newTotalNeeded < 1) {
            showToast('Please, select at least one ticket.');
            return;
        }

        setTickets(updatedTickets);

        // If new ticket total is less than currently selected seats, trim excess seats
        if (selectedSeats.length > newTotalNeeded) {
            const trimmedSeats = selectedSeats.slice(0, newTotalNeeded);
            setSelectedSeats(trimmedSeats);
            showToast(`Adjusted to ${newTotalNeeded} seat(s) based on the number of tickets.`);
        }
    };

    const toggleSeat = (seatId: string) => {
        if (occupiedSeats.has(seatId)) return;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            if (selectedSeats.length >= totalTicketsNeeded) {
                showToast(`You have already selected ${totalTicketsNeeded} seat(s). Increase the number of tickets to select more seats.`);
                return;
            }
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    // Rows configuration (A to F)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="booking-container">
            <Header />
            {toastMsg && <div className="toast-popup">{toastMsg}</div>}
            <header className="cinema-header">
                <img
                    src="https://img.youtube.com/vi/Ho10_4IX1jE/maxresdefault.jpg"
                    alt="Practical Magic 2"
                    className="movie-poster-thumb"
                />
                <div className="header-details">
                    <h1 className="movie-title">Practical Magic 2</h1>
                    <div className="movie-meta-bar">
                        <span className="meta-item">ROOM 1</span>
                        <span className="meta-divider">|</span>
                        <span className="meta-item">SEP 21, 2026</span>
                        <span className="meta-divider">|</span>
                        <span>2:00 PM</span>
                        <span className="meta-divider">|</span>
                        <span className="rating-badge">PG-13</span>
                    </div>
                </div>
            </header>
            <main className="main-canvas">
                <section className="ticket-section">
                    <div className="ticket-header">
                        <div className="ticket-title">
                            <span>Select tickets</span>
                        </div>
                    </div>
                    <div className="ticket-categories-grid">
                        <div className={`category-card ${tickets.adult > 0 ? 'active' : ''}`}>
                            <div className="category-info">
                                <span className="category-name">Adult</span>
                                <span className="category-price">${TICKET_PRICES.adult.toFixed(2)}</span>
                                <span className="category-subtext">Regular ticket</span>
                            </div>
                            <div className="stepper">
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('adult', -1)}
                                    disabled={tickets.adult === 0}
                                >-</button>
                                <span className="stepper-count">{tickets.adult}</span>
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('adult', 1)}
                                >+</button>
                            </div>
                        </div>
                        <div className={`category-card ${tickets.senior > 0 ? 'active' : ''}`}>
                            <div className="category-info">
                                <span className="category-name">Senior (60+)</span>
                                <span className="category-price">${TICKET_PRICES.senior.toFixed(2)}</span>
                                <span className="category-subtext">Seniors aged 60 and over</span>
                            </div>
                            <div className="stepper">
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('senior', -1)}
                                    disabled={tickets.senior === 0}
                                >-</button>
                                <span className="stepper-count">{tickets.senior}</span>
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('senior', 1)}
                                >+</button>
                            </div>
                        </div>
                        <div className={`category-card ${tickets.child > 0 ? 'active' : ''}`}>
                            <div className="category-info">
                                <span className="category-name">Child (2-12)</span>
                                <span className="category-price">${TICKET_PRICES.child.toFixed(2)}</span>
                                <span className="category-subtext">Children aged 2 to 12</span>
                            </div>
                            <div className="stepper">
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('child', -1)}
                                    disabled={tickets.child === 0}
                                >-</button>
                                <span className="stepper-count">{tickets.child}</span>
                                <button
                                    className="stepper-btn"
                                    onClick={() => handleTicketChange('child', 1)}
                                >+</button>
                            </div>
                        </div>

                    </div>
                </section>
                <section className="screen-area">
                    <div className="screen-arc-container">
                        <svg className="screen-svg" viewBox="0 0 500 40">
                            <path d="M 20 35 Q 250 5 480 35" className="screen-path" />
                        </svg>
                        <div className="screen-text">SCREEN</div>
                    </div>
                    <div className="seats-card">
                        <div className="grid-rows">
                            {rows.map((row) => {
                                return (
                                    <div key={row} className="row-container">
                                        <span className="row-label">{row}</span>
                                        <div className="row-seats">
                                            {[[1, 2], [3, 4], [5, 6], [7, 8]].map((pair, pIdx) => (
                                                <div key={pIdx} className="seat-pair">
                                                    {pair.map((col) => {
                                                        const seatId = `${row}${col}`;
                                                        const isOccupied = occupiedSeats.has(seatId);
                                                        const isSelected = selectedSeats.includes(seatId);

                                                        let seatClass = 'seat-available';
                                                        if (isOccupied) seatClass = 'seat-occupied';
                                                        if (isSelected) seatClass = 'seat-selected';

                                                        return (
                                                            <button
                                                                key={seatId}
                                                                className={`seat-btn ${seatClass}`}
                                                                onClick={() => toggleSeat(seatId)}
                                                                disabled={isOccupied}
                                                                title={`Seat ${seatId} ${isOccupied ? '(Occupied)' : isSelected ? '(Selected)' : '(Available)'}`}
                                                            >
                                                                <ReclinerSeatSVG />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="row-label">{row}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="legend-bar">
                            <div className="legend-item">
                                <div className="seat-btn seat-available"><ReclinerSeatSVG /></div>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat-btn seat-selected"><ReclinerSeatSVG /></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat-btn seat-occupied"><ReclinerSeatSVG /></div>
                                <span>Occupied</span>
                            </div>
                        </div>
                    </div>
                </section>
                <button
                    className="checkout-btn"
                    disabled={selectedSeats.length !== totalTicketsNeeded}
                    onClick={() => { }}
                >
                    <span>Continue to Checkout</span>
                    <span>→</span>
                </button>
            </main>
        </div>
    );
}