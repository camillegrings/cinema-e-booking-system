CREATE DATABASE IF NOT EXISTS cinema_booking;

USE cinema_booking;

CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    cast TEXT,
    director VARCHAR(255),
    producer VARCHAR(255),
    synopsis TEXT,
    reviews TEXT,
    mpaa_rating VARCHAR(10),
    trailer_image_url VARCHAR(500),
    trailer_video_url VARCHAR(500),
    release_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS halls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    seat_count INT NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hall_id INT NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    FOREIGN KEY (hall_id) REFERENCES halls(id) 
        ON DELETE CASCADE,
    UNIQUE (hall_id, row_label, seat_number)
);

CREATE TABLE IF NOT EXISTS showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    hall_id INT NOT NULL,
    show_time DATETIME NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id) 
        ON DELETE CASCADE,
    FOREIGN KEY (hall_id) REFERENCES halls(id) 
        ON DELETE CASCADE,
    UNIQUE (hall_id, show_time)
);