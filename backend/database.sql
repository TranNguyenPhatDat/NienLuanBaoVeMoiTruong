-- =========================================================================
-- BƯỚC 1: TẠO CƠ SỞ DỮ LIỆU & DỌN DẸP BẢNG CŨ
-- =========================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'pollution_db')
BEGIN
    CREATE DATABASE pollution_db;
END
GO

USE pollution_db;
GO

-- Xóa các bảng cũ (cả tiếng Anh lẫn tiếng Việt nếu có) theo đúng thứ tự khóa ngoại
DROP TABLE IF EXISTS process_logs;
DROP TABLE IF EXISTS report_images;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS pollution_types;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS NhatKyXuLy;
DROP TABLE IF EXISTS HinhAnhPhanAnh;
DROP TABLE IF EXISTS PhanAnh;
DROP TABLE IF EXISTS LoaiONhiem;
DROP TABLE IF EXISTS NguoiDung;
GO

-- =========================================================================
-- BƯỚC 2: TẠO 5 BẢNG DỮ LIỆU BẰNG TIẾNG VIỆT
-- =========================================================================

-- 1. Bảng Người Dùng
CREATE TABLE NguoiDung (
    ma_nguoi_dung INT IDENTITY(1,1) PRIMARY KEY,
    ho_ten NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau_hash VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    vai_tro NVARCHAR(30) DEFAULT N'Người dân'
        CHECK (vai_tro IN (N'Người dân', N'Cán bộ', N'Quản lý')),
    ngay_tao DATETIME DEFAULT GETDATE()
);

-- 2. Bảng Loại Ô Nhiễm
CREATE TABLE LoaiONhiem (
    ma_loai INT IDENTITY(1,1) PRIMARY KEY,
    ten_loai NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(MAX)
);

-- 3. Bảng Phản Ánh Ô Nhiễm
CREATE TABLE PhanAnh (
    ma_phan_anh INT IDENTITY(1,1) PRIMARY KEY,
    ma_nguoi_dan INT REFERENCES NguoiDung(ma_nguoi_dung),
    ma_loai INT REFERENCES LoaiONhiem(ma_loai),
    tieu_de NVARCHAR(200) NOT NULL,
    mo_ta NVARCHAR(MAX),
    muc_do NVARCHAR(30) DEFAULT N'Trung bình'
        CHECK (muc_do IN (N'Thấp', N'Trung bình', N'Nghiêm trọng', N'Khẩn cấp')),
    vi_do DECIMAL(10, 8) NOT NULL,
    kinh_do DECIMAL(11, 8) NOT NULL,
    dia_chi NVARCHAR(MAX),
    trang_thai NVARCHAR(30) DEFAULT N'Chờ tiếp nhận'
        CHECK (trang_thai IN (N'Chờ tiếp nhận', N'Đã tiếp nhận', N'Đã xác minh', N'Đang xử lý', N'Hoàn thành', N'Từ chối')),
    ma_can_bo_phu_trach INT REFERENCES NguoiDung(ma_nguoi_dung),
    ngay_tao DATETIME DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME DEFAULT GETDATE()
);

-- 4. Bảng Hình Ảnh Phản Ánh
CREATE TABLE HinhAnhPhanAnh (
    ma_hinh_anh INT IDENTITY(1,1) PRIMARY KEY,
    ma_phan_anh INT NOT NULL REFERENCES PhanAnh(ma_phan_anh) ON DELETE CASCADE,
    duong_dan_anh VARCHAR(255) NOT NULL,
    loai_anh NVARCHAR(20) DEFAULT N'Trước xử lý'
        CHECK (loai_anh IN (N'Trước xử lý', N'Sau xử lý')),
    ngay_tao DATETIME DEFAULT GETDATE()
);

