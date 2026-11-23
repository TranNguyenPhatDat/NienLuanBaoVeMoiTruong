/**
 * Dữ liệu cấu hình & Bộ nhớ dự phòng (data.js)
 * Đồng bộ 100% tiếng Việt với database.sql (TP. Cao Lãnh, Đồng Tháp)
 */

const INITIAL_POLLUTION_TYPES = [
  { id: 1, name: 'Rác thải', description: 'Rác thải sinh hoạt, rác tự phát, ùn ứ', icon: 'trash-2', color: '#16a34a' },
  { id: 2, name: 'Nước thải', description: 'Nước thải đen, mùi hôi, xả trực tiếp ra kênh rạch', icon: 'droplet', color: '#0284c7' },
  { id: 3, name: 'Khói bụi', description: 'Khói bụi từ nhà xưởng, đốt rác gây ô nhiễm không khí', icon: 'cloud-fog', color: '#ea580c' },
  { id: 4, name: 'Tiếng ồn', description: 'Tiếng ồn vượt mức quy định gây ảnh hưởng sinh hoạt', icon: 'volume-2', color: '#7c3aed' }
];

const INITIAL_USERS = [
  { id: 1, full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0901234561', role: 'Người dân' },
  { id: 2, full_name: 'Trần Thị Bích', email: 'bich.tran@gmail.com', phone: '0901234562', role: 'Người dân' },
  { id: 3, full_name: 'Lê Hoàng Nam', email: 'nam.le@gmail.com', phone: '0901234563', role: 'Người dân' },
  { id: 4, full_name: 'Phạm Minh Tuấn (Cán bộ Đô thị)', email: 'tuan.canbo@dongthap.gov.vn', phone: '0918111222', role: 'Cán bộ' },
  { id: 5, full_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)', email: 'oanh.canbo@dongthap.gov.vn', phone: '0918333444', role: 'Cán bộ' },
  { id: 6, full_name: 'Đặng Quốc Hùng (Trưởng phòng TNMT)', email: 'hung.quanly@dongthap.gov.vn', phone: '0918999888', role: 'Quản lý' }
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
    severity_level: 'Nghiêm trọng',
    latitude: 10.422500,
    longitude: 105.643200,
    address_text: 'Đường Phạm Hữu Lầu, Phường 6, TP. Cao Lãnh',
    status: 'Hoàn thành',
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
    severity_level: 'Khẩn cấp',
    latitude: 10.431000,
    longitude: 105.638500,
    address_text: 'Phường 6, TP. Cao Lãnh, Đồng Tháp',
    status: 'Đang xử lý',
    assigned_to: 5,
    officer_name: 'Võ Thị Kim Oanh (Cán bộ Môi trường)',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600'
  }
];

class LocalDataStore {
  constructor() {
    this.storageKeyReports = 'eco_reports_vn_v1';
    this.storageKeyUsers = 'eco_users_vn_v1';
    this.initData();
  }

  initData() {
    if (!localStorage.getItem(this.storageKeyReports)) {
      localStorage.setItem(this.storageKeyReports, JSON.stringify(INITIAL_REPORTS));
    }
    if (!localStorage.getItem(this.storageKeyUsers)) {
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(INITIAL_USERS));
    }
  }

  getOfficers() {
    const users = JSON.parse(localStorage.getItem(this.storageKeyUsers) || '[]');
    return users.filter(u => u.role === 'Cán bộ' || u.role === 'Quản lý');
  }
}

window.localDataStore = new LocalDataStore();
window.INITIAL_POLLUTION_TYPES = INITIAL_POLLUTION_TYPES;
window.INITIAL_USERS = INITIAL_USERS;