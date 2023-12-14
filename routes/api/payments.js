const express = require('express');
const router = express.Router();
const databaseConn = require('../../config/database.js');

// --------------------------------------------------Add Payment
router.post('/add-payment', (req, res) => {
   const { paymentDate, paymentMode } = req.body;

   if (!paymentDate || !paymentMode) {
      return res.status(400).json({ msg: 'Please provide paymentDate and paymentMode' });
   }

   const sqlQuery = `INSERT INTO payments (paymentDate, paymentMode) VALUES ('${paymentDate}', '${paymentMode}')`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) {
         console.error('Payment addition error:', error);
         res.status(500).json({ message: 'Payment addition failed' });
      } else {
         res.status(200).json({ message: 'Payment added successfully' });
      }
   });
});

// --------------------------------------------------View Payments
router.get('/view-payments', (req, res) => {
   const sqlQuery = `SELECT * FROM payments`;
   databaseConn.query(sqlQuery, function (error, results, fields){
      if (error) throw error;
      res.status(200).json(results);
   });
});

//-------------------------------------------------- Update Payment Details
router.put('/update-payment/:id', (req, res) => {
   const { paymentDate, paymentMode } = req.body;
   const paymentId = req.params.id;

   if (!paymentDate || !paymentMode) {
      return res.status(400).json({ msg: 'Please provide paymentDate and paymentMode' });
   }

   const sqlQuery = `UPDATE payments SET paymentDate = '${paymentDate}', paymentMode = '${paymentMode}' WHERE paymentId = ${paymentId}`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) throw error;
      res.status(200).json(results);
   });
});

//----------------------------------------------- Delete Payment
router.delete('/delete-payment/:id', (req, res) => {
   const paymentId = req.params.id;
   const sqlQuery = `DELETE FROM payments WHERE paymentId = ${paymentId}`;

   databaseConn.query(sqlQuery, (error, results, fields) => {
      if (error) throw error;
      res.status(200).json(results);
   });
});

module.exports = router;
