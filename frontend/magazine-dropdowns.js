// Quản lý dữ liệu chuyên mục, menu xổ xuống (dropdown) & điều hướng sang trang chuyên mục riêng

const MAGAZINE_CATALOG = {
  'topic-water': {
    label: 'Nước & Cuộc sống',
    color: 'sky',
    subs: {
      'nuoc-doi-song': {
        title: 'Nước & Đời sống (Cao Lãnh / Đồng Tháp)',
        desc: 'Tình hình nguồn nước sinh hoạt, thủy văn sông Tiền và đời sống người dân vùng Đồng Tháp.',
        articles: [
          {
            title: 'Đồng Tháp: Người dân mong sớm hoàn thành công trình ứng phó sạt lở bờ sông Tiền',
            source: 'Báo Tin tức',
            time: '23/11/2026',
            summary: 'Tình trạng sạt lở bờ sông Tiền tại xã đảo Tân Long (tỉnh Đồng Tháp) diễn biến phức tạp, ăn sâu vào đất liền và uy hiếp tuyến giao thông.',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
            link: 'https://baotintuc.vn/dong-thap-nguoi-dan-mong-som-hoan-thanh-cong-trinh-ung-pho-sat-lo-post1405293.html'
          },
          {
            title: 'Đồng Tháp chủ động ứng phó xâm nhập mặn mùa khô',
            source: 'VOV',
            time: '23/11/2026',
            summary: 'Đài Khí tượng Thủy văn tỉnh Đồng Tháp ghi nhận nước mặn bắt đầu xâm nhập vào cửa sông Tiền, chính quyền và người dân chủ động ứng phó.',
            image: 'https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=900&q=80',
            link: 'https://vov.vn/xa-hoi/dong-thap-chu-dong-ung-pho-xam-nhap-man-mua-kho-post1352569.vov'
          }
        ],
        videos: [
          {
            id: '6xGabJ2nGuI',
            title: 'Yêu cầu kiểm tra cơ sở chế biến cá gây ô nhiễm ở Đồng Tháp | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '02:55'
          },
          {
            id: 'rCETz0txknA',
            title: 'Ô nhiễm môi trường các vùng nuôi thủy sản | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '04:05'
          }
        ]
      },
      'tai-nguyen-nuoc': {
        title: 'Tài nguyên & Nguồn nước',
        desc: 'Khai thác, bảo vệ tài nguyên nước mặt, kênh rạch nội đồng và an ninh nguồn nước.',
        articles: [
          {
            title: 'Nạo vét tuyến luồng hàng hải sông Tiền, đảm bảo lưu thông hàng hóa ra biển',
            source: 'Báo Đồng Tháp',
            time: '22/11/2026',
            summary: 'Kết hợp phát triển hạ tầng đường thủy và sản xuất thuận thiên tại vùng đồng bằng sông Cửu Long.',
            image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80',
            link: 'https://baodongthap.vn/'
          },
          {
            title: 'Kiểm soát xả thải ra hệ thống kênh rạch đô thị TP. Cao Lãnh',
            source: 'Cổng TTĐT Đồng Tháp',
            time: '20/11/2026',
            summary: 'Tăng cường quan trắc chất lượng nước mặt tại các tuyến rạch trung tâm và khu dân cư.',
            image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
            link: 'https://dongthap.gov.vn/'
          }
        ],
        videos: [
          {
            id: 'IYkZpuux51M',
            title: 'Khắc phục ô nhiễm môi trường ở TP. Cao Lãnh | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '03:20'
          }
        ]
      }
    }
  },

  'topic-resource': {
    label: 'Môi trường - Tài nguyên',
    color: 'amber',
    subs: {
      'xu-ly-rac-cao-lanh': {
        title: 'Quản lý chất thải & Xử lý ô nhiễm tại Cao Lãnh',
        desc: 'Công tác thu gom, vận chuyển, xử lý rác thải và khắc phục các điểm nóng ô nhiễm trên địa bàn.',
        articles: [
          {
            title: 'Công tác bảo vệ môi trường tại Khu xử lý rác thải Đập Đá, huyện Cao Lãnh',
            source: 'Cổng TTĐT Đồng Tháp',
            time: '19/11/2026',
            summary: 'Văn bản điều hành và cập nhật công tác bảo vệ môi trường tại Khu xử lý rác thải Đập Đá, huyện Cao Lãnh.',
            image: 'https://images.unsplash.com/photo-1532996161904-c79ec27c18ce?auto=format&fit=crop&w=900&q=80',
            link: 'https://dongthap.gov.vn/web/cong-thong-tin-dtp/chi-tiet?id=5582933'
          },
          {
            title: 'Tăng cường thu gom rác thải sinh hoạt tại các tuyến đường nội ô TP. Cao Lãnh',
            source: 'Báo Đồng Tháp',
            time: '18/11/2026',
            summary: 'Xóa bỏ các bãi rác tự phát ven đường, đảm bảo mỹ quan đô thị xanh - sạch - đẹp.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
            link: 'https://baodongthap.vn/'
          }
        ],
        videos: [
          {
            id: 'IYkZpuux51M',
            title: 'Khắc phục ô nhiễm môi trường ở TP. Cao Lãnh | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '03:20'
          },
          {
            id: 'YBu0BGluBpA',
            title: 'Đồng Tháp: Ô nhiễm vẫn tiếp diễn sau phản ánh | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '03:10'
          }
        ]
      },
      'giam-sat-xu-phat': {
        title: 'Giám sát & Xử phạt vi phạm môi trường',
        desc: 'Quy định pháp luật, mức xử phạt hành chính và công tác thanh tra bảo vệ môi trường.',
        articles: [
          {
            title: 'Nhiều quy định mới về xử phạt vi phạm môi trường',
            source: 'THDT',
            time: '20/11/2026',
            summary: 'Cập nhật các mức xử phạt hành chính đối với hành vi xả thải không qua xử lý và vi phạm vệ sinh môi trường công cộng.',
            image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=80',
            link: 'https://thdt.vn/tin-tuc/nhieu-quy-dinh-moi-ve-xu-phat-vi-pham-moi-truong'
          }
        ],
        videos: [
          {
            id: 'YBu0BGluBpA',
            title: 'Đồng Tháp: Ô nhiễm vẫn tiếp diễn sau phản ánh | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '03:10'
          }
        ]
      }
    }
  },

  'topic-green': {
    label: 'Cuộc sống xanh',
    color: 'eco',
    subs: {
      'phan-loai-tai-che': {
        title: 'Đổi phế liệu & Phân loại rác tại nguồn',
        desc: 'Các mô hình phân loại rác tại hộ gia đình, đổi rác thải nhựa lấy cây xanh tại Đồng Tháp.',
        articles: [
          {
            title: 'Phụ nữ chung tay sống xanh, lan tỏa yêu thương',
            source: 'Báo Đồng Tháp',
            time: 'Sống xanh',
            summary: 'Mô hình “Đổi phế liệu - lấy mầm xanh” thu gom chai nhựa, lon nước, giấy vụn đổi cây giống, hạt giống và phân loại rác tại nguồn.',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
            link: 'https://baodongthap.vn/phu-nu-chung-tay-song-xanh-lan-toa-yeu-thuong-a241732.html'
          }
        ],
        videos: [
          {
            id: 'IYkZpuux51M',
            title: 'Khắc phục ô nhiễm môi trường ở TP. Cao Lãnh | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '03:20'
          }
        ]
      },
      'giam-nhua-song-xanh': {
        title: 'Giảm nhựa dùng một lần & Không gian xanh đô thị',
        desc: 'Hành động thiết thực giảm thiểu rác thải nhựa và xây dựng đô thị xanh bền vững.',
        articles: [
          {
            title: 'Đồng Tháp chung tay giảm nhựa dùng một lần, hướng tới môi trường sống xanh bền vững',
            source: 'Thời báo Tài chính VN',
            time: 'Sống xanh',
            summary: 'Khuyến khích từ chối đồ nhựa dùng một lần và duy trì thói quen phân loại rác thường xuyên trong đời sống.',
            image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=900&q=80',
            link: 'https://thoibaotaichinhvietnam.vn/dong-thap-chung-tay-giam-nhua-dung-mot-lan-huong-toi-moi-truong-song-xanh-ben-vung-198241.html'
          }
        ],
        videos: [
          {
            id: 'rCETz0txknA',
            title: 'Ô nhiễm môi trường các vùng nuôi thủy sản | THDT',
            channel: 'Truyền Hình Đồng Tháp',
            duration: '04:05'
          }
        ]
      }
    }
  }
};

