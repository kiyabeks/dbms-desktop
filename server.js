const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');


const accountroutes = require('./routes/api/accounts.js');
const paymentsroutes = require('./routes/api/payments.js');
const queueorderroutes = require('./routes/api/queueorder.js');
const summaryroutes = require('./routes/api/summary.js');

app.use(bodyParser.json());
app.use(express.json({ extended: false }));
app.use(cors());
app.use('/accounts', accountroutes); 
app.use('/payments', paymentsroutes);
app.use('/queueorder', queueorderroutes);
app.use('/summary', summaryroutes);

app.get('/', (req, res) => {
   res.send('Server is running'); 
});

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
