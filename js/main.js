/**
 * main.js — Homepage Logic
 */

document.addEventListener('DOMContentLoaded', function () {
  injectLayout();
  renderFeaturedEvents();
  renderRecentEvents();
  updateStats();
});

/* ── Layout injection ─────────────────────────────────── */

function injectLayout() {
  /* Header */
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.outerHTML = renderHeader('home');

  /* Footer */
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.outerHTML = renderFooter();
}

/* ── Stats ────────────────────────────────────────────── */

function updateStats() {
  const s = SITE_CONFIG.stats;
  const evEl  = document.getElementById('stat-events');
  const phEl  = document.getElementById('stat-photos');
  const yrEl  = document.getElementById('stat-year');
  if (evEl)  evEl.textContent  = s.events;
  if (phEl)  phEl.textContent  = s.photos;
  if (yrEl)  yrEl.textContent  = s.established;
}

/* ── Featured Events ──────────────────────────────────── */

function renderFeaturedEvents() {
  const container = document.getElementById('featured-events');
  if (!container) return;

  const featured = EVENTS_DATA.filter(function (e) { return e.featured; });

  if (featured.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">No featured events available.</p>';
    return;
  }

  container.innerHTML = featured.map(renderFeaturedCard).join('');
}

/* ── Recent Events ────────────────────────────────────── */

function renderRecentEvents() {
  const container = document.getElementById('recent-events');
  if (!container) return;

  const recent = EVENTS_DATA.filter(function (e) { return e.recent; });

  if (recent.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">No recent events available.</p>';
    return;
  }

  container.innerHTML = recent.map(renderEventCard).join('');
}
