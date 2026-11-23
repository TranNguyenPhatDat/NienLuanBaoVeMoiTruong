const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const authSchemas = [
  {
    table: 'NguoiDung',
    id: 'ma_nguoi_dung',
    name: 'ho_ten',
    email: 'email',
    password: 'mat_khau_hash',
    phone: 'so_dien_thoai',
    role: 'vai_tro',
    citizenRole: 'Người dân'
  },
  {
    table: 'users',
    id: 'id',
    name: 'full_name',
    email: 'email',
    password: 'password_hash',
    phone: 'phone',
    role: 'role',
    citizenRole: 'CITIZEN'
  }
];

async function getAuthSchema(pool) {
  const result = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME IN ('NguoiDung', 'users')
  `);
  const columnsByTable = new Map();

  for (const column of result.recordset) {
    const tableName = column.TABLE_NAME.toLowerCase();
    if (!columnsByTable.has(tableName)) columnsByTable.set(tableName, new Set());
    columnsByTable.get(tableName).add(column.COLUMN_NAME.toLowerCase());
  }

  const schema = authSchemas.find(candidate => {
    const columns = columnsByTable.get(candidate.table.toLowerCase());
    return columns && ['id', 'name', 'email', 'password', 'phone', 'role']
      .every(key => columns.has(candidate[key].toLowerCase()));
  });

  if (!schema) {
    throw new Error('Không tìm thấy bảng tài khoản NguoiDung hoặc users có đủ các cột đăng nhập.');
  }

  return schema;
}

function normalizeRole(role) {
  const normalizedRole = String(role || '').trim().toUpperCase();
  const roleNames = {
    CITIZEN: 'Người dân',
    OFFICER: 'Cán bộ',
    MANAGER: 'Quản lý'
  };
  return roleNames[normalizedRole] || String(role || '').trim();
}

function getUserQuery(schema) {
  return `
    SELECT [${schema.id}] AS id, [${schema.name}] AS full_name,
           [${schema.email}] AS email, [${schema.password}] AS password_hash,
           [${schema.phone}] AS phone, [${schema.role}] AS role
    FROM [${schema.table}]
  `;
}

exports.register = async (req, res) => {
  try {
    const full_name = typeof req.body.full_name === 'string' ? req.body.full_name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu!' });
    }

    const pool = await poolPromise;
    const schema = await getAuthSchema(pool);

    const checkUser = await pool.request()
      .input('email', sql.VarChar(320), email)
      .query(`${getUserQuery(schema)} WHERE LOWER(LTRIM(RTRIM([${schema.email}]))) = @email`);

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký!' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('full_name', sql.NVarChar(100), full_name)
      .input('email', sql.VarChar(320), email)
      .input('password_hash', sql.VarChar(255), passwordHash)
      .input('phone', sql.VarChar(20), phone)
      .input('role', sql.NVarChar(20), schema.citizenRole)
      .query(`
        INSERT INTO [${schema.table}] ([${schema.name}], [${schema.email}], [${schema.password}], [${schema.phone}], [${schema.role}])
        VALUES (@full_name, @email, @password_hash, @phone, @role)
      `);

    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu!' });
    }

    const pool = await poolPromise;
    const schema = await getAuthSchema(pool);

    const result = await pool.request()
      .input('email', sql.VarChar(320), email)
      .query(`${getUserQuery(schema)} WHERE LOWER(LTRIM(RTRIM([${schema.email}]))) = @email`);

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    const isMatch = typeof user.password_hash === 'string' &&
      await bcrypt.compare(password, user.password_hash.trim());
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    const role = normalizeRole(user.role);
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: err.message });
  }
};