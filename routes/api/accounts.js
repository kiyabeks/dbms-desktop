const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbConn = require('../../config/database');

// /signup
router.post('/signup', async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = req.body.isAdmin || 0; // Default to 0 if isAdmin is not provided

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sqlQuery = `INSERT INTO authentication (username, email, password, isAdmin) VALUES (?, ?, ?, ?)`;
        dbConn.query(sqlQuery, [username, email, hashedPassword, isAdmin], function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Failed to register user' });
            }

            const userId = results.insertId;
            res.status(200).json({ success: true, userId: userId });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



// User Login
router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const sqlQuery = `SELECT * FROM authentication WHERE email = ?`;
        dbConn.query(sqlQuery, [email], async function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const data = {
                    username: user.username,
                    email: user.email,
                    accountid: user.accountid, // Add accountid to the payload
                };

                // create token
                const token = jwt.sign({ data: data }, process.env.SECRET_TOKEN, { expiresIn: '1h' });

                res.status(200).json({ success: true, token: token });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Admin Login
router.post('/admin-login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const sqlQuery = `SELECT * FROM authentication WHERE email = ? AND isAdmin = 1`;
        dbConn.query(sqlQuery, [email], async function (error, results) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password for admin' });
            }

            const adminUser = results[0];
            const isMatch = await bcrypt.compare(password, adminUser.password);

            if (isMatch) {
                const data = {
                    username: adminUser.username,
                    email: adminUser.email,
                    isAdmin: adminUser.isAdmin,
                };

                // include isAdmin in the token payload
                const token = jwt.sign({ data: data, isAdmin: adminUser.isAdmin }, process.env.SECRET_TOKEN, { expiresIn: '1h' });

                res.status(200).json({ success: true, token: token });
            } else {
                res.status(401).json({ success: false, message: 'Invalid email or password for admin' });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Admin View Users
// @routes GET api/authentication/view
// @desc View Data from the Database
// @access PUBLIC
router.get('/admin-view', (req, res) => {
    const token= req.headers.authorization.split(' ')[1];
    if (!token)  {
      res.status(200).json({success: false,msg: 'Error, Token was not found'});
    }

  const decodedtoken = jwt.verify(token,process.env.SECRET_TOKEN);

  console.log(decodedtoken.data['email']);
    const sqlQuery = 'SELECT * FROM authentication';
    dbConn.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Exclude sensitive information (e.g., password) before sending the response
        const sanitizedResults = results.map(user => {
            const { password, ...userData } = user;
            return userData;
        });
        res.status(200).json(sanitizedResults);
    });
});

// ADMIN UPDATE
// @routes PUT api/authentication/admin-update/:accountid
// @desc Update Data in the Database
// @access PRIVATE (only for admin users)
router.put('/admin-update/:accountid', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        // Check if the user is an admin based on the email
        const isAdmin = decodedToken.data['email'] === 'Admin1@gmail.com'; // Replace with your admin email

        if (!isAdmin) {
            return res.status(403).json({ success: false, msg: 'Unauthorized access. Admin privileges required.' });
        }

        console.log(decodedToken.data['email']);
        const { username, email, password } = req.body;
        const { accountid } = req.params;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sqlQuery = 'UPDATE authentication SET username = ?, email = ?, password = ? WHERE accountid = ?';
        dbConn.query(sqlQuery, [username, email, hashedPassword, accountid], function (error, results, fields) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});






// DELETE
// @routes DELETE api/authentication/delete/:accountid
// @desc Delete User Account
// @access PRIVATE (only for admin users)
router.delete('/delete/:accountid', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        // Check if the user is an admin based on the email
        const isAdmin = decodedToken.data['email'] === 'Admin1@gmail.com'; // Replace with your admin email

        if (!isAdmin) {
            return res.status(403).json({ success: false, msg: 'Unauthorized access. Admin privileges required.' });
        }

        console.log(decodedToken.data['email']);
        const { accountid } = req.params;

        if (!accountid) {
            return res.status(400).json({ error: 'Missing required parameter: accountid' });
        }

        const sqlQuery = 'DELETE FROM authentication WHERE accountid = ?';
        dbConn.query(sqlQuery, [accountid], function (error, results, fields) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json(results);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// View Users
// @routes GET api/authentication/view
// @desc View Data from the Database
// @access PRIVATE
router.get('/user-view', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    console.log(decodedToken.data['email']);
    const user_email = decodedToken.data['email'];

    const sqlQuery = 'SELECT * FROM authentication WHERE email = ?';
    dbConn.query(sqlQuery, [user_email], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Exclude sensitive information (e.g., password) before sending the response
        const sanitizedResults = results.map(user => {
            const { password, ...userData } = user;
            return userData;
        });

        res.status(200).json(sanitizedResults);
    });
});

// UPDATE
// @routes PUT api/authentication/update/:accountid
// @desc Update Data in the Database
// @access PRIVATE
router.put('/user-update', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
    const userEmail = decodedToken.data['email'];
    const userAccountId = decodedToken.data['accountid'];

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure that the logged-in user is updating their own information
    if (userEmail !== email) {
        return res.status(403).json({ error: 'Unauthorized to update this account' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlQuery = 'UPDATE authentication SET username = ?, email = ?, password = ? WHERE accountid = ?';
    dbConn.query(sqlQuery, [username, email, hashedPassword, userAccountId], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});



module.exports = router;
