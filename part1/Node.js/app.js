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
