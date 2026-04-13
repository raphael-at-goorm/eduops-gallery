/**
 * components.js — Shared Rendering Utilities
 * 모든 페이지에서 공통으로 사용하는 컴포넌트 함수들
 */

/* ── Google Drive URL 변환 ──────────────────────────────── */

/**
 * Google Drive 공유 링크를 <img> 태그에서 바로 쓸 수 있는 URL로 변환합니다.
 *
 * 지원 형식:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing  ← 공유 링크
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?export=view&id=FILE_ID        ← 이미 변환된 형식
 *   그 외 일반 URL                                             ← 그대로 반환
 *
 * @param {string} url
 * @param {boolean} [fullSize=false]  true면 원본 화질 URL, false면 썸네일 URL
 * @returns {string}
 */
function driveToImg(url, fullSize) {
  if (!url) return '';

  // /file/d/FILE_ID/...  형식
  var m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!m) {
    // ?id=FILE_ID 또는 &id=FILE_ID 형식
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  }

  if (m) {
    var id = m[1];
    return fullSize
      ? 'https://drive.google.com/uc?export=view&id=' + id
      : 'https://lh3.googleusercontent.com/d/' + id;
  }

  return url; // Google Drive URL이 아니면 그대로 반환
}


/* ── SVG Icons ─────────────────────────────────────────── */

function iconCalendar() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="1.5" y="3" width="13" height="11" rx="1.5"/>
    <path d="M5 1.5v3M11 1.5v3M1.5 7.5h13"/>
  </svg>`;
}

function iconLocation() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M8 14.5S2.5 9.5 2.5 6a5.5 5.5 0 0111 0C13.5 9.5 8 14.5 8 14.5z"/>
    <circle cx="8" cy="6" r="1.8"/>
  </svg>`;
}

