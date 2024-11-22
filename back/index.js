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
        SELECT id ,link, headline, category, short_description, authors, date, clusterID
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
app.post('/get-allarticles', (req, res) => {
    const { category } = req.body;
    const query = `
        SELECT  id, link, headline, category, short_description, authors, date, clusterID
        FROM Articles
        WHERE category LIKE ?
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
app.post('/get-alltweets', (req, res) => {
    const { category } = req.body;

    const query = `
        SELECT Username, Tweet, Created_At, Retweets, Favorites, Tweet_Link, Media_URL, Explanation, categories
        FROM Tweets
        WHERE categories LIKE ?
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
    const { username, auth_token } = req.body;

    const query = `
        SELECT username, deactivated, auth_token
        FROM Users_new
        WHERE username = ? AND auth_token = ?;
    `;

    pool.query(query, [username, auth_token], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];
            if (user.deactivated === 1) {
                return res.status(403).json({ status: 'Error', message: 'Account is deactivated' });
            }
            return res.json({ status: 'Success', message: 'Login successful' });
        } else {
            return res.status(401).json({ status: 'Error', message: 'Invalid username or password' });
        }
    });
});
app.post('/sign-up', (req, res) => {
console.log('Request Body:', req.body);
    const { auth_token, nickname, email } = req.body;

    console.log('Received data:', { auth_token, nickname, email });

    const checkQuery = `SELECT id FROM Users_new WHERE username = ? OR email = ?;`;
    const insertQuery = `INSERT INTO Users_new (username, email, auth_token) VALUES (?, ?, ?);`;

    pool.query(checkQuery, [nickname, email], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Database error during check:', checkErr);  // Log the error
            return res.status(500).json({ status: 'Error', error: checkErr.message });
        }

        if (checkResults.length > 0) {
            console.log('Username or email already registered');
            return res.status(409).json({ status: 'Error', message: 'Username or email is already registered' });
        }

        pool.query(insertQuery, [nickname, email, auth_token], (insertErr) => {
            if (insertErr) {
                console.error('Database error during insert:', insertErr);  // Log the error
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

    // Check if username is provided
    if (!username) {
        return res.status(400).json({ status: 'Error', message: 'Username is required' });
    }

    // Set the username to the global variable
    currentUsername = username;

    // Log the updated username for debugging
    console.log('Current Username Set:', currentUsername);

    return res.json({ status: 'Success', message: 'Username set successfully' });
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
app.get('/get_trending_tweets', (req, res) => {
    const query = `
        WITH LatestDate AS (
            SELECT DATE(MAX(Created_At)) AS max_date
            FROM Tweets
        )
        SELECT Username, Tweet, Created_At, Retweets, Favorites, Tweet_Link, Media_URL, Explanation, categories
        FROM Tweets
        WHERE DATE(Created_At) >= (SELECT max_date FROM LatestDate) - INTERVAL 1 DAY
        ORDER BY Favorites DESC
        LIMIT 100;
    `;

    pool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ status: 'Error', message: error.message });
        }

        if (results.length > 0) {
            return res.json({ status: 'Success', data: results });
        } else {
            return res.json({ status: 'No tweets found' });
        }
    });
});
app.post('/deactivate-user', (req, res) => {
    const { username } = req.body;

    const query = `
        UPDATE Users_new
        SET deactivated = 1
        WHERE username = ?;
    `;

    pool.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', message: 'Internal server error' });
        }

        if (results.affectedRows > 0) {
            return res.json({ status: 'Success', message: `User ${username} has been deactivated` });
        } else {
            return res.status(404).json({ status: 'Error', message: 'User not found' });
        }
    });
});
app.post('/delete-user', (req, res) => {
    const { username } = req.body;

    const query = `
        DELETE FROM Users_new
        WHERE username = ?;
    `;

    pool.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', message: 'Internal server error' });
        }

        if (results.affectedRows > 0) {
            return res.json({ status: 'Success', message: `User ${username} has been deleted.` });
        } else {
            return res.status(404).json({ status: 'Error', message: `User ${username} not found.` });
        }
    });
});
app.post('/get-article-by-id', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ status: 'Error', error: 'Article ID is required' });
    }

    const query = `
        SELECT id, link, headline, category, short_description, authors, date, clusterID
        FROM Articles
        WHERE id = ?;
    `;

    pool.query(query, [id], (fetchError, results) => {
        if (fetchError) {
            return res.status(500).json({ status: 'Error', error: fetchError.message });
        }

        if (results.length > 0) {
            return res.json({ status: 'Article found', data: results[0] });
        } else {
            return res.json({ status: 'No article found with the given ID' });
        }
    });
});
app.post('/get-tweet-by-link', (req, res) => {
    const { link } = req.body;

    if (!link) {
        return res.status(400).json({ status: 'Error', error: 'Tweet link is required' });
    }

    const query = `
        SELECT Username, Tweet, Created_At, Retweets, Favorites, Tweet_Link, Media_URL, Explanation, categories
        FROM Tweets
        WHERE Tweet_Link = ?;
    `;

    pool.query(query, [link], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', error: err.message });
        }

        if (results.length > 0) {
            return res.json({ status: 'Tweet found', data: results[0] });
        } else {
            return res.json({ status: 'No tweet found with the given link' });
        }
    });
});
app.post('/delete-preferences', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ status: 'Error', message: 'Username is required' });
    }

    const deleteQuery = `DELETE FROM Preferences WHERE username = ?;`;

    pool.query(deleteQuery, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'Error', error: err.message });
        }

        if (results.affectedRows > 0) {
            return res.json({ status: 'Success', message: 'Preferences deleted successfully' });
        } else {
            return res.status(404).json({ status: 'Error', message: 'No preferences found for this username' });
        }
    });
});

app.post('/get-related', (req, res) => { 
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ status: 'Error', message: 'Article ID is required' });
    }

    const clusterQuery = `
        SELECT clusterID 
        FROM Articles 
        WHERE id = ?;
    `;

    pool.query(clusterQuery, [id], (clusterError, clusterResults) => {
        if (clusterError) {
            return res.status(500).json({ status: 'Error', message: clusterError.message });
        }

        if (clusterResults.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'No article found with the given ID' });
        }

        const clusterID = clusterResults[0].clusterID;

        // If clusterID is -1, return an empty response.
        if (clusterID === -1||clusterID==0) {
            return res.json({ status: 'Success', data: [] });
        }

        const relatedQuery = `
            SELECT id, link, headline, category, short_description, authors, date, clusterID
            FROM Articles
            WHERE clusterID = ? AND id != ?
            LIMIT 1000;
        `;

        pool.query(relatedQuery, [clusterID, id], (relatedError, relatedResults) => {
            if (relatedError) {
                return res.status(500).json({ status: 'Error', message: relatedError.message });
            }

            if (relatedResults.length > 0) {
                return res.json({ status: 'Success', data: relatedResults });
            } else {
                return res.status(404).json({ status: 'Error', message: 'No related articles found' });
            }
        });
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});