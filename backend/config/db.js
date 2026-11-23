const sql = require('mssql');
require('dotenv').config();

const requiredConfig = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME', 'JWT_SECRET'];
const missingConfig = requiredConfig.filter(key => !process.env[key]);

if (missingConfig.length > 0) {
  throw new Error(`Thiếu cấu hình SQL Server trong backend/.env: ${missingConfig.join(', ')}`);
}

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Đã kết nối thành công SQL Server (pollution_db)');
    return pool;
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối SQL Server:', err);
    throw err;
  });

module.exports = { sql, poolPromise };