window.MAGAZINE_CATALOG = MAGAZINE_CATALOG;

let activeDropdownMenuEl = null;

function closeMagazineDropdown() {
  if (activeDropdownMenuEl) {
    activeDropdownMenuEl.remove();
    activeDropdownMenuEl = null;
  }
}

function openMagazineDropdown(navKey, anchorBtn) {
  const cat = MAGAZINE_CATALOG[navKey];
  if (!cat || !anchorBtn) return;

  const isSame = activeDropdownMenuEl && activeDropdownMenuEl.dataset.forKey === navKey;
  closeMagazineDropdown();
  if (isSame) return;

  const rect = anchorBtn.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.dataset.forKey = navKey;
  menu.style.cssText = `
    position: fixed;
    top: ${Math.round(rect.bottom)}px;
    left: ${Math.max(8, Math.round(rect.left))}px;
    z-index: 99999;
    min-width: 260px;
    background: #15803d;
    color: #ffffff;
    border: 1px solid rgba(134, 239, 172, 0.35);
    border-radius: 0 0 12px 12px;
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.25);
    padding: 6px 0;
  `;

  Object.entries(cat.subs).forEach(([subKey, subData]) => {
    const link = document.createElement('a');
    link.href = `chuyen-muc.html?cat=${encodeURIComponent(navKey)}&sub=${encodeURIComponent(subKey)}`;
    link.textContent = subData.title;
    link.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 16px;
      font-size: 12.5px;
      font-weight: 500;
      color: #f0fdf4;
      text-decoration: none;
      transition: background 0.15s ease;
    `;
    link.innerHTML = `<span>${subData.title}</span><span style="opacity:0.8">›</span>`;
    link.addEventListener('mouseenter', () => {
      link.style.background = '#16a34a';
      link.style.color = '#ffffff';
    });
    link.addEventListener('mouseleave', () => {
      link.style.background = 'transparent';
      link.style.color = '#f0fdf4';
    });
    menu.appendChild(link);
  });

  document.body.appendChild(menu);
  activeDropdownMenuEl = menu;
}

function initMagazineNavDropdowns() {
  Object.keys(MAGAZINE_CATALOG).forEach(navKey => {
    const btn = document.querySelector(`.nav-item-btn[data-nav-key="${navKey}"]`);
    if (!btn) return;

    // Gỡ bỏ onclick cũ nếu file JS khác có gắn vào
    btn.removeAttribute('onclick');
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openMagazineDropdown(navKey, btn);
    };
  });

  document.addEventListener('click', (e) => {
    if (
      activeDropdownMenuEl &&
      !activeDropdownMenuEl.contains(e.target) &&
      !e.target.closest('.nav-item-btn[data-nav-key]')
    ) {
      closeMagazineDropdown();
    }
  });

  window.addEventListener('scroll', closeMagazineDropdown, { passive: true });
  window.addEventListener('resize', closeMagazineDropdown, { passive: true });
}

// Chạy ngay và chạy lại sau khi các script khác load xong để không bị ghi đè onclick
document.addEventListener('DOMContentLoaded', () => {
  initMagazineNavDropdowns();
  setTimeout(initMagazineNavDropdowns, 400);
});