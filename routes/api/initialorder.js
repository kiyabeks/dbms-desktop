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

    const { printtype, printmedium, printsize, orderdate } = req.body;

    if (!printtype || !printmedium || !printsize || !orderdate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sqlQuery = 'INSERT INTO initialorder (printtype, printmedium, printsize, orderdate, accountid) VALUES (?, ?, ?, ?, ?)';
    dbConn.query(sqlQuery, [printtype, printmedium, printsize, orderdate, userAccountId], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});

// ADMIN SELECT or (VIEW)
// @routes GET api/temperature/admin-view
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
        const sqlQuery = 'SELECT * FROM initialorder';
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
// @routes PUT api/temperature/update/:id
// @desc Update Data in the Database
// @access PRIVATE
router.put('/admin-update/:orderid', (req, res) => {
    const token= req.headers.authorization.split(' ')[1];
        if (!token)  {
          res.status(200).json({success: false,msg: 'Error, Token was not found'});
        }
  
      const decodedtoken = jwt.verify(token,process.env.SECRET_TOKEN);
  
      console.log(decodedtoken.data['email']);
    const {printtype, printmedium, printsize, orderdate} = req.body;
    const { orderid } = req.params;

    if (!printtype || !printmedium || !printsize || !orderdate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sqlQuery = 'UPDATE initialorder SET printtype = ?, printmedium = ?, printsize = ?, orderdate = ? WHERE orderid = ?';
    dbConn.query(sqlQuery, [printtype, printmedium, printsize, orderdate, orderid], function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
});

// DELETE
// @routes DELETE api/temperature/delete/:orderid
// @desc Delete Data from the Database
// @access PRIVATE (only for admin users)
router.delete('/delete/:orderid', async (req, res) => {
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
        const { orderid } = req.params;

        if (!orderid) {
            return res.status(400).json({ error: 'Missing required parameter: orderid' });
        }

        const sqlQuery = 'DELETE FROM initialorder WHERE orderid = ?';
        dbConn.query(sqlQuery, [orderid], function (error, results, fields) {
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

        const sqlQuery = 'SELECT * FROM initialorder WHERE accountid = ?';
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
// @routes PUT api/temperature/user-update
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

        const { orderid, printtype, printmedium, printsize, orderdate } = req.body;

        if (!orderid || !printtype || !printmedium || !printsize || !orderdate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the user has permission to update this order
        const checkPermissionQuery = 'SELECT * FROM initialorder WHERE orderid = ? AND accountid = ?';
        dbConn.query(checkPermissionQuery, [orderid, userAccountId], function (error, permissionResults) {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (permissionResults.length === 0) {
                return res.status(403).json({ error: 'Unauthorized to update this order' });
            }

            // Update the order
            const updateQuery = 'UPDATE initialorder SET printtype = ?, printmedium = ?, printsize = ?, orderdate = ? WHERE orderid = ?';
            dbConn.query(updateQuery, [printtype, printmedium, printsize, orderdate, orderid], function (updateError, results, fields) {
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
