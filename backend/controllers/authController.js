const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');


exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    const pool = await poolPromise;

   
    const checkUser = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM users WHERE email = @email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký!' });
    }

    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

   
    await pool.request()
      .input('full_name', sql.NVarChar, full_name)
      .input('email', sql.VarChar, email)
      .input('password_hash', sql.VarChar, password_hash)
      .input('phone', sql.VarChar, phone)
      .query(`
        INSERT INTO users (full_name, email, password_hash, phone, role)
        VALUES (@full_name, @email, @password_hash, @phone, 'CITIZEN')
      `);

    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu!' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu!' });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};