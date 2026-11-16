# NienLuanBaoVeMoiTruong
Hệ thống phần mềm báo cáo và theo dõi xử lý điểm ô nhiễm môi trường tại địa phương.

## Kết nối SQL Server Express

Backend dùng SQL Server qua TCP. Nếu kết nối đến `localhost\SQLEXPRESS` bị timeout:

1. Mở **SQL Server Configuration Manager** → **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**.
2. Bật **TCP/IP**, sau đó mở **TCP/IP Properties** → **IP Addresses** → **IPAll**. Xóa `TCP Dynamic Ports` và đặt `TCP Port` thành `1433`.
3. Khởi động lại dịch vụ **SQL Server (SQLEXPRESS)**.
4. Trong `backend/.env`, đặt `DB_SERVER=localhost` và `DB_PORT=1433`; bỏ `DB_INSTANCE` hoặc xóa dòng đó. Không cấu hình đồng thời `DB_PORT` và `DB_INSTANCE`.
5. Chạy backend từ thư mục `backend` bằng `node server.js`.

File `.env` chứa thông tin đăng nhập nên không được đưa lên Git.
