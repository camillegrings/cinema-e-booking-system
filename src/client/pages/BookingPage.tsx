import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './BookingPage.css';
import { Header } from '../components/Header.js';
import { Link } from "react-router-dom";


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

interface ShowtimeSeatData {
    seat_id: number;
    show_seat_id?: number;
    row_label: string;
    seat_number: number;
    status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'UNAVAILABLE';
}

interface ShowtimeDetails {
    showtime_id: number;
    movie_id?: number;
    movie_title: string;
    mpaa_rating: string;
    trailer_image_url: string;
    showroom_name: string;
    show_time: string;
}

export const BookingPage: React.FC = () => {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const navState = useLocation().state as {
        movieTitle?: string;
        mpaaRating?: string;
        trailerImageUrl?: string;
        showroomName?: string;
        showTime?: string;
    } | null;

    const handleProceedToPayment = () => {
        const orderSummary = {
            showtimeId: meta.showtime_id,
            movieTitle: meta.movie_title,
            showroom: meta.showroom_name,
            showTime: meta.show_time,
            tickets,
            selectedSeats,
            subtotal: (tickets.adult * prices.adult) + (tickets.senior * prices.senior) + (tickets.child * prices.child)
        };

        // Store order data so PaymentPage can read it
        sessionStorage.setItem('current_checkout_order', JSON.stringify(orderSummary));

        navigate('/payment');
    };

    // Showtime & movie information
    const [meta, setMeta] = useState<ShowtimeDetails>({
        showtime_id: Number(showtimeId) || 0,
        movie_title: navState?.movieTitle || 'Loading Movie...',
        mpaa_rating: navState?.mpaaRating || '',
        trailer_image_url: navState?.trailerImageUrl || '',
        showroom_name: navState?.showroomName || '',
        show_time: navState?.showTime || ''
    });

    // Ticket Prices setup
    const [prices, setPrices] = useState({
        adult: 12.00,
        senior: 10.00,
        child: 8.00
    });

    // State for ticket quantities (Default 1 adult ticket)
    const [tickets, setTickets] = useState<ITickets>(() => {
        const saved = sessionStorage.getItem(`booking_tickets_${showtimeId}`);
        return saved ? JSON.parse(saved) : { adult: 1, senior: 0, child: 0 };
    });

    const totalTicketsNeeded = tickets.adult + tickets.senior + tickets.child;

    // Grid state
    const [seats, setSeats] = useState<ShowtimeSeatData[]>([]);
    const [occupiedSeatLabels, setOccupiedSeatLabels] = useState<Set<string>>(new Set(['A1', 'B3', 'C4']));
    const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
        const saved = sessionStorage.getItem(`booking_seats_${showtimeId}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Toast message setup

    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3500);
    };

    // Load showtime details, seats, and ticket prices
    useEffect(() => {
        if (!showtimeId) return;

        // Fetch showtime & movie details (handles direct URL navigation or browser refresh)
        // Adjust endpoint URL if your teammate mounted showtimes under /movies/showtimes/detail/:id
        fetch(`http://localhost:3000/showtimes/${showtimeId}`)
            .then(res => (res.ok ? res.json() : null))
            .then(raw => {
                const data = Array.isArray(raw) ? raw[0] : raw;
                if (!data) return;

                setMeta(prev => ({
                    showtime_id: Number(showtimeId),
                    movie_title: data.movie_title || data.title || prev.movie_title,
                    mpaa_rating: data.mpaa_rating || prev.mpaa_rating,
                    trailer_image_url: data.trailer_image_url || prev.trailer_image_url,
                    showroom_name: data.showroom_name || data.name || (data.showroom_id ? `Showroom ${data.showroom_id}` : prev.showroom_name),
                    show_time: data.show_time || prev.show_time
                }));

                // If the showtime endpoint only returned movie_id (not title/image), fetch the movie row directly
                if (data.movie_id && !data.movie_title && !data.title) {
                    fetch(`http://localhost:3000/movies/get/${data.movie_id}`)
                        .then(r => (r.ok ? r.json() : null))
                        .then(mRaw => {
                            const m = Array.isArray(mRaw) ? mRaw[0] : mRaw;
                            if (m) {
                                setMeta(prev => ({
                                    ...prev,
                                    movie_title: m.title,
                                    mpaa_rating: m.mpaa_rating,
                                    trailer_image_url: m.trailer_image_url
                                }));
                            }
                        })
                        .catch(() => { });
                }
            })
            .catch(() => { });

        // Seat map & booked seats
        fetch(`http://localhost:3000/showtimes/${showtimeId}/seats`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.seats && data.seats.length > 0) {
                    setSeats(data.seats);
                    const occupied = new Set<string>();
                    data.seats.forEach((s: ShowtimeSeatData) => {
                        if (s.status === 'BOOKED' || s.status === 'HELD' || s.status === 'UNAVAILABLE') {
                            occupied.add(`${s.row_label}${s.seat_number}`);
                        }
                    });
                    setOccupiedSeatLabels(occupied);
                }
            })
            .catch(() => { });

        // Pricing 
        fetch(`http://localhost:3000/pricing/ticket-prices`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) {
                    const priceMap: any = {};
                    data.forEach((p: { ticket_type: string; price: number }) => {
                        priceMap[p.ticket_type.toLowerCase()] = Number(p.price);
                    });
                    setPrices(prev => ({ ...prev, ...priceMap }));
                }
            })
            .catch(() => { });
    }, [showtimeId]);

    // Save user selection to session for guest login 
    useEffect(() => {
        sessionStorage.setItem(`booking_tickets_${showtimeId}`, JSON.stringify(tickets));
        sessionStorage.setItem(`booking_seats_${showtimeId}`, JSON.stringify(selectedSeats));
    }, [tickets, selectedSeats, showtimeId]);

    // Stepper Counter
    const handleTicketChange = (category: keyof ITickets, delta: number) => {
        const nextCount = Math.max(0, tickets[category] + delta);
        const nextTickets = { ...tickets, [category]: nextCount };
        const nextTotal = nextTickets.adult + nextTickets.senior + nextTickets.child;

        setTickets(nextTickets);

        // Auto-trim seats if ticket count drops below selected count
        if (selectedSeats.length > nextTotal) {
            setSelectedSeats(selectedSeats.slice(0, nextTotal));
            showToast(`Seats adjusted to ${nextTotal} based on your tickets.`);
        }
    };

    // Seat selection and validate tickets
    const toggleSeat = (seatId: string) => {
        if (totalTicketsNeeded === 0) {
            showToast('Please select at least 1 ticket before choosing seats.');
            return;
        }

        if (occupiedSeatLabels.has(seatId)) return;

        // Unselect seat
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
            return;
        }

        // Exact ticket matching rule
        if (selectedSeats.length >= totalTicketsNeeded) {
            showToast(`You have already selected all ${totalTicketsNeeded} seats for your tickets.`);
            return;
        }



        setSelectedSeats([...selectedSeats, seatId]);
    };
    // Rows configuration
    const rowMap = useMemo(() => {
        if (seats.length > 0) {
            const map: Record<string, number[]> = {};
            seats.forEach(s => {
                if (!map[s.row_label]) map[s.row_label] = [];
                map[s.row_label].push(s.seat_number);
            });
            return map;
        }
        return {
            'A': [1, 2, 3, 4, 5],
            'B': [1, 2, 3, 4, 5],
            'C': [1, 2, 3, 4, 5],
            'D': [1, 2, 3, 4, 5]
        };
    }, [seats]);

    const formattedDate = useMemo(() => {
        const d = new Date(meta.show_time.includes('T') ? meta.show_time : meta.show_time.replace(' ', 'T'));
        return isNaN(d.getTime()) ? meta.show_time : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [meta.show_time]);

    const formattedTime = useMemo(() => {
        const d = new Date(meta.show_time.includes('T') ? meta.show_time : meta.show_time.replace(' ', 'T'));
        return isNaN(d.getTime()) ? meta.show_time : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }, [meta.show_time]);

    // Checkout 

    const handleBackToMovie = () => {
        if (meta.movie_id) {
            navigate(`/movie/${meta.movie_id}`);
        } else {
            navigate(-1);
        }
    };




    return (
        <div className="booking-container">
            <Header />
            {toastMsg && <div className="toast-popup">{toastMsg}</div>}
            <main className="main-canvas">
                <section className="cinema-header">
                    {meta.trailer_image_url && (
                        <img
                            src={meta.trailer_image_url}
                            alt={meta.movie_title}
                            className="movie-poster-thumb"
                        />
                    )}
                    <div className="header-details">
                        <h1 className="movie-title">{meta.movie_title}</h1>
                        <div className="movie-meta-bar">
                            {meta.showroom_name && (
                                <>
                                    <span className="meta-item">{meta.showroom_name.toUpperCase()}</span>
                                    <span className="meta-divider">|</span>
                                </>
                            )}
                            {formattedDate && (
                                <>
                                    <span className="meta-item">{formattedDate.toUpperCase()}</span>
                                    <span className="meta-divider">|</span>
                                </>
                            )}
                            {formattedTime && (
                                <>
                                    <span>{formattedTime}</span>
                                    <span className="meta-divider">|</span>
                                </>
                            )}
                            {meta.mpaa_rating && (
                                <span className="rating-badge">{meta.mpaa_rating}</span>
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                className="back-to-movie-btn"
                                onClick={handleBackToMovie}
                            > ← Back to Movie
                            </button>
                        </div>
                    </div>
                </section>
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
                                <span className="category-price">${prices.adult.toFixed(2)}</span>
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
                                <span className="category-price">${prices.senior.toFixed(2)}</span>
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
                                <span className="category-price">${prices.child.toFixed(2)}</span>
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
                            {Object.keys(rowMap).sort().map((row) => (
                                <div key={row} className="row-container">
                                    <span className="row-label">{row}</span>
                                    <div className="row-seats">
                                        {rowMap[row].map((num) => {
                                            const seatId = `${row}${num}`;
                                            const isOccupied = occupiedSeatLabels.has(seatId);
                                            const isSelected = selectedSeats.includes(seatId);

                                            let seatClass = 'seat-available';
                                            if (isOccupied) seatClass = 'seat-occupied';
                                            if (isSelected) seatClass = 'seat-selected';

                                            return (
                                                <button
                                                    key={seatId}
                                                    type="button"
                                                    className={`seat-btn ${seatClass}`}
                                                    onClick={() => toggleSeat(seatId)}
                                                    disabled={isOccupied}
                                                    title={`Seat ${seatId} ${isOccupied ? '(Booked)' : isSelected ? '(Selected)' : '(Available)'}`}
                                                >
                                                    <ReclinerSeatSVG />
                                                    <span className="seat-badge-label">{num}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="row-label">{row}</span>
                                </div>
                            ))}
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
                    disabled={selectedSeats.length !== totalTicketsNeeded || selectedSeats.length == 0}
                    onClick={handleProceedToPayment}
                >
                    <span>Continue to Checkout</span>
                    <span>→</span>
                </button>
            </main>
        </div>
    );
}