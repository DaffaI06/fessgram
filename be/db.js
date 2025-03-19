const {Pool} = require('pg');
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    database: 'fessdb',
    password: 'myBackend',
    port: 5432
});

module.exports = pool;