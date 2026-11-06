USE cinema_booking;

INSERT INTO theaters (name, location) VALUES ('Cineplex 1', '123 Main St, Cityville');
INSERT INTO pricing_settings (id, online_booking_fee, tax_rate) VALUES (1, 1.50, 0.0700);
INSERT INTO ticket_prices (ticket_type, price) VALUES
    ('ADULT', 12.00),
    ('CHILD', 8.00),
    ('SENIOR', 10.00);
INSERT INTO promotions (promo_code, discount_percentage, expiration_date) VALUES ('SAVE10', 10.00, '2026-12-31');

-- SHOWROOMS

INSERT INTO showrooms (theater_id, name, seat_count)
VALUES
    (1, 'Showroom 1', 20),
    (1, 'Showroom 2', 20),
    (1, 'Showroom 3', 20);

-- SEATS

INSERT INTO seats (showroom_id, row_label, seat_number)
VALUES
    -- Showroom 1
    (1, 'A', 1), (1, 'A', 2), (1, 'A', 3), (1, 'A', 4), (1, 'A', 5),
    (1, 'B', 1), (1, 'B', 2), (1, 'B', 3), (1, 'B', 4), (1, 'B', 5),
    (1, 'C', 1), (1, 'C', 2), (1, 'C', 3), (1, 'C', 4), (1, 'C', 5),
    (1, 'D', 1), (1, 'D', 2), (1, 'D', 3), (1, 'D', 4), (1, 'D', 5),

    -- Showroom 2
    (2, 'A', 1), (2, 'A', 2), (2, 'A', 3), (2, 'A', 4), (2, 'A', 5),
    (2, 'B', 1), (2, 'B', 2), (2, 'B', 3), (2, 'B', 4), (2, 'B', 5),
    (2, 'C', 1), (2, 'C', 2), (2, 'C', 3), (2, 'C', 4), (2, 'C', 5),
    (2, 'D', 1), (2, 'D', 2), (2, 'D', 3), (2, 'D', 4), (2, 'D', 5),

    -- Showroom 3
    (3, 'A', 1), (3, 'A', 2), (3, 'A', 3), (3, 'A', 4), (3, 'A', 5),
    (3, 'B', 1), (3, 'B', 2), (3, 'B', 3), (3, 'B', 4), (3, 'B', 5),
    (3, 'C', 1), (3, 'C', 2), (3, 'C', 3), (3, 'C', 4), (3, 'C', 5),
    (3, 'D', 1), (3, 'D', 2), (3, 'D', 3), (3, 'D', 4), (3, 'D', 5);


-- MOVIES

INSERT INTO movies
(title, genre, cast, director, producer, synopsis, reviews, mpaa_rating,
 trailer_image_url, trailer_video_url, release_date, status)
VALUES

(
    'Practical Magic 2',
    'Fantasy',
    'Sandra Bullock, Nicole Kidman, Joey King, Lee Pace, Maisie Williams, Xolo Maridueña',
    'Susanne Bier',
    'Denise Di Novi, Sandra Bullock, Nicole Kidman',
    'The Owens sisters return to confront a dark curse threatening their family.',
    'A fantasy sequel featuring magic, family, romance, and comedy.',
    'PG-13',
    'https://img.youtube.com/vi/Ho10_4IX1jE/maxresdefault.jpg',
    'https://www.youtube.com/embed/Ho10_4IX1jE',
    '2026-09-11',
    "Currently Running"
),

(
    'Spider-Man: Brand New Day',
    'Action',
    'Tom Holland, Zendaya, Jacob Batalon',
    'Destin Daniel Cretton',
    'Kevin Feige, Amy Pascal',
    'Peter Parker faces a new chapter of his life as Spider-Man while confronting a dangerous new threat.',
    'An action-packed superhero movie featuring Spider-Man.',
    'PG-13',
    'https://img.youtube.com/vi/8TZMtslA3UY/maxresdefault.jpg',
    'https://www.youtube.com/embed/8TZMtslA3UY',
    '2026-07-31',
    "Currently Running"
),

