/**
 * main.js — Homepage Logic
 */

document.addEventListener('DOMContentLoaded', function () {
  var brand = SITE_CONFIG.brand || {};
  if (brand.name) document.title = brand.name + (brand.tagline ? ' — ' + brand.tagline : '');

  injectLayout();
  updateHero();
  updateStats();
  updateSections();
  updateCta();
  renderFeaturedEvents();
  renderRecentEvents();
});

/* ── Layout injection ─────────────────────────────────── */

function injectLayout() {
  var headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.outerHTML = renderHeader('home');

  var footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.outerHTML = renderFooter();
}

/* ── Hero ─────────────────────────────────────────────── */

function updateHero() {
  var h = SITE_CONFIG.hero;
  if (!h) return;

  setText('hero-label', h.label);
  setHtml('hero-title', h.title ? h.title.replace(/\n/g, '<br>') : '');
  setText('hero-description', h.description);

  var ctaPrimary = document.getElementById('hero-cta-primary');
  if (ctaPrimary) ctaPrimary.textContent = h.ctaPrimary;

  var ctaSecondary = document.getElementById('hero-cta-secondary');
  if (ctaSecondary) ctaSecondary.textContent = h.ctaSecondary;

  var img = document.getElementById('hero-image');
  if (img && h.image) img.src = driveToImg(h.image);

  setText('hero-caption-title', h.captionTitle);
  setText('hero-caption-text', h.captionText);
}

/* ── Stats ────────────────────────────────────────────── */

function updateStats() {
  var s = SITE_CONFIG.stats;
  if (!s) return;
  setText('stat-events', s.events);
  setText('stat-photos', s.photos);
  setText('stat-year',   s.established);
}

/* ── Section texts ────────────────────────────────────── */

function updateSections() {
  var sec = SITE_CONFIG.sections;
  if (!sec) return;

  setText('featured-title',    sec.featuredTitle);
  setText('featured-subtitle', sec.featuredSubtitle);

  var featuredLink = document.getElementById('featured-viewall');
  if (featuredLink && sec.featuredViewAll) {
    featuredLink.innerHTML = escapeHtml(sec.featuredViewAll) + ' <span aria-hidden="true">→</span>';
  }

  setText('recent-title',    sec.recentTitle);
  setText('recent-subtitle', sec.recentSubtitle);

  var recentLink = document.getElementById('recent-browseall');
  if (recentLink && sec.recentBrowseAll) {
    recentLink.innerHTML = escapeHtml(sec.recentBrowseAll) + ' <span aria-hidden="true">→</span>';
  }
}

/* ── CTA Band ─────────────────────────────────────────── */

function updateCta() {
  var sec = SITE_CONFIG.sections;
  if (!sec) return;
  setText('cta-title', sec.ctaTitle);
  setText('cta-text',  sec.ctaText);

  var ctaBtn = document.getElementById('cta-button');
  if (ctaBtn && sec.ctaButton) ctaBtn.textContent = sec.ctaButton;
}

/* ── Featured Events ──────────────────────────────────── */

function renderFeaturedEvents() {
  var container = document.getElementById('featured-events');
  if (!container) return;

  var featured = EVENTS_DATA.filter(function (e) { return e.featured; });
  if (featured.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">No featured events.</p>';
    return;
  }
  container.innerHTML = featured.map(renderFeaturedCard).join('');
}

/* ── Recent Events ────────────────────────────────────── */

function renderRecentEvents() {
  var container = document.getElementById('recent-events');
  if (!container) return;

  var recent = EVENTS_DATA.filter(function (e) { return e.recent; });
  if (recent.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">No recent events.</p>';
    return;
  }
  container.innerHTML = recent.map(renderEventCard).join('');
}

/* ── DOM helpers ──────────────────────────────────────── */

function setText(id, value) {
  var el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function setHtml(id, value) {
  var el = document.getElementById(id);
  if (el && value != null) el.innerHTML = value;
}
