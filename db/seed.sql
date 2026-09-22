USE cinema_booking;

-- HALLS

INSERT INTO halls (name, seat_count)
VALUES
    ('Hall 1', 20),
    ('Hall 2', 20);


-- SEATS

INSERT INTO seats (hall_id, row_label, seat_number)
VALUES
    -- Hall 1
    (1, 'A', 1), (1, 'A', 2), (1, 'A', 3), (1, 'A', 4), (1, 'A', 5),
    (1, 'B', 1), (1, 'B', 2), (1, 'B', 3), (1, 'B', 4), (1, 'B', 5),
    (1, 'C', 1), (1, 'C', 2), (1, 'C', 3), (1, 'C', 4), (1, 'C', 5),
    (1, 'D', 1), (1, 'D', 2), (1, 'D', 3), (1, 'D', 4), (1, 'D', 5),

    -- Hall 2
    (2, 'A', 1), (2, 'A', 2), (2, 'A', 3), (2, 'A', 4), (2, 'A', 5),
    (2, 'B', 1), (2, 'B', 2), (2, 'B', 3), (2, 'B', 4), (2, 'B', 5),
    (2, 'C', 1), (2, 'C', 2), (2, 'C', 3), (2, 'C', 4), (2, 'C', 5),
    (2, 'D', 1), (2, 'D', 2), (2, 'D', 3), (2, 'D', 4), (2, 'D', 5);


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

INSERT INTO showtimes (movie_id, hall_id, show_time)
VALUES

-- Practical Magic 2
(1, 1, '2026-09-15 18:00:00'),
(1, 1, '2026-09-15 21:00:00'),
(1, 2, '2026-09-16 19:00:00'),

-- Spider-Man: Brand New Day
(2, 2, '2026-09-15 17:00:00'),
(2, 2, '2026-09-15 20:30:00'),
(2, 1, '2026-09-16 18:30:00'),

-- The Odyssey
(3, 1, '2026-09-15 16:00:00'),
(3, 1, '2026-09-16 20:00:00'),
(3, 2, '2026-09-17 18:00:00'),

-- Hope
(4, 2, '2026-09-15 19:30:00'),
(4, 1, '2026-09-16 21:00:00'),

-- Runner
(5, 2, '2026-09-15 18:00:00'),
(5, 2, '2026-09-16 20:30:00'),

-- Toy Story 5
(6, 1, '2026-09-15 15:00:00'),
(6, 1, '2026-09-16 17:00:00'),
(6, 2, '2026-09-17 15:00:00'),

-- Supergirl
(7, 2, '2026-09-15 16:00:00'),
(7, 1, '2026-09-16 19:30:00'),
(7, 2, '2026-09-17 20:00:00'),

-- The Dog Stars
(8, 1, '2026-09-15 20:00:00'),
(8, 2, '2026-09-16 18:00:00'),
(8, 1, '2026-09-17 21:00:00');

