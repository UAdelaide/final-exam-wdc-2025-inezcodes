const express = require('express');
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
};