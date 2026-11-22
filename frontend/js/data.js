/**
 * Mock Data & Local Storage Fallback
 * Dữ liệu đồng bộ 100% với database.sql (TP. Cao Lãnh, Đồng Tháp)
 * Tự động kích hoạt khi chưa bật backend hoặc chưa cấu hình SQL Server
 */

const INITIAL_POLLUTION_TYPES = [
  { id: 1, name: 'Rác thải', description: 'Rác thải sinh hoạt, rác tự phát, ùn ứ', icon: 'trash-2', color: '#16a34a' },
  { id: 2, name: 'Nước thải', description: 'Nước thải đen, mùi hôi, xả trực tiếp ra kênh rạch', icon: 'droplet', color: '#0284c7' },
  { id: 3, name: 'Khói bụi', description: 'Khói bụi từ nhà xưởng, đốt rác gây ô nhiễm không khí', icon: 'cloud-fog', color: '#ea580c' },
  { id: 4, name: 'Tiếng ồn', description: 'Tiếng ồn vượt mức quy định gây ảnh hưởng sinh hoạt', icon: 'volume-2', color: '#7c3aed' }
];

const INITIAL_USERS = [
  { id: 1, full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234561', role: 'CITIZEN' },
  { id: 2, full_name: 'Trần Thị Bích', email: 'bich.tran@gmail.com', phone: '0901234562', role: 'CITIZEN' },
  { id: 3, full_name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0901234563', role: 'CITIZEN' },
  { id: 4, full_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)', email: 'tuan.canbo@dongthap.gov.vn', phone: '0918111222', role: 'OFFICER' },
  { id: 5, full_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)', email: 'oanh.canbo@dongthap.gov.vn', phone: '0918333444', role: 'OFFICER' },
  { id: 6, full_name: 'Đặng Quốc Hùng (Trưởng phòng TNMT)', email: 'hung.quanly@dongthap.gov.vn', phone: '0918999888', role: 'MANAGER' }
];

const INITIAL_REPORTS = [
  {
    id: 1,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Bãi rác tự phát gần cổng sau Đại học Đồng Tháp',
    description: 'Rác thải sinh hoạt và hộp xốp vứt bừa bãi dọc vỉa hè gây mất mỹ quan và bốc mùi.',
    severity_level: 'HIGH',
    latitude: 10.422500,
    longitude: 105.643200,
    address_text: 'Đường Phạm Hữu Lầu, Phường 6, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600'
  },
  {
    id: 2,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Nước thải đen ngòm xả ra rạch Cái Sao Thượng',
    description: 'Cơ sở chế biến gần cầu xả nước thải chưa qua xử lý làm nước kênh chuyển màu đen đặc.',
    severity_level: 'CRITICAL',
    latitude: 10.431000,
    longitude: 105.638500,
    address_text: 'Phường 6, TP. Cao Lãnh, Đồng Tháp',
    status: 'PROCESSING',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600'
  },
  {
    id: 3,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 3,
    pollution_type_name: 'Khói bụi',
    title: 'Đốt rác thải nhựa gây khói mù mịt khu dân cư',
    description: 'Chiều tối người dân tự ý đốt túi nilon và vỏ xe gây khói khét lẹt ảnh hưởng trẻ nhỏ.',
    severity_level: 'HIGH',
    latitude: 10.455200,
    longitude: 105.632100,
    address_text: 'Đường Nguyễn Huệ, Phường 1, TP. Cao Lãnh',
    status: 'VERIFIED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600'
  },
  {
    id: 4,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 4,
    pollution_type_name: 'Tiếng ồn',
    title: 'Quán nhậu mở loa kẹo kéo quá 23h đêm',
    description: 'Âm thanh công suất lớn kéo dài khuya gây mất ngủ cho cả khu phố.',
    severity_level: 'MEDIUM',
    latitude: 10.458900,
    longitude: 105.635400,
    address_text: 'Đường 30/4, Phường 1, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 5,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Ùn ứ rác thải tại góc chợ Cao Lãnh',
    description: 'Xe thu gom chưa kịp dọn khiến rác tràn xuống lòng đường vào giờ cao điểm.',
    severity_level: 'HIGH',
    latitude: 10.453500,
    longitude: 105.630800,
    address_text: 'Đường Thiên Hộ Dương, Phường 4, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600'
  },
  {
    id: 6,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Cống thoát nước bị nghẹt tràn nước bẩn ra đường',
    description: 'Mỗi khi mưa lớn nước cống đen trào ngược lên mặt đường bốc mùi hôi thối.',
    severity_level: 'MEDIUM',
    latitude: 10.461200,
    longitude: 105.629500,
    address_text: 'Đường Lê Lợi, Phường 2, TP. Cao Lãnh',
    status: 'ACCEPTED',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 7,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Xà bần và phế liệu xây dựng đổ trộm ven đường',
    description: 'Xe tải đổ trộm gạch đá và bao xi măng lấn chiếm lối đi bộ ven bờ kè.',
    severity_level: 'MEDIUM',
    latitude: 10.448000,
    longitude: 105.625000,
    address_text: 'Bờ kè Sông Cao Lãnh, Phường 3, TP. Cao Lãnh',
    status: 'PENDING',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    thumbnail: null
  },
  {
    id: 8,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 3,
    pollution_type_name: 'Khói bụi',
    title: 'Khói bụi từ xưởng mộc gần khu dân cư',
    description: 'Bụi gỗ mịn bay mù mịt sang các nhà lân cận khi xưởng hoạt động.',
    severity_level: 'HIGH',
    latitude: 10.467500,
    longitude: 105.641000,
    address_text: 'Đường Tôn Đức Thắng, Phường Mỹ Phú, TP. Cao Lãnh',
    status: 'PROCESSING',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 9,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Xả nước thải rửa xe trực tiếp xuống mương thoát nước',
    description: 'Tiệm rửa xe không có bể lắng, xả bọt xà phòng và dầu nhớt thẳng ra mương.',
    severity_level: 'LOW',
    latitude: 10.451000,
    longitude: 105.639000,
    address_text: 'Đường Ngô Thời Nhậm, Phường 1, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 10,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Rác thải nhựa trôi nổi dày đặc dưới chân cầu',
    description: 'Rác từ thượng nguồn tấp vào chân cầu kết thành mảng lớn gây tắc dòng chảy.',
    severity_level: 'HIGH',
    latitude: 10.456800,
    longitude: 105.627200,
    address_text: 'Cầu Đúc, Phường 2, TP. Cao Lãnh',
    status: 'VERIFIED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 11,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 4,
    pollution_type_name: 'Tiếng ồn',
    title: 'Tiếng ồn máy phát điện công nghiệp chạy suốt đêm',
    description: 'Cơ sở kinh doanh chạy máy phát điện không có hộp cách âm gây rung và ồn.',
    severity_level: 'MEDIUM',
    latitude: 10.443200,
    longitude: 105.636800,
    address_text: 'Đường Lý Thường Kiệt, Phường 6, TP. Cao Lãnh',
    status: 'PENDING',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    thumbnail: null
  },
  {
    id: 12,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Bãi tập kết rác tự phát trong hẻm nhỏ',
    description: 'Người dân thiếu ý thức vứt rác trước khu đất trống tạo thành ổ chuột và muỗi.',
    severity_level: 'MEDIUM',
    latitude: 10.463000,
    longitude: 105.633500,
    address_text: 'Hẻm 45, Đường Hùng Vương, Phường 2, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 13,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Nước kênh chuyển màu xanh rêu và có váng dầu',
    description: 'Nghi vấn rò rỉ dầu nhớt từ bến tàu gần đó làm ô nhiễm cả đoạn kênh dài.',
    severity_level: 'CRITICAL',
    latitude: 10.435500,
    longitude: 105.621500,
    address_text: 'Xã Tân Thuận Đông, TP. Cao Lãnh',
    status: 'PROCESSING',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 14,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 3,
    pollution_type_name: 'Khói bụi',
    title: 'Đốt rơm rạ và cỏ khô ven quốc lộ gây khuất tầm nhìn',
    description: 'Khói dày đặc bay ngang mặt đường gây nguy hiểm cho xe máy lưu thông.',
    severity_level: 'HIGH',
    latitude: 10.478000,
    longitude: 105.651200,
    address_text: 'Quốc lộ 30, Phường Mỹ Tân, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 15,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Xác động vật chết vứt xuống kênh gây mùi hôi nồng nặc',
    description: 'Bao tải chứa xác gia cầm trôi dạt vào bờ gần khu vực nhà dân.',
    severity_level: 'CRITICAL',
    latitude: 10.449500,
    longitude: 105.645500,
    address_text: 'Xã Hòa An, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 16,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 4,
    pollution_type_name: 'Tiếng ồn',
    title: 'Công trình thi công khoan cắt bê tông vào giờ nghỉ trưa',
    description: 'Tiếng máy khoan đục ầm ĩ từ 12h trưa đến 13h30 ảnh hưởng người già và trẻ em.',
    severity_level: 'LOW',
    latitude: 10.457500,
    longitude: 105.631000,
    address_text: 'Đường Đặng Văn Bình, Phường 1, TP. Cao Lãnh',
    status: 'ACCEPTED',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    thumbnail: null
  },
  {
    id: 17,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Thùng rác công cộng hư hỏng tràn rác ra công viên',
    description: 'Các thùng rác quanh công viên bị vỡ đáy, rác rơi vãi khắp thảm cỏ.',
    severity_level: 'LOW',
    latitude: 10.454200,
    longitude: 105.634200,
    address_text: 'Công viên Văn Miếu, Phường 1, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 18,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Hố ga mất nắp bốc mùi hôi thối nồng nặc',
    description: 'Nước thải tù đọng dưới hố ga bốc mùi lên trực tiếp khu vực buôn bán ăn uống.',
    severity_level: 'HIGH',
    latitude: 10.452100,
    longitude: 105.629000,
    address_text: 'Đường Nguyễn Đình Chiểu, Phường 2, TP. Cao Lãnh',
    status: 'VERIFIED',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 19,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 3,
    pollution_type_name: 'Khói bụi',
    title: 'Khói đen từ lò đốt thủ công của cơ sở tái chế',
    description: 'Ống khói thấp xả trực tiếp khói đen kịt ra khu vực xung quanh mỗi buổi sáng.',
    severity_level: 'CRITICAL',
    latitude: 10.471000,
    longitude: 105.619000,
    address_text: 'Xã Tịnh Thới, TP. Cao Lãnh',
    status: 'PROCESSING',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 20,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Rác thải y tế (khẩu trang, kim tiêm cũ) vứt lẫn rác sinh hoạt',
    description: 'Phát hiện nhiều rác thải phòng khám bỏ chung vào thùng rác dân sinh.',
    severity_level: 'CRITICAL',
    latitude: 10.460100,
    longitude: 105.637800,
    address_text: 'Đường Hải Thượng Lãn Ông, Phường 1, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 21,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Tập kết vỏ dừa và phụ phẩm nông nghiệp gây ruồi nhặng',
    description: 'Đống vỏ dừa chất cao nhiều tuần không dọn tạo nước rỉ đen và nhiều muỗi.',
    severity_level: 'MEDIUM',
    latitude: 10.439000,
    longitude: 105.631500,
    address_text: 'Đường Trần Hưng Đạo, Phường 6, TP. Cao Lãnh',
    status: 'PENDING',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    thumbnail: null
  },
  {
    id: 22,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 2,
    pollution_type_name: 'Nước thải',
    title: 'Nước thải từ khu trọ sinh viên chảy tràn ra hẻm',
    description: 'Đường ống thoát nước khu trọ bị vỡ khiến nước sinh hoạt chảy lênh láng ra đường.',
    severity_level: 'MEDIUM',
    latitude: 10.424800,
    longitude: 105.645000,
    address_text: 'Khu dân cư Đại học Đồng Tháp, Phường 6',
    status: 'ACCEPTED',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    thumbnail: null
  },
  {
    id: 23,
    citizen_id: 2,
    citizen_name: 'Trần Thị Bích',
    pollution_type_id: 3,
    pollution_type_name: 'Khói bụi',
    title: 'Bụi đất từ xe ben chở vật liệu không che bạt',
    description: 'Xe tải chở cát đá chạy qua tuyến đường làm rơi vãi đất cát, xe chạy qua bụi mù.',
    severity_level: 'HIGH',
    latitude: 10.465000,
    longitude: 105.648000,
    address_text: 'Đường Điện Biên Phủ, Phường Mỹ Phú, TP. Cao Lãnh',
    status: 'VERIFIED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 24,
    citizen_id: 3,
    citizen_name: 'Lê Hoàng Nam',
    pollution_type_id: 4,
    pollution_type_name: 'Tiếng ồn',
    title: 'Cơ sở gia công sắt thép gõ hàn ồn ào cả ngày',
    description: 'Tiếng máy cắt sắt chói tai phát ra liên tục từ sáng sớm đến chiều tối.',
    severity_level: 'MEDIUM',
    latitude: 10.446500,
    longitude: 105.628500,
    address_text: 'Đường Võ Trường Toản, Phường 1, TP. Cao Lãnh',
    status: 'COMPLETED',
    assigned_to: 4,
    officer_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    thumbnail: null
  },
  {
    id: 25,
    citizen_id: 1,
    citizen_name: 'Nguyễn Văn An',
    pollution_type_id: 1,
    pollution_type_name: 'Rác thải',
    title: 'Bãi rác tự phát dưới dốc cầu Cao Lãnh',
    description: 'Người đi đường tiện tay vứt túi rác xuống chân dốc cầu gây mất vệ sinh.',
    severity_level: 'HIGH',
    latitude: 10.415000,
    longitude: 105.612000,
    address_text: 'Khu vực Cầu Cao Lãnh, Xã Tịnh Thới, TP. Cao Lãnh',
    status: 'PENDING',
    assigned_to: null,
    officer_name: null,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    thumbnail: null
  }
];

const INITIAL_IMAGES = [
  { id: 1, report_id: 1, image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600', image_type: 'BEFORE', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 2, report_id: 1, image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600', image_type: 'AFTER', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 3, report_id: 2, image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600', image_type: 'BEFORE', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 4, report_id: 3, image_url: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600', image_type: 'BEFORE', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 5, report_id: 5, image_url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600', image_type: 'BEFORE', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 6, report_id: 5, image_url: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?w=600', image_type: 'AFTER', created_at: new Date(Date.now() - 7 * 86400000).toISOString() }
];

const INITIAL_PROCESS_LOGS = [
  {
    id: 1,
    report_id: 1,
    updated_by: 6,
    updated_by_name: 'Đặng Quốc Hùng (Trưởng phòng TNMT)',
    role: 'MANAGER',
    status_from: 'PENDING',
    status_to: 'ACCEPTED',
    note: 'Đã tiếp nhận thông tin phản ánh từ sinh viên khu vực ĐH Đồng Tháp.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 2,
    report_id: 1,
    updated_by: 4,
    updated_by_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    role: 'OFFICER',
    status_from: 'ACCEPTED',
    status_to: 'VERIFIED',
    note: 'Đã kiểm tra thực tế, đúng là có bãi rác tự phát lớn.',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 3,
    report_id: 1,
    updated_by: 4,
    updated_by_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    role: 'OFFICER',
    status_from: 'VERIFIED',
    status_to: 'PROCESSING',
    note: 'Điều động xe thu gom rác đô thị đến dọn dẹp.',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString()
  },
  {
    id: 4,
    report_id: 1,
    updated_by: 4,
    updated_by_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)',
    role: 'OFFICER',
    status_from: 'PROCESSING',
    status_to: 'COMPLETED',
    note: 'Đã thu gom sạch sẽ và cắm biển cấm đổ rác.',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 5,
    report_id: 2,
    updated_by: 6,
    updated_by_name: 'Đặng Quốc Hùng (Trưởng phòng TNMT)',
    role: 'MANAGER',
    status_from: 'PENDING',
    status_to: 'ACCEPTED',
    note: 'Tiếp nhận tin báo khẩn cấp về ô nhiễm nguồn nước rạch Cái Sao.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 6,
    report_id: 2,
    updated_by: 5,
    updated_by_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    role: 'OFFICER',
    status_from: 'ACCEPTED',
    status_to: 'VERIFIED',
    note: 'Đã lấy mẫu nước kiểm tra và xác định nguồn xả thải.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 7,
    report_id: 2,
    updated_by: 5,
    updated_by_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    role: 'OFFICER',
    status_from: 'VERIFIED',
    status_to: 'PROCESSING',
    note: 'Đang lập biên bản xử phạt và yêu cầu cơ sở khắc phục hệ thống lọc.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

class LocalDataStore {
  constructor() {
    this.storageKeyReports = 'eco_reports_v1';
    this.storageKeyImages = 'eco_images_v1';
    this.storageKeyLogs = 'eco_logs_v1';
    this.storageKeyUsers = 'eco_users_v1';
    this.initData();
  }

  initData() {
    if (!localStorage.getItem(this.storageKeyReports)) {
      localStorage.setItem(this.storageKeyReports, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(this.storageKeyImages)) {
      localStorage.setItem(this.storageKeyImages, JSON.stringify(INITIAL_IMAGES));
    }
    if (!localStorage.getItem(this.storageKeyLogs)) {
      localStorage.setItem(this.storageKeyLogs, JSON.stringify(INITIAL_PROCESS_LOGS));
    }
    if (!localStorage.getItem(this.storageKeyUsers)) {
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(INITIAL_USERS));
    }
  }

  getReports(filter = {}) {
    let reports = JSON.parse(localStorage.getItem(this.storageKeyReports) || '[]');
    
    if (filter.status) {
      reports = reports.filter(r => r.status === filter.status);
    }
    if (filter.pollution_type_id) {
      reports = reports.filter(r => String(r.pollution_type_id) === String(filter.pollution_type_id));
    }
    if (filter.severity_level) {
      reports = reports.filter(r => r.severity_level === filter.severity_level);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      reports = reports.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.address_text && r.address_text.toLowerCase().includes(q))
      );
    }

    return reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getReportById(id) {
    const numId = parseInt(id, 10);
    const reports = JSON.parse(localStorage.getItem(this.storageKeyReports) || '[]');
    const report = reports.find(r => r.id === numId);
    if (!report) return null;

    const allImages = JSON.parse(localStorage.getItem(this.storageKeyImages) || '[]');
    const allLogs = JSON.parse(localStorage.getItem(this.storageKeyLogs) || '[]');
    const allUsers = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');

    const officer = allUsers.find(u => u.id === report.assigned_to);

    return {
      ...report,
      officer_name: officer ? officer.full_name : report.officer_name,
      images: allImages.filter(img => img.report_id === numId),
      logs: allLogs.filter(log => log.report_id === numId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    };
  }

  createReport(data, currentUser) {
    const reports = JSON.parse(localStorage.getItem(this.storageKeyReports) || '[]');
    const images = JSON.parse(localStorage.getItem(this.storageKeyImages) || '[]');
    
    const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    const typeObj = INITIAL_POLLUTION_TYPES.find(t => t.id === parseInt(data.pollution_type_id, 10));

    const newReport = {
      id: newId,
      citizen_id: currentUser ? currentUser.id : 1,
      citizen_name: currentUser ? currentUser.full_name : 'Người dân ẩn danh',
      pollution_type_id: parseInt(data.pollution_type_id, 10),
      pollution_type_name: typeObj ? typeObj.name : 'Khác',
      title: data.title,
      description: data.description,
      severity_level: data.severity_level || 'MEDIUM',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      address_text: data.address_text,
      status: 'PENDING',
      assigned_to: null,
      officer_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      thumbnail: data.image_url || null
    };

    reports.unshift(newReport);
    localStorage.setItem(this.storageKeyReports, JSON.stringify(reports));

    if (data.image_url) {
      images.push({
        id: images.length + 1,
        report_id: newId,
        image_url: data.image_url,
        image_type: 'BEFORE',
        created_at: new Date().toISOString()
      });
      localStorage.setItem(this.storageKeyImages, JSON.stringify(images));
    }

    return newReport;
  }

  updateReportStatus(id, updateData, currentUser) {
    const numId = parseInt(id, 10);
    const reports = JSON.parse(localStorage.getItem(this.storageKeyReports) || '[]');
    const images = JSON.parse(localStorage.getItem(this.storageKeyImages) || '[]');
    const logs = JSON.parse(localStorage.getItem(this.storageKeyLogs) || '[]');
    const users = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');

    const reportIndex = reports.findIndex(r => r.id === numId);
    if (reportIndex === -1) return null;

    const oldStatus = reports[reportIndex].status;
    const newStatus = updateData.status || oldStatus;
    
    if (updateData.assigned_to) {
      reports[reportIndex].assigned_to = parseInt(updateData.assigned_to, 10);
      const officer = users.find(u => u.id === reports[reportIndex].assigned_to);
      if (officer) reports[reportIndex].officer_name = officer.full_name;
    }

    reports[reportIndex].status = newStatus;
    reports[reportIndex].updated_at = new Date().toISOString();

    logs.push({
      id: logs.length + 1,
      report_id: numId,
      updated_by: currentUser ? currentUser.id : 4,
      updated_by_name: currentUser ? currentUser.full_name : 'Cán bộ xử lý',
      role: currentUser ? currentUser.role : 'OFFICER',
      status_from: oldStatus,
      status_to: newStatus,
      note: updateData.note || 'Cập nhật tiến độ xử lý hiện trường.',
      created_at: new Date().toISOString()
    });

    if (updateData.after_image_url) {
      images.push({
        id: images.length + 1,
        report_id: numId,
        image_url: updateData.after_image_url,
        image_type: 'AFTER',
        created_at: new Date().toISOString()
      });
    }

    localStorage.setItem(this.storageKeyReports, JSON.stringify(reports));
    localStorage.setItem(this.storageKeyImages, JSON.stringify(images));
    localStorage.setItem(this.storageKeyLogs, JSON.stringify(logs));

    return reports[reportIndex];
  }

  getStats() {
    const reports = JSON.parse(localStorage.getItem(this.storageKeyReports) || '[]');
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'PENDING').length;
    const processing = reports.filter(r => ['ACCEPTED', 'VERIFIED', 'PROCESSING'].includes(r.status)).length;
    const completed = reports.filter(r => r.status === 'COMPLETED').length;
    const rejected = reports.filter(r => r.status === 'REJECTED').length;

    const typeCounts = {};
    INITIAL_POLLUTION_TYPES.forEach(t => { typeCounts[t.name] = 0; });
    reports.forEach(r => {
      const typeName = r.pollution_type_name || 'Khác';
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    const byType = Object.keys(typeCounts).map(name => ({
      type_name: name,
      count: typeCounts[name]
    }));

    return {
      overview: { total, pending, processing, completed, rejected },
      byType,
      avgResolutionHours: 28.5
    };
  }

  getOfficers() {
    const users = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');
    return users.filter(u => u.role === 'OFFICER' || u.role === 'MANAGER');
  }

  resetToDefault() {
    localStorage.setItem(this.storageKeyReports, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(this.storageKeyImages, JSON.stringify(INITIAL_IMAGES));
    localStorage.setItem(this.storageKeyLogs, JSON.stringify(INITIAL_PROCESS_LOGS));
    localStorage.setItem(this.storageKeyUsers, JSON.stringify(INITIAL_USERS));
  }
}

window.localDataStore = new LocalDataStore();
window.INITIAL_POLLUTION_TYPES = INITIAL_POLLUTION_TYPES;
window.INITIAL_USERS = INITIAL_USERS;

