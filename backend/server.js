const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Báo cáo Ô nhiễm Môi trường đang hoạt động!' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await poolPromise;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động backend vì lỗi kết nối SQL Server:', error);
    process.exitCode = 1;
  }
}

startServer();