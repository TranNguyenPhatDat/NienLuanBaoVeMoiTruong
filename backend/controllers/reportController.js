const { sql, poolPromise } = require('../config/db');

// Map chuyển đổi mã từ Frontend (nếu còn gửi tiếng Anh) sang tiếng Việt trong DB
const mapTrangThai = {
  PENDING: 'Chờ tiếp nhận',
  ACCEPTED: 'Đã tiếp nhận',
  VERIFIED: 'Đã xác minh',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối'
};

const mapMucDo = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Nghiêm trọng',
  CRITICAL: 'Khẩn cấp'
};

exports.getAllReports = async (req, res) => {
  try {
    const { status, pollution_type_id, severity_level, search } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT 
        p.ma_phan_anh AS id,
        p.tieu_de AS title,
        p.mo_ta AS description,
        p.muc_do AS severity_level,
        p.vi_do AS latitude,
        p.kinh_do AS longitude,
        p.dia_chi AS address_text,
        p.trang_thai AS status,
        p.ngay_tao AS created_at,
        p.ngay_cap_nhat AS updated_at,
        p.ma_loai AS pollution_type_id,
        l.ten_loai AS pollution_type_name,
        nd.ho_ten AS citizen_name,
        cb.ho_ten AS assigned_officer_name,
        (SELECT TOP 1 duong_dan_anh FROM HinhAnhPhanAnh WHERE ma_phan_anh = p.ma_phan_anh AND loai_anh = N'Trước xử lý') AS thumbnail
      FROM PhanAnh p
      LEFT JOIN LoaiONhiem l ON p.ma_loai = l.ma_loai
      LEFT JOIN NguoiDung nd ON p.ma_nguoi_dan = nd.ma_nguoi_dung
      LEFT JOIN NguoiDung cb ON p.ma_can_bo_phu_trach = cb.ma_nguoi_dung
      WHERE 1=1
    `;

    if (status) {
      const vnStatus = mapTrangThai[status] || status;
      request.input('status', sql.NVarChar, vnStatus);
      query += ' AND p.trang_thai = @status';
    }
    if (pollution_type_id) {
      request.input('typeId', sql.Int, parseInt(pollution_type_id));
      query += ' AND p.ma_loai = @typeId';
    }
    if (severity_level) {
      const vnSeverity = mapMucDo[severity_level] || severity_level;
      request.input('severity', sql.NVarChar, vnSeverity);
      query += ' AND p.muc_do = @severity';
    }
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      query += ' AND (p.tieu_de LIKE @search OR p.dia_chi LIKE @search OR p.mo_ta LIKE @search)';
    }

    query += ' ORDER BY p.ngay_tao DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách phản ánh', error: err.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pool = await poolPromise;

    const reportRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          p.ma_phan_anh AS id,
          p.tieu_de AS title,
          p.mo_ta AS description,
          p.muc_do AS severity_level,
          p.vi_do AS latitude,
          p.kinh_do AS longitude,
          p.dia_chi AS address_text,
          p.trang_thai AS status,
          p.ma_can_bo_phu_trach AS assigned_to,
          p.ngay_tao AS created_at,
          p.ngay_cap_nhat AS updated_at,
          l.ten_loai AS pollution_type_name,
          nd.ho_ten AS citizen_name,
          cb.ho_ten AS assigned_officer_name
        FROM PhanAnh p
        LEFT JOIN LoaiONhiem l ON p.ma_loai = l.ma_loai
        LEFT JOIN NguoiDung nd ON p.ma_nguoi_dan = nd.ma_nguoi_dung
        LEFT JOIN NguoiDung cb ON p.ma_can_bo_phu_trach = cb.ma_nguoi_dung
        WHERE p.ma_phan_anh = @id
      `);

    if (reportRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh!' });
    }

    const imagesRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT ma_hinh_anh AS id, duong_dan_anh AS image_url, loai_anh AS image_type
        FROM HinhAnhPhanAnh WHERE ma_phan_anh = @id
      `);

    const logsRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          nk.ma_nhat_ky AS id,
          nk.trang_thai_cu AS status_from,
          nk.trang_thai_moi AS status_to,
          nk.ghi_chu AS note,
          nk.ngay_tao AS created_at,
          nd.ho_ten AS updated_by_name
        FROM NhatKyXuLy nk
        LEFT JOIN NguoiDung nd ON nk.ma_nguoi_cap_nhat = nd.ma_nguoi_dung
        WHERE nk.ma_phan_anh = @id
        ORDER BY nk.ngay_tao ASC
      `);

    res.json({
      ...reportRes.recordset[0],
      images: imagesRes.recordset,
      logs: logsRes.recordset
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết phản ánh', error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { pollution_type_id, title, description, severity_level, latitude, longitude, address_text, image_url } = req.body;
    const citizen_id = req.user.id;
    const vnSeverity = mapMucDo[severity_level] || severity_level || 'Trung bình';
    const pool = await poolPromise;

    const insertRes = await pool.request()
      .input('ma_nguoi_dan', sql.Int, citizen_id)
      .input('ma_loai', sql.Int, parseInt(pollution_type_id))
      .input('tieu_de', sql.NVarChar, title)
      .input('mo_ta', sql.NVarChar, description || '')
      .input('muc_do', sql.NVarChar, vnSeverity)
      .input('vi_do', sql.Decimal(10, 8), parseFloat(latitude))
      .input('kinh_do', sql.Decimal(11, 8), parseFloat(longitude))
      .input('dia_chi', sql.NVarChar, address_text || '')
      .input('trang_thai', sql.NVarChar, 'Chờ tiếp nhận')
      .query(`
        INSERT INTO PhanAnh (ma_nguoi_dan, ma_loai, tieu_de, mo_ta, muc_do, vi_do, kinh_do, dia_chi, trang_thai)
        OUTPUT INSERTED.ma_phan_anh AS id
        VALUES (@ma_nguoi_dan, @ma_loai, @tieu_de, @mo_ta, @muc_do, @vi_do, @kinh_do, @dia_chi, @trang_thai)
      `);

    const reportId = insertRes.recordset[0].id;

    if (image_url) {
      await pool.request()
        .input('ma_phan_anh', sql.Int, reportId)
        .input('duong_dan_anh', sql.VarChar, image_url)
        .input('loai_anh', sql.NVarChar, 'Trước xử lý')
        .query(`
          INSERT INTO HinhAnhPhanAnh (ma_phan_anh, duong_dan_anh, loai_anh)
          VALUES (@ma_phan_anh, @duong_dan_anh, @loai_anh)
        `);
    }

    res.status(201).json({ message: 'Gửi phản ánh thành công!', reportId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo phản ánh', error: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, assigned_to, note, after_image_url } = req.body;
    const updated_by = req.user.id;
    const vnStatus = mapTrangThai[status] || status;
    const pool = await poolPromise;

    const oldRes = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT trang_thai FROM PhanAnh WHERE ma_phan_anh = @id');

    if (oldRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh!' });
    }
    const oldStatus = oldRes.recordset[0].trang_thai;

    await pool.request()
      .input('id', sql.Int, id)
      .input('trang_thai', sql.NVarChar, vnStatus)
      .input('ma_can_bo', sql.Int, assigned_to ? parseInt(assigned_to) : null)
      .query(`
        UPDATE PhanAnh 
        SET trang_thai = @trang_thai,
            ma_can_bo_phu_trach = COALESCE(@ma_can_bo, ma_can_bo_phu_trach),
            ngay_cap_nhat = GETDATE()
        WHERE ma_phan_anh = @id
      `);

    await pool.request()
      .input('ma_phan_anh', sql.Int, id)
      .input('ma_nguoi_cap_nhat', sql.Int, updated_by)
      .input('trang_thai_cu', sql.NVarChar, oldStatus)
      .input('trang_thai_moi', sql.NVarChar, vnStatus)
      .input('ghi_chu', sql.NVarChar, note || '')
      .query(`
        INSERT INTO NhatKyXuLy (ma_phan_anh, ma_nguoi_cap_nhat, trang_thai_cu, trang_thai_moi, ghi_chu)
        VALUES (@ma_phan_anh, @ma_nguoi_cap_nhat, @trang_thai_cu, @trang_thai_moi, @ghi_chu)
      `);

    if (after_image_url) {
      await pool.request()
        .input('ma_phan_anh', sql.Int, id)
        .input('duong_dan_anh', sql.VarChar, after_image_url)
        .input('loai_anh', sql.NVarChar, 'Sau xử lý')
        .query(`
          INSERT INTO HinhAnhPhanAnh (ma_phan_anh, duong_dan_anh, loai_anh)
          VALUES (@ma_phan_anh, @duong_dan_anh, @loai_anh)
        `);
    }

    res.json({ message: 'Cập nhật tiến độ xử lý thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const pool = await poolPromise;

    const statusRes = await pool.request().query(`
      SELECT trang_thai AS status, COUNT(*) AS count
      FROM PhanAnh GROUP BY trang_thai
    `);

    const typeRes = await pool.request().query(`
      SELECT l.ten_loai AS name, COUNT(p.ma_phan_anh) AS count
      FROM LoaiONhiem l
      LEFT JOIN PhanAnh p ON l.ma_loai = p.ma_loai
      GROUP BY l.ten_loai
    `);

    const avgRes = await pool.request().query(`
      SELECT AVG(CAST(DATEDIFF(HOUR, ngay_tao, ngay_cap_nhat) AS FLOAT)) AS avg_hours
      FROM PhanAnh WHERE trang_thai = N'Hoàn thành'
    `);

    res.json({
      byStatus: statusRes.recordset,
      byType: typeRes.recordset,
      avgResolutionHours: Math.round((avgRes.recordset[0].avg_hours || 0) * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy thống kê', error: err.message });
  }
};