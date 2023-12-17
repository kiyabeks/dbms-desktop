const express = require('express');
const router = express.Router();
const dbConn = require('../../config/database.js');
const jwt = require('jsonwebtoken');

// INSERT
// @routes POST api/payment/add
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

        const { orderid, paymentmode, paymentdate } = req.body;

        if (!orderid || !paymentmode || !paymentdate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the user has permission to add payment to this order
        const checkPermissionQuery = 'SELECT * FROM initialorder WHERE orderid = ? AND accountid = ?';
        dbConn.query(checkPermissionQuery, [orderid, userAccountId], function (error, permissionResults) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (permissionResults.length === 0) {
                return res.status(403).json({ error: 'Unauthorized to add payment to this order' });
            }

            // Insert payment
            const sqlQuery = 'INSERT INTO payments (orderid, accountid, paymentmode, paymentdate) VALUES (?, ?, ?, ?)';
            dbConn.query(sqlQuery, [orderid, userAccountId, paymentmode, paymentdate], function (insertError, results, fields) {
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
// @routes GET api/payment/admin-view
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
        const sqlQuery = 'SELECT * FROM payments';
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
// @routes PUT api/payment/admin-update/:paymentid
// @desc Update Payment Status in the Database
// @access PRIVATE (only for admin users)
router.put('/admin-update/:paymentid', (req, res) => {
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
        const { paymentstatus } = req.body;
        const { paymentid } = req.params;

        if (!paymentstatus) {
            return res.status(400).json({ error: 'Missing required field: paymentstatus' });
        }

        const sqlQuery = 'UPDATE payments SET paymentstatus = ? WHERE paymentid = ?';
        dbConn.query(sqlQuery, [paymentstatus, paymentid], function (error, results, fields) {
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
// @routes DELETE api/payment/delete/:paymentid
// @desc Delete Data from the Database
// @access PRIVATE (only for admin users)
router.delete('/delete/:paymentid', async (req, res) => {
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
        const { paymentid } = req.params;

        if (!paymentid) {
            return res.status(400).json({ error: 'Missing required parameter: paymentid' });
        }

        const sqlQuery = 'DELETE FROM payments WHERE paymentid = ?';
        dbConn.query(sqlQuery, [paymentid], function (error, results, fields) {
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
// @routes GET api/payment/user-view
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

        const sqlQuery = 'SELECT * FROM payments WHERE accountid = ?';
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

// USER UPDATE
// @routes PUT api/payment/user-update
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

        const { paymentid, paymentmode, paymentdate } = req.body;

        if (!paymentid || !paymentmode || !paymentdate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the payment belongs to the logged-in user
        const checkOwnershipQuery = 'SELECT * FROM payments WHERE paymentid = ? AND accountid = ?';
        dbConn.query(checkOwnershipQuery, [paymentid, userAccountId], function (error, ownershipResults) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (ownershipResults.length === 0) {
                return res.status(403).json({ error: 'Unauthorized to update this payment. Payment not found or does not belong to the user.' });
            }

            // Update the payment
            const updateQuery = 'UPDATE payments SET paymentmode = ?, paymentdate = ? WHERE paymentid = ?';
            dbConn.query(updateQuery, [paymentmode, paymentdate, paymentid], function (updateError, results, fields) {
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