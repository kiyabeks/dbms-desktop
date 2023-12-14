const express = require('express');
const router = express.Router();
const databaseConn = require('../../config/database.js');

// --------------------------------------------------View Order
router.get('/view-order/:orderId', (req, res) => {
   const orderId = req.params.orderId;

   const viewQuery = `
      SELECT order_queue.*, authentication.username AS accountUsername, payments.paymentMode
      FROM order_queue
      LEFT JOIN authentication ON order_queue.accountId = authentication.accountId
      LEFT JOIN payments ON order_queue.paymentId = payments.paymentId
      WHERE order_queue.orderId = ${orderId}
   `;

   databaseConn.query(viewQuery, (viewError, viewResults, viewFields) => {
      if (viewError) {
         console.error('Error retrieving order information:', viewError);
         res.status(500).json({ message: 'Error retrieving order information' });
      } else {
         res.status(200).json({ orderInfo: viewResults[0] });
      }
   });
});

// --------------------------------------------------Update Order
router.put('/update-order/:orderId', (req, res) => {
   const orderId = req.params.orderId;
   const { orderDetails, orderDate } = req.body;

   const updateQuery = `
      UPDATE order_queue
      SET orderDetails = '${orderDetails}', orderDate = '${orderDate}'
      WHERE orderId = ${orderId}
   `;

   databaseConn.query(updateQuery, (updateError, updateResults, updateFields) => {
      if (updateError) {
         console.error('Error updating order information:', updateError);
         res.status(500).json({ message: 'Error updating order information' });
      } else {
         res.status(200).json({ message: 'Order updated successfully' });
      }
   });
});

// --------------------------------------------------Delete Order
router.delete('/delete-order/:orderId', (req, res) => {
   const orderId = req.params.orderId;

   const deleteQuery = `DELETE FROM order_queue WHERE orderId = ${orderId}`;

   databaseConn.query(deleteQuery, (deleteError, deleteResults, deleteFields) => {
      if (deleteError) {
         console.error('Error deleting order:', deleteError);
         res.status(500).json({ message: 'Error deleting order' });
      } else {
         res.status(200).json({ message: 'Order deleted successfully' });
      }
   });
});

// --------------------------------------------------Add Order
router.post('/add-order', (req, res) => {
   const { accountId, paymentId, orderDetails, orderDate } = req.body;

   if (!accountId || !paymentId) {
      return res.status(400).json({ msg: 'Please provide accountId, paymentId, orderDetails, and orderDate' });
   }

   const addQuery = `
      INSERT INTO order_queue (accountId, paymentId, orderDetails, orderDate)
      VALUES (${accountId}, ${paymentId}, '${orderDetails}', '${orderDate}')
   `;

   databaseConn.query(addQuery, (addError, addResults, addFields) => {
      if (addError) {
         console.error('Error adding order:', addError);
         res.status(500).json({ message: 'Error adding order' });
      } else {
         res.status(200).json({ message: 'Order added successfully' });
      }
   });
});

module.exports = router;
