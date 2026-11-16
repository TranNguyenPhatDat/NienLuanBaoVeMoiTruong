const { sql, poolPromise } = require('../config/db');


exports.getAllReports = async (req, res) => {
  try {
    const { status, pollution_type_id, severity_level, search } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT r.*, pt.name AS pollution_type_name, u.full_name AS citizen_name,
             (SELECT TOP 1 image_url FROM report_images WHERE report_id = r.id AND image_type = 'BEFORE') AS thumbnail
      FROM reports r
      LEFT JOIN pollution_types pt ON r.pollution_type_id = pt.id
      LEFT JOIN users u ON r.citizen_id = u.id
      WHERE 1=1
    `;

    if (status) {
      query += ` AND r.status = @status`;
      request.input('status', sql.VarChar, status);
    }
    if (pollution_type_id) {
      query += ` AND r.pollution_type_id = @pollution_type_id`;
      request.input('pollution_type_id', sql.Int, pollution_type_id);
    }
    if (severity_level) {
      query += ` AND r.severity_level = @severity_level`;
      request.input('severity_level', sql.VarChar, severity_level);
    }
    if (search) {
      query += ` AND (r.title LIKE @search OR r.address_text LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phản ánh', error: error.message });
  }
};


exports.getStats = async (req, res) => {
  try {
    const pool = await poolPromise;

   
    const statusRes = await pool.request().query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status IN ('ACCEPTED', 'VERIFIED', 'PROCESSING') THEN 1 ELSE 0 END) AS processing,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
      FROM reports
    `);

   
    const typeRes = await pool.request().query(`
      SELECT pt.name AS type_name, COUNT(r.id) AS count
      FROM pollution_types pt
      LEFT JOIN reports r ON pt.id = r.pollution_type_id
      GROUP BY pt.id, pt.name
    `);

  
    const avgTimeRes = await pool.request().query(`
      SELECT ISNULL(AVG(CAST(DATEDIFF(HOUR, created_at, updated_at) AS FLOAT)), 0) AS avg_hours
      FROM reports
      WHERE status = 'COMPLETED'
    `);

    res.json({
      overview: statusRes.recordset[0],
      byType: typeRes.recordset,
      avgResolutionHours: Math.round(avgTimeRes.recordset[0].avg_hours * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy dữ liệu thống kê', error: error.message });
  }
};


exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const reportRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT r.*, pt.name AS pollution_type_name, u.full_name AS citizen_name, a.full_name AS officer_name
        FROM reports r
        LEFT JOIN pollution_types pt ON r.pollution_type_id = pt.id
        LEFT JOIN users u ON r.citizen_id = u.id
        LEFT JOIN users a ON r.assigned_to = a.id
        WHERE r.id = @id
      `);

    if (reportRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh!' });
    }

    const imagesRes = await pool.request()
      .input('report_id', sql.Int, id)
      .query('SELECT * FROM report_images WHERE report_id = @report_id');

    const logsRes = await pool.request()
      .input('report_id', sql.Int, id)
      .query(`
        SELECT pl.*, u.full_name AS updated_by_name, u.role
        FROM process_logs pl
        LEFT JOIN users u ON pl.updated_by = u.id
        WHERE pl.report_id = @report_id
        ORDER BY pl.created_at ASC
      `);

    res.json({
      ...reportRes.recordset[0],
      images: imagesRes.recordset,
      logs: logsRes.recordset
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết phản ánh', error: error.message });
  }
};


exports.createReport = async (req, res) => {
  try {
    const { pollution_type_id, title, description, severity_level, latitude, longitude, address_text, image_url } = req.body;
    const citizen_id = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('citizen_id', sql.Int, citizen_id)
      .input('pollution_type_id', sql.Int, pollution_type_id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('severity_level', sql.VarChar, severity_level || 'MEDIUM')
      .input('latitude', sql.Decimal(10, 8), latitude)
      .input('longitude', sql.Decimal(11, 8), longitude)
      .input('address_text', sql.NVarChar, address_text)
      .query(`
        INSERT INTO reports (citizen_id, pollution_type_id, title, description, severity_level, latitude, longitude, address_text, status)
        OUTPUT INSERTED.id
        VALUES (@citizen_id, @pollution_type_id, @title, @description, @severity_level, @latitude, @longitude, @address_text, 'PENDING')
      `);

    const newReportId = result.recordset[0].id;

    if (image_url) {
      await pool.request()
        .input('report_id', sql.Int, newReportId)
        .input('image_url', sql.VarChar, image_url)
        .query(`INSERT INTO report_images (report_id, image_url, image_type) VALUES (@report_id, @image_url, 'BEFORE')`);
    }

    res.status(201).json({ message: 'Gửi phản ánh thành công!', reportId: newReportId });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi phản ánh', error: error.message });
  }
};


exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assigned_to, after_image_url } = req.body;
    const updated_by = req.user.id;
    const pool = await poolPromise;

    const currentRes = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT status, assigned_to FROM reports WHERE id = @id');

    if (currentRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh!' });
    }

    const oldStatus = currentRes.recordset[0].status;
    const newAssignedTo = assigned_to || currentRes.recordset[0].assigned_to;

    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .input('assigned_to', sql.Int, newAssignedTo)
      .query('UPDATE reports SET status = @status, assigned_to = @assigned_to, updated_at = GETDATE() WHERE id = @id');

    await pool.request()
      .input('report_id', sql.Int, id)
      .input('updated_by', sql.Int, updated_by)
      .input('status_from', sql.VarChar, oldStatus)
      .input('status_to', sql.VarChar, status)
      .input('note', sql.NVarChar, note || '')
      .query(`
        INSERT INTO process_logs (report_id, updated_by, status_from, status_to, note)
        VALUES (@report_id, @updated_by, @status_from, @status_to, @note)
      `);

    if (after_image_url) {
      await pool.request()
        .input('report_id', sql.Int, id)
        .input('image_url', sql.VarChar, after_image_url)
        .query(`INSERT INTO report_images (report_id, image_url, image_type) VALUES (@report_id, @image_url, 'AFTER')`);
    }

    res.json({ message: 'Cập nhật tiến độ xử lý thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
};