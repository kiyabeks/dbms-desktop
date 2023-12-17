const express = require('express');
const router = express.Router();
const dbConn = require('../../config/database.js');
const jwt = require('jsonwebtoken');

// INSERT
// @routes POST api/temperature/add
// @desc Insert Data to Database
// @access PRIVATE
router.post('/add', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    const userAccountId = decodedToken.data['accountid'];

    const { fullname, city, zipcode } = req.body;

    if (!fullname || !city || !zipcode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sqlQuery =
        'INSERT INTO address (accountid, fullname, city, zipcode) VALUES (?, ?, ?, ?)';
    dbConn.query(sqlQuery, [userAccountId, fullname, city, zipcode], function (
        error,
        results,
        fields
    ) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});




router.get('/admin-view', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        // Log decoded token for troubleshooting
        console.log('Decoded Token:', decodedToken);

        // Check if the user is an admin based on the email
        const isAdmin = decodedToken.data['email'] === 'Admin2@gmail.com'; // Replace with your admin email

        // Log isAdmin for troubleshooting
        console.log('Is Admin:', isAdmin);

        if (isAdmin) {
            // Continue with the rest of the code...
            const sqlQuery = 'SELECT * FROM address';
            dbConn.query(sqlQuery, function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.status(200).json(results);
            });
        } else {
            return res.status(403).json({ success: false, msg: 'Unauthorized access. Admin privileges required.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




// ADMIN UPDATE
// @routes PUT api/temperature/update/:addressid
// @desc Update Data in the Database
// @access PRIVATE
router.put('/admin-update/:addressid', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    console.log(decodedToken.data['email']);
    const { fullname, city, zipcode } = req.body;
    const { addressid } = req.params;

    if (!fullname || !city || !zipcode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sqlQuery = 'UPDATE address SET fullname = ?, city = ?, zipcode = ? WHERE addressid = ?';
    dbConn.query(sqlQuery, [fullname, city, zipcode, addressid], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});

// DELETE
// @routes DELETE api/temperature/delete/:addressid
// @desc Delete Data from the Database
// @access PRIVATE (only for admin users)
router.delete('/delete/:addressid', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        // Check if the user is an admin based on the email
        const isAdmin = decodedToken.data['email'] === 'Admin2@gmail.com'; // Replace with your admin email

        if (!isAdmin) {
            return res.status(403).json({ success: false, msg: 'Unauthorized access. Admin privileges required.' });
        }

        console.log(decodedToken.data['email']);
        const { addressid } = req.params;

        if (!addressid) {
            return res.status(400).json({ error: 'Missing required parameter: addressid' });
        }

        const sqlQuery = 'DELETE FROM address WHERE addressid = ?';
        dbConn.query(sqlQuery, [addressid], function (error, results, fields) {
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

// User View
// @routes GET api/temperature/user-view
// @desc View Data from the Database for the logged-in user
// @access PRIVATE
router.get('/user-view', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);

        const userAccountId = decodedToken.data['accountid'];

        const sqlQuery = 'SELECT * FROM address WHERE accountid = ?';
        dbConn.query(sqlQuery, [userAccountId], function (error, results, fields) {
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

// ADDRESS UPDATE
// @routes PUT api/payment/address-update
// @desc Update Data in the Database
// @access PRIVATE
router.put('/user-update', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        const userAccountId = decodedToken.data['accountid'];

        const { fullname, city, zipcode } = req.body;

        if (!fullname || !city || !zipcode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the address belongs to the logged-in user
        const checkOwnershipQuery = 'SELECT * FROM address WHERE accountid = ?';
        dbConn.query(checkOwnershipQuery, [userAccountId], function (error, ownershipResults) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (ownershipResults.length === 0) {
                return res.status(403).json({ error: 'Unauthorized to update this address. Address not found or does not belong to the user.' });
            }

            // Update the address
            const updateQuery = 'UPDATE address SET fullname = ?, city = ?, zipcode = ? WHERE accountid = ?';
            dbConn.query(updateQuery, [fullname, city, zipcode, userAccountId], function (updateError, results, fields) {
                if (updateError) {
                    console.error(updateError);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.status(200).json(results);
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