-- 5. Bảng Nhật Ký Xử Lý
CREATE TABLE NhatKyXuLy (
    ma_nhat_ky INT IDENTITY(1,1) PRIMARY KEY,
    ma_phan_anh INT NOT NULL REFERENCES PhanAnh(ma_phan_anh) ON DELETE CASCADE,
    ma_nguoi_cap_nhat INT NOT NULL REFERENCES NguoiDung(ma_nguoi_dung),
    trang_thai_cu NVARCHAR(30),
    trang_thai_moi NVARCHAR(30),
    ghi_chu NVARCHAR(MAX),
    ngay_tao DATETIME DEFAULT GETDATE()
);
GO

-- =========================================================================
-- BƯỚC 3: NẠP DỮ LIỆU MẪU (MẬT KHẨU CHUNG: 123456)
-- =========================================================================

INSERT INTO LoaiONhiem (ten_loai, mo_ta) VALUES
(N'Rác thải', N'Rác thải sinh hoạt, rác tự phát, ùn ứ'),
(N'Nước thải', N'Nước thải đen, mùi hôi, xả trực tiếp ra kênh rạch'),
(N'Khói bụi', N'Khói bụi từ nhà xưởng, đốt rác gây ô nhiễm không khí'),
(N'Tiếng ồn', N'Tiếng ồn vượt mức quy định gây ảnh hưởng sinh hoạt');

