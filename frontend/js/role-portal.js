// Quản lý phân quyền hiển thị tab, điều phối vai trò & chuyển chuyên mục
const LOGO_CANDIDATES = [
  '/images/logonienluan.jpg',
  'http://localhost:5000/images/logonienluan.jpg',
  'http://localhost:3000/images/logonienluan.jpg',
  'images/logonienluan.jpg',
  '../backend/images/logonienluan.jpg'
];

function handleLogoError(imgEl) {
  if (!imgEl) return;
  const idx = parseInt(imgEl.getAttribute('data-fallback-idx') || '0', 10) + 1;
  if (idx < LOGO_CANDIDATES.length) {
    imgEl.setAttribute('data-fallback-idx', String(idx));
    imgEl.src = LOGO_CANDIDATES[idx];
  } else {
    imgEl.classList.add('hidden');
    const svgLogo = document.getElementById('svgFallbackLogo');
    if (svgLogo) svgLogo.classList.remove('hidden');
  }
}

function getNormalizedRoleType() {
  const user = (window.app && window.app.currentUser) || (() => {
    try {
      return JSON.parse(localStorage.getItem('ecoalert_user') || 'null');
    } catch {
      return null;
    }
  })();

  if (!user) return 'citizen';
  const roleRaw = String(user.vai_tro || user.role || '').toLowerCase();
  const nameRaw = String(user.ho_ten || user.name || '').toLowerCase();

  if (roleRaw.includes('quản lý') || roleRaw.includes('admin')) return 'admin';
  if (
    roleRaw.includes('công an') ||
    nameRaw.includes('công an') ||
    roleRaw.includes('cán bộ') ||
    roleRaw.includes('officer')
  ) {
    return 'police_officer';
  }
  return 'citizen';
}

