const express = require('express');
const app = express();
const cors = require('cors');

const accountroutes = require('./routes/api/accounts.js'); 

app.use(express.json({ extended: false }));
app.use(cors());
app.use('/accounts', accountroutes); 

app.get('/', (req, res) => {
   res.send('Server is running'); 
});

const PORT = 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
