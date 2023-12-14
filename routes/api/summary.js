const express = require('express');
const router = express.Router();
const databaseConn = require('../../config/database.js');

// --------------------------------------------------View Summary
router.get('/view-summary/:summaryId', async (req, res) => {
  const summaryId = req.params.summaryId;

  try {
    const viewResults = await databaseQuery(`
      SELECT
        summary.summaryId,
        summary.accountId,
        summary.orderId,
        summary.paymentId
      FROM summary
      WHERE summary.summaryId = ?
    `, [summaryId]);

    if (viewResults.length > 0) {
      res.status(200).json({ summaryInfo: viewResults[0] });
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  } catch (error) {
    console.error('Error retrieving summary information:', error);
    res.status(500).json({ message: 'Error retrieving summary information' });
  }
});

router.post('/add-summary', async (req, res) => {
    const { accountId, orderId, paymentId } = req.body;
  
    // Check if required fields are provided
    if (!accountId) {
      return res.status(400).json({ error: 'Please provide a valid accountId' });
    }
  
    if (!orderId) {
      return res.status(400).json({ error: 'Please provide a valid orderId' });
    }
  
    if (!paymentId) {
      return res.status(400).json({ error: 'Please provide a valid paymentId' });
    }
  
    try {
        const checkExistenceQuery = `
        SELECT * FROM authentication WHERE accountId = ?;
      `;
      
      const checkOrderQuery = `
        SELECT * FROM order_queue WHERE orderId = ?;
      `;
      
      const checkPaymentQuery = `
        SELECT * FROM payments WHERE paymentId = ?;
      `;
      
      const [accountRows] = await databaseQuery(checkExistenceQuery, [accountId]);
      const [orderRows] = await databaseQuery(checkOrderQuery, [orderId]);
      const [paymentRows] = await databaseQuery(checkPaymentQuery, [paymentId]);
      
  
      // Check if accountId, orderId, and paymentId are valid
      if (accountRows.length === 0 || orderRows.length === 0 || paymentRows.length === 0) {
        return res.status(400).json({ error: 'Invalid accountId, orderId, or paymentId' });
      }
  
      // If all checks pass, insert into the summary table
      const addResults = await databaseQuery(`
        INSERT INTO summary (accountId, orderId, paymentId)
        VALUES (?, ?, ?)
      `, [accountId, orderId, paymentId]);
  
      res.status(201).json({ message: 'Summary added successfully', summaryId: addResults.insertId });
    } catch (error) {
        console.error('Error adding summary:', error);
        res.status(500).json({ error: `Error adding summary: ${error.message}` });
      }
      
  });
  

// --------------------------------------------------Update Summary
router.put('/update-summary/:summaryId', async (req, res) => {
  const summaryId = req.params.summaryId;
  const { accountId, orderId, paymentId } = req.body;

  try {
    // Update the summary table
    await databaseQuery(`
      UPDATE summary
      SET accountId = ?, orderId = ?, paymentId = ?
      WHERE summaryId = ?
    `, [accountId, orderId, paymentId, summaryId]);

    res.status(200).json({ message: 'Summary updated successfully' });
  } catch (error) {
    console.error('Error updating summary information:', error);
    res.status(500).json({ error: 'Error updating summary information' });
  }
});

// --------------------------------------------------Delete Summary
router.delete('/delete-summary/:summaryId', async (req, res) => {
  const summaryId = req.params.summaryId;

  try {
    // Delete from the summary table
    await databaseQuery('DELETE FROM summary WHERE summaryId = ?', [summaryId]);
    res.status(200).json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Error deleting summary:', error);
    res.status(500).json({ error: 'Error deleting summary' });
  }
});

async function databaseQuery(sql, values) {
  return new Promise((resolve, reject) => {
    databaseConn.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = router;
