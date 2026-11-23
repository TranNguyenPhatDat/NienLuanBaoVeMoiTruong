// Quản lý Video YouTube, Tin tức báo chí & Chức năng đăng/quản lý nội dung của Admin
const DEFAULT_YOUTUBE_VIDEOS = [
  {
    id: 'IYkZpuux51M',
    title: 'Khắc phục ô nhiễm môi trường ở TP. Cao Lãnh | THDT',
    channel: 'Truyền Hình Đồng Tháp',
    duration: '00:51'
  },
  {
    id: 'gAZORXzjlZI',
    title: 'Huyện Cao Lãnh: Phản hồi về ô nhiễm tại Rạch Ông Ấu | THDT',
    channel: 'Truyền Hình Đồng Tháp',
    duration: '01:15'
  },
  {
    id: 'YB5nnPyeESw',
    title: 'Người thầm lặng vì môi trường xanh, sạch TP Cao Lãnh | THDT',
    channel: 'Truyền Hình Đồng Tháp',
    duration: '04:12'
  },
  {
    id: '5LStLeoiH4s',
    title: 'Hàng loạt bãi rác gây ô nhiễm môi trường | VTV24',
    channel: 'VTV24',
    duration: '02:00'
  },
  {
    id: '94CoJtVPGaE',
    title: 'Video tuyên truyền: Bảo vệ môi trường',
    channel: 'Hoan Nguyễn',
    duration: '02:25'
  }
];

const STORAGE_KEYS = {
  ADMIN_VIDEOS: 'mtxanh_admin_videos_v1',
  ADMIN_ARTICLES: 'mtxanh_admin_articles_v1'
};

let RSS_NEWS_ARTICLES = [];
let CURRENT_TOPIC_FILTER = 'ALL';

function getStoredVideos() {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_VIDEOS) || '[]');
    return Array.isArray(custom) ? [...custom, ...DEFAULT_YOUTUBE_VIDEOS] : [...DEFAULT_YOUTUBE_VIDEOS];
  } catch {
    return [...DEFAULT_YOUTUBE_VIDEOS];
  }
}

function getStoredAdminArticles() {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_ARTICLES) || '[]');
    return Array.isArray(custom) ? custom : [];
  } catch {
    return [];
  }
}

function extractYouTubeId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

