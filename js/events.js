/**
 * events.js — All Events Page Logic
 */

var currentFilters = { search: '', year: '', category: '' };

document.addEventListener('DOMContentLoaded', function () {
  injectEventsLayout();
  populateFilters();
  readUrlParams();
  applyFilters();
});

/* ── Layout ───────────────────────────────────────────── */

function injectEventsLayout() {
  var headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.outerHTML = renderHeader('events');

  var footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.outerHTML = renderFooter();
}

/* ── Filters init ─────────────────────────────────────── */

function populateFilters() {
  var yearSelect = document.getElementById('filter-year');
  if (yearSelect) {
    var years = Array.from(new Set(EVENTS_DATA.map(function (e) { return String(e.year); }))).sort().reverse();
    years.forEach(function (y) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
  }

  var catSelect = document.getElementById('filter-category');
  if (catSelect) {
    var cats = Array.from(new Set(EVENTS_DATA.map(function (e) { return e.category; }))).sort();
    cats.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.toLowerCase();
      opt.textContent = c;
      catSelect.appendChild(opt);
    });
  }

  /* Bind events */
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentFilters.search = this.value.toLowerCase().trim();
      applyFilters();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', function () {
      currentFilters.year = this.value;
      applyFilters();
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', function () {
      currentFilters.category = this.value;
      applyFilters();
    });
  }
}

/* ── Read URL params ──────────────────────────────────── */

function readUrlParams() {
  var params = new URLSearchParams(window.location.search);

  var paramCat = params.get('category');
  if (paramCat) {
    currentFilters.category = paramCat.toLowerCase();
    var catSelect = document.getElementById('filter-category');
    if (catSelect) catSelect.value = paramCat.toLowerCase();
  }

  var paramYear = params.get('year');
  if (paramYear) {
    currentFilters.year = paramYear;
    var yearSelect = document.getElementById('filter-year');
    if (yearSelect) yearSelect.value = paramYear;
  }

  var paramSearch = params.get('search');
  if (paramSearch) {
    currentFilters.search = paramSearch.toLowerCase().trim();
    var searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = paramSearch;
  }
}

/* ── Filter & Render ──────────────────────────────────── */

function applyFilters() {
  var filtered = EVENTS_DATA.filter(function (event) {
    var matchSearch = !currentFilters.search ||
      event.title.toLowerCase().includes(currentFilters.search) ||
      event.shortDescription.toLowerCase().includes(currentFilters.search) ||
      event.location.toLowerCase().includes(currentFilters.search) ||
      event.category.toLowerCase().includes(currentFilters.search);

    var matchYear = !currentFilters.year ||
      String(event.year) === currentFilters.year;

    var matchCat = !currentFilters.category ||
      event.category.toLowerCase() === currentFilters.category;

    return matchSearch && matchYear && matchCat;
  });

  renderEvents(filtered);
}

function renderEvents(filtered) {
  var container = document.getElementById('events-list');
  if (!container) return;

  var countEl = document.getElementById('events-count');
  if (countEl) {
    countEl.textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '');
  }

  if (filtered.length === 0) {
    container.innerHTML = renderEmptyState('Try adjusting your search or filter criteria.');
    return;
  }

  container.innerHTML = filtered.map(renderEventCard).join('');
}
