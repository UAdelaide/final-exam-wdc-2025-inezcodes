const express = require('express');
const { get } = require('http');
const mysql = require('mysql');
const app = express();
const port = 8080;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // no password as per instructions
    database: 'DogWalkService'
});

db.connect(err=>{
    if(err) throw err;
    console.log('Connected to MySQL');
    seedDatabase(); // Insert records on startup
});

// Insert test data on startup
function seedDatabase() {
    const insertUsers =`
        INSERT IGNORE INTO Users (username, email, password_hash, role )
        VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),

        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),

        ('carol123', 'carol@example.com', 'hashed789', 'owner'),

        ('davidwalker', 'david@example.com', 'hashed321', 'walker'),

        ('emilyowner', 'emily@example.com', 'hashed654', 'owner');
    `;

    const insertDogs = `
    INSERT INTO Dogs (owner_id, name, size)
    VALUES
    ((SELECT user_id FROM Users WHERE username = 'alice123'),'Max', 'medium'),

    ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),

    ((SELECT user_id FROM Users WHERE username = 'emailyowner'), 'Charlie', 'large'),

    ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Rocky', 'medium'),

    ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Luna', 'small');
`;

    const insertRequests =`
    INSERT INTO WalkRequests (dog_id, request_time, duration_minutes, location, status)
    VALUES
    ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Charlie'), '2025-06-11 10:00:00', 60, 'Riverside Trail', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-12 07:30:00', 30, 'City Gardens', 'cancelled'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-13 17:00:00', 40, 'Botanic Park', 'completed');
`;

db.query(insertUsers, () => {
    db.query(insertDogs, () => {
        db.query(insertRequests, () => {

        });
    });
});
}

// /api/dogs
app/get(`/api/dogs`, async (req, res) => {
    try {
        const query = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u d.owner_id = u.user_id;
        `;
        db.query(query, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    } catch (error){
        res.status(500).json
    }
    }
});