function renderYouTubePlaylist() {
  const container = document.getElementById('youtubePlaylistContainer');
  if (!container) return;

  const videos = getStoredVideos();
  const isAdmin = typeof getNormalizedRoleType === 'function' && getNormalizedRoleType() === 'admin';
  const customIds = new Set(getStoredAdminVideosOnly().map(v => v.id));

  container.innerHTML = videos.map((vid) => {
    const safeTitle = String(vid.title || '').replace(/'/g, "\\'");
    const canDelete = isAdmin && customIds.has(vid.id);

    return `
      <div class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 flex items-center gap-3 transition-all group">
        <div onclick="selectYouTubeVideo('${vid.id}', '${safeTitle}')" class="cursor-pointer flex items-center gap-3 flex-1 min-w-0">
          <div class="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0">
            <img src="https://img.youtube.com/vi/${vid.id}/mqdefault.jpg" alt="${vid.title}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform">
            <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white">${vid.duration || 'Mới'}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-semibold text-emerald-400">${vid.channel || 'MT Xanh'}</div>
            <h4 class="text-xs font-bold text-slate-100 group-hover:text-emerald-300 line-clamp-2 leading-snug mt-0.5">
              ${vid.title}
            </h4>
          </div>
        </div>
        ${canDelete ? `
          <button onclick="deleteAdminVideo('${vid.id}')" title="Xóa video đã thêm" class="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white text-[10px] font-bold shrink-0">
            Xóa
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

function getStoredAdminVideosOnly() {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_VIDEOS) || '[]');
    return Array.isArray(custom) ? custom : [];
  } catch {
    return [];
  }
}

function selectYouTubeVideo(videoId, title) {
  const player = document.getElementById('youtubeMainPlayer');
  const titleEl = document.getElementById('youtubeCurrentTitle');
  const watchBtn = document.getElementById('youtubeWatchDirectBtn');

  if (player) player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  if (titleEl) titleEl.textContent = title;
  if (watchBtn) watchBtn.href = `https://www.youtube.com/watch?v=${videoId}`;
}

function openAdminMediaModal(defaultTab = 'article') {
  const modal = document.getElementById('adminMediaModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchAdminMediaFormTab(defaultTab);
}

function closeAdminMediaModal() {
  const modal = document.getElementById('adminMediaModal');
  if (modal) modal.classList.add('hidden');
}

function switchAdminMediaFormTab(tab) {
  const articleBox = document.getElementById('adminArticleFormBox');
  const videoBox = document.getElementById('adminVideoFormBox');
  const btnArticle = document.getElementById('tabAdminAddArticle');
  const btnVideo = document.getElementById('tabAdminAddVideo');

  if (articleBox) articleBox.classList.toggle('hidden', tab !== 'article');
  if (videoBox) videoBox.classList.toggle('hidden', tab !== 'video');

  if (btnArticle) {
    btnArticle.className = tab === 'article'
      ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-eco-700 text-white'
      : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600';
  }
  if (btnVideo) {
    btnVideo.className = tab === 'video'
      ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white'
      : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600';
  }
}

function handleAdminAddArticleSubmit(event) {
  event.preventDefault();
  const title = (document.getElementById('adminNewsTitle')?.value || '').trim();
  const source = (document.getElementById('adminNewsSource')?.value || 'Bản tin MT Xanh').trim();
  const link = (document.getElementById('adminNewsLink')?.value || '#').trim();
  const image = (document.getElementById('adminNewsImage')?.value || '/images/logonienluan.jpg').trim();
  const summary = (document.getElementById('adminNewsSummary')?.value || '').trim();

  if (!title) return;

  const list = getStoredAdminArticles();
  list.unshift({
    id: 'admin-news-' + Date.now(),
    title,
    source,
    link: link || '#newsFeedSection',
    image: image || '/images/logonienluan.jpg',
    summary,
    pubDate: new Date().toISOString(),
    isAdminAdded: true
  });

  localStorage.setItem(STORAGE_KEYS.ADMIN_ARTICLES, JSON.stringify(list));
  document.getElementById('adminAddArticleForm')?.reset();
  closeAdminMediaModal();
  rebuildCombinedNewsAndRender();

  if (window.app && typeof window.app.showToast === 'function') {
    window.app.showToast('Đã đăng bài báo môi trường mới cho người dân', 'success');
  }
}

function handleAdminAddVideoSubmit(event) {
  event.preventDefault();
  const rawLink = document.getElementById('adminVideoUrl')?.value || '';
  const videoId = extractYouTubeId(rawLink);
  const title = (document.getElementById('adminVideoTitle')?.value || '').trim();
  const channel = (document.getElementById('adminVideoChannel')?.value || 'Truyền Hình Đồng Tháp').trim();
  const duration = (document.getElementById('adminVideoDuration')?.value || 'Mới').trim();

  if (!videoId) {
    alert('Link hoặc ID YouTube chưa hợp lệ. Hãy dán link dạng https://www.youtube.com/watch?v=... hoặc mã 11 ký tự.');
    return;
  }
  if (!title) return;

  const list = getStoredAdminVideosOnly();
  list.unshift({ id: videoId, title, channel, duration: duration || 'Mới' });
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(list));

  document.getElementById('adminAddVideoForm')?.reset();
  closeAdminMediaModal();
  renderYouTubePlaylist();
  selectYouTubeVideo(videoId, title);

  if (window.app && typeof window.app.showToast === 'function') {
    window.app.showToast('Đã thêm video YouTube mới vào chuyên mục', 'success');
  }
}

function deleteAdminVideo(videoId) {
  const list = getStoredAdminVideosOnly().filter(v => v.id !== videoId);
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(list));
  renderYouTubePlaylist();
}

function getNewsCandidateUrls() {
  const candidates = [];
  if (window.location && window.location.origin && window.location.origin.startsWith('http')) {
    candidates.push(`${window.location.origin}/api/v1/news`);
  }
  if (window.API_CONFIG && window.API_CONFIG.BASE_URL) {
    candidates.push(`${window.API_CONFIG.BASE_URL.replace(/\/$/, '')}/news`);
  }
  candidates.push('http://localhost:5000/api/v1/news');
  candidates.push('http://localhost:3000/api/v1/news');
  return [...new Set(candidates)];
}

async function loadRealNewsFromBackend(showToast = false) {
  const updatedBadge = document.getElementById('newsUpdatedBadge');
  let rssArticles = [];

  for (const url of getNewsCandidateUrls()) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data.articles)) {
        rssArticles = data.articles;
        if (updatedBadge && data.updated_at) {
          const t = new Date(data.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          updatedBadge.textContent = `Cập nhật ${t}`;
        }
        break;
      }
    } catch {
      // Thử ứng viên tiếp theo
    }
  }

  RSS_NEWS_ARTICLES = rssArticles;
  rebuildCombinedNewsAndRender();

  if (showToast && window.app && typeof window.app.showToast === 'function') {
    window.app.showToast('Đã làm mới danh sách tin tức môi trường', 'success');
  }
}

function rebuildCombinedNewsAndRender() {
  const adminArticles = getStoredAdminArticles();
  const allArticles = [...adminArticles, ...RSS_NEWS_ARTICLES];

  renderHeroFeaturedNews(allArticles[0]);
  renderLeftColumnNews(allArticles.slice(1, 3));
  renderSideQuickNews(allArticles.slice(3, 6));
  renderRealNewsGrid(CURRENT_TOPIC_FILTER, allArticles);
}

function renderLeftColumnNews(articles) {
  const container = document.getElementById('leftColumnNewsList');
  if (!container) return;

  if (!articles || articles.length === 0) {
    container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-400">Chưa có tin cột trái.</div>`;
    return;
  }

  container.innerHTML = articles.map(a => `
    <a href="${a.link}" target="_blank" rel="noopener noreferrer"
      class="news-card block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
      <div class="h-32 overflow-hidden bg-slate-100 relative">
        <img src="${a.image}" alt="${a.title}" onerror="this.src='/images/logonienluan.jpg'" class="news-img w-full h-full object-cover">
        <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-eco-700/95 text-white text-[10px] font-bold">${a.source}</span>
      </div>
      <div class="p-3">
        <h4 class="text-xs font-extrabold text-slate-800 group-hover:text-eco-700 line-clamp-2 leading-snug">
          ${a.title}
        </h4>
      </div>
    </a>
  `).join('');
}

