/**
 * Map Controller (Leaflet & OpenStreetMap)
 * Trực quan hóa tọa độ các điểm nóng ô nhiễm tại TP. Cao Lãnh
 * Tương tác click xem popup và chọn tọa độ ghim điểm mới
 */

class MapController {
  constructor() {
    this.map = null;
    this.markersLayer = null;
    this.pickerMap = null;
    this.pickerMarker = null;
    this.defaultCenter = [10.4535, 105.6308]; // Trung tâm TP. Cao Lãnh
    this.defaultZoom = 14;
  }

  initMainMap(containerId = 'mainMap') {
    const el = document.getElementById(containerId);
    if (!el || this.map) return;

    this.map = L.map(containerId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'CRITICAL': return { bg: '#dc2626', border: '#991b1b', text: 'Khẩn cấp' };
      case 'HIGH': return { bg: '#ea580c', border: '#c2410c', text: 'Nghiêm trọng' };
      case 'MEDIUM': return { bg: '#d97706', border: '#b45309', text: 'Trung bình' };
      case 'LOW': default: return { bg: '#16a34a', border: '#15803d', text: 'Thấp' };
    }
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'VERIFIED': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  getStatusText(status) {
    const map = {
      PENDING: 'Chờ tiếp nhận',
      ACCEPTED: 'Đã tiếp nhận',
      VERIFIED: 'Đã xác minh',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Đã hoàn thành',
      REJECTED: 'Từ chối'
    };
    return map[status] || status;
  }

  renderMarkers(reports = []) {
    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const bounds = [];

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;

      const lat = parseFloat(r.latitude);
      const lng = parseFloat(r.longitude);
      bounds.push([lat, lng]);

      const colors = this.getSeverityColor(r.severity_level);

      // Custom marker icon
      const iconHtml = `
        <div class="custom-map-marker" style="--marker-color: ${colors.bg}; --marker-border: ${colors.border}">
          <div class="marker-pulse"></div>
          <div class="marker-pin">
            <span class="marker-inner-dot"></span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'eco-map-div-icon',
        html: iconHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const thumbHtml = r.thumbnail 
        ? `<div class="popup-thumb" style="background-image: url('${r.thumbnail}')"></div>` 
        : '';

      const popupHtml = `
        <div class="eco-popup-card">
          ${thumbHtml}
          <div class="p-3">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${this.getStatusBadgeClass(r.status)}">
                ${this.getStatusText(r.status)}
              </span>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                ${r.pollution_type_name || 'Ô nhiễm'}
              </span>
              <span class="px-2 py-0.5 text-xs font-bold rounded-full text-white" style="background-color: ${colors.bg}">
                ${colors.text}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 line-clamp-2 leading-snug mb-1">
              ${r.title}
            </h4>
            <p class="text-xs text-slate-550 flex items-start gap-1 mb-2">
              <svg class="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${r.address_text || 'Chưa có địa chỉ cụ thể'}</span>
            </p>
            <button onclick="window.app.openReportDetail(${r.id})" 
              class="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm">
              <span>Xem chi tiết hồ sơ</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, className: 'eco-leaflet-popup' });
      this.markersLayer.addLayer(marker);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

  flyToReport(latitude, longitude) {
    if (!this.map || !latitude || !longitude) return;
    this.map.flyTo([parseFloat(latitude), parseFloat(longitude)], 16, {
      duration: 1.2
    });
  }

  // --- PICKER MAP (For Report Submission) ---
  initPickerMap(containerId = 'pickerMap', initialCoords = [10.4535, 105.6308], onPickCallback = null) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (this.pickerMap) {
      this.pickerMap.remove();
      this.pickerMap = null;
    }

    this.pickerMap = L.map(containerId, {
      center: initialCoords,
      zoom: 14,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.pickerMap);

    this.pickerMarker = L.marker(initialCoords, { draggable: true }).addTo(this.pickerMap);

    const updateCoords = (lat, lng) => {
      if (onPickCallback) {
        onPickCallback(lat.toFixed(6), lng.toFixed(6));
      }
    };

    updateCoords(initialCoords[0], initialCoords[1]);

    this.pickerMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updateCoords(pos.lat, pos.lng);
    });

    this.pickerMap.on('click', (e) => {
      this.pickerMarker.setLatLng(e.latlng);
      updateCoords(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size after modal render
    setTimeout(() => {
      if (this.pickerMap) this.pickerMap.invalidateSize();
    }, 300);
  }

  setPickerLocation(lat, lng) {
    if (this.pickerMap && this.pickerMarker) {
      const pos = [parseFloat(lat), parseFloat(lng)];
      this.pickerMarker.setLatLng(pos);
      this.pickerMap.setView(pos, 15);
    }
  }
}

window.mapController = new MapController();
