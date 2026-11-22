# EcoAlert Frontend - Cổng Giám Sát & Báo Cáo Ô Nhiễm Môi Trường Đô Thị

Giao diện Web tương tác hoàn chỉnh cho đề tài Niên Luận Bảo Vệ Môi Trường, được thiết kế đồng nhất theo hệ màu **Xanh lá cây (Forest / Emerald Green) và Trắng**, mang phong cách tự nhiên, trang nhã, công dân, thân thiện và đáp ứng đầy đủ các chức năng của backend.

---

## 🌟 Tính Năng Chính Được Xây Dựng

1. **Bản đồ số tương tác (GIS Leaflet & OpenStreetMap)**:
   - Trực quan hóa tọa độ các điểm nóng ô nhiễm (tọa độ thực tế tại Thành phố Cao Lãnh, Đồng Tháp).
   - Marker màu phân loại theo mức độ nguy hại:
     - 🔴 **Khẩn cấp (CRITICAL)**: Đỏ
     - 🟠 **Nghiêm trọng (HIGH)**: Cam cháy
     - 🟡 **Trung bình (MEDIUM)**: Vàng hổ phách
     - 🟢 **Thấp (LOW)**: Xanh lá cây
   - Hiệu ứng sóng lan tỏa (radar pulse), popup hiển thị ảnh hiện trường thu nhỏ, địa chỉ và nút xem hồ sơ chi tiết.
   - Nút **"Định vị"** bay nhanh đến vị trí từng vụ việc trên bản đồ.

2. **Gửi Phản Ánh Môi Trường (Citizen Form)**:
   - Phân loại 4 nhóm ô nhiễm: *Rác thải, Nước thải, Khói bụi, Tiếng ồn*.
   - **Ghim vị trí trực tiếp trên bản đồ mini**: Người dân chỉ cần click hoặc kéo thả ghim trên bản đồ để tự động lấy kinh độ, vĩ độ và địa chỉ.
   - Tải lên hình ảnh hiện trường (BEFORE) với các preset ảnh mẫu để người dùng thử nghiệm nhanh.
   - Chọn mức độ nghiêm trọng và nhập mô tả chi tiết.

3. **Hồ Sơ Chi Tiết & So Sánh Ảnh Hiện Trường (Before / After)**:
   - Hộp so sánh ảnh trực quan: Ảnh chụp hiện trường lúc báo cáo (**TRƯỚC**) vs Ảnh nghiệm thu sau khi cán bộ xử lý sạch sẽ (**SAU**).
   - **Timeline Nhật Ký Tiến Độ (Process Logs)**: Hiển thị minh bạch từng bước xử lý, thời gian, tên cán bộ, vai trò và biên bản hiện trường.

4. **Khu Vực Nghiệp Vụ Cán Bộ & Lãnh Đạo (Officer / Manager Portal)**:
   - Cập nhật trạng thái phản ánh: `PENDING` ➔ `ACCEPTED` ➔ `VERIFIED` ➔ `PROCESSING` ➔ `COMPLETED` / `REJECTED`.
   - Phân công cán bộ thụ lý (`assigned_to`).
   - Nhập biên bản hiện trường và đính kèm ảnh hoàn trả mặt bằng sạch đẹp.

5. **Trung Tâm Phân Tích & Thống Kê (Analytics Dashboard)**:
   - Biểu đồ tròn (Donut Chart) phân bổ cơ cấu ô nhiễm.
   - Biểu đồ cột (Bar Chart) tiến độ xử lý hồ sơ.
   - Chỉ số tổng hợp: Tổng số vụ, Chờ duyệt, Đang xử lý, Hoàn thành, Thời gian xử lý trung bình.
   - Danh sách theo dõi khối lượng công việc của đội ngũ cán bộ.

6. **Chế Độ Chuyển Đổi Nhanh Tài Khoản (Quick Role Switcher)**:
   - Thanh trên cùng cho phép chuyển đổi 1-click giữa:
     - 🧑 **Người dân**: Nguyễn Văn An (`an.nguyen@gmail.com`)
     - 👮 **Cán bộ**: Phạm Minh Tuấn (`tuan.canbo@dongthap.gov.vn`)
     - 🎖️ **Quản lý**: Đặng Quốc Hùng (`hung.quanly@dongthap.gov.vn`)
   - Đầy đủ form Đăng nhập / Đăng ký tài khoản mới kết nối JWT.

7. **Cơ Chế Hybrid Thông Minh (Online & Offline)**:
   - Tự động kết nối REST API Backend `http://localhost:5000/api/v1` khi backend đang chạy.
   - Nếu SQL Server hoặc backend chưa bật, hệ thống tự động chuyển sang lớp dữ liệu mô phỏng đồng bộ 100% với 25 bản ghi trong `database.sql`, giúp mở lên là có thể trải nghiệm toàn diện ngay lập tức!

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: Mở trực tiếp (Nhanh nhất)
Chỉ cần nhấp đúp vào file `frontend/index.html` trong trình duyệt bất kỳ (Chrome, Edge, Firefox, Cốc Cốc).

### Cách 2: Chạy với Live Server / Node.js
```bash
cd frontend
npm start
# Hoặc: npx serve . -p 3000
```
Sau đó truy cập: `http://localhost:3000`

### Cách 3: Chạy cùng Backend
1. Khởi động backend:
   ```bash
   cd backend
   node server.js
   ```
2. Mở `frontend/index.html` để trải nghiệm hệ thống hoàn chỉnh kết nối SQL Server!