function renderHeroFeaturedNews(article) {
  const heroBox = document.getElementById('heroRealNewsCard');
  if (!heroBox) return;

  if (!article) {
    heroBox.innerHTML = `<div class="p-6 text-xs text-slate-400 h-80 flex items-center justify-center">Chưa có bài báo tiêu điểm hôm nay.</div>`;
    return;
  }

  const timeStr = article.pubDate
    ? new Date(article.pubDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Vừa cập nhật';

  heroBox.onclick = () => window.open(article.link, '_blank', 'noopener,noreferrer');
  heroBox.innerHTML = `
    <div class="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
      <img src="${article.image}" alt="${article.title}" onerror="this.src='/images/logonienluan.jpg'" class="news-img w-full h-full object-cover">
      <span class="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full bg-eco-700 text-white text-[10px] font-bold shadow">
        ${article.isAdminAdded ? 'Tin do Admin đăng' : 'Tiêu điểm'} • ${article.source}
      </span>
    </div>
    <div class="p-5 flex-1 flex flex-col justify-between">
      <div>
        <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-eco-700 transition-colors leading-snug">
          ${article.title}
        </h1>
        <p class="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
          ${article.summary || ''}
        </p>
      </div>
      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
        <span>🕒 ${timeStr}</span>
        <span class="font-bold text-eco-700">Đọc bài viết ↗</span>
      </div>
    </div>
  `;
}

function renderSideQuickNews(articles) {
  const container = document.getElementById('sideQuickNewsList');
  if (!container) return;

  if (!articles || articles.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400">Chưa có tin đọc nhanh.</p>`;
    return;
  }

  container.innerHTML = articles.map((a, i) => `
    <a href="${a.link}" target="_blank" rel="noopener noreferrer"
      class="${i > 0 ? 'pt-2.5' : ''} flex items-start gap-2.5 group">
      <img src="${a.image}" alt="${a.title}" onerror="this.src='/images/logonienluan.jpg'"
        class="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0">
      <div class="min-w-0 flex-1">
        <h4 class="text-xs font-bold text-slate-800 group-hover:text-eco-700 line-clamp-2 leading-snug">
          ${a.title}
        </h4>
        <span class="text-[10px] text-slate-400">${a.source}</span>
      </div>
    </a>
  `).join('');
}

function renderRealNewsGrid(keywordFilter = 'ALL', preloadedAll = null) {
  const grid = document.getElementById('newsArticlesGrid');
  if (!grid) return;

  const allArticles = preloadedAll || [...getStoredAdminArticles(), ...RSS_NEWS_ARTICLES];
  const baseList = allArticles.length > 6 ? allArticles.slice(6) : allArticles;
  const list = keywordFilter === 'ALL'
    ? baseList
    : allArticles.filter(a => {
        const text = `${a.title || ''} ${a.summary || ''}`.toLowerCase();
        return text.includes(keywordFilter.toLowerCase());
      });

  const finalItems = list.length > 0 ? list : baseList;

  if (finalItems.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-xs text-slate-400">Đang cập nhật tin bài...</div>`;
    return;
  }

  grid.innerHTML = finalItems.map(article => {
    const timeStr = article.pubDate
      ? new Date(article.pubDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';

    return `
      <a href="${article.link}" target="_blank" rel="noopener noreferrer"
        class="news-card bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">
        <div>
          <div class="relative h-44 overflow-hidden bg-slate-100">
            <img src="${article.image}" alt="${article.title}" onerror="this.src='/images/logonienluan.jpg'" class="news-img w-full h-full object-cover">
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-eco-800 shadow-sm">
              ${article.source}
            </span>
          </div>
          <div class="p-4">
            <div class="text-[11px] text-slate-400 mb-1.5">🕒 ${timeStr}</div>
            <h3 class="font-bold text-sm text-slate-800 group-hover:text-eco-700 transition-colors leading-snug line-clamp-2">
              ${article.title}
            </h3>
            <p class="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
              ${article.summary || ''}
            </p>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px]">
          <span class="text-slate-400">${article.isAdminAdded ? 'Cổng MT Xanh' : 'Nguồn báo chí'}</span>
          <span class="font-bold text-eco-700">Mở bài viết ↗</span>
        </div>
      </a>
    `;
  }).join('');
}

function filterRealNews(keyword) {
  CURRENT_TOPIC_FILTER = keyword;
  document.querySelectorAll('.news-src-btn').forEach(btn => {
    const active = btn.getAttribute('data-src') === keyword;
    btn.className = active
      ? 'news-src-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-eco-700 text-white shadow-sm'
      : 'news-src-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:border-eco-500';
  });
  renderRealNewsGrid(keyword);
}