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
 trailer_image_url, trailer_video_url, release_date)
VALUES

(
    'Practical Magic 2',
    'Fantasy',
    'Sandra Bullock, Nicole Kidman, Joey King',
    'Griffin Dunne',
    'Denise Di Novi',
    'The Owens sisters return for another magical adventure as their family faces a new supernatural threat.',
    'A fun fantasy sequel with a mix of romance, comedy, and magic.',
    'PG-13',
    'https://example.com/practical-magic-2.jpg',
    'https://www.youtube.com/watch?v=example1',
    '2026-09-10'
),

(
    'Spider-Man: Brand New Day',
    'Action',
    'Tom Holland, Zendaya, Jacob Batalon',
    'Destin Daniel Cretton',
    'Kevin Feige, Amy Pascal',
    'Peter Parker faces a new chapter of his life as Spider-Man while confronting a dangerous new threat.',
    'An action-packed superhero movie with familiar characters and a new story.',
    'PG-13',
    'https://example.com/spider-man-brand-new-day.jpg',
    'https://www.youtube.com/watch?v=example2',
    '2026-07-31'
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
    'https://example.com/the-odyssey.jpg',
    'https://www.youtube.com/watch?v=example3',
    '2026-07-17'
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
    'https://example.com/hope.jpg',
    'https://www.youtube.com/watch?v=example4',
    '2026-09-09'
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
    'https://example.com/runner.jpg',
    'https://www.youtube.com/watch?v=example5',
    '2026-09-11'
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
(5, 2, '2026-09-16 20:30:00');