/**
 * event.js — Event Detail & Gallery Page Logic
 */

var galleryImages = [];   /* { url, thumb, name }[] */
var lightboxIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
  injectEventLayout();

  var slug  = getSlugFromUrl();
  var event = EVENTS_DATA.find(function (e) { return e.slug === slug; });

  if (!event) {
    renderNotFound();
    return;
  }

  renderEventHero(event);
  renderRelatedEvents(event);
  loadGallery(event);
});

/* ── Layout ───────────────────────────────────────────── */

function injectEventLayout() {
  var headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.outerHTML = renderHeader('event');

  var footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.outerHTML = renderFooter();
}

/* ── URL Helper ───────────────────────────────────────── */

function getSlugFromUrl() {
  return new URLSearchParams(window.location.search).get('slug') || '';
}

/* ── Event Not Found ──────────────────────────────────── */

function renderNotFound() {
  var main = document.getElementById('event-main');
  if (!main) return;
  main.innerHTML = `
    <div class="container" style="padding-top:80px;padding-bottom:80px;text-align:center;">
      <div style="font-size:2.5rem;opacity:.2;margin-bottom:20px;">◎</div>
      <h1 style="font-family:var(--font-display);font-size:1.6rem;margin-bottom:12px;">Event Not Found</h1>
      <p style="color:var(--color-text-secondary);margin-bottom:32px;">The event you are looking for does not exist or has been removed.</p>
      <a href="events.html" class="btn btn--primary">Browse All Events</a>
    </div>
  `;
}

/* ── Hero ─────────────────────────────────────────────── */

