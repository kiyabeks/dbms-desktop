const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const accountroutes = require('./routes/api/accounts.js');
const paymentsroutes = require('./routes/api/payments.js');
const queueorderroutes = require('./routes/api/queueorder.js');
const summaryroutes = require('./routes/api/summary.js');
const initialorderroutes = require('./routes/api/initialorder.js');
const addressesroutes = require('./routes/api/addresses.js');
require('dotenv').config({path:'./.env'});


app.use(bodyParser.json());
app.use(express.json({ extended: false }));
app.use(cors());
app.use('/accounts', accountroutes);
app.use('/payments', paymentsroutes);
app.use('/queueorder', queueorderroutes);
app.use('/summary', summaryroutes);
app.use('/initialorder', initialorderroutes);
app.use('/addresses', addressesroutes);

app.get('/', (req, res) => {
   res.send('Server is running');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
   console.error('Server error:', err);
});

app.use((err, req, res, next) => {
   console.error('Error:', err.stack);
   res.status(500).json({ error: 'Something went wrong!' });
});

process.on('SIGINT', () => {
   console.log('Received SIGINT. Shutting down gracefully...');
   server.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(0);
   });
});