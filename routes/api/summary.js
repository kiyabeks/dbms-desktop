const express = require('express');
const router = express.Router();
const dbConn = require('../../config/database.js');
const jwt = require('jsonwebtoken');

// ADMIN ADD SUMMARY
// @routes POST api/order-queue/summary
// @desc Get summary information from the Database
// @access PRIVATE (only for admin users)
router.post('/add', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        const userAccountId = decodedToken.data['accountid'];

        // Check if the user is an admin based on the email
        const isAdmin = decodedToken.data['email'] === 'Admin2@gmail.com'; // Replace with your admin email

        if (!isAdmin) {
            return res.status(403).json({ success: false, msg: 'Unauthorized access. Admin privileges required.' });
        }

        console.log(decodedToken.data['email']);

        const { queueid } = req.body;

        // Check if the user has permission to access this summary information
        // (You might want to add additional checks here based on your requirements)

        // Retrieve summary information from the order_queue table based on queueid
        const selectQuery = 'SELECT * FROM order_queue WHERE queueid = ?';
        dbConn.query(selectQuery, [queueid], function (error, results, fields) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Summary information not found' });
            }

            const summaryInfo = results[0];

            // Insert the retrieved information into the summary table without queuestatus
            const insertQuery = 'INSERT INTO summary (queueid, accountid, orderid, paymentid) VALUES (?, ?, ?, ?)';
            dbConn.query(
                insertQuery,
                [summaryInfo.queueid, summaryInfo.accountid, summaryInfo.orderid, summaryInfo.paymentid],
                function (insertError, insertResults, insertFields) {
                    if (insertError) {
                        console.error(insertError);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    res.status(200).json({ success: true, msg: 'Summary information added successfully' });
                }
            );
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
        const sqlQuery = 'SELECT * FROM summary'; // Modify this query based on your actual table structure
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


// DELETE
// @routes DELETE api/summary/delete/:id
// @desc Delete Data from the Database
// @access PRIVATE
router.delete('/delete/:summaryid', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(200).json({ success: false, msg: 'Error, Token was not found' });
    }

    const decodedtoken = jwt.verify(token, process.env.SECRET_TOKEN);

    console.log(decodedtoken.data['email']);
    const { summaryid } = req.params;

    if (!summaryid) {
        return res.status(400).json({ error: 'Missing required parameter: summaryid' });
    }

    const sqlQuery = 'DELETE FROM summary WHERE summaryid = ?';
    dbConn.query(sqlQuery, [summaryid], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
