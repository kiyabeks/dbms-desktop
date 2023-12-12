const mysql = require('mysql');

const dbConfig = {
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'moneygers',
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
   if (err) {
      console.error('Database connection error:', err);
   } else {
      console.log('Connected to the database');
      connection.release();
   }
});

module.exports = pool;