function renderEventHero(event) {
  /* Breadcrumbs */
  var bcEl = document.getElementById('event-breadcrumbs');
  if (bcEl) {
    bcEl.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumbs__sep" aria-hidden="true">›</span>
        <a href="events.html">All Events</a>
        <span class="breadcrumbs__sep" aria-hidden="true">›</span>
        <span aria-current="page">${escapeHtml(event.title)}</span>
      </nav>
    `;
  }

  /* Page title */
  document.title = escapeHtml(event.title) + ' — Prestige Events';

  /* Hero section */
  var heroEl = document.getElementById('event-hero');
  if (!heroEl) return;

  heroEl.innerHTML = `
    <div class="container">
      <div class="event-hero__inner">
        <div class="event-hero__content">
          <div class="event-hero__category">${escapeHtml(event.category)}</div>
          <h1 class="event-hero__title">${escapeHtml(event.title)}</h1>
          <p class="event-hero__subtitle">${escapeHtml(event.shortDescription)}</p>
          <div class="event-hero__meta">
            <div class="event-hero__meta-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" width="14" height="14">
                <rect x="1.5" y="3" width="13" height="11" rx="1.5"/>
                <path d="M5 1.5v3M11 1.5v3M1.5 7.5h13"/>
              </svg>
              ${escapeHtml(event.date)}
            </div>
            <div class="event-hero__meta-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" width="14" height="14">
                <path d="M8 14.5S2.5 9.5 2.5 6a5.5 5.5 0 0111 0C13.5 9.5 8 14.5 8 14.5z"/>
                <circle cx="8" cy="6" r="1.8"/>
              </svg>
              ${escapeHtml(event.location)}
            </div>
          </div>
          <p class="event-hero__description">${escapeHtml(event.description)}</p>
        </div>
        <div class="event-hero__cover">
          <img
            src="${driveToImg(event.coverImage)}"
            alt="${escapeHtml(event.title)} 대표 이미지"
            loading="eager"
          >
        </div>
      </div>
    </div>
  `;
}

/* ── Gallery ──────────────────────────────────────────── */

async function loadGallery(event) {
  var section = document.getElementById('gallery-section');
  if (!section) return;

  /* Show skeleton while loading */
  section.innerHTML = buildSkeletonHtml();

  var driveError = null;
  var folderId   = extractDriveFolderId(event.driveFolderUrl);

  /* Try Drive folder API first */
  if (folderId && SITE_CONFIG.googleDrive.apiKey) {
    try {
      var driveResult = await fetchDriveImages(folderId);
      if (driveResult.length > 0) {
        galleryImages = driveResult;
      } else {
        /* API 응답은 200이지만 파일 없음 → 권한 문제 */
        driveError = 'Drive API가 파일 목록을 반환하지 않았습니다. ' +
          '폴더 및 파일의 공유 설정을 확인하세요 (아래 안내 참고).';
        galleryImages = [];
      }
    } catch (err) {
      console.warn('[Drive] API 오류:', err.message);
      driveError    = err.message;
      galleryImages = [];
    }
  }

  /* Fallback: manual images[] array */
  if (!galleryImages || galleryImages.length === 0) {
    galleryImages = (event.images || []).map(function (url) {
      return { url: url, thumb: url, name: '' };
    });
    /* images[]에 항목이 있으면 Drive 오류는 숨김 */
    if (galleryImages.length > 0) driveError = null;
  }

  if (galleryImages.length === 0) {
    section.innerHTML = buildEmptyGalleryHtml(event, driveError);
    return;
  }

  section.innerHTML = buildGalleryHtml(galleryImages, event);
  attachGalleryListeners();
  initLightbox();
}

function buildSkeletonHtml() {
  var items = Array(8).fill(0).map(function (_, i) {
    return `<div class="gallery-skeleton${i === 0 ? ' gallery-skeleton--lg' : ''}"></div>`;
  }).join('');
  return `
    <div class="container">
      <div class="gallery-section__header">
        <h2 class="gallery-section__title" style="opacity:.3">Gallery</h2>
      </div>
      <div class="gallery-loading">${items}</div>
    </div>
  `;
}

function buildEmptyGalleryHtml(event, driveError) {
  var hasFolder = event.driveFolderUrl && event.driveFolderUrl.trim() !== '';
  var hasApiKey = SITE_CONFIG.googleDrive.apiKey && SITE_CONFIG.googleDrive.apiKey.trim() !== '';

  var msg;
  if (driveError) {
    msg = '<strong>Google Drive API 오류</strong> — ' + escapeHtml(driveError) +
          '<br><span style="font-size:12px;opacity:.7;">Google Cloud Console에서 Drive API 활성화 여부 및 API 키의 HTTP 참조자 제한을 확인하세요.' +
          ' 폴더와 파일이 <em>링크가 있는 모든 사용자 — 뷰어</em>로 공유되어 있어야 합니다.</span>';
  } else if (hasFolder && !hasApiKey) {
    msg = '<strong>Google Drive API key 필요</strong> — 어드민 › 연동 설정에서 googleDrive.apiKey 를 설정하면 폴더 이미지가 자동으로 표시됩니다.';
  } else {
    msg = '<strong>이미지가 없습니다</strong> — 어드민에서 이벤트의 images[] 배열에 이미지 URL을 추가하거나, Drive 폴더 URL을 입력하세요.';
  }

  return `
    <div class="container">
      <div class="gallery-section__header">
        <h2 class="gallery-section__title">Gallery</h2>
      </div>
      <div class="gallery-grid">
        <div class="drive-notice">${msg}</div>
      </div>
    </div>
  `;
}

function buildGalleryHtml(images, event) {
  var items = images.map(function (img, idx) {
    var isLarge = idx === 0;
    var thumbSrc = driveToImg(img.thumb || img.url);   // 썸네일: lh3 형식
    var fullSrc  = driveToImg(img.url);                // 라이트박스: lh3 형식 (uc?export=view는 브라우저에서 로드 불가)
    return `
      <div
        class="gallery-item${isLarge ? ' gallery-item--lg' : ''}"
        data-index="${idx}"
        data-full="${escapeHtml(fullSrc)}"
        role="button"
        tabindex="0"
        aria-label="이미지 ${idx + 1} 크게 보기"
      >
        <img
          src="${thumbSrc}"
          alt="${escapeHtml(img.name || (event.title + ' ' + (idx + 1)))}"
          loading="lazy"
        >
        <div class="gallery-item__overlay" aria-hidden="true">
          <span class="gallery-item__zoom">${iconZoom()}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="container">
      <div class="gallery-section__header">
        <h2 class="gallery-section__title">Gallery</h2>
        <span class="gallery-section__count">${images.length} photos</span>
      </div>
      <div class="gallery-grid" id="gallery-grid">${items}</div>
    </div>
  `;
}

function attachGalleryListeners() {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.addEventListener('click', function (e) {
    var item = e.target.closest('.gallery-item');
    if (!item) return;
    openLightbox(parseInt(item.dataset.index, 10));
  });

  grid.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var item = e.target.closest('.gallery-item');
      if (!item) return;
      e.preventDefault();
      openLightbox(parseInt(item.dataset.index, 10));
    }
  });
}


/* ── Lightbox ─────────────────────────────────────────── */

function initLightbox() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () { shiftLightbox(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { shiftLightbox(1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', handleLightboxKey);
}

function openLightbox(index) {
  var lb = document.getElementById('lightbox');
  if (!lb || galleryImages.length === 0) return;

  lightboxIndex = index;
  updateLightboxImage();
  lb.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('is-open');
  document.body.style.overflow = '';
}

function shiftLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  var img     = document.getElementById('lb-img');
  var counter = document.getElementById('lb-counter');
  var image   = galleryImages[lightboxIndex];

  if (img) {
    img.src = driveToImg(image.url); // 라이트박스: lh3 형식
    img.alt = image.name || ('Image ' + (lightboxIndex + 1));
  }
  if (counter) {
    counter.textContent = (lightboxIndex + 1) + ' / ' + galleryImages.length;
  }
}

function handleLightboxKey(e) {
  var lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('is-open')) return;

  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   shiftLightbox(-1);
  if (e.key === 'ArrowRight')  shiftLightbox(1);
}


/* ── Related Events ───────────────────────────────────── */

function renderRelatedEvents(currentEvent) {
  var container = document.getElementById('related-events');
  if (!container) return;

  var related = EVENTS_DATA.filter(function (e) {
    return e.slug !== currentEvent.slug &&
      (e.category === currentEvent.category || e.year === currentEvent.year);
  }).slice(0, 3);

  if (related.length === 0) {
    var section = document.getElementById('related-section');
    if (section) section.style.display = 'none';
    return;
  }

  container.innerHTML = related.map(renderEventCard).join('');
}
