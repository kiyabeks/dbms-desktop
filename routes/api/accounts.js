const express = require('express');
const router = express.Router();
const databaseConn = require('../../config/database.js');

// -----------------------------------------------------------Register
router.post('/register', (req, res) => {
   const { username, email, password } = req.body;

   if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please provide username, email, and password' });
   }

   const sqlQuery = `INSERT INTO authentication (username, email, password) VALUES ('${username}', '${email}', '${password}')`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) {
         console.error('Registration error:', error);
         res.status(500).json({ message: 'Registration failed' });
      } else {
         res.status(200).json({ message: 'Registration successful' });
      }
   });
});


// -----------------------------------------------------------------------Login
router.post('/login', (req, res) => {
   const { username, password } = req.body;

   if (!username || !password) {
      return res.status(400).json({ msg: 'Please provide both username and password' });
   }

   const sqlQuery = `SELECT * FROM authentication WHERE username = '${username}' AND password = '${password}'`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) {
         console.error('Login error:', error);
         return res.status(500).json({ message: 'Login failed' });
      }

      if (results.length > 0) {
         
         res.status(200).json({ message: 'Login successful' });
      } else {
       
         res.status(401).json({ message: 'Invalid credentials' });
      }
   });
});


// ------------------------------------------------------View all accounts (for demonstration purposes)
router.get('/view', (req, res) => {
   const sqlQuery = `SELECT * FROM authentication`;
   databaseConn.query(sqlQuery, function (error, results, fields){
      if (error) throw error;
      res.status(200).json(results);
   });
});

//-------------------------------------------------------- Update account details
router.put('/update/:id', (req, res) => {
   const { username, email, password } = req.body;
   const accountId = req.params.id;

   if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please provide username, email, and password' });
   }

   const sqlQuery = `UPDATE authentication SET username = '${username}', email = '${email}', password = '${password}' WHERE accountId = ${accountId}`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) throw error;
      res.status(200).json(results);
   });
});

//--------------------------------------------- Delete account
router.delete('/delete/:id', (req, res) => {
   const accountId = req.params.id;
   const sqlQuery = `DELETE FROM authentication WHERE accountId = ${accountId}`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) throw error;
      res.status(200).json(results);
   });
});

module.exports = router;
