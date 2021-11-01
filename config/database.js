const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: 'ssac-ivy-database.cowfif0icakd.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    port: '3306',
    password: 'Loanna98!',
    database: 'DailyGreen'
});

module.exports = {
    pool: pool
};