INSERT INTO NguoiDung (ho_ten, email, mat_khau_hash, so_dien_thoai, vai_tro) VALUES
(N'Nguyễn Văn An', 'an.nguyen@gmail.com', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0901234561', N'Người dân'),
(N'Trần Thị Bích', 'bich.tran@gmail.com', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0901234562', N'Người dân'),
(N'Lê Hoàng Nam', 'nam.le@gmail.com', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0901234563', N'Người dân'),
(N'Phạm Minh Tuấn (Cán bộ Đô thị)', 'tuan.canbo@dongthap.gov.vn', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0918111222', N'Cán bộ'),
(N'Võ Thị Kim Oanh (Cán bộ Môi trường)', 'oanh.canbo@dongthap.gov.vn', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0918333444', N'Cán bộ'),
(N'Đặng Quốc Hùng (Trưởng phòng TNMT)', 'hung.quanly@dongthap.gov.vn', '$2b$10$ld20gh8mVzOIAJKdJrJkyeRP5j9Qp3nOf1j8gKgn/rD132Tzon6Pa', '0918999888', N'Quản lý');

INSERT INTO PhanAnh (ma_nguoi_dan, ma_loai, tieu_de, mo_ta, muc_do, vi_do, kinh_do, dia_chi, trang_thai, ma_can_bo_phu_trach, ngay_tao, ngay_cap_nhat) VALUES
(1, 1, N'Bãi rác tự phát gần cổng sau Đại học Đồng Tháp', N'Rác thải sinh hoạt và hộp xốp vứt bừa bãi dọc vỉa hè gây mất mỹ quan và bốc mùi.', N'Nghiêm trọng', 10.422500, 105.643200, N'Đường Phạm Hữu Lầu, Phường 6, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -15, GETDATE()), DATEADD(day, -12, GETDATE())),
(2, 2, N'Nước thải đen ngòm xả ra rạch Cái Sao Thượng', N'Cơ sở chế biến gần cầu xả nước thải chưa qua xử lý làm nước kênh chuyển màu đen đặc.', N'Khẩn cấp', 10.431000, 105.638500, N'Phường 6, TP. Cao Lãnh, Đồng Tháp', N'Đang xử lý', 5, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
(3, 3, N'Đốt rác thải nhựa gây khói mù mịt khu dân cư', N'Chiều tối người dân tự ý đốt túi nilon và vỏ xe gây khói khét lẹt ảnh hưởng trẻ nhỏ.', N'Nghiêm trọng', 10.455200, 105.632100, N'Đường Nguyễn Huệ, Phường 1, TP. Cao Lãnh', N'Đã xác minh', 4, DATEADD(day, -3, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 4, N'Quán nhậu mở loa kẹo kéo quá 23h đêm', N'Âm thanh công suất lớn kéo dài khuya gây mất ngủ cho cả khu phố.', N'Trung bình', 10.458900, 105.635400, N'Đường 30/4, Phường 1, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -10, GETDATE()), DATEADD(day, -9, GETDATE())),
(2, 1, N'Ùn ứ rác thải tại góc chợ Cao Lãnh', N'Xe thu gom chưa kịp dọn khiến rác tràn xuống lòng đường vào giờ cao điểm.', N'Nghiêm trọng', 10.453500, 105.630800, N'Đường Thiên Hộ Dương, Phường 4, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -8, GETDATE()), DATEADD(day, -7, GETDATE())),
(3, 2, N'Cống thoát nước bị nghẹt tràn nước bẩn ra đường', N'Mỗi khi mưa lớn nước cống đen trào ngược lên mặt đường bốc mùi hôi thối.', N'Trung bình', 10.461200, 105.629500, N'Đường Lê Lợi, Phường 2, TP. Cao Lãnh', N'Đã tiếp nhận', NULL, DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 1, N'Xà bần và phế liệu xây dựng đổ trộm ven đường', N'Xe tải đổ trộm gạch đá và bao xi măng lấn chiếm lối đi bộ ven bờ kè.', N'Trung bình', 10.448000, 105.625000, N'Bờ kè Sông Cao Lãnh, Phường 3, TP. Cao Lãnh', N'Chờ tiếp nhận', NULL, DATEADD(hour, -12, GETDATE()), DATEADD(hour, -12, GETDATE())),
(2, 3, N'Khói bụi từ xưởng mộc gần khu dân cư', N'Bụi gỗ mịn bay mù mịt sang các nhà lân cận khi xưởng hoạt động.', N'Nghiêm trọng', 10.467500, 105.641000, N'Đường Tôn Đức Thắng, Phường Mỹ Phú, TP. Cao Lãnh', N'Đang xử lý', 5, DATEADD(day, -6, GETDATE()), DATEADD(day, -3, GETDATE())),
(3, 2, N'Xả nước thải rửa xe trực tiếp xuống mương thoát nước', N'Tiệm rửa xe không có bể lắng, xả bọt xà phòng và dầu nhớt thẳng ra mương.', N'Thấp', 10.451000, 105.639000, N'Đường Ngô Thời Nhậm, Phường 1, TP. Cao Lãnh', N'Hoàn thành', 5, DATEADD(day, -20, GETDATE()), DATEADD(day, -18, GETDATE())),
(1, 1, N'Rác thải nhựa trôi nổi dày đặc dưới chân cầu', N'Rác từ thượng nguồn tấp vào chân cầu kết thành mảng lớn gây tắc dòng chảy.', N'Nghiêm trọng', 10.456800, 105.627200, N'Cầu Đúc, Phường 2, TP. Cao Lãnh', N'Đã xác minh', 4, DATEADD(day, -4, GETDATE()), DATEADD(day, -2, GETDATE())),
(2, 4, N'Tiếng ồn máy phát điện công nghiệp chạy suốt đêm', N'Cơ sở kinh doanh chạy máy phát điện không có hộp cách âm gây rung và ồn.', N'Trung bình', 10.443200, 105.636800, N'Đường Lý Thường Kiệt, Phường 6, TP. Cao Lãnh', N'Chờ tiếp nhận', NULL, DATEADD(hour, -5, GETDATE()), DATEADD(hour, -5, GETDATE())),
(3, 1, N'Bãi tập kết rác tự phát trong hẻm nhỏ', N'Người dân thiếu ý thức vứt rác trước khu đất trống tạo thành ổ chuột và muỗi.', N'Trung bình', 10.463000, 105.633500, N'Hẻm 45, Đường Hùng Vương, Phường 2, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -14, GETDATE()), DATEADD(day, -11, GETDATE())),
(1, 2, N'Nước kênh chuyển màu xanh rêu và có váng dầu', N'Nghi vấn rò rỉ dầu nhớt từ bến tàu gần đó làm ô nhiễm cả đoạn kênh dài.', N'Khẩn cấp', 10.435500, 105.621500, N'Xã Tân Thuận Đông, TP. Cao Lãnh', N'Đang xử lý', 5, DATEADD(day, -4, GETDATE()), DATEADD(day, -1, GETDATE())),
(2, 3, N'Đốt rơm rạ và cỏ khô ven quốc lộ gây khuất tầm nhìn', N'Khói dày đặc bay ngang mặt đường gây nguy hiểm cho xe máy lưu thông.', N'Nghiêm trọng', 10.478000, 105.651200, N'Quốc lộ 30, Phường Mỹ Tân, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -12, GETDATE()), DATEADD(day, -11, GETDATE())),
(3, 1, N'Xác động vật chết vứt xuống kênh gây mùi hôi nồng nặc', N'Bao tải chứa xác gia cầm trôi dạt vào bờ gần khu vực nhà dân.', N'Khẩn cấp', 10.449500, 105.645500, N'Xã Hòa An, TP. Cao Lãnh', N'Hoàn thành', 5, DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE())),
(1, 4, N'Công trình thi công khoan cắt bê tông vào giờ nghỉ trưa', N'Tiếng máy khoan đục ầm ĩ từ 12h trưa đến 13h30 ảnh hưởng người già và trẻ em.', N'Thấp', 10.457500, 105.631000, N'Đường Đặng Văn Bình, Phường 1, TP. Cao Lãnh', N'Đã tiếp nhận', NULL, DATEADD(day, -1, GETDATE()), DATEADD(hour, -18, GETDATE())),
(2, 1, N'Thùng rác công cộng hư hỏng tràn rác ra công viên', N'Các thùng rác quanh công viên bị vỡ đáy, rác rơi vãi khắp thảm cỏ.', N'Thấp', 10.454200, 105.634200, N'Công viên Văn Miếu, Phường 1, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -9, GETDATE()), DATEADD(day, -8, GETDATE())),
(3, 2, N'Hố ga mất nắp bốc mùi hôi thối nồng nặc', N'Nước thải tù đọng dưới hố ga bốc mùi lên trực tiếp khu vực buôn bán ăn uống.', N'Nghiêm trọng', 10.452100, 105.629000, N'Đường Nguyễn Đình Chiểu, Phường 2, TP. Cao Lãnh', N'Đã xác minh', 5, DATEADD(day, -3, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 3, N'Khói đen từ lò đốt thủ công của cơ sở tái chế', N'Ống khói thấp xả trực tiếp khói đen kịt ra khu vực xung quanh mỗi buổi sáng.', N'Khẩn cấp', 10.471000, 105.619000, N'Xã Tịnh Thới, TP. Cao Lãnh', N'Đang xử lý', 5, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
(2, 1, N'Rác thải y tế (khẩu trang, kim tiêm cũ) vứt lẫn rác sinh hoạt', N'Phát hiện nhiều rác thải phòng khám bỏ chung vào thùng rác dân sinh.', N'Khẩn cấp', 10.460100, 105.637800, N'Đường Hải Thượng Lãn Ông, Phường 1, TP. Cao Lãnh', N'Hoàn thành', 5, DATEADD(day, -11, GETDATE()), DATEADD(day, -10, GETDATE())),
(3, 1, N'Tập kết vỏ dừa và phụ phẩm nông nghiệp gây ruồi nhặng', N'Đống vỏ dừa chất cao nhiều tuần không dọn tạo nước rỉ đen và nhiều muỗi.', N'Trung bình', 10.439000, 105.631500, N'Đường Trần Hưng Đạo, Phường 6, TP. Cao Lãnh', N'Chờ tiếp nhận', NULL, DATEADD(hour, -3, GETDATE()), DATEADD(hour, -3, GETDATE())),
(1, 2, N'Nước thải từ khu trọ sinh viên chảy tràn ra hẻm', N'Đường ống thoát nước khu trọ bị vỡ khiến nước sinh hoạt chảy lênh láng ra đường.', N'Trung bình', 10.424800, 105.645000, N'Khu dân cư Đại học Đồng Tháp, Phường 6', N'Đã tiếp nhận', NULL, DATEADD(day, -1, GETDATE()), DATEADD(hour, -10, GETDATE())),
(2, 3, N'Bụi đất từ xe ben chở vật liệu không che bạt', N'Xe tải chở cát đá chạy qua tuyến đường làm rơi vãi đất cát, xe chạy qua bụi mù.', N'Nghiêm trọng', 10.465000, 105.648000, N'Đường Điện Biên Phủ, Phường Mỹ Phú, TP. Cao Lãnh', N'Đã xác minh', 4, DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE())),
(3, 4, N'Cơ sở gia công sắt thép gõ hàn ồn ào cả ngày', N'Tiếng máy cắt sắt chói tai phát ra liên tục từ sáng sớm đến chiều tối.', N'Trung bình', 10.446500, 105.628500, N'Đường Võ Trường Toản, Phường 1, TP. Cao Lãnh', N'Hoàn thành', 4, DATEADD(day, -18, GETDATE()), DATEADD(day, -15, GETDATE())),
(1, 1, N'Bãi rác tự phát dưới dốc cầu Cao Lãnh', N'Người đi đường tiện tay vứt túi rác xuống chân dốc cầu gây mất vệ sinh.', N'Nghiêm trọng', 10.415000, 105.612000, N'Khu vực Cầu Cao Lãnh, Xã Tịnh Thới, TP. Cao Lãnh', N'Chờ tiếp nhận', NULL, DATEADD(hour, -1, GETDATE()), DATEADD(hour, -1, GETDATE()));

INSERT INTO HinhAnhPhanAnh (ma_phan_anh, duong_dan_anh, loai_anh) VALUES
(1, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600', N'Trước xử lý'),
(1, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600', N'Sau xử lý'),
(2, 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600', N'Trước xử lý'),
(3, 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600', N'Trước xử lý'),
(5, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600', N'Trước xử lý'),
(5, 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=600', N'Sau xử lý');

INSERT INTO NhatKyXuLy (ma_phan_anh, ma_nguoi_cap_nhat, trang_thai_cu, trang_thai_moi, ghi_chu, ngay_tao) VALUES
(1, 6, N'Chờ tiếp nhận', N'Đã tiếp nhận', N'Đã tiếp nhận thông tin phản ánh từ sinh viên khu vực ĐH Đồng Tháp.', DATEADD(day, -14, GETDATE())),
(1, 4, N'Đã tiếp nhận', N'Đã xác minh', N'Đã kiểm tra thực tế, đúng là có bãi rác tự phát lớn.', DATEADD(day, -14, GETDATE())),
(1, 4, N'Đã xác minh', N'Đang xử lý', N'Điều động xe thu gom rác đô thị đến dọn dẹp.', DATEADD(day, -13, GETDATE())),
(1, 4, N'Đang xử lý', N'Hoàn thành', N'Đã thu gom sạch sẽ và cắm biển cấm đổ rác.', DATEADD(day, -12, GETDATE())),
(2, 6, N'Chờ tiếp nhận', N'Đã tiếp nhận', N'Tiếp nhận tin báo khẩn cấp về ô nhiễm nguồn nước rạch Cái Sao.', DATEADD(day, -4, GETDATE())),
(2, 5, N'Đã tiếp nhận', N'Đã xác minh', N'Đã lấy mẫu nước kiểm tra và xác định nguồn xả thải.', DATEADD(day, -3, GETDATE())),
(2, 5, N'Đã xác minh', N'Đang xử lý', N'Đang lập biên bản xử phạt và yêu cầu cơ sở khắc phục hệ thống lọc.', DATEADD(day, -2, GETDATE()));
GO