(
    'The Odyssey',
    'Adventure',
    'Matt Damon, Tom Holland, Anne Hathaway, Zendaya',
    'Christopher Nolan',
    'Emma Thomas, Christopher Nolan',
    'A legendary journey home becomes an epic battle against monsters, gods, and the forces of nature.',
    'A visually ambitious adaptation of the classic Greek epic.',
    'PG-13',
    'https://img.youtube.com/vi/Mzw2ttJD2qQ/maxresdefault.jpg',
    'https://www.youtube.com/embed/Mzw2ttJD2qQ',
    '2026-07-17',
    "Currently Running"
),

(
    'Hope',
    'Sci-Fi',
    'Michael Fassbender, Alicia Vikander, Taylor Russell',
    'Na Hong-jin',
    'Na Hong-jin',
    'A mysterious event in a remote community leads to a dangerous investigation into an unknown threat.',
    'A tense science-fiction thriller with an international cast.',
    'R',
    'https://img.youtube.com/vi/mYRc2Gl7geY/maxresdefault.jpg',
    'https://www.youtube.com/embed/mYRc2Gl7geY',
    '2026-09-09',
    "Currently Running"
),

(
    'Runner',
    'Action',
    'Alan Ritchson',
    'Unknown',
    'Unknown',
    'A dangerous mission forces a skilled runner to fight his way through a rapidly escalating situation.',
    'An energetic action movie built around fast-paced set pieces.',
    'PG-13',
    'https://img.youtube.com/vi/m8JUmBgHejI/maxresdefault.jpg',
    'https://www.youtube.com/embed/m8JUmBgHejI',
    '2026-09-11',
    "Currently Running"
),

(
    'Toy Story 5',
    'Animation',
    'Tom Hanks, Tim Allen, Joan Cusack, Greta Lee, Conan O''Brien, Tony Hale',
    'Andrew Stanton',
    'Lindsey Collins',
    'Woody, Buzz, Jessie, and the rest of the toys face a new challenge involving a high-tech toy.',
    'A new animated adventure featuring the beloved Toy Story characters.',
    'PG',
    'https://img.youtube.com/vi/s_qpMMkvHYE/maxresdefault.jpg',
    'https://www.youtube.com/embed/s_qpMMkvHYE',
    '2026-06-19',
    "Currently Running"
),

(
    'Supergirl',
    'Action',
    'Milly Alcock, Matthias Schoenaerts, Eve Ridley, David Krumholtz, Emily Beecham, Jason Momoa',
    'Craig Gillespie',
    'Peter Safran, James Gunn',
    'Kara Zor-El joins an unlikely companion on an interstellar journey involving vengeance and justice.',
    'A superhero adventure following Supergirl on an interstellar journey.',
    'PG-13',
    'https://img.youtube.com/vi/s1-pfiVMKAs/maxresdefault.jpg',
    'https://www.youtube.com/embed/s1-pfiVMKAs',
    '2026-06-26',
    "Currently Running"
),

(
    'The Dog Stars',
    'Thriller',
    'Jacob Elordi, Josh Brolin, Margaret Qualley',
    'Ridley Scott',
    'Ridley Scott, Michael Pruss, Mark L. Smith',
    'In a post-apocalyptic world, a young pilot and a survivalist face an uncertain future after receiving a mysterious radio transmission.',
    'A post-apocalyptic thriller directed by Ridley Scott.',
    'R',
    'https://img.youtube.com/vi/cmzVY1goqwQ/maxresdefault.jpg',
    'https://www.youtube.com/embed/cmzVY1goqwQ',
    '2026-08-28',
    "Currently Running"
),

(
    'PAW Patrol: The Dino Movie',
    'Animation',
    'Mckenna Grace, Terry Crews, Ron Pardo, Jennifer Hudson',
    'Cal Brunker',
    'Jennifer Dodge, Laura Clunie, Toni Stevens',
    'The PAW Patrol pups encounter dinosaurs and must work together to save the day.',
    'An animated adventure featuring the PAW Patrol team.',
    'PG',
    'https://img.youtube.com/vi/xgI5iYmOf5Q/maxresdefault.jpg',
    'https://www.youtube.com/embed/xgI5iYmOf5Q',
    '2026-08-14',
    "Coming Soon"
),

