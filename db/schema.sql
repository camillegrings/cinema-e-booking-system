DROP DATABASE IF EXISTS cinema_booking;
CREATE DATABASE IF NOT EXISTS cinema_booking;

USE cinema_booking;

CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('ADMIN', 'CUSTOMER') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'INACTIVE',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    subscribed_to_promos BOOLEAN NOT NULL DEFAULT FALSE,
    home_address_id INT NULL,
    FOREIGN KEY (home_address_id) REFERENCES addresses(id)
        ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE TABLE tokens (
    -- user_id INT PRIMARY KEY,.
    email VARCHAR(255) NOT NULL UNIQUE,
    verification_code INT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
)

CREATE TABLE admins (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE TABLE verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    purpose ENUM('REGISTRATION', 'PASSWORD_RESET') NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE payment_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    slot TINYINT NOT NULL,
    card_number_enc VARBINARY(255) NOT NULL,
    last_four CHAR(4) NOT NULL,
    cardholder_name VARCHAR(100) NOT NULL,
    expiration_date DATE NOT NULL,
    billing_address_id INT NOT NULL,
    CHECK (slot BETWEEN 1 AND 3),
    UNIQUE (customer_id, slot),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(id)
        ON DELETE RESTRICT
);

CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    cast TEXT,
    director VARCHAR(255),
    producer VARCHAR(255),
    synopsis TEXT,
    reviews TEXT,
    mpaa_rating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17') NOT NULL,
    trailer_image_url VARCHAR(500),
    trailer_video_url VARCHAR(500),
    release_date DATE NOT NULL,
    status ENUM('Currently Running', 'Coming Soon') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorite_movies (
    customer_id INT NOT NULL,
    movie_id INT NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, movie_id),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
        ON DELETE CASCADE
);

CREATE TABLE theaters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE halls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT NOT NULL DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    seat_count INT NOT NULL,
    CHECK (seat_count > 0),
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hall_id INT NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    FOREIGN KEY (hall_id) REFERENCES halls(id) 
        ON DELETE CASCADE,
    UNIQUE (hall_id, row_label, seat_number)
);

CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    hall_id INT NOT NULL,
    show_time DATETIME NOT NULL,
    duration INT NOT NULL DEFAULT 120,
    CHECK (duration > 0),
    FOREIGN KEY (movie_id) REFERENCES movies(id) 
        ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) 
        ON DELETE CASCADE,
    UNIQUE (hall_id, show_time)
);

CREATE TABLE pricing_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    online_booking_fee DECIMAL(6,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    CHECK (id = 1),
    CHECK (online_booking_fee >= 0),
    CHECK (tax_rate BETWEEN 0 AND 1)
);

CREATE TABLE ticket_prices (
    ticket_type ENUM('ADULT', 'CHILD', 'SENIOR') PRIMARY KEY,
    price DECIMAL(6,2) NOT NULL,
    CHECK (price >= 0)
);

CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promo_code VARCHAR(30) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5,2) NOT NULL,
    created_by INT NULL,
    expiration_date DATE NOT NULL,
    FOREIGN KEY (created_by) REFERENCES admins(user_id) 
        ON DELETE SET NULL,
    CHECK (discount_percentage > 0 AND discount_percentage <= 100)
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    payment_card_id INT NULL,
    promotion_id INT NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    booking_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_reference VARCHAR(100),
    refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    CHECK (subtotal >= 0 AND tax_amount >= 0 AND booking_fee >= 0 AND discount >= 0 AND total_amount >= 0),
    CHECK (refund_amount >= 0 AND refund_amount <= total_amount),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (payment_card_id) REFERENCES payment_cards(id)
        ON DELETE SET NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON DELETE SET NULL
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    ticket_type ENUM('ADULT', 'CHILD', 'SENIOR') NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    CHECK (price >= 0),
    UNIQUE (showtime_id, seat_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
        ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (seat_id) REFERENCES seats(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (ticket_type) REFERENCES ticket_prices(ticket_type)
);

CREATE TABLE preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL UNIQUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE CASCADE
);

CREATE TABLE preference_categories (
    preference_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    PRIMARY KEY (preference_id, category),
    FOREIGN KEY (preference_id) REFERENCES preferences(id)
        ON DELETE CASCADE
);

CREATE TABLE preference_ratings (
    preference_id INT NOT NULL,
    mpaa_rating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17') NOT NULL,
    PRIMARY KEY (preference_id, mpaa_rating),
    FOREIGN KEY (preference_id) REFERENCES preferences(id)
        ON DELETE CASCADE
);

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    movie_id INT NOT NULL,
    recommended_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    score DECIMAL(6,3) NOT NULL DEFAULT 0,
    reason ENUM('FAVORITES', 'USER_PREFERENCES', 'BOOKING_ACTIVITY', 'AGGREGATED_ACTIVITY') NOT NULL,
    dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (customer_id, movie_id),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
        ON DELETE CASCADE
);

CREATE VIEW movie_booking_activity AS
SELECT m.id AS movie_id, m.title, COUNT(t.id) AS total_tickets_sold
FROM movies m
JOIN showtimes s ON s.movie_id = m.id
JOIN tickets t ON t.showtime_id = s.id
JOIN bookings b ON b.id = t.booking_id
WHERE b.status = 'CONFIRMED'
GROUP BY m.id, m.title;