function iconZoom() {
  return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <circle cx="10" cy="10" r="6"/>
    <path d="M21 21l-4.35-4.35M13 10h-6M10 7v6"/>
  </svg>`;
}


/* ── Card Templates ────────────────────────────────────── */

/**
 * Featured event card (horizontal layout)
 * @param {Object} event
 * @returns {string} HTML
 */
function renderFeaturedCard(event) {
  return `
    <a href="event.html?slug=${event.slug}" class="featured-card" aria-label="${event.title} 갤러리 보기">
      <div class="featured-card__image-wrap">
        <img
          src="${driveToImg(event.coverImage)}"
          alt="${event.title}"
          loading="lazy"
        >
      </div>
      <div class="featured-card__body">
        <div class="featured-card__badge">
          <span class="featured-card__badge-dot"></span>
          ${escapeHtml(event.category)}
        </div>
        <h3 class="featured-card__title">${escapeHtml(event.title)}</h3>
        <p class="featured-card__description">${escapeHtml(event.description)}</p>
        <div class="featured-card__meta">
          <div class="featured-card__meta-item">
            ${iconCalendar()}
            ${escapeHtml(event.date)}
          </div>
          <div class="featured-card__meta-item">
            ${iconLocation()}
            ${escapeHtml(event.location)}
          </div>
        </div>
        <span class="featured-card__link">View Gallery →</span>
      </div>
    </a>
  `;
}

/**
 * Standard event card (grid item)
 * @param {Object} event
 * @returns {string} HTML
 */
function renderEventCard(event) {
  return `
    <a href="event.html?slug=${event.slug}" class="event-card" aria-label="${event.title} 갤러리 보기">
      <div class="event-card__image-wrap">
        <img
          src="${driveToImg(event.coverImage)}"
          alt="${event.title}"
          loading="lazy"
        >
      </div>
      <div class="event-card__body">
        <span class="event-card__category">${escapeHtml(event.category)}</span>
        <h3 class="event-card__title">${escapeHtml(event.title)}</h3>
        <p class="event-card__description">${escapeHtml(event.shortDescription)}</p>
        <div class="event-card__meta">
          <div class="event-card__meta-item">
            ${iconCalendar()}
            ${escapeHtml(event.date)}
          </div>
          <div class="event-card__meta-item">
            ${iconLocation()}
            ${escapeHtml(event.location)}
          </div>
        </div>
        <span class="event-card__link">View Gallery →</span>
      </div>
    </a>
  `;
}

/**
 * Empty state block (for event list)
 * @param {string} message
 * @returns {string} HTML
 */
function renderEmptyState(message) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">◎</div>
      <h3 class="empty-state__title">No events found</h3>
      <p class="empty-state__text">${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Header HTML (inserted into pages)
 * @param {string} activePage  'home' | 'events' | 'event'
 * @returns {string} HTML
 */
function renderHeader(activePage) {
  const brand = SITE_CONFIG.brand;
  const logoInner = brand.logoUrl
    ? `<img src="${driveToImg(brand.logoUrl)}" alt="${escapeHtml(brand.name)}" class="header__logo-img">`
    : `<span class="header__logo-mark" aria-hidden="true">PE</span>
          <div>
            <span class="header__logo-name">${escapeHtml(brand.name)}</span>
            <span class="header__logo-sub">${escapeHtml(brand.tagline)}</span>
          </div>`;
  return `
    <header class="header" role="banner">
      <div class="container header__inner">
        <a href="index.html" class="header__logo" aria-label="${brand.name} 홈">
          ${logoInner}
        </a>
        <nav class="header__nav" aria-label="주요 메뉴">
          <a href="index.html"  class="header__nav-link${activePage === 'home'   ? ' is-active' : ''}">Home</a>
          <a href="events.html" class="header__nav-link${activePage === 'events' ? ' is-active' : ''}">All Events</a>
        </nav>
      </div>
    </header>
  `;
}

/**
 * Footer HTML
 * @returns {string} HTML
 */
function renderFooter() {
  const brand = SITE_CONFIG.brand;

  const categoryLinks = SITE_CONFIG.footerCategories.map(c =>
    `<li><a href="events.html?category=${encodeURIComponent(c.value)}">${escapeHtml(c.label)}</a></li>`
  ).join('');

  const socialLinks = SITE_CONFIG.social.map(s =>
    `<li><a href="${s.url}" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`
  ).join('');

  return `
    <footer class="footer" role="contentinfo">
      <div class="container footer__inner">
        <div class="footer__brand">
          <a href="index.html" class="footer__logo" aria-label="${brand.name} 홈">
            ${brand.logoUrl
              ? `<img src="${driveToImg(brand.logoUrl)}" alt="${escapeHtml(brand.name)}" class="footer__logo-img">`
              : `<span class="footer__logo-mark" aria-hidden="true">PE</span>
            <div>
              <span class="footer__logo-name">${escapeHtml(brand.name)}</span>
              <span class="footer__logo-sub">${escapeHtml(brand.tagline)}</span>
            </div>`}
          </a>
          <p class="footer__description">${escapeHtml(brand.description)}</p>
        </div>
        <div class="footer__col">
          <h4 class="footer__heading">Quick Links</h4>
          <ul class="footer__list">
            <li><a href="index.html">Home</a></li>
            <li><a href="events.html">All Events</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4 class="footer__heading">Categories</h4>
          <ul class="footer__list">${categoryLinks}</ul>
        </div>
        <div class="footer__col">
          <h4 class="footer__heading">Connect</h4>
          <ul class="footer__list">${socialLinks}</ul>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <span>© ${brand.year} ${escapeHtml(brand.name)}. All rights reserved.</span>
          <div class="footer__bottom-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}


/* ── Utilities ─────────────────────────────────────────── */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extract Google Drive folder ID from a share URL
 * @param {string} url
 * @returns {string|null}
 */
function extractDriveFolderId(url) {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch image list from a public Google Drive folder
 * Requires SITE_CONFIG.googleDrive.apiKey to be set
 * @param {string} folderId
 * @returns {Promise<Array<{url: string, thumb: string, name: string}>>}
 */
async function fetchDriveImages(folderId) {
  const apiKey = SITE_CONFIG.googleDrive.apiKey;
  if (!apiKey) throw new Error('Google Drive API key not configured');

  const q      = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
  const fields = encodeURIComponent('files(id,name)');
  const endpoint = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=${fields}&pageSize=100&orderBy=name`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Drive API error ${res.status}`);
  }

  const data = await res.json();
  return (data.files || []).map(file => ({
    url:   `https://drive.google.com/uc?export=view&id=${file.id}`,
    thumb: `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`,
    name:  file.name
  }));
}

/**
 * Build gallery image list for an event.
 * Priority: Drive folder (if configured) → manual images array
 * @param {Object} event
 * @returns {Promise<Array<{url: string, thumb: string, name: string}>>}
 */
async function resolveEventImages(event) {
  const folderId = extractDriveFolderId(event.driveFolderUrl);

  if (folderId && SITE_CONFIG.googleDrive.apiKey) {
    try {
      const driveImages = await fetchDriveImages(folderId);
      if (driveImages.length > 0) return driveImages;
    } catch (err) {
      console.warn('[Drive] Could not load images:', err.message);
    }
  }

  /* Fallback: images array in data.js */
  return (event.images || []).map(url => ({ url, thumb: url, name: '' }));
}
