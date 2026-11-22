/**
 * EcoAlert Main Application Controller
 * Xử lý logic giao diện, phân quyền, bộ lọc, tương tác modal và thông báo
 */

class EcoApp {
  constructor() {
    this.currentTab = 'map';
    this.reports = [];
    this.currentReportDetail = null;
    this.currentUser = window.apiService.getCurrentUser();
    this.filters = {
      status: '',
      pollution_type_id: '',
      severity_level: '',
      search: ''
    };
    this.debounceTimer = null;
  }

  async init() {
    this.setupAuthUI();
    this.setupEventListeners();
    this.renderFilterPollutionTypes();

    // Khởi tạo bản đồ
    window.mapController.initMainMap('mainMap');

    // Kiểm tra kết nối backend
    window.apiService.checkHealth().then(available => {
      this.updateBackendStatusBadge(available);
    });

    // Tải dữ liệu ban đầu
    await this.refreshData();

    // Auto check hash route
    const hash = window.location.hash.replace('#', '');
    if (['map', 'list', 'stats', 'about'].includes(hash)) {
      this.switchTab(hash);
    }
  }

  setupEventListeners() {
    // Chuyển tab
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Lắng nghe thay đổi xác thực
    window.addEventListener('auth:change', (e) => {
      this.currentUser = e.detail.user;
      this.setupAuthUI();
      if (this.currentReportDetail) {
        this.renderOfficerControlPanel(this.currentReportDetail);
      }
    });

    window.addEventListener('backend:status', (e) => {
      this.updateBackendStatusBadge(e.detail.available);
    });

    // Tìm kiếm với debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.filters.search = e.target.value;
          this.applyFilters();
        }, 300);
      });
    }

    // Bộ lọc select
    ['filterStatus', 'filterType', 'filterSeverity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          this.filters.status = document.getElementById('filterStatus')?.value || '';
          this.filters.pollution_type_id = document.getElementById('filterType')?.value || '';
          this.filters.severity_level = document.getElementById('filterSeverity')?.value || '';
          this.applyFilters();
        });
      }
    });
  }

  updateBackendStatusBadge(isOnline) {
    const el = document.getElementById('backendStatusBadge');
    if (!el) return;
    if (isOnline) {
      el.innerHTML = `
        <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-medium text-emerald-800">Backend SQL Server: Sẵn sàng</span>
      `;
      el.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200';
    } else {
      el.innerHTML = `
        <span class="flex h-2 w-2 rounded-full bg-amber-500"></span>
        <span class="text-xs font-medium text-amber-900">Mô phỏng dữ liệu (25 điểm Cao Lãnh)</span>
      `;
      el.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200';
    }
  }

  setupAuthUI() {
    const userContainer = document.getElementById('userNavContainer');
    const guestContainer = document.getElementById('guestNavContainer');
    const currentRoleBadge = document.getElementById('currentRoleBadge');

    if (this.currentUser) {
      if (userContainer) userContainer.classList.remove('hidden');
      if (guestContainer) guestContainer.classList.add('hidden');

      const nameEl = document.getElementById('userNavName');
      const roleEl = document.getElementById('userNavRole');
      if (nameEl) nameEl.textContent = this.currentUser.full_name;
      if (roleEl) {
        const roleNames = {
          CITIZEN: 'Người dân',
          OFFICER: 'Cán bộ Môi trường / Đô thị',
          MANAGER: 'Lãnh đạo / Quản lý TNMT'
        };
        roleEl.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
      }

      if (currentRoleBadge) {
        currentRoleBadge.textContent = this.currentUser.role;
        currentRoleBadge.className = `px-2 py-0.5 rounded text-xs font-bold ${
          this.currentUser.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
          this.currentUser.role === 'OFFICER' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        }`;
      }
    } else {
      if (userContainer) userContainer.classList.add('hidden');
      if (guestContainer) guestContainer.classList.remove('hidden');
      if (currentRoleBadge) {
        currentRoleBadge.textContent = 'KHÁCH';
        currentRoleBadge.className = 'px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600';
      }
    }

    // Đồng bộ nút chọn vai trò nhanh
    document.querySelectorAll('.role-preset-btn').forEach(btn => {
      const role = btn.getAttribute('data-role');
      if (this.currentUser && this.currentUser.role === role) {
        btn.classList.add('ring-2', 'ring-emerald-600', 'bg-emerald-50');
      } else {
        btn.classList.remove('ring-2', 'ring-emerald-600', 'bg-emerald-50');
      }
    });
  }

  renderFilterPollutionTypes() {
    const select = document.getElementById('filterType');
    if (!select) return;
    select.innerHTML = '<option value="">Tất cả loại ô nhiễm</option>';
    window.INITIAL_POLLUTION_TYPES.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      select.appendChild(opt);
    });

    const createFormSelect = document.getElementById('createPollutionType');
    if (createFormSelect) {
      createFormSelect.innerHTML = '';
      window.INITIAL_POLLUTION_TYPES.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.name} - ${t.description}`;
        createFormSelect.appendChild(opt);
      });
    }
  }

  async refreshData() {
    try {
      this.reports = await window.apiService.getReports(this.filters);
      this.renderReportsList();
      window.mapController.renderMarkers(this.reports);
      await this.loadStats();
    } catch (err) {
      this.showToast('Không thể tải danh sách phản ánh', 'error');
    }
  }

  async loadStats() {
    try {
      const stats = await window.apiService.getStats();
      const overview = stats.overview || {};

      document.getElementById('statTotal')?.replaceChildren(document.createTextNode(overview.total || 0));
      document.getElementById('statPending')?.replaceChildren(document.createTextNode(overview.pending || 0));
      document.getElementById('statProcessing')?.replaceChildren(document.createTextNode(overview.processing || 0));
      document.getElementById('statCompleted')?.replaceChildren(document.createTextNode(overview.completed || 0));
      document.getElementById('statAvgTime')?.replaceChildren(document.createTextNode(`${stats.avgResolutionHours || 0}h`));

      window.chartController.renderDashboardCharts(stats);
    } catch (err) {
      console.warn('Lỗi tải thống kê:', err);
    }
  }

  applyFilters() {
    this.refreshData();
  }

  resetFilters() {
    this.filters = { status: '', pollution_type_id: '', severity_level: '', search: '' };
    if (document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
    if (document.getElementById('filterType')) document.getElementById('filterType').value = '';
    if (document.getElementById('filterSeverity')) document.getElementById('filterSeverity').value = '';
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    this.applyFilters();
  }

  renderReportsList() {
    const container = document.getElementById('reportsListContainer');
    const tableBody = document.getElementById('reportsTableBody');
    const countBadge = document.getElementById('reportsCountBadge');

    if (countBadge) countBadge.textContent = `${this.reports.length} phản ánh`;

    if (this.reports.length === 0) {
      const emptyHtml = `
        <div class="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h4 class="font-semibold text-slate-700">Không tìm thấy phản ánh nào</h4>
          <p class="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
        </div>
      `;
      if (container) container.innerHTML = emptyHtml;
      if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-550">${emptyHtml}</td></tr>`;
      return;
    }

    // 1. Render Danh sách Card cho tab Bản đồ
    if (container) {
      container.innerHTML = this.reports.map(r => {
        const severity = window.mapController.getSeverityColor(r.severity_level);
        const statusClass = window.mapController.getStatusBadgeClass(r.status);
        const statusText = window.mapController.getStatusText(r.status);
        const dateStr = new Date(r.created_at).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return `
          <div class="eco-card bg-white p-3.5 rounded-xl border border-slate-200/80 cursor-pointer" onclick="window.app.openReportDetail(${r.id})">
            <div class="flex items-start gap-3">
              ${r.thumbnail ? `
                <img src="${r.thumbnail}" alt="Hiện trường" class="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-100" />
              ` : `
                <div class="w-16 h-16 rounded-lg bg-emerald-50 flex flex-col items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span class="text-[10px] mt-0.5">Không ảnh</span>
                </div>
              `}
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span class="px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusClass}">
                    ${statusText}
                  </span>
                  <span class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700">
                    ${r.pollution_type_name || 'Khác'}
                  </span>
                  <span class="px-1.5 py-0.5 text-[10px] font-bold rounded text-white" style="background-color: ${severity.bg}">
                    ${severity.text}
                  </span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 truncate hover:text-emerald-700 transition-colors">
                  #${r.id} - ${r.title}
                </h4>
                <p class="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>${r.address_text || 'Đang cập nhật vị trí'}</span>
                </p>
                <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span>${r.citizen_name || 'Người dân'}</span>
                  <button type="button" onclick="event.stopPropagation(); window.mapController.flyToReport(${r.latitude}, ${r.longitude})" class="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1">
                    <span>Định vị</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Render Table cho tab Danh sách mở rộng
    if (tableBody) {
      tableBody.innerHTML = this.reports.map(r => {
        const severity = window.mapController.getSeverityColor(r.severity_level);
        const statusClass = window.mapController.getStatusBadgeClass(r.status);
        const statusText = window.mapController.getStatusText(r.status);
        const dateStr = new Date(r.created_at).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });

        return `
          <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100" onclick="window.app.openReportDetail(${r.id})">
            <td class="py-3 px-4 text-xs font-mono font-bold text-slate-500">#${r.id}</td>
            <td class="py-3 px-4">
              <div class="font-semibold text-sm text-slate-900">${r.title}</div>
              <div class="text-xs text-slate-500 line-clamp-1">${r.address_text || ''}</div>
            </td>
            <td class="py-3 px-4 text-xs font-medium text-slate-700">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100">
                ${r.pollution_type_name || 'Khác'}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 text-xs font-bold rounded text-white" style="background-color: ${severity.bg}">
                ${severity.text}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${statusClass}">
                ${statusText}
              </span>
            </td>
            <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
              ${dateStr}
            </td>
            <td class="py-3 px-4 text-right">
              <button class="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                Chi tiết
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    window.location.hash = tabId;

    // Toggle navigation buttons
    document.querySelectorAll('[data-tab]').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('nav-tab-active');
      } else {
        btn.classList.remove('nav-tab-active');
      }
    });

    // Toggle view containers
    document.querySelectorAll('.view-tab-content').forEach(view => {
      view.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.remove('hidden');

    if (tabId === 'map' && window.mapController.map) {
      setTimeout(() => {
        window.mapController.map.invalidateSize();
      }, 200);
    }

    if (tabId === 'stats') {
      this.loadStats();
    }
  }

  // --- REPORT DETAIL MODAL ---
  async openReportDetail(reportId) {
    try {
      const report = await window.apiService.getReportById(reportId);
      this.currentReportDetail = report;

      const modal = document.getElementById('reportDetailModal');
      if (!modal) return;

      const severity = window.mapController.getSeverityColor(report.severity_level);
      const statusClass = window.mapController.getStatusBadgeClass(report.status);
      const statusText = window.mapController.getStatusText(report.status);
      const createdDate = new Date(report.created_at).toLocaleString('vi-VN');

      document.getElementById('modalReportId').textContent = `#${report.id}`;
      document.getElementById('modalReportTitle').textContent = report.title;
      document.getElementById('modalReportType').textContent = report.pollution_type_name || 'Khác';
      document.getElementById('modalReportCitizen').textContent = report.citizen_name || 'Người dân';
      document.getElementById('modalReportAddress').textContent = report.address_text || 'Chưa có thông tin';
      document.getElementById('modalReportCreated').textContent = createdDate;
      document.getElementById('modalReportDesc').textContent = report.description || 'Không có mô tả chi tiết.';
      document.getElementById('modalReportCoords').textContent = `${report.latitude}, ${report.longitude}`;

      const severityBadge = document.getElementById('modalReportSeverity');
      if (severityBadge) {
        severityBadge.textContent = severity.text;
        severityBadge.style.backgroundColor = severity.bg;
      }

      const statusBadge = document.getElementById('modalReportStatus');
      if (statusBadge) {
        statusBadge.textContent = statusText;
        statusBadge.className = `px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`;
      }

      // Render hình ảnh Hiện trường (Trước / Sau)
      this.renderReportImages(report.images || []);

      // Render nhật ký xử lý
      this.renderProcessLogs(report.logs || []);

      // Render Officer Control Panel (nếu đủ quyền)
      this.renderOfficerControlPanel(report);

      modal.classList.remove('hidden');
    } catch (err) {
      this.showToast(err.message || 'Lỗi khi mở chi tiết phản ánh', 'error');
    }
  }

  renderReportImages(images) {
    const container = document.getElementById('modalImagesContainer');
    if (!container) return;

    if (images.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
          Chưa có hình ảnh hiện trường được tải lên
        </div>
      `;
      return;
    }

    const beforeImgs = images.filter(img => img.image_type === 'BEFORE');
    const afterImgs = images.filter(img => img.image_type === 'AFTER');

    let html = '';

    if (beforeImgs.length > 0) {
      html += `
        <div class="photo-compare-box">
          <div class="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1.5 border-b border-amber-200 flex items-center justify-between">
            <span>ẢNH HIỆN TRƯỜNG (TRƯỚC XỬ LÝ)</span>
            <span class="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">Gửi lúc báo cáo</span>
          </div>
          <div class="p-2 space-y-2">
            ${beforeImgs.map(img => `
              <img src="${img.image_url}" alt="Trước xử lý" class="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90" onclick="window.open('${img.image_url}', '_blank')" />
            `).join('')}
          </div>
        </div>
      `;
    }

    if (afterImgs.length > 0) {
      html += `
        <div class="photo-compare-box">
          <div class="bg-emerald-50 text-emerald-900 text-xs font-bold px-3 py-1.5 border-b border-emerald-200 flex items-center justify-between">
            <span>KẾT QUẢ KHẮC PHỤC (SAU XỬ LÝ)</span>
            <span class="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">Cán bộ xác nhận</span>
          </div>
          <div class="p-2 space-y-2">
            ${afterImgs.map(img => `
              <img src="${img.image_url}" alt="Sau xử lý" class="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90" onclick="window.open('${img.image_url}', '_blank')" />
            `).join('')}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="photo-compare-box flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50 border-dashed">
          <svg class="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span class="text-xs font-medium">Chưa có ảnh sau khi xử lý</span>
          <span class="text-[11px] text-slate-400 mt-0.5">Cán bộ sẽ chụp và đính kèm khi hoàn thành khắc phục</span>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  renderProcessLogs(logs) {
    const container = document.getElementById('modalLogsContainer');
    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-xs text-slate-400 bg-slate-50 rounded-lg text-center">
          Chưa có nhật ký ghi nhận tiến độ cho hồ sơ này
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="timeline-stem">
        ${logs.map(log => {
          const fromText = window.mapController.getStatusText(log.status_from);
          const toText = window.mapController.getStatusText(log.status_to);
          const dateStr = new Date(log.created_at).toLocaleString('vi-VN');
          return `
            <div class="timeline-node">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-semibold text-xs text-slate-800">${log.updated_by_name || 'Cán bộ'}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">${log.role || 'OFFICER'}</span>
                <span class="text-[11px] text-slate-400 ml-auto">${dateStr}</span>
              </div>
              <div class="text-xs text-slate-600 mb-1.5">
                Chuyển trạng thái: <strong class="text-slate-700">${fromText}</strong> ➔ <strong class="text-emerald-700">${toText}</strong>
              </div>
              ${log.note ? `
                <div class="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100/80 leading-relaxed">
                  "${log.note}"
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderOfficerControlPanel(report) {
    const panel = document.getElementById('officerControlPanel');
    if (!panel) return;

    const isAuthorized = this.currentUser && ['OFFICER', 'MANAGER'].includes(this.currentUser.role);
    if (!isAuthorized) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');

    // Populate cán bộ phụ trách
    const officerSelect = document.getElementById('updateAssignedTo');
    if (officerSelect) {
      officerSelect.innerHTML = '<option value="">-- Giữ nguyên hoặc chưa phân công --</option>';
      const officers = window.localDataStore.getOfficers();
      officers.forEach(off => {
        const opt = document.createElement('option');
        opt.value = off.id;
        opt.textContent = `${off.full_name} (${off.role === 'MANAGER' ? 'Quản lý' : 'Cán bộ'})`;
        if (report.assigned_to === off.id) opt.selected = true;
        officerSelect.appendChild(opt);
      });
    }

    // Set current status in select
    const statusSelect = document.getElementById('updateStatus');
    if (statusSelect) {
      statusSelect.value = report.status;
    }
  }

  closeReportDetail() {
    const modal = document.getElementById('reportDetailModal');
    if (modal) modal.classList.add('hidden');
  }

  // --- SUBMIT STATUS UPDATE (Officer / Manager) ---
  async handleStatusUpdateSubmit(e) {
    e.preventDefault();
    if (!this.currentReportDetail) return;

    const status = document.getElementById('updateStatus').value;
    const note = document.getElementById('updateNote').value;
    const assigned_to = document.getElementById('updateAssignedTo').value;
    const after_image_url = document.getElementById('updateAfterImageUrl').value;

    try {
      const res = await window.apiService.updateReportStatus(this.currentReportDetail.id, {
        status,
        note,
        assigned_to: assigned_to ? parseInt(assigned_to, 10) : undefined,
        after_image_url: after_image_url || undefined
      });

      this.showToast(res.message || 'Cập nhật tiến độ thành công!', 'success');
      document.getElementById('updateNote').value = '';
      document.getElementById('updateAfterImageUrl').value = '';

      await this.openReportDetail(this.currentReportDetail.id);
      await this.refreshData();
    } catch (err) {
      this.showToast(err.message || 'Lỗi khi cập nhật tiến độ', 'error');
    }
  }

  // --- CREATE REPORT MODAL ---
  openCreateModal() {
    if (!this.currentUser) {
      this.showToast('Vui lòng đăng nhập hoặc chọn vai trò Người dân để gửi phản ánh!', 'warning');
      this.quickLoginAs('CITIZEN');
    }

    const modal = document.getElementById('createReportModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    // Mở picker map Leaflet
    const defaultCoords = [10.4535, 105.6308];
    window.mapController.initPickerMap('pickerMap', defaultCoords, (lat, lng) => {
      document.getElementById('createLatitude').value = lat;
      document.getElementById('createLongitude').value = lng;
    });

    document.getElementById('createLatitude').value = defaultCoords[0].toFixed(6);
    document.getElementById('createLongitude').value = defaultCoords[1].toFixed(6);
  }

  closeCreateModal() {
    const modal = document.getElementById('createReportModal');
    if (modal) modal.classList.add('hidden');
  }

  async handleCreateReportSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('createTitle').value.trim();
    const pollution_type_id = document.getElementById('createPollutionType').value;
    const severity_level = document.getElementById('createSeverity').value;
    const address_text = document.getElementById('createAddress').value.trim();
    const latitude = document.getElementById('createLatitude').value;
    const longitude = document.getElementById('createLongitude').value;
    const description = document.getElementById('createDescription').value.trim();
    const image_url = document.getElementById('createImageUrl').value.trim();

    if (!title || !address_text) {
      this.showToast('Vui lòng điền đầy đủ tiêu đề và địa chỉ phản ánh!', 'warning');
      return;
    }

    try {
      const res = await window.apiService.createReport({
        title,
        pollution_type_id,
        severity_level,
        address_text,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description,
        image_url: image_url || undefined
      });

      this.showToast(res.message || 'Gửi phản ánh thành công!', 'success');
      this.closeCreateModal();

      // Reset form
      document.getElementById('createReportForm').reset();

      await this.refreshData();

      // Bay tới phản ánh vừa tạo trên bản đồ
      if (res.reportId) {
        this.switchTab('map');
        window.mapController.flyToReport(latitude, longitude);
      }
    } catch (err) {
      this.showToast(err.message || 'Lỗi khi gửi phản ánh', 'error');
    }
  }

  // --- QUICK ROLE SWITCHER (Demo Mode) ---
  quickLoginAs(role) {
    const users = JSON.parse(localStorage.getItem('eco_users_v1') || '[]');
    let target = null;
    if (role === 'CITIZEN') target = users.find(u => u.role === 'CITIZEN');
    if (role === 'OFFICER') target = users.find(u => u.role === 'OFFICER');
    if (role === 'MANAGER') target = users.find(u => u.role === 'MANAGER');

    if (target) {
      const dummyToken = 'mock_jwt_' + target.id + '_' + Date.now();
      window.apiService.setSession(dummyToken, target);
      this.showToast(`Đã chuyển sang vai trò: ${target.full_name} (${role})`, 'success');
    }
  }

  logout() {
    window.apiService.logout();
    this.showToast('Đã đăng xuất tài khoản', 'info');
  }

  // --- AUTH MODAL ---
  openAuthModal(defaultMode = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    this.switchAuthMode(defaultMode);
    modal.classList.remove('hidden');
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
  }

  switchAuthMode(mode) {
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer');
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabRegister = document.getElementById('tabAuthRegister');

    if (mode === 'login') {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      tabLogin?.classList.add('border-emerald-600', 'text-emerald-700', 'font-bold');
      tabRegister?.classList.remove('border-emerald-600', 'text-emerald-700', 'font-bold');
    } else {
      loginForm?.classList.add('hidden');
      registerForm?.classList.remove('hidden');
      tabRegister?.classList.add('border-emerald-600', 'text-emerald-700', 'font-bold');
      tabLogin?.classList.remove('border-emerald-600', 'text-emerald-700', 'font-bold');
    }
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await window.apiService.login(email, password);
      this.showToast(res.message || 'Đăng nhập thành công!', 'success');
      this.closeAuthModal();
      document.getElementById('loginForm').reset();
    } catch (err) {
      this.showToast(err.message || 'Đăng nhập thất bại', 'error');
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const full_name = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    try {
      const res = await window.apiService.register({ full_name, email, phone, password });
      this.showToast(res.message || 'Đăng ký thành công! Hãy đăng nhập.', 'success');
      this.switchAuthMode('login');
      document.getElementById('loginEmail').value = email;
    } catch (err) {
      this.showToast(err.message || 'Đăng ký thất bại', 'error');
    }
  }

  // Preset sample photo helper for fast demo testing
  setPresetPhoto(url) {
    const input = document.getElementById('createImageUrl');
    if (input) {
      input.value = url;
      this.showToast('Đã chọn hình ảnh mẫu hiện trường', 'info');
    }
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const colors = {
      success: { bg: 'bg-emerald-600', icon: 'M5 13l4 4L19 7' },
      error: { bg: 'bg-rose-600', icon: 'M6 18L18 6M6 6l12 12' },
      warning: { bg: 'bg-amber-600', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
      info: { bg: 'bg-slate-800', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
    };

    const config = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = `eco-toast flex items-center gap-3 p-3.5 text-white rounded-xl shadow-lg ${config.bg} text-sm font-medium`;
    toast.innerHTML = `
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.icon}"></path>
      </svg>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white text-lg leading-none">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  }
}

window.app = new EcoApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
