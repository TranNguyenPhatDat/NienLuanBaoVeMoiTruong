// Logic riêng cho trang chuyên mục (chuyen-muc.html)

function playCategoryVideo(videoId, title) {
  const player = document.getElementById('catYoutubePlayer');
  const titleEl = document.getElementById('catYoutubeTitle');
  const directEl = document.getElementById('catYoutubeDirect');

  if (player) player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  if (titleEl) titleEl.textContent = title;
  if (directEl) directEl.href = `https://www.youtube.com/watch?v=${videoId}`;

  document.querySelectorAll('.cat-yt-item').forEach(item => {
    const isActive = item.dataset.vid === videoId;
    item.classList.toggle('bg-slate-800', isActive);
    item.classList.toggle('border-emerald-500', isActive);
    item.classList.toggle('border-slate-800', !isActive);
  });
}

function renderCategoryPage() {
  const catalog = window.MAGAZINE_CATALOG || {};
  const params = new URLSearchParams(window.location.search);

  const catKey = catalog[params.get('cat')] ? params.get('cat') : 'topic-water';
  const catObj = catalog[catKey];
  const subKeys = Object.keys(catObj.subs);
  const subKey = catObj.subs[params.get('sub')] ? params.get('sub') : subKeys[0];
  const subObj = catObj.subs[subKey];

  document.title = `${subObj.title} - MT Xanh & Cuộc Sống`;

  // Breadcrumb & Tiêu đề
  const breadcrumbCat = document.getElementById('catBreadcrumbParent');
  const breadcrumbSub = document.getElementById('catBreadcrumbSub');
  const headingEl = document.getElementById('catPageTitle');
  const descEl = document.getElementById('catPageDesc');

  if (breadcrumbCat) breadcrumbCat.textContent = catObj.label;
  if (breadcrumbSub) breadcrumbSub.textContent = subObj.title;
  if (headingEl) headingEl.textContent = subObj.title;
  if (descEl) descEl.textContent = subObj.desc;

  // Các nút chuyển nhanh giữa các mục con trong cùng chuyên mục
  const subTabsEl = document.getElementById('catSubTabs');
  if (subTabsEl) {
    subTabsEl.innerHTML = Object.entries(catObj.subs).map(([k, info]) => {
      const active = k === subKey;
      return `
        <a href="chuyen-muc.html?cat=${encodeURIComponent(catKey)}&sub=${encodeURIComponent(k)}"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            active
              ? 'bg-eco-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-eco-500 hover:text-eco-700'
          }">
          ${info.title}
        </a>
      `;
    }).join('');
  }

  // Render danh sách bài báo thật
  const articlesEl = document.getElementById('catArticlesGrid');
  if (articlesEl) {
    articlesEl.innerHTML = subObj.articles.map(art => `
      <a href="${art.link}" target="_blank" rel="noopener noreferrer"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-eco-400 transition-all overflow-hidden flex flex-col justify-between group">
        <div>
          <div class="relative h-48 bg-slate-100 overflow-hidden">
            <img src="${art.image}" alt="${art.title}" onerror="this.src='/images/logonienluan.jpg'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
              ${art.source}
            </span>
          </div>
          <div class="p-4">
            <div class="text-[11px] text-slate-400 mb-1">🕒 ${art.time}</div>
            <h3 class="text-sm font-extrabold text-slate-800 group-hover:text-eco-700 leading-snug">
              ${art.title}
            </h3>
            <p class="text-xs text-slate-600 mt-2 leading-relaxed">
              ${art.summary}
            </p>
          </div>
        </div>
        <div class="px-4 py-2.5 border-t border-slate-100 text-[11px] font-bold text-eco-700 flex items-center justify-between">
          <span>Đọc bài báo gốc</span>
          <span>↗</span>
        </div>
      </a>
    `).join('');
  }

  // Render Video YouTube thật của chuyên mục
  const videos = subObj.videos || [];
  const videoBlock = document.getElementById('catVideoSection');
  if (videoBlock && videos.length > 0) {
    const first = videos[0];
    playCategoryVideo(first.id, first.title);

    const listEl = document.getElementById('catYoutubeList');
    if (listEl) {
      listEl.innerHTML = videos.map((v, idx) => `
        <div data-vid="${v.id}"
          onclick="playCategoryVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')"
          class="cat-yt-item cursor-pointer p-2.5 rounded-xl border ${idx === 0 ? 'bg-slate-800 border-emerald-500' : 'bg-slate-900/80 border-slate-800'} hover:bg-slate-800 transition-colors flex items-center gap-3">
          <div class="relative w-28 h-16 rounded-lg overflow-hidden bg-black shrink-0">
            <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" class="w-full h-full object-cover">
            <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">${v.duration}</span>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">${v.title}</h4>
            <p class="text-[11px] text-emerald-400 mt-1">${v.channel}</p>
          </div>
        </div>
      `).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', renderCategoryPage);