const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

let currentArticleId = null;
let currentUsername = null; 
let currentTweetLink = null;
const app = express();
app.use(cors());
app.use(bodyParser.json());



const pool = mysql.createPool({
    host: "chronicallyswe.c1ikges4mouc.eu-north-1.rds.amazonaws.com",
    user: "root",
    password: "swedatabase",
    database: "chronically",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
app.post('/get-articles', (req, res) => {
    const { category } = req.body;
    const query = `
        SELECT link, headline, category, short_description, authors, date, clusterID
        FROM Articles
        WHERE category LIKE ?
        LIMIT 1000;
    `;
    pool.query(query, [`%${category}%`], (fetchError, results) => {
        if (fetchError) {
            return res.status(500).json({ status: 'Error', error: fetchError.message });
        }
        if (results.length > 0) {
            return res.json({ status: 'Articles found', data: results });
        } else {
            return res.json({ status: 'No articles found' });
        }
    });
});
app.post('/get-tweets', (req, res) => {
    const { category } = req.body;

    const query = `
        SELECT Username, Tweet, Created_At, Retweets, Favorites, Tweet_Link, Media_URL, Explanation, categories
        FROM Tweets
        WHERE categories LIKE ?
        LIMIT 100;
    `;

    const values = [`%${category || ''}%`];

    pool.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', error: err.message });
        }

        if (results.length > 0) {
            return res.json({ status: 'Tweets found', data: results });
        } else {
            return res.json({ status: 'No tweets found' });
        }
    });
});
app.post('/check-login', (req, res) => {
    const { username, password } = req.body;
    const query = `
        SELECT username
        FROM Users
        WHERE username = ? AND password = ?;
    `;
    pool.query(query, [username, password], (err, results) => {
        if (results.length > 0) {
            return res.json({ status: 'Success', message: 'Login successful' });
        } else {
            return res.status(401).json({ status: 'Error', message: 'Invalid username or password' });
        }
    });
});
app.post('/sign-up', (req, res) => {
    const { username, password } = req.body;
    const checkQuery = `SELECT username FROM Users WHERE username = ?;`;
    const insertQuery = `INSERT INTO Users (username, password) VALUES (?, ?);`;

    pool.query(checkQuery, [username], (checkErr, checkResults) => {
        if (checkResults.length > 0) {
            return res.status(409).json({ status: 'Error', message: 'Username is already registered' });
        }
        pool.query(insertQuery, [username, password], (insertErr) => {
            if (insertErr) {
                return res.status(500).json({ status: 'Error', error: insertErr.message });
            }
            return res.json({ status: 'Success', message: 'User registered successfully' });
        });
    });
});
app.post('/add-preference', (req, res) => {
    const { username, preference } = req.body;
    const insertQuery = `INSERT INTO Preferences (username, preference) VALUES (?, ?);`;

    pool.query(insertQuery, [username, preference], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ status: 'Error', message: 'Preference already exists for this username' });
            }
            return res.status(500).json({ status: 'Error', error: err.message });
        }
        return res.json({ status: 'Success', message: 'Preference added successfully' });
    });
});
app.post('/check-preferences', (req, res) => {
    const { username } = req.body;
    const checkQuery = `SELECT preference FROM Preferences WHERE username = ?;`;
    pool.query(checkQuery, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', error: err.message });
        }

        if (results.length > 0) {
            return res.json({ status: 'Success', message: 'Preferences found', data: results });
        } else {
            return res.status(404).json({ status: 'Error', message: 'No preferences found for this username' });
        }
    });
});
app.post('/set-username', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ status: 'Username is required' });
    }

 
    currentUsername = username;

    return res.json({ status: 'Username set successfully' });
});
app.get('/get-username', (req, res) => {
    if (currentUsername) {
        return res.json({ username: currentUsername });
    } else {
        return res.json({ status: 'No username set' });
    }
});
app.post('/set-article-id', (req, res) => {
    const { id } = req.body;
    currentArticleId = id;
    return res.json({ status: 'Success', message: 'Article ID set successfully' });
});
app.get('/get-article-id', (req, res) => {
    if (currentArticleId) {
        return res.json({ articleId: currentArticleId });
    } else {
        return res.json({ status: 'Error', message: 'No article ID set' });
    }
});
app.post('/set-tweet-link', (req, res) => {
    const { link } = req.body;
    currentTweetLink = link;
    return res.json({ status: 'Success', message: 'Tweet link set successfully' });
});
app.get('/get-tweet-link', (req, res) => {
    if (currentTweetLink) {
        return res.json({ tweetLink: currentTweetLink });
    } else {
        return res.json({ status: 'Error', message: 'No tweet link set' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});