function applyRolePermissionsUI() {
  const roleType = getNormalizedRoleType();
  const badgeEl = document.getElementById('currentRoleBadge');
  const subtitleEl = document.getElementById('brandSubtitle');
  const topBannerText = document.getElementById('topBannerText');
  const staffBar = document.getElementById('staffQuickCommandBar');
  const staffCard = document.getElementById('staffCommandCard');
  const staffTitle = document.getElementById('staffCommandTitle');
  const staffUrgentBadge = document.getElementById('staffCommandUrgentCount');
  const officerPanel = document.getElementById('officerControlPanel');
  const officerHeading = document.getElementById('officerPanelHeading');
  const officerRoleTag = document.getElementById('officerPanelRoleTag');
  const assignWrapper = document.getElementById('assignOfficerWrapper');

  const navTabList = document.getElementById('navTabList');
  const navTabStats = document.getElementById('navTabStats');
  const staffBtnOpenList = document.getElementById('staffBtnOpenList');
  const staffBtnOpenStats = document.getElementById('staffBtnOpenStats');
  const adminMediaControls = document.getElementById('adminMediaControls');

  const reports = (window.app && Array.isArray(window.app.reports)) ? window.app.reports : [];
  const urgentOrPendingCount = reports.filter(r => {
    const st = r.trang_thai || r.status;
    const sev = r.muc_do || r.severity_level;
    return st === 'Chờ tiếp nhận' || sev === 'Khẩn cấp';
  }).length;

  if (staffUrgentBadge) {
    staffUrgentBadge.textContent = `${urgentOrPendingCount} hồ sơ ưu tiên / chờ xử lý`;
  }

  if (roleType === 'admin') {
    if (badgeEl) {
      badgeEl.textContent = 'QUẢN LÝ (ADMIN)';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-200 whitespace-nowrap';
    }
    if (subtitleEl) subtitleEl.textContent = 'Điều phối & Quản trị hệ thống MT Xanh';
    if (topBannerText) topBannerText.textContent = 'Chế độ Quản lý (Admin) — Đăng tin/video mới, Sổ bộ phản ánh & Báo cáo thống kê';
    if (staffBar) staffBar.classList.remove('hidden');
    if (staffCard) staffCard.className = 'role-admin-banner rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4';
    if (staffTitle) staffTitle.textContent = 'Bảng điều hành Quản lý (Admin)';
    if (navTabList) navTabList.classList.remove('hidden');
    if (navTabStats) navTabStats.classList.remove('hidden');
    if (staffBtnOpenList) staffBtnOpenList.classList.remove('hidden');
    if (staffBtnOpenStats) staffBtnOpenStats.classList.remove('hidden');
    if (adminMediaControls) adminMediaControls.classList.remove('hidden');
    if (officerPanel) officerPanel.classList.remove('hidden');
    if (assignWrapper) assignWrapper.classList.remove('hidden');
    if (officerHeading) officerHeading.textContent = 'Quản lý phân công cán bộ & duyệt trạng thái';
    if (officerRoleTag) officerRoleTag.textContent = 'QUẢN LÝ (ADMIN)';
  } else if (roleType === 'police_officer') {
    if (badgeEl) {
      badgeEl.textContent = 'CÔNG AN / CÁN BỘ';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 border border-blue-200 whitespace-nowrap';
    }
    if (subtitleEl) subtitleEl.textContent = 'Nghiệp vụ xác minh & xử lý hiện trường';
    if (topBannerText) topBannerText.textContent = 'Chế độ Công an / Cán bộ — Xác minh hiện trường, lập biên bản & xử lý hồ sơ';
    if (staffBar) staffBar.classList.remove('hidden');
    if (staffCard) staffCard.className = 'role-police-banner rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4';
    if (staffTitle) staffTitle.textContent = 'Bảng điều hành Công an / Cán bộ hiện trường';
    if (navTabList) navTabList.classList.remove('hidden');
    if (navTabStats) navTabStats.classList.add('hidden');
    if (staffBtnOpenList) staffBtnOpenList.classList.remove('hidden');
    if (staffBtnOpenStats) staffBtnOpenStats.classList.add('hidden');
    if (adminMediaControls) adminMediaControls.classList.add('hidden');
    if (officerPanel) officerPanel.classList.remove('hidden');
    if (assignWrapper) assignWrapper.classList.add('hidden');
    if (officerHeading) officerHeading.textContent = 'Biên bản xác minh, xử lý & ảnh sau khắc phục';
    if (officerRoleTag) officerRoleTag.textContent = 'CÔNG AN / CÁN BỘ';
  } else {
    if (badgeEl) {
      badgeEl.textContent = 'NGƯỜI DÂN';
      badgeEl.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap';
    }
    if (subtitleEl) subtitleEl.textContent = 'Giám sát Môi trường Đô thị & Cộng đồng TP. Cao Lãnh';
    if (topBannerText) topBannerText.textContent = 'Cổng Thông Tin & Giám Sát Môi Trường Đô Thị TP. Cao Lãnh';
    if (staffBar) staffBar.classList.add('hidden');
    if (navTabList) navTabList.classList.add('hidden');
    if (navTabStats) navTabStats.classList.add('hidden');
    if (adminMediaControls) adminMediaControls.classList.add('hidden');
    if (officerPanel) officerPanel.classList.add('hidden');
  }

  if (typeof renderYouTubePlaylist === 'function') {
    renderYouTubePlaylist();
  }
}

function quickFilterForStaff(filterVal) {
  switchPortalTab('map');
  const statusSelect = document.getElementById('filterStatus');
  const severitySelect = document.getElementById('filterSeverity');

  if (filterVal === 'Khẩn cấp') {
    if (severitySelect) {
      severitySelect.value = 'Khẩn cấp';
      severitySelect.dispatchEvent(new Event('change'));
    }
  } else if (statusSelect) {
    statusSelect.value = filterVal;
    statusSelect.dispatchEvent(new Event('change'));
  }
}

function openTopicSection(navKey, keyword) {
  switchPortalTab('home');
  setActiveNavHighlight(navKey);

  const headingEl = document.getElementById('activeCategoryHeading');
  const labels = {
    'home': 'Tin Tức Môi Trường & Cuộc Sống',
    'topic-water': 'Chuyên mục: Nước & Cuộc Sống',
    'topic-resource': 'Chuyên mục: Môi Trường - Tài Nguyên',
    'topic-green': 'Chuyên mục: Cuộc Sống Xanh & Tái Chế'
  };
  if (headingEl && labels[navKey]) {
    headingEl.textContent = labels[navKey];
  }

  if (typeof filterRealNews === 'function' && keyword) {
    filterRealNews(keyword);
  }

  const targetMap = {
    'topic-water': 'section-water-life',
    'topic-resource': 'section-env-resource',
    'topic-green': 'section-green-life'
  };

  if (navKey === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const dedicatedSection = targetMap[navKey] ? document.getElementById(targetMap[navKey]) : null;
  const fallbackSection = document.getElementById('newsFeedSection');
  (dedicatedSection || fallbackSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToVideoSection() {
  switchPortalTab('home');
  setActiveNavHighlight('video');
  document.getElementById('videoSectionBlock')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setActiveNavHighlight(navKey) {
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-nav-key') === navKey;
    btn.classList.remove('bg-eco-900', 'text-white', 'font-bold');
    btn.classList.add('text-eco-50', 'font-semibold');

    if (isActive) {
      btn.classList.remove('text-eco-50', 'font-semibold');
      btn.classList.add('bg-eco-900', 'text-white', 'font-bold');
    }
  });
}

function renderHomeRecentReports() {
  const container = document.getElementById('homeRecentReportsGrid');
  if (!container) return;

  const list = (window.app && Array.isArray(window.app.reports) && window.app.reports.length > 0)
    ? window.app.reports.slice(0, 3)
    : (Array.isArray(window.MOCK_REPORTS) ? window.MOCK_REPORTS.slice(0, 3) : []);

  if (list.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 col-span-3">Đang đồng bộ dữ liệu phản ánh từ hệ thống...</p>`;
    return;
  }

  container.innerHTML = list.map(r => {
    const status = r.trang_thai || r.status || 'Chờ tiếp nhận';
    const severity = r.muc_do || r.severity_level || 'Trung bình';
    const title = r.tieu_de || r.title || 'Phản ánh môi trường';
    const address = r.dia_chi || r.address_text || 'TP. Cao Lãnh';
    const id = r.ma_phan_anh || r.id || '';

    const statusClass =
      status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
      status === 'Đang xử lý' ? 'bg-blue-100 text-blue-800' :
      'bg-amber-100 text-amber-800';

    return `
      <div onclick="window.app && window.app.openReportDetail(${id})" class="card-elevated cursor-pointer p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${status}</span>
            <span class="text-[10px] font-bold text-rose-600">${severity}</span>
          </div>
          <h4 class="font-bold text-xs text-slate-800 line-clamp-2 leading-snug">${title}</h4>
          <p class="text-[11px] text-slate-500 mt-1.5 line-clamp-1">📍 ${address}</p>
        </div>
        <div class="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
          <span class="font-mono text-slate-400">#${id}</span>
          <span class="font-semibold text-eco-700">Xem chi tiết →</span>
        </div>
      </div>
    `;
  }).join('');
}

function switchPortalTab(tabName) {
  const roleType = getNormalizedRoleType();
  if (tabName === 'stats' && roleType !== 'admin') tabName = 'home';
  if (tabName === 'list' && roleType === 'citizen') tabName = 'home';

  document.querySelectorAll('.view-tab-content').forEach(el => el.classList.add('hidden'));
  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  } else {
    document.getElementById('view-home')?.classList.remove('hidden');
    tabName = 'home';
  }

  setActiveNavHighlight(tabName);

  if (tabName === 'map' && window.mapManager && window.mapManager.map) {
    setTimeout(() => window.mapManager.map.invalidateSize(), 150);
  }
  if (tabName === 'stats' && window.app && typeof window.app.renderCharts === 'function') {
    window.app.renderCharts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const liveDateEl = document.getElementById('liveDateText');
  if (liveDateEl && dateStr) {
    liveDateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  applyRolePermissionsUI();
  if (typeof renderYouTubePlaylist === 'function') renderYouTubePlaylist();
  if (typeof loadRealNewsFromBackend === 'function') loadRealNewsFromBackend(false);
  renderHomeRecentReports();

  setTimeout(() => {
    applyRolePermissionsUI();
    renderHomeRecentReports();
  }, 1000);
});