(
    'The End of Oak Street',
    'Sci-Fi',
    'Anne Hathaway, Ewan McGregor, Maisy Stella, Christian Convery',
    'David Robert Mitchell',
    'J.J. Abrams, Hannah Minghella, Jon Cohen, David Robert Mitchell, Matt Jackson, Tommy Harper',
    'After a mysterious cosmic event transports an entire neighborhood somewhere unknown, a family must work together to survive.',
    'A science-fiction adventure about a family facing a mysterious cosmic event.',
    'PG-13',
    'https://img.youtube.com/vi/IoHWPAN6FPg/maxresdefault.jpg',
    'https://www.youtube.com/embed/IoHWPAN6FPg',
    '2026-08-14',
    "Coming Soon"
),

(
    'Heart of the Beast',
    'Action',
    'Tom Hiddleston, Ana de Armas',
    'Andy Serkis',
    'Andy Serkis, Jonathan Cavendish',
    'A former special forces soldier must survive in the Alaskan wilderness after a plane crash while protecting his loyal military dog.',
    'An action adventure focused on survival, loyalty, and the bond between a soldier and his dog.',
    'PG-13',
    'https://img.youtube.com/vi/JFQcDFhNh4o/maxresdefault.jpg',
    'https://www.youtube.com/embed/JFQcDFhNh4o',
    '2026-09-25',
    "Coming Soon"
),

(
    'Digger',
    'Thriller',
    'Tom Cruise',
    'Doug Liman',
    'Tom Cruise, Christopher McQuarrie',
    'A high-stakes environmental thriller centered on a dangerous mission and the people caught in its consequences.',
    'An upcoming thriller featuring Tom Cruise.',
    'PG-13',
    'https://img.youtube.com/vi/qORTe1wW3Wg/maxresdefault.jpg',
    'https://www.youtube.com/embed/qORTe1wW3Wg',
    '2026-10-02',
    "Coming Soon"
),

(
    'Verity',
    'Thriller',
    'Anne Hathaway, Dakota Johnson, Josh Hartnett',
    'Michael Showalter',
    'Anne Hathaway, Josh Hartnett',
    'A struggling writer is hired to complete the books of an injured bestselling author and discovers disturbing secrets within the author''s home.',
    'A psychological thriller based on the novel by Colleen Hoover.',
    'R',
    'https://img.youtube.com/vi/xdPMKhjMSFs/maxresdefault.jpg',
    'https://www.youtube.com/embed/xdPMKhjMSFs',
    '2026-10-02',
    "Coming Soon"
);

-- SHOWTIMES

INSERT INTO showtimes (movie_id, showroom_id, show_time)
VALUES
    -- NOVEMBER 15

    -- Showroom 1
    (6, 1, '2026-11-15 15:00:00'), -- Toy Story 5
    (1, 1, '2026-11-15 17:00:00'), -- Practical Magic 2
    (3, 1, '2026-11-15 19:00:00'), -- The Odyssey

    -- Showroom 2
    (7, 2, '2026-11-15 15:00:00'), -- Supergirl
    (2, 2, '2026-11-15 17:00:00'), -- Spider-Man: Brand New Day
    (4, 2, '2026-11-15 19:00:00'), -- Hope

    -- Showroom 3
    (5, 3, '2026-11-15 15:00:00'), -- Runner
    (8, 3, '2026-11-15 17:00:00'), -- The Dog Stars
    (9, 3, '2026-11-15 19:00:00'), -- PAW Patrol: The Dino Movie

    -- NOVEMBER 16

    -- Showroom 1
    (10, 1, '2026-11-16 15:00:00'), -- The End of Oak Street
    (11, 1, '2026-11-16 17:00:00'), -- Heart of the Beast
    (12, 1, '2026-11-16 19:00:00'), -- Digger
    (13, 1, '2026-11-16 21:00:00'), -- Verity

    -- Showroom 2
    (1, 2, '2026-11-16 15:00:00'), -- Practical Magic 2
    (2, 2, '2026-11-16 17:00:00'), -- Spider-Man: Brand New Day
    (3, 2, '2026-11-16 19:00:00'), -- The Odyssey

    -- Showroom 3
    (4, 3, '2026-11-16 15:00:00'), -- Hope
    (5, 3, '2026-11-16 17:00:00'), -- Runner
    (6, 3, '2026-11-16 19:00:00'), -- Toy Story 5

    -- NOVEMBER 17

    -- Showroom 1
    (7, 1, '2026-11-17 15:00:00'), -- Supergirl
    (8, 1, '2026-11-17 17:00:00'), -- The Dog Stars

    -- Showroom 2
    (9, 2, '2026-11-17 15:00:00'), -- PAW Patrol: The Dino Movie
    (10, 2, '2026-11-17 17:00:00'), -- The End of Oak Street

    -- Showroom 3
    (11, 3, '2026-11-17 15:00:00'), -- Heart of the Beast
    (12, 3, '2026-11-17 17:00:00'), -- Digger
    (13, 3, '2026-11-17 19:00:00'); -- Verity

