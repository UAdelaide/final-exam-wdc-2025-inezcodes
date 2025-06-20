const express = require('express');
const get } = require('http');
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
            console.log('Seed data inserted');

        });
    });
});
}

// /api/dogs
app.get('/api/dogs', async (req, res) => {
    try {
      const query = `
        SELECT d.name AS dog_name, d.size, u.username AS owner_username
        FROM Dogs d
        JOIN Users u ON d.owner_id = u.user_id;
      `;
      db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dogs' });
    }
  });

  // /api/walkrequests/open
  app.get('/api/walkrequests/open', async (req, res) => {
    try {
      const query = `
        SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
        FROM WalkRequests wr
        JOIN Dogs d ON wr.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE wr.status = 'open';
      `;
      db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch open walk requests' });
    }
  });

  // /api/walkers/summary
  app.get('/api/walkers/summary', async (req, res) => {
    try {
      const query = `
        SELECT
          u.username AS walker_username,
          COUNT(r.rating_id) AS total_ratings,
          ROUND(AVG(r.rating), 1) AS average_rating,
          (
            SELECT COUNT(*)
            FROM WalkApplications wa
            JOIN WalkRequests wr ON wa.request_id = wr.request_id
            WHERE wa.walker_id = u.user_id AND wa.status = 'accepted' AND wr.status = 'completed'
          ) AS completed_walks
        FROM Users u
        LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
        WHERE u.role = 'walker'
        GROUP BY u.user_id;
      `;
      db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch walker summary' });
    }
  });

  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });