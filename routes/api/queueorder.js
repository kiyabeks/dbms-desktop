const express = require('express');
const router = express.Router();
const dbConn = require('../../config/database.js');
const jwt = require('jsonwebtoken');

// INSERT
// @routes POST api/order-queue/add
// @desc Insert Data to Database
// @access PRIVATE
router.post('/add', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        const userAccountId = decodedToken.data['accountid'];

        console.log(decodedToken.data['email']);

        const { orderid, paymentid } = req.body;

        if (!orderid || !paymentid) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the user has permission to add to this order
        const checkPermissionQuery = 'SELECT * FROM initialorder WHERE orderid = ? AND accountid = ?';
        dbConn.query(checkPermissionQuery, [orderid, userAccountId], function (error, permissionResults) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (permissionResults.length === 0) {
                return res.status(403).json({ error: 'Unauthorized to add to this order' });
            }

            // Insert into order_queue
            const sqlQuery = 'INSERT INTO order_queue (orderid, accountid, paymentid) VALUES (?, ?, ?)';
            dbConn.query(sqlQuery, [orderid, userAccountId, paymentid], function (insertError, results, fields) {
                if (insertError) {
                    console.error(insertError);
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


// ADMIN SELECT or (VIEW)
// @routes GET api/order-queue/admin-view
// @desc View Data from the Database
// @access PRIVATE (only for admin users)
router.get('/admin-view', async (req, res) => {
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
        const sqlQuery = 'SELECT * FROM order_queue';
        dbConn.query(sqlQuery, function (error, results, fields) {
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

// ADMIN UPDATE
// @routes PUT api/order-queue/admin-update/:queueid
// @desc Update Data in the Database
// @access PRIVATE (only for admin users)
router.put('/admin-update/:queueid', (req, res) => {
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
        const { queuestatus } = req.body;
        const { queueid } = req.params;

        if (!queuestatus) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sqlQuery = 'UPDATE order_queue SET queuestatus = ? WHERE queueid = ?';
        dbConn.query(sqlQuery, [queuestatus, queueid], function (error, results, fields) {
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
// @routes DELETE api/order-queue/delete/:queueid
// @desc Delete Data from the Database
// @access PRIVATE (only for admin users)
router.delete('/delete/:queueid', async (req, res) => {
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
        const { queueid } = req.params;

        if (!queueid) {
            return res.status(400).json({ error: 'Missing required parameter: queueid' });
        }

        const sqlQuery = 'DELETE FROM order_queue WHERE queueid = ?';
        dbConn.query(sqlQuery, [queueid], function (error, results, fields) {
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
// @routes GET api/order-queue/user-view
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

        const sqlQuery = 'SELECT * FROM order_queue WHERE accountid = ?';
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


module.exports = router;