INSERT INTO users (email, password_hash)
VALUES ('customer@test.com', '$2b$10$FQwyLZmawX.dCtl7V0v0GuqUeLEn9/TGxNfRZdqr.Jm/Kf7G.H7YC');
SET @c = LAST_INSERT_ID();
INSERT INTO customers (user_id, first_name, last_name, phone_number, status, is_verified)
VALUES (@c, 'Test', 'Customer', '555-0101', 'ACTIVE', TRUE);

INSERT INTO users (email, password_hash)
VALUES ('admin@test.com', '$2b$10$CoOZRQQwqhQkY9p1c8SN6eretwS9YZM7nnaB/ndezDkI8a7vl4Ime');
SET @a = LAST_INSERT_ID();
INSERT INTO admins (user_id, name)
VALUES (@a, 'Test Admin');

INSERT INTO users (email, password_hash)
VALUES ('fav@test.com', '$2b$10$ejnzEuIdlviIgPA4PPNsOubv.k464RpWaR3I35V2azbSuS4lmDSru');
SET @fav = LAST_INSERT_ID();
INSERT INTO customers (user_id, first_name, last_name, phone_number, status, subscribed_to_promos, is_verified)
VALUES (@fav, 'Fay', 'Favorite', '123-4567', 'ACTIVE', TRUE, TRUE);

-- Favorite movies for the demo customer
INSERT INTO favorite_movies (customer_id, movie_id)
VALUES (@fav, 1), (@fav, 2);

-- Verified user with 3 payment cards (Cards123!)
INSERT INTO users (email, password_hash)
VALUES ('cards@test.com', '$2b$10$A2R9VKvw58KN7X3xdNFnV.8Pgh6krTjiRZv9bVEsg9/wuxyyLV0y6');
SET @cards = LAST_INSERT_ID();

-- Home address
INSERT INTO addresses (street, city, state, zip_code)
VALUES ('1 Main St', 'Athens', 'GA', '30601');
SET @home = LAST_INSERT_ID();

INSERT INTO customers (
    user_id, first_name, last_name, phone_number,
    status, is_verified, subscribed_to_promos, home_address_id
)
VALUES (
    @cards, 'Carl', 'Cards', '123-4568',
    'ACTIVE', TRUE, FALSE, @home
);

-- Billing addresses for each payment card
INSERT INTO addresses (street, city, state, zip_code)
VALUES ('10 Oak St', 'Athens', 'GA', '30601');
SET @b1 = LAST_INSERT_ID();

INSERT INTO addresses (street, city, state, zip_code)
VALUES ('20 Elm St', 'Athens', 'GA', '30601');
SET @b2 = LAST_INSERT_ID();

INSERT INTO addresses (street, city, state, zip_code)
VALUES ('30 Pine St', 'Athens', 'GA', '30601');
SET @b3 = LAST_INSERT_ID();

INSERT INTO payment_cards (
    customer_id, slot, card_number_enc, last_four,
    cardholder_name, expiration_date, billing_address_id
)
VALUES
(@cards, 1, AES_ENCRYPT('4111111111111111', 'demo-key'), '1111', 'Carl Cards', '2029-12-01', @b1),
(@cards, 2, AES_ENCRYPT('4242424242424242', 'demo-key'), '4242', 'Carl Cards', '2029-12-01', @b2),
(@cards, 3, AES_ENCRYPT('5555555555554444', 'demo-key'), '4444', 'Carl Cards', '2029-12-01', @b3);