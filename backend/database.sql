-- Tự động tạo database pollution_db nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'pollution_db')
BEGIN
    CREATE DATABASE pollution_db;
END
GO
-- BƯỚC 2: Chuyển sang đúng database pollution_db và tạo lại đầy đủ
USE pollution_db;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'CITIZEN' CHECK (role IN ('CITIZEN', 'OFFICER', 'MANAGER')),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE pollution_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX)
);

CREATE TABLE reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    citizen_id INT REFERENCES users(id),
    pollution_type_id INT REFERENCES pollution_types(id),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    severity_level VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address_text NVARCHAR(MAX),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'VERIFIED', 'PROCESSING', 'COMPLETED', 'REJECTED')),
    assigned_to INT REFERENCES users(id),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE report_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'BEFORE' CHECK (image_type IN ('BEFORE', 'AFTER')),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE process_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    updated_by INT NOT NULL REFERENCES users(id),
    status_from VARCHAR(30),
    status_to VARCHAR(30),
    note NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- Chèn loại ô nhiễm
INSERT INTO pollution_types (name, description) VALUES
(N'Rác thải', N'Rác thải sinh hoạt, rác tự phát, ùn ứ'),
(N'Nước thải', N'Nước thải đen, mùi hôi, xả trực tiếp ra kênh rạch'),
(N'Khói bụi', N'Khói bụi từ nhà xưởng, đốt rác gây ô nhiễm không khí'),
(N'Tiếng ồn', N'Tiếng ồn vượt mức quy định gây ảnh hưởng sinh hoạt');

-- Chèn tài khoản người dùng mẫu
INSERT INTO users (full_name, email, password_hash, phone, role) VALUES
(N'Nguyễn Văn An', 'an.nguyen@gmail.com', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0901234561', 'CITIZEN'),
(N'Trần Thị Bích', 'bich.tran@gmail.com', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0901234562', 'CITIZEN'),
(N'Lê Hoàng Nam', 'nam.le@gmail.com', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0901234563', 'CITIZEN'),
(N'Phạm Minh Tuấn (Cán bộ Đô thị)', 'tuan.canbo@dongthap.gov.vn', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0918111222', 'OFFICER'),
(N'Võ Thị Kim Oanh (Cán bộ Môi trường)', 'oanh.canbo@dongthap.gov.vn', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0918333444', 'OFFICER'),
(N'Đặng Quốc Hùng (Trưởng phòng TNMT)', 'hung.quanly@dongthap.gov.vn', '$2a$10$X7v1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v', '0918999888', 'MANAGER');

-- Chèn 25 phản ánh dữ liệu mô phỏng tại Cao Lãnh, Đồng Tháp
INSERT INTO reports (citizen_id, pollution_type_id, title, description, severity_level, latitude, longitude, address_text, status, assigned_to, created_at, updated_at) VALUES
(1, 1, N'Bãi rác tự phát gần cổng sau Đại học Đồng Tháp', N'Rác thải sinh hoạt và hộp xốp vứt bừa bãi dọc vỉa hè gây mất mỹ quan và bốc mùi.', 'HIGH', 10.422500, 105.643200, N'Đường Phạm Hữu Lầu, Phường 6, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -15, GETDATE()), DATEADD(day, -12, GETDATE())),
(2, 2, N'Nước thải đen ngòm xả ra rạch Cái Sao Thượng', N'Cơ sở chế biến gần cầu xả nước thải chưa qua xử lý làm nước kênh chuyển màu đen đặc.', 'CRITICAL', 10.431000, 105.638500, N'Phường 6, TP. Cao Lãnh, Đồng Tháp', 'PROCESSING', 5, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
(3, 3, N'Đốt rác thải nhựa gây khói mù mịt khu dân cư', N'Chiều tối người dân tự ý đốt túi nilon và vỏ xe gây khói khét lẹt ảnh hưởng trẻ nhỏ.', 'HIGH', 10.455200, 105.632100, N'Đường Nguyễn Huệ, Phường 1, TP. Cao Lãnh', 'VERIFIED', 4, DATEADD(day, -3, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 4, N'Quán nhậu mở loa kẹo kéo quá 23h đêm', N'Âm thanh công suất lớn kéo dài khuya gây mất ngủ cho cả khu phố.', 'MEDIUM', 10.458900, 105.635400, N'Đường 30/4, Phường 1, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -10, GETDATE()), DATEADD(day, -9, GETDATE())),
(2, 1, N'Ùn ứ rác thải tại góc chợ Cao Lãnh', N'Xe thu gom chưa kịp dọn khiến rác tràn xuống lòng đường vào giờ cao điểm.', 'HIGH', 10.453500, 105.630800, N'Đường Thiên Hộ Dương, Phường 4, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -8, GETDATE()), DATEADD(day, -7, GETDATE())),
(3, 2, N'Cống thoát nước bị nghẹt tràn nước bẩn ra đường', N'Mỗi khi mưa lớn nước cống đen trào ngược lên mặt đường bốc mùi hôi thối.', 'MEDIUM', 10.461200, 105.629500, N'Đường Lê Lợi, Phường 2, TP. Cao Lãnh', 'ACCEPTED', NULL, DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 1, N'Xà bần và phế liệu xây dựng đổ trộm ven đường', N'Xe tải đổ trộm gạch đá và bao xi măng lấn chiếm lối đi bộ ven bờ kè.', 'MEDIUM', 10.448000, 105.625000, N'Bờ kè Sông Cao Lãnh, Phường 3, TP. Cao Lãnh', 'PENDING', NULL, DATEADD(hour, -12, GETDATE()), DATEADD(hour, -12, GETDATE())),
(2, 3, N'Khói bụi từ xưởng mộc gần khu dân cư', N'Bụi gỗ mịn bay mù mịt sang các nhà lân cận khi xưởng hoạt động.', 'HIGH', 10.467500, 105.641000, N'Đường Tôn Đức Thắng, Phường Mỹ Phú, TP. Cao Lãnh', 'PROCESSING', 5, DATEADD(day, -6, GETDATE()), DATEADD(day, -3, GETDATE())),
(3, 2, N'Xả nước thải rửa xe trực tiếp xuống mương thoát nước', N'Tiệm rửa xe không có bể lắng, xả bọt xà phòng và dầu nhớt thẳng ra mương.', 'LOW', 10.451000, 105.639000, N'Đường Ngô Thời Nhậm, Phường 1, TP. Cao Lãnh', 'COMPLETED', 5, DATEADD(day, -20, GETDATE()), DATEADD(day, -18, GETDATE())),
(1, 1, N'Rác thải nhựa trôi nổi dày đặc dưới chân cầu', N'Rác từ thượng nguồn tấp vào chân cầu kết thành mảng lớn gây tắc dòng chảy.', 'HIGH', 10.456800, 105.627200, N'Cầu Đúc, Phường 2, TP. Cao Lãnh', 'VERIFIED', 4, DATEADD(day, -4, GETDATE()), DATEADD(day, -2, GETDATE())),
(2, 4, N'Tiếng ồn máy phát điện công nghiệp chạy suốt đêm', N'Cơ sở kinh doanh chạy máy phát điện không có hộp cách âm gây rung và ồn.', 'MEDIUM', 10.443200, 105.636800, N'Đường Lý Thường Kiệt, Phường 6, TP. Cao Lãnh', 'PENDING', NULL, DATEADD(hour, -5, GETDATE()), DATEADD(hour, -5, GETDATE())),
(3, 1, N'Bãi tập kết rác tự phát trong hẻm nhỏ', N'Người dân thiếu ý thức vứt rác trước khu đất trống tạo thành ổ chuột và muỗi.', 'MEDIUM', 10.463000, 105.633500, N'Hẻm 45, Đường Hùng Vương, Phường 2, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -14, GETDATE()), DATEADD(day, -11, GETDATE())),
(1, 2, N'Nước kênh chuyển màu xanh rêu và có váng dầu', N'Nghi vấn rò rỉ dầu nhớt từ bến tàu gần đó làm ô nhiễm cả đoạn kênh dài.', 'CRITICAL', 10.435500, 105.621500, N'Xã Tân Thuận Đông, TP. Cao Lãnh', 'PROCESSING', 5, DATEADD(day, -4, GETDATE()), DATEADD(day, -1, GETDATE())),
(2, 3, N'Đốt rơm rạ và cỏ khô ven quốc lộ gây khuất tầm nhìn', N'Khói dày đặc bay ngang mặt đường gây nguy hiểm cho xe máy lưu thông.', 'HIGH', 10.478000, 105.651200, N'Quốc lộ 30, Phường Mỹ Tân, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -12, GETDATE()), DATEADD(day, -11, GETDATE())),
(3, 1, N'Xác động vật chết vứt xuống kênh gây mùi hôi nồng nặc', N'Bao tải chứa xác gia cầm trôi dạt vào bờ gần khu vực nhà dân.', 'CRITICAL', 10.449500, 105.645500, N'Xã Hòa An, TP. Cao Lãnh', 'COMPLETED', 5, DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE())),
(1, 4, N'Công trình thi công khoan cắt bê tông vào giờ nghỉ trưa', N'Tiếng máy khoan đục ầm ĩ từ 12h trưa đến 13h30 ảnh hưởng người già và trẻ em.', 'LOW', 10.457500, 105.631000, N'Đường Đặng Văn Bình, Phường 1, TP. Cao Lãnh', 'ACCEPTED', NULL, DATEADD(day, -1, GETDATE()), DATEADD(hour, -18, GETDATE())),
(2, 1, N'Thùng rác công cộng hư hỏng tràn rác ra công viên', N'Các thùng rác quanh công viên bị vỡ đáy, rác rơi vãi khắp thảm cỏ.', 'LOW', 10.454200, 105.634200, N'Công viên Văn Miếu, Phường 1, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -9, GETDATE()), DATEADD(day, -8, GETDATE())),
(3, 2, N'Hố ga mất nắp bốc mùi hôi thối nồng nặc', N'Nước thải tù đọng dưới hố ga bốc mùi lên trực tiếp khu vực buôn bán ăn uống.', 'HIGH', 10.452100, 105.629000, N'Đường Nguyễn Đình Chiểu, Phường 2, TP. Cao Lãnh', 'VERIFIED', 5, DATEADD(day, -3, GETDATE()), DATEADD(day, -1, GETDATE())),
(1, 3, N'Khói đen từ lò đốt thủ công của cơ sở tái chế', N'Ống khói thấp xả trực tiếp khói đen kịt ra khu vực xung quanh mỗi buổi sáng.', 'CRITICAL', 10.471000, 105.619000, N'Xã Tịnh Thới, TP. Cao Lãnh', 'PROCESSING', 5, DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
(2, 1, N'Rác thải y tế (khẩu trang, kim tiêm cũ) vứt lẫn rác sinh hoạt', N'Phát hiện nhiều rác thải phòng khám bỏ chung vào thùng rác dân sinh.', 'CRITICAL', 10.460100, 105.637800, N'Đường Hải Thượng Lãn Ông, Phường 1, TP. Cao Lãnh', 'COMPLETED', 5, DATEADD(day, -11, GETDATE()), DATEADD(day, -10, GETDATE())),
(3, 1, N'Tập kết vỏ dừa và phụ phẩm nông nghiệp gây ruồi nhặng', N'Đống vỏ dừa chất cao nhiều tuần không dọn tạo nước rỉ đen và nhiều muỗi.', 'MEDIUM', 10.439000, 105.631500, N'Đường Trần Hưng Đạo, Phường 6, TP. Cao Lãnh', 'PENDING', NULL, DATEADD(hour, -3, GETDATE()), DATEADD(hour, -3, GETDATE())),
(1, 2, N'Nước thải từ khu trọ sinh viên chảy tràn ra hẻm', N'Đường ống thoát nước khu trọ bị vỡ khiến nước sinh hoạt chảy lênh láng ra đường.', 'MEDIUM', 10.424800, 105.645000, N'Khu dân cư Đại học Đồng Tháp, Phường 6', 'ACCEPTED', NULL, DATEADD(day, -1, GETDATE()), DATEADD(hour, -10, GETDATE())),
(2, 3, N'Bụi đất từ xe ben chở vật liệu không che bạt', N'Xe tải chở cát đá chạy qua tuyến đường làm rơi vãi đất cát, xe chạy qua bụi mù.', 'HIGH', 10.465000, 105.648000, N'Đường Điện Biên Phủ, Phường Mỹ Phú, TP. Cao Lãnh', 'VERIFIED', 4, DATEADD(day, -2, GETDATE()), DATEADD(day, -1, GETDATE())),
(3, 4, N'Cơ sở gia công sắt thép gõ hàn ồn ào cả ngày', N'Tiếng máy cắt sắt chói tai phát ra liên tục từ sáng sớm đến chiều tối.', 'MEDIUM', 10.446500, 105.628500, N'Đường Võ Trường Toản, Phường 1, TP. Cao Lãnh', 'COMPLETED', 4, DATEADD(day, -18, GETDATE()), DATEADD(day, -15, GETDATE())),
(1, 1, N'Bãi rác tự phát dưới dốc cầu Cao Lãnh', N'Người đi đường tiện tay vứt túi rác xuống chân dốc cầu gây mất vệ sinh.', 'HIGH', 10.415000, 105.612000, N'Khu vực Cầu Cao Lãnh, Xã Tịnh Thới, TP. Cao Lãnh', 'PENDING', NULL, DATEADD(hour, -1, GETDATE()), DATEADD(hour, -1, GETDATE()));

-- Chèn hình ảnh minh họa mẫu
INSERT INTO report_images (report_id, image_url, image_type) VALUES
(1, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600', 'BEFORE'),
(1, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600', 'AFTER'),
(2, 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600', 'BEFORE'),
(3, 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600', 'BEFORE'),
(5, 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600', 'BEFORE'),
(5, 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=600', 'AFTER');

-- Chèn nhật ký tiến độ xử lý mẫu
INSERT INTO process_logs (report_id, updated_by, status_from, status_to, note, created_at) VALUES
(1, 6, 'PENDING', 'ACCEPTED', N'Đã tiếp nhận thông tin phản ánh từ sinh viên khu vực ĐH Đồng Tháp.', DATEADD(day, -14, GETDATE())),
(1, 4, 'ACCEPTED', 'VERIFIED', N'Đã kiểm tra thực tế, đúng là có bãi rác tự phát lớn.', DATEADD(day, -14, GETDATE())),
(1, 4, 'VERIFIED', 'PROCESSING', N'Điều động xe thu gom rác đô thị đến dọn dẹp.', DATEADD(day, -13, GETDATE())),
(1, 4, 'PROCESSING', 'COMPLETED', N'Đã thu gom sạch sẽ và cắm biển cấm đổ rác.', DATEADD(day, -12, GETDATE())),
(2, 6, 'PENDING', 'ACCEPTED', N'Tiếp nhận tin báo khẩn cấp về ô nhiễm nguồn nước rạch Cái Sao.', DATEADD(day, -4, GETDATE())),
(2, 5, 'ACCEPTED', 'VERIFIED', N'Đã lấy mẫu nước kiểm tra và xác định nguồn xả thải.', DATEADD(day, -3, GETDATE())),
(2, 5, 'VERIFIED', 'PROCESSING', N'Đang lập biên bản xử phạt và yêu cầu cơ sở khắc phục hệ thống lọc.', DATEADD(day, -2, GETDATE()));
GO