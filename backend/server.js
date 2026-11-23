const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
const { poolPromise } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Đảm bảo thư mục images/uploads tồn tại để lưu ảnh người dân & admin tải lên
const uploadDir = path.join(__dirname, 'images', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Phục vụ thư mục images tĩnh qua URL /images/...
app.use('/images', express.static(path.join(__dirname, 'images')));

// Cấu hình Multer nhận file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép tải lên tệp hình ảnh!'));
    }
  }
});

// API Upload ảnh: lưu file vào images/uploads và trả về URL để lưu vào dbo.HinhAnhPhanAnh
app.post('/api/v1/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng chọn một tệp hình ảnh!' });
  }
  const fullUrl = `${req.protocol}://${req.get('host')}/images/uploads/${req.file.filename}`;
  res.json({
    success: true,
    imageUrl: fullUrl,
    relativePath: `/images/uploads/${req.file.filename}`
  });
});

app.use('/api/v1/news', newsRoutes);
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