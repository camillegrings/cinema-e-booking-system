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
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_statuses (
    name VARCHAR(20) PRIMARY KEY
);
INSERT INTO customer_statuses (name) VALUES ('ACTIVE'), ('INACTIVE'), ('SUSPENDED');

CREATE TABLE customers (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    subscribed_to_promos BOOLEAN NOT NULL DEFAULT FALSE,
    home_address_id INT NULL,
    FOREIGN KEY (status) REFERENCES customer_statuses(name),
    FOREIGN KEY (home_address_id) REFERENCES addresses(id)
        ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE TABLE admins (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE VIEW user_accounts AS
SELECT u.*, CASE WHEN a.user_id IS NOT NULL THEN 'ADMIN' ELSE 'CUSTOMER' END AS role
FROM users u
LEFT JOIN admins a ON a.user_id = u.id;

DELIMITER $$
CREATE TRIGGER customers_not_admin BEFORE INSERT ON customers FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM admins WHERE user_id = NEW.user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is already an admin';
    END IF;
END$$
CREATE TRIGGER admins_not_customer BEFORE INSERT ON admins FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM customers WHERE user_id = NEW.user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is already a customer';
    END IF;
END$$
DELIMITER ;

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
    runtime_minutes INT NOT NULL DEFAULT 120,
    CHECK (runtime_minutes > 0),
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

CREATE TABLE showrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT NOT NULL DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    seat_count INT NOT NULL,
    CHECK (seat_count > 0),
    UNIQUE (theater_id, name),
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    showroom_id INT NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id)
        ON DELETE CASCADE,
    UNIQUE (showroom_id, row_label, seat_number)
);

CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    showroom_id INT NOT NULL,
    show_time DATETIME NOT NULL,
    duration INT NOT NULL DEFAULT 120,
    end_time DATETIME AS (DATE_ADD(show_time, INTERVAL duration MINUTE)) STORED,
    CHECK (duration > 0),
    UNIQUE (showroom_id, show_time),
    INDEX (show_time),
    FOREIGN KEY (movie_id) REFERENCES movies(id) 
        ON DELETE CASCADE,
    FOREIGN KEY (showroom_id) REFERENCES showrooms(id)
        ON DELETE CASCADE
);

CREATE TABLE show_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    status ENUM('AVAILABLE', 'HELD', 'BOOKED', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    hold_session_id VARCHAR(64) NULL,
    hold_expires_at DATETIME NULL,
    UNIQUE (showtime_id, seat_id),
    UNIQUE (id, showtime_id),
    CHECK ((status = 'HELD' AND hold_session_id IS NOT NULL AND hold_expires_at IS NOT NULL)
        OR (status <> 'HELD' AND hold_session_id IS NULL AND hold_expires_at IS NULL)),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT
);

DELIMITER $$
CREATE TRIGGER showtimes_before_insert
BEFORE INSERT ON showtimes
FOR EACH ROW
BEGIN
    DECLARE v_conflicts INT;

    SET NEW.duration = (SELECT runtime_minutes FROM movies WHERE id = NEW.movie_id);

    SELECT COUNT(*) INTO v_conflicts
    FROM showtimes s
    WHERE s.showroom_id = NEW.showroom_id
      AND NEW.show_time < s.end_time
      AND DATE_ADD(NEW.show_time, INTERVAL NEW.duration MINUTE) > s.show_time;

    IF v_conflicts > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Showtime conflicts with an existing showtime in the same showroom';
    END IF;
END$$

CREATE TRIGGER showtimes_before_update
BEFORE UPDATE ON showtimes
FOR EACH ROW
BEGIN
    DECLARE v_conflicts INT;

    SET NEW.duration = (SELECT runtime_minutes FROM movies WHERE id = NEW.movie_id);

    SELECT COUNT(*) INTO v_conflicts
    FROM showtimes s
    WHERE s.showroom_id = NEW.showroom_id
        AND s.id <> NEW.id
        AND NEW.show_time < s.end_time
        AND DATE_ADD(NEW.show_time, INTERVAL NEW.duration MINUTE) > s.show_time;

    IF v_conflicts > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Showtime conflicts with an existing showtime in the same showroom';
    END IF;

    IF NEW.showroom_id <> OLD.showroom_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot change showroom for an existing showtime';
    END IF;
END$$

CREATE TRIGGER showtimes_after_insert
AFTER INSERT ON showtimes
FOR EACH ROW
BEGIN
    INSERT INTO show_seats (showtime_id, seat_id)
    SELECT NEW.id, id FROM seats WHERE showroom_id = NEW.showroom_id;
END$$
DELIMITER ;

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
    CHECK (discount_percentage >= 1 AND discount_percentage <= 100)
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    showtime_id INT NOT NULL,
    payment_card_id INT NULL,
    promotion_id INT NULL,
    confirmation_email VARCHAR(255) NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    booking_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_reference VARCHAR(100),
    refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    UNIQUE (id, showtime_id),
    CHECK (subtotal >= 0 AND tax_amount >= 0 AND booking_fee >= 0 AND discount >= 0 AND total_amount >= 0),
    CHECK (refund_amount >= 0 AND refund_amount <= total_amount),
    FOREIGN KEY (customer_id) REFERENCES customers(user_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
        ON DELETE RESTRICT,
    FOREIGN KEY (payment_card_id) REFERENCES payment_cards(id)
        ON DELETE SET NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
        ON DELETE SET NULL
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    show_seat_id INT NOT NULL,
    ticket_type ENUM('ADULT', 'CHILD', 'SENIOR') NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    CHECK (price >= 0),
    UNIQUE (show_seat_id),
    FOREIGN KEY (booking_id, showtime_id) REFERENCES bookings(id, showtime_id)
        ON DELETE CASCADE,
    FOREIGN KEY (show_seat_id, showtime_id) REFERENCES show_seats(id, showtime_id)
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
JOIN bookings b ON b.showtime_id = s.id
JOIN tickets t ON t.booking_id = b.id
WHERE b.status = 'CONFIRMED'
GROUP BY m.id, m.title;