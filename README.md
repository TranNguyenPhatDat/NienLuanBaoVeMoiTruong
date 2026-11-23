# NienLuanBaoVeMoiTruong
Hệ thống phần mềm báo cáo và theo dõi xử lý điểm ô nhiễm môi trường tại địa phương.

## Kết nối SQL Server Express

Backend dùng SQL Server qua TCP. Nếu kết nối đến `localhost\SQLEXPRESS` bị timeout:

1. Mở **SQL Server Configuration Manager** → **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**.
2. Bật **TCP/IP**, sau đó mở **TCP/IP Properties** → **IP Addresses** → **IPAll**. Xóa `TCP Dynamic Ports` và đặt `TCP Port` thành `1433`.
3. Khởi động lại dịch vụ **SQL Server (SQLEXPRESS)**.
4. Trong `backend/.env`, đặt `DB_SERVER=localhost` và `DB_PORT=1433`; bỏ `DB_INSTANCE` hoặc xóa dòng đó. Không cấu hình đồng thời `DB_PORT` và `DB_INSTANCE`.
5. Chạy backend từ thư mục `backend` bằng `node server.js`.

Tạo `backend/.env` với thông tin kết nối SQL Server và một JWT secret riêng:

```env
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=pollution_db
DB_USER=your_sql_user
DB_PASSWORD=your_sql_password
JWT_SECRET=replace_with_a_long_random_secret
```

Tài khoản mẫu dùng mật khẩu `123456`. Nếu đã nạp dữ liệu mẫu cũ vào bảng tiếng Việt `NguoiDung`, chạy `backend/fix_sample_account_passwords.sql` một lần để cập nhật hash đúng. Mật khẩu được lưu dưới dạng bcrypt hash; login không bỏ qua bước kiểm tra hash. File `.env` chứa thông tin đăng nhập nên không được đưa lên Git.
