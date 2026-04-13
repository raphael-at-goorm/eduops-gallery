/**
 * admin.js — Admin Panel Logic
 * GitHub API를 통해 config.js / data.js를 읽고 쓰는 SPA 어드민
 */

/* ══════════════════════════════════════════════════════════
   0. Constants
══════════════════════════════════════════════════════════ */

var ADMIN_PIN = 'hiddensinger8!';

/* ══════════════════════════════════════════════════════════
   1. State
══════════════════════════════════════════════════════════ */

var S = {
  token:      '',
  owner:      '',
  repo:       '',
  branch:     'main',
  config:     null,   // SITE_CONFIG 사본
  events:     null,   // EVENTS_DATA 사본
  configSha:  '',
  dataSha:    '',
  dirty:      false,
  view:       'settings-brand',
  editId:     null    // 편집 중인 이벤트 ID (null = 새 이벤트)
};

/* ══════════════════════════════════════════════════════════
   2. GitHub API
══════════════════════════════════════════════════════════ */

function apiUrl(path) {
  return 'https://api.github.com/repos/' + S.owner + '/' + S.repo + '/' + path;
}

function apiHeaders() {
  return {
    'Authorization': 'token ' + S.token,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
}

async function ghGet(path) {
  var res = await fetch(apiUrl(path), { headers: apiHeaders() });
  if (!res.ok) {
    var err = await res.json().catch(function() { return {}; });
    throw new Error(err.message || 'HTTP ' + res.status);
  }
  return res.json();
}

async function ghPut(path, content, sha, message) {
  var body = {
    message: message || 'Update via Admin Panel',
    content: utf8ToB64(content),
    branch:  S.branch
  };
  if (sha) body.sha = sha;

  var res = await fetch(apiUrl(path), {
    method:  'PUT',
    headers: apiHeaders(),
    body:    JSON.stringify(body)
  });
  var data = await res.json();
  if (!res.ok) {
    if (res.status === 409) throw new Error('충돌: 파일이 외부에서 변경되었습니다. 페이지를 새로고침하세요.');
    throw new Error(data.message || 'HTTP ' + res.status);
  }
  return data;
}

function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
}

/* ══════════════════════════════════════════════════════════
   3. Data Parsing & Generation
══════════════════════════════════════════════════════════ */

function parseConfigJs(src) {
  try {
    var fn = new Function(src + '; return SITE_CONFIG;');
    return JSON.parse(JSON.stringify(fn()));
  } catch(e) {
    console.error('config.js 파싱 오류:', e);
    return null;
  }
}

function parseDataJs(src) {
  try {
    var fn = new Function(src + '; return EVENTS_DATA;');
    return JSON.parse(JSON.stringify(fn()));
  } catch(e) {
    console.error('data.js 파싱 오류:', e);
    return null;
  }
}

function generateConfigJs(cfg) {
  return (
    '/**\n' +
    ' * config.js — Site Configuration\n' +
    ' * Managed via Admin Panel (/admin.html)\n' +
    ' */\n\n' +
    'const SITE_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n'
  );
}

function generateDataJs(events) {
  return (
    '/**\n' +
    ' * data.js — Event Data\n' +
    ' * Managed via Admin Panel (/admin.html)\n' +
    ' */\n\n' +
    'const EVENTS_DATA = ' + JSON.stringify(events, null, 2) + ';\n'
  );
}

/* ══════════════════════════════════════════════════════════
   4. App Init & Auth
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  setupAuthScreen();

  document.getElementById('auth-submit').addEventListener('click', handleLogin);
  document.getElementById('auth-pin').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
  document.getElementById('deploy-btn').addEventListener('click', deployChanges);

  // Sidebar nav
  document.querySelectorAll('.sidebar-nav-item[data-view]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if ((S.view === 'event-edit') && S.editDirty) {
        if (!confirm('이벤트 편집 중 변경사항이 있습니다. 돌아가시겠습니까?')) return;
      }
      showView(btn.dataset.view);
    });
  });

  showAuthScreen();
});

function setupAuthScreen() {
  var savedToken = localStorage.getItem('admin_token');
  var savedRepo  = localStorage.getItem('admin_repo');
  var setupEl = document.getElementById('auth-setup');

  if (!savedToken || !savedRepo) {
    // First time: show token + repo fields
    if (setupEl) setupEl.style.display = 'block';
    prefillRepoField();
  }
  // Focus PIN field
  setTimeout(function() {
    var pin = document.getElementById('auth-pin');
    if (pin) pin.focus();
  }, 50);
}

function prefillRepoField() {
  var repoEl = document.getElementById('auth-repo');
  if (!repoEl) return;
  // Auto-detect repo from GitHub Pages URL
  var hostname = window.location.hostname;
  var pathname = window.location.pathname;
  if (hostname.endsWith('.github.io')) {
    var owner = hostname.replace('.github.io', '');
    var pathParts = pathname.split('/').filter(Boolean);
    if (owner && pathParts.length > 0) {
      repoEl.value = owner + '/' + pathParts[0];
    }
  }
  var savedRepo = localStorage.getItem('admin_repo');
  if (savedRepo) repoEl.value = savedRepo;
}

async function handleLogin() {
  var errEl = document.getElementById('auth-error');
  errEl.classList.remove('is-visible');

  var pin = document.getElementById('auth-pin').value;
  if (pin !== ADMIN_PIN) {
    errEl.textContent = 'PIN이 올바르지 않습니다.';
    errEl.classList.add('is-visible');
    return;
  }

  var savedToken = localStorage.getItem('admin_token');
  var savedRepo  = localStorage.getItem('admin_repo');

  if (savedToken && savedRepo) {
    var parts = savedRepo.split('/');
    if (parts.length === 2) {
      S.token = savedToken;
      S.owner = parts[0];
      S.repo  = parts[1];
      try { await loadData(); }
      catch(e) {
        errEl.textContent = '데이터 로드 실패: ' + e.message;
        errEl.classList.add('is-visible');
        S.token = S.owner = S.repo = '';
      }
      return;
    }
  }

  // First time: need token + repo
  var tokenEl  = document.getElementById('auth-token');
  var repoEl   = document.getElementById('auth-repo');
  var token    = tokenEl ? tokenEl.value.trim() : '';
  var repoRaw  = repoEl  ? repoEl.value.trim()  : '';
  var parts    = repoRaw.split('/');

  if (!token) {
    errEl.textContent = 'GitHub Token을 입력해주세요.';
    errEl.classList.add('is-visible');
    return;
  }
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    errEl.textContent = 'Repository 형식이 올바르지 않습니다. (예: owner/repo)';
    errEl.classList.add('is-visible');
    return;
  }

  S.token = token;
  S.owner = parts[0];
  S.repo  = parts[1];

  try {
    await loadData();
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_repo', repoRaw);
  } catch(e) {
    errEl.textContent = '로그인 실패: ' + e.message;
    errEl.classList.add('is-visible');
    S.token = S.owner = S.repo = '';
  }
}

function handleLogout() {
  if (S.dirty && !confirm('저장되지 않은 변경사항이 있습니다. 로그아웃 하시겠습니까?')) return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_repo');
  location.reload();
}

/* ══════════════════════════════════════════════════════════
   5. Data Loading
══════════════════════════════════════════════════════════ */

async function loadData() {
  showLoading('GitHub에서 데이터를 불러오는 중…');
  try {
    var cfgFile  = await ghGet('contents/js/config.js');
    var dataFile = await ghGet('contents/js/data.js');

    S.configSha = cfgFile.sha;
    S.dataSha   = dataFile.sha;

    S.config = parseConfigJs(b64ToUtf8(cfgFile.content));
    S.events = parseDataJs(b64ToUtf8(dataFile.content));

    if (!S.config) throw new Error('config.js를 파싱하지 못했습니다.');
    if (!S.events) throw new Error('data.js를 파싱하지 못했습니다.');

    // Ensure required keys exist (backwards compat)
    S.config.hero     = S.config.hero     || {};
    S.config.stats    = S.config.stats    || {};
    S.config.sections = S.config.sections || {};
    S.config.googleDrive    = S.config.googleDrive    || { apiKey: '' };
    S.config.footerCategories = S.config.footerCategories || [];
    S.config.social   = S.config.social   || [];

    hideLoading();
    showApp();
    showView('settings-brand');
  } catch(e) {
    hideLoading();
    throw e;
  }
}

/* ══════════════════════════════════════════════════════════
   6. View Router
══════════════════════════════════════════════════════════ */

var VIEW_TITLES = {
  'settings-brand':        '브랜드 &amp; 히어로',
  'settings-sections':     '섹션 텍스트',
  'settings-footer':       '푸터 &amp; 소셜',
  'settings-integrations': '연동 설정',
  'events':                '이벤트 관리',
  'event-edit':            '이벤트 편집'
};

function showView(view) {
  S.view = view;
  document.getElementById('topbar-title').innerHTML = VIEW_TITLES[view] || view;

  document.querySelectorAll('.sidebar-nav-item[data-view]').forEach(function(btn) {
    btn.classList.toggle('is-active', btn.dataset.view === view);
  });

  var content = document.getElementById('admin-content');
  switch(view) {
    case 'settings-brand':        content.innerHTML = renderSettingsBrand();     bindSettingsBrand();     break;
    case 'settings-sections':     content.innerHTML = renderSettingsSections();  bindSettingsSections();  break;
    case 'settings-footer':       content.innerHTML = renderSettingsFooter();    bindSettingsFooter();    break;
    case 'settings-integrations': content.innerHTML = renderSettingsIntegrations(); bindSettingsIntegrations(); break;
    case 'events':                content.innerHTML = renderEventsView();        bindEventsView();        break;
    case 'event-edit':            content.innerHTML = renderEventEditView();     bindEventEditView();     break;
  }
}

/* ══════════════════════════════════════════════════════════
   7. Settings — Brand & Hero
══════════════════════════════════════════════════════════ */

function renderSettingsBrand() {
  var b = S.config.brand || {};
  var h = S.config.hero  || {};
  var s = S.config.stats || {};
  return (
    card('브랜드', true,
      row(field('사이트 이름', inp('brand-name', b.name)),
          field('태그라인',    inp('brand-tagline', b.tagline))) +
      field('사이트 설명', textarea('brand-description', b.description)) +
      field('연도', inp('brand-year', b.year, 'text', '2025')) +
      field('로고 이미지 URL <span>(설정 시 텍스트 로고 대신 이미지 표시)</span>',
        '<div class="img-preview-row">' +
        '<img class="img-preview img-preview--logo" id="logo-img-preview" src="' + esc(driveToImg(b.logoUrl || '')) + '" alt=""' + (b.logoUrl ? '' : ' style="display:none"') + '>' +
        inp('brand-logoUrl', b.logoUrl) +
        '</div>' +
        '<p class="admin-hint">직접 URL 또는 Google Drive 공유 링크. 비워두면 텍스트 로고("PE")가 표시됩니다.</p>'
      )
    ) +
    card('히어로 섹션', true,
      field('라벨 텍스트 <span>(히어로 상단 소형 태그)</span>', inp('hero-label', h.label)) +
      field('메인 타이틀 <span>(줄바꿈: \\n 사용)</span>', inp('hero-title', h.title)) +
      field('설명 문구', textarea('hero-description', h.description)) +
      row(field('기본 버튼 텍스트', inp('hero-ctaPrimary', h.ctaPrimary)),
          field('보조 버튼 텍스트', inp('hero-ctaSecondary', h.ctaSecondary))) +
      field('히어로 이미지 URL',
        '<div class="img-preview-row">' +
        '<img class="img-preview" id="hero-img-preview" src="' + esc(driveToImg(h.image || '')) + '" alt="">' +
        inp('hero-image', h.image) +
        '</div>' +
        '<p class="admin-hint">직접 URL 또는 Google Drive 공유 이미지 링크 (https://drive.google.com/uc?export=view&amp;id=FILE_ID)</p>'
      ) +
      row(field('캡션 카드 제목', inp('hero-captionTitle', h.captionTitle)),
          field('캡션 카드 내용', inp('hero-captionText', h.captionText)))
    ) +
    card('통계 수치', true,
      row(field('이벤트 수', inp('stats-events', s.events, 'text', '6+')),
          field('사진 수',   inp('stats-photos', s.photos, 'text', '500+')),
          field('설립 연도', inp('stats-established', s.established, 'text', '2025')))
    )
  );
}

function bindSettingsBrand() {
  liveInput('brand-name',        function(v){ S.config.brand.name = v; });
  liveInput('brand-tagline',     function(v){ S.config.brand.tagline = v; });
  liveInput('brand-description', function(v){ S.config.brand.description = v; });
  liveInput('brand-year',        function(v){ S.config.brand.year = v; });
  liveInput('brand-logoUrl',     function(v){
    S.config.brand.logoUrl = v;
    var prev = document.getElementById('logo-img-preview');
    if (prev) {
      var converted = driveToImg(v);
      prev.src = converted;
      prev.style.display = converted ? '' : 'none';
    }
  });
  liveInput('hero-label',        function(v){ S.config.hero.label = v; });
  liveInput('hero-title',        function(v){ S.config.hero.title = v; });
  liveInput('hero-description',  function(v){ S.config.hero.description = v; });
  liveInput('hero-ctaPrimary',   function(v){ S.config.hero.ctaPrimary = v; });
  liveInput('hero-ctaSecondary', function(v){ S.config.hero.ctaSecondary = v; });
  liveInput('hero-image',        function(v){
    S.config.hero.image = v;
    var prev = document.getElementById('hero-img-preview');
    if (prev) prev.src = driveToImg(v);
  });
  liveInput('hero-captionTitle', function(v){ S.config.hero.captionTitle = v; });
  liveInput('hero-captionText',  function(v){ S.config.hero.captionText = v; });
  liveInput('stats-events',      function(v){ S.config.stats.events = v; });
  liveInput('stats-photos',      function(v){ S.config.stats.photos = v; });
  liveInput('stats-established', function(v){ S.config.stats.established = v; });
  bindCardToggles();
}

/* ══════════════════════════════════════════════════════════
   8. Settings — Section Texts
══════════════════════════════════════════════════════════ */

function renderSettingsSections() {
  var sec = S.config.sections || {};
  return (
    card('Featured Events 섹션', true,
      row(field('제목',    inp('sec-featuredTitle',    sec.featuredTitle)),
          field('부제목',  inp('sec-featuredSubtitle', sec.featuredSubtitle)),
          field('"전체 보기" 링크 텍스트', inp('sec-featuredViewAll', sec.featuredViewAll)))
    ) +
    card('Recent Events 섹션', true,
      row(field('제목',    inp('sec-recentTitle',    sec.recentTitle)),
          field('부제목',  inp('sec-recentSubtitle', sec.recentSubtitle)),
          field('"전체 보기" 링크 텍스트', inp('sec-recentBrowseAll', sec.recentBrowseAll)))
    ) +
    card('하단 CTA 배너', true,
      field('제목', inp('sec-ctaTitle', sec.ctaTitle)) +
      field('본문', textarea('sec-ctaText', sec.ctaText)) +
      field('버튼 텍스트', inp('sec-ctaButton', sec.ctaButton))
    )
  );
}

function bindSettingsSections() {
  var keys = ['featuredTitle','featuredSubtitle','featuredViewAll','recentTitle','recentSubtitle','recentBrowseAll','ctaTitle','ctaText','ctaButton'];
  keys.forEach(function(k) {
    liveInput('sec-' + k, function(v){ S.config.sections[k] = v; });
  });
  bindCardToggles();
}

/* ══════════════════════════════════════════════════════════
   9. Settings — Footer & Social
══════════════════════════════════════════════════════════ */

function renderSettingsFooter() {
  return (
    card('소셜 링크', true, renderSocialList()) +
    card('푸터 카테고리', true, renderCategoryList())
  );
}

function renderSocialList() {
  var items = (S.config.social || []).map(function(s, i) {
    return (
      '<div class="list-item" data-idx="' + i + '">' +
        '<div class="list-item__inputs">' +
          '<input class="list-item__input social-label" data-idx="' + i + '" placeholder="이름 (예: Instagram)" value="' + esc(s.label) + '">' +
          '<input class="list-item__input social-url"   data-idx="' + i + '" placeholder="URL" value="' + esc(s.url) + '">' +
        '</div>' +
        '<button class="list-item__remove social-remove" data-idx="' + i + '" aria-label="삭제">×</button>' +
      '</div>'
    );
  }).join('');
  return (
    '<div class="list-editor" id="social-list">' + items + '</div>' +
    '<button class="list-add-btn" id="social-add">+ 소셜 링크 추가</button>'
  );
}

function renderCategoryList() {
  var items = (S.config.footerCategories || []).map(function(c, i) {
    return (
      '<div class="list-item" data-idx="' + i + '">' +
        '<div class="list-item__inputs">' +
          '<input class="list-item__input cat-label" data-idx="' + i + '" placeholder="표시 이름" value="' + esc(c.label) + '">' +
          '<input class="list-item__input cat-value" data-idx="' + i + '" placeholder="필터 값 (예: Gala)" value="' + esc(c.value) + '">' +
        '</div>' +
        '<button class="list-item__remove cat-remove" data-idx="' + i + '" aria-label="삭제">×</button>' +
      '</div>'
    );
  }).join('');
  return (
    '<div class="list-editor" id="cat-list">' + items + '</div>' +
    '<button class="list-add-btn" id="cat-add">+ 카테고리 추가</button>'
  );
}

function bindSettingsFooter() {
  // Social
  delegate('social-list', '.social-label', 'input', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.social[i].label = e.target.value;
    markDirty();
  });
  delegate('social-list', '.social-url', 'input', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.social[i].url = e.target.value;
    markDirty();
  });
  delegate('social-list', '.social-remove', 'click', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.social.splice(i, 1);
    markDirty();
    refreshFooterView();
  });
  on('social-add', 'click', function() {
    S.config.social.push({ label: '', url: '#' });
    markDirty();
    refreshFooterView();
  });

  // Categories
  delegate('cat-list', '.cat-label', 'input', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.footerCategories[i].label = e.target.value;
    markDirty();
  });
  delegate('cat-list', '.cat-value', 'input', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.footerCategories[i].value = e.target.value;
    markDirty();
  });
  delegate('cat-list', '.cat-remove', 'click', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    S.config.footerCategories.splice(i, 1);
    markDirty();
    refreshFooterView();
  });
  on('cat-add', 'click', function() {
    S.config.footerCategories.push({ label: '', value: '' });
    markDirty();
    refreshFooterView();
  });

  bindCardToggles();
}

function refreshFooterView() {
  var content = document.getElementById('admin-content');
  if (content) {
    content.innerHTML = renderSettingsFooter();
    bindSettingsFooter();
  }
}

/* ══════════════════════════════════════════════════════════
   10. Settings — Integrations
══════════════════════════════════════════════════════════ */

function renderSettingsIntegrations() {
  var gd = S.config.googleDrive || {};
  return card('Google Drive 연동', true,
    field('API 키',
      '<input id="drive-apikey" type="password" class="admin-input" value="' + esc(gd.apiKey || '') + '" placeholder="AIzaSy…" autocomplete="off">' +
      '<p class="admin-hint">' +
        '<a href="https://console.cloud.google.com/" target="_blank" rel="noopener" style="color:#2563EB;">Google Cloud Console</a>에서 Drive API를 활성화하고 API 키를 발급하세요.' +
        '<br>각 이벤트의 <strong>Drive 폴더 URL</strong>을 입력하면 이미지를 자동으로 불러옵니다.' +
      '</p>'
    )
  );
}

function bindSettingsIntegrations() {
  liveInput('drive-apikey', function(v){ S.config.googleDrive.apiKey = v; });
  bindCardToggles();
}

/* ══════════════════════════════════════════════════════════
   11. Events View
══════════════════════════════════════════════════════════ */

function renderEventsView() {
  var cards = S.events.map(function(ev) {
    return (
      '<div class="event-admin-card">' +
        '<div class="event-admin-card__thumb">' +
          '<img src="' + esc(driveToImg(ev.coverImage || '')) + '" alt="' + esc(ev.title) + '" loading="lazy">' +
        '</div>' +
        '<div class="event-admin-card__body">' +
          '<div class="event-admin-card__badges">' +
            '<span class="badge badge--cat">'  + esc(ev.category) + '</span>' +
            (ev.featured ? '<span class="badge badge--feat">Featured</span>' : '') +
            (ev.recent   ? '<span class="badge badge--rec">Recent</span>'   : '') +
          '</div>' +
          '<div class="event-admin-card__title">' + esc(ev.title) + '</div>' +
          '<div class="event-admin-card__date">'  + esc(ev.date)  + '</div>' +
          '<div class="event-admin-card__actions">' +
            '<button class="btn-admin btn-admin--ghost btn-admin--sm ev-edit" data-id="' + ev.id + '">편집</button>' +
            '<button class="btn-admin btn-admin--danger btn-admin--sm ev-delete" data-id="' + ev.id + '">삭제</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="events-admin-header">' +
      '<h2>이벤트 관리</h2>' +
      '<button class="btn-admin btn-admin--primary" id="ev-new">+ 새 이벤트</button>' +
    '</div>' +
    '<div class="events-admin-grid">' + (cards || '<p style="color:var(--color-text-muted)">이벤트가 없습니다.</p>') + '</div>'
  );
}

function bindEventsView() {
  on('ev-new', 'click', function() {
    S.editId = null;
    showView('event-edit');
  });
  document.querySelectorAll('.ev-edit').forEach(function(btn) {
    btn.addEventListener('click', function() {
      S.editId = parseInt(btn.dataset.id, 10);
      showView('event-edit');
    });
  });
  document.querySelectorAll('.ev-delete').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = parseInt(btn.dataset.id, 10);
      var ev = S.events.find(function(e){ return e.id === id; });
      if (!ev) return;
      if (!confirm('"' + ev.title + '"을 삭제하시겠습니까?')) return;
      S.events = S.events.filter(function(e){ return e.id !== id; });
      markDirty();
      showView('events');
      showToast('이벤트가 삭제되었습니다.', 'success');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   12. Event Edit View
══════════════════════════════════════════════════════════ */

function getEditingEvent() {
  if (S.editId === null) {
    return {
      id: nextId(),
      slug: '',
      title: '',
      shortDescription: '',
      description: '',
      date: '',
      location: '',
      category: '',
      year: String(new Date().getFullYear()),
      coverImage: '',
      featured: false,
      recent: false,
      driveFolderUrl: '',
      images: []
    };
  }
  var found = S.events.find(function(e){ return e.id === S.editId; });
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

function nextId() {
  if (!S.events.length) return 1;
  return Math.max.apply(null, S.events.map(function(e){ return e.id; })) + 1;
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

var _editEv = null;

function renderEventEditView() {
  _editEv = getEditingEvent();
  if (!_editEv) return '<p>이벤트를 찾을 수 없습니다.</p>';
  var isNew = S.editId === null;

  var imgList = (_editEv.images || []).map(function(url, i) {
    return (
      '<div class="image-list__item">' +
        '<img src="' + esc(driveToImg(url)) + '" alt="">' +
        '<button class="image-list__remove img-remove" data-idx="' + i + '" aria-label="삭제">×</button>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="edit-header">' +
      '<button class="edit-back" id="edit-back">← 목록으로</button>' +
      '<h2>' + (isNew ? '새 이벤트' : esc(_editEv.title || '이벤트 편집')) + '</h2>' +
      '<div class="edit-save-bar">' +
        '<button class="btn-admin btn-admin--primary" id="edit-save">저장</button>' +
      '</div>' +
    '</div>' +

    card('기본 정보', true,
      field('이벤트 제목', inp('ev-title', _editEv.title)) +
      field('짧은 설명 <span>(카드 부제목)</span>', inp('ev-shortDesc', _editEv.shortDescription)) +
      field('상세 설명', textarea('ev-description', _editEv.description, 4)) +
      row(field('날짜 <span>(예: March 15, 2025)</span>', inp('ev-date', _editEv.date)),
          field('장소', inp('ev-location', _editEv.location))) +
      row(field('카테고리 <span>(예: Gala, Conference…)</span>', inp('ev-category', _editEv.category)),
          field('연도', inp('ev-year', _editEv.year))) +
      field('URL 슬러그 <span>(영문, 소문자, 하이픈)</span>',
        '<input id="ev-slug" class="admin-input" value="' + esc(_editEv.slug) + '" placeholder="annual-charity-gala">'
      )
    ) +

    card('대표 이미지', true,
      field('커버 이미지 URL <span>(Google Drive 공유 링크 또는 직접 URL)</span>',
        '<div class="img-preview-row">' +
          '<img class="img-preview" id="cover-preview" src="' + esc(driveToImg(_editEv.coverImage || '')) + '" alt="">' +
          inp('ev-coverImage', _editEv.coverImage) +
        '</div>' +
        '<p class="admin-hint">Google Drive 파일 공유 링크(https://drive.google.com/file/d/…/view)를 그대로 붙여넣으면 자동 변환됩니다.</p>'
      )
    ) +

    card('노출 설정', true,
      '<div style="display:flex;gap:32px;">' +
        toggle('ev-featured', _editEv.featured, 'Featured (홈 피처드 섹션에 표시)') +
        toggle('ev-recent',   _editEv.recent,   'Recent (홈 최근 이벤트 섹션에 표시)') +
      '</div>'
    ) +

    card('갤러리 이미지', true,
      field('Google Drive 폴더 URL',
        '<input id="ev-driveUrl" class="admin-input" value="' + esc(_editEv.driveFolderUrl || '') + '" placeholder="https://drive.google.com/drive/folders/…">' +
        '<p class="admin-hint">폴더를 "링크가 있는 모든 사용자 — 뷰어"로 공유 후 URL 입력. API 키 설정 시 자동 로드됩니다.</p>'
      ) +
      '<div class="admin-label" style="margin-bottom:8px;">갤러리 이미지 URL 목록 <span>(Drive 폴더 미설정 시 / API 키 없을 때 사용)</span></div>' +
      '<p class="admin-hint" style="margin-bottom:8px;">Google Drive 파일 공유 링크(https://drive.google.com/file/d/…/view)를 직접 추가할 수 있습니다.</p>' +
      '<div class="image-list" id="image-list">' + imgList + '</div>' +
      '<div class="image-add-row">' +
        '<input id="img-url-input" class="admin-input" placeholder="https://… 이미지 URL">' +
        '<button class="btn-admin btn-admin--ghost btn-admin--sm" id="img-add-btn">추가</button>' +
      '</div>'
    )
  );
}

function bindEventEditView() {
  on('edit-back', 'click', function() {
    showView('events');
  });

  on('edit-save', 'click', function() {
    collectEventForm();
    if (!_editEv.title.trim()) { showToast('제목을 입력하세요.', 'error'); return; }
    if (!_editEv.slug.trim()) { _editEv.slug = toSlug(_editEv.title); }

    if (S.editId === null) {
      S.events.push(_editEv);
    } else {
      var idx = S.events.findIndex(function(e){ return e.id === S.editId; });
      if (idx !== -1) S.events[idx] = _editEv;
    }
    S.editId = _editEv.id;
    markDirty();
    showToast('저장되었습니다. (배포 버튼을 눌러야 실제 사이트에 반영됩니다)', 'success');
    showView('events');
  });

  // Auto-generate slug from title
  on('ev-title', 'input', function() {
    var titleEl = document.getElementById('ev-title');
    var slugEl  = document.getElementById('ev-slug');
    if (slugEl && titleEl && !slugEl.dataset.manuallyEdited) {
      slugEl.value = toSlug(titleEl.value);
    }
  });
  on('ev-slug', 'input', function() {
    var el = document.getElementById('ev-slug');
    if (el) el.dataset.manuallyEdited = '1';
  });

  // Cover image preview
  on('ev-coverImage', 'input', function() {
    var src = document.getElementById('ev-coverImage').value;
    var prev = document.getElementById('cover-preview');
    if (prev) prev.src = driveToImg(src);
  });

  // Image list: remove
  delegate('image-list', '.img-remove', 'click', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    _editEv.images.splice(i, 1);
    refreshImageList();
  });

  // Image list: add
  on('img-add-btn', 'click', addImageUrl);
  on('img-url-input', 'keydown', function(e) { if (e.key === 'Enter') addImageUrl(); });

  bindCardToggles();
}

function addImageUrl() {
  var inp = document.getElementById('img-url-input');
  if (!inp) return;
  var url = inp.value.trim();
  if (!url) return;
  _editEv.images = _editEv.images || [];
  _editEv.images.push(url);
  inp.value = '';
  refreshImageList();
}

function refreshImageList() {
  var listEl = document.getElementById('image-list');
  if (!listEl) return;
  listEl.innerHTML = (_editEv.images || []).map(function(url, i) {
    return (
      '<div class="image-list__item">' +
        '<img src="' + esc(driveToImg(url)) + '" alt="">' +
        '<button class="image-list__remove img-remove" data-idx="' + i + '" aria-label="삭제">×</button>' +
      '</div>'
    );
  }).join('');
  // Re-bind remove buttons
  delegate('image-list', '.img-remove', 'click', function(e) {
    var i = parseInt(e.target.dataset.idx, 10);
    _editEv.images.splice(i, 1);
    refreshImageList();
  });
}

function collectEventForm() {
  _editEv.title            = val('ev-title');
  _editEv.shortDescription = val('ev-shortDesc');
  _editEv.description      = val('ev-description');
  _editEv.date             = val('ev-date');
  _editEv.location         = val('ev-location');
  _editEv.category         = val('ev-category');
  _editEv.year             = val('ev-year');
  _editEv.slug             = val('ev-slug') || toSlug(_editEv.title);
  _editEv.coverImage       = val('ev-coverImage');
  _editEv.featured         = checked('ev-featured');
  _editEv.recent           = checked('ev-recent');
  _editEv.driveFolderUrl   = val('ev-driveUrl');
}

/* ══════════════════════════════════════════════════════════
   13. Deploy (Publish to GitHub)
══════════════════════════════════════════════════════════ */

async function deployChanges() {
  if (!S.dirty) return;
  var btn = document.getElementById('deploy-btn');
  btn.disabled = true;
  btn.textContent = '배포 중…';

  showLoading('GitHub에 변경사항을 배포하는 중…');

  try {
    var configContent = generateConfigJs(S.config);
    var dataContent   = generateDataJs(S.events);

    var msg = 'Update via Admin Panel';

    // Commit config.js
    var cfgRes = await ghPut('contents/js/config.js', configContent, S.configSha, msg + ': site config');
    S.configSha = cfgRes.content.sha;

    // Commit data.js
    var dataRes = await ghPut('contents/js/data.js', dataContent, S.dataSha, msg + ': event data');
    S.dataSha = dataRes.content.sha;

    markClean();
    hideLoading();
    showToast('✓ 배포 완료! 약 1분 후 사이트에 반영됩니다.', 'success');
  } catch(e) {
    hideLoading();
    showToast('배포 실패: ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.disabled = !S.dirty;
    btn.textContent = '▲ 배포하기';
  }
}

/* ══════════════════════════════════════════════════════════
   14. UI State Helpers
══════════════════════════════════════════════════════════ */

function markDirty() {
  S.dirty = true;
  var badge = document.getElementById('dirty-badge');
  var btn   = document.getElementById('deploy-btn');
  if (badge) badge.classList.add('is-visible');
  if (btn)   btn.disabled = false;
}

function markClean() {
  S.dirty = false;
  var badge = document.getElementById('dirty-badge');
  var btn   = document.getElementById('deploy-btn');
  if (badge) badge.classList.remove('is-visible');
  if (btn)   btn.disabled = true;
}

function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display   = 'none';
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('admin-app').style.display   = 'flex';
  var sbName = document.getElementById('sb-brand-name');
  if (sbName && S.config.brand) sbName.textContent = S.config.brand.name || 'Prestige Events';
}

function showLoading(msg) {
  var el = document.getElementById('admin-loading');
  var txt = document.getElementById('loading-text');
  if (el)  el.style.display  = 'flex';
  if (txt) txt.textContent = msg || '불러오는 중…';
}

function hideLoading() {
  var el = document.getElementById('admin-loading');
  if (el) el.style.display = 'none';
}

var _toastTimer = null;
function showToast(msg, type) {
  var el = document.getElementById('admin-toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'admin-toast admin-toast--' + (type || 'success') + ' is-visible';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { el.classList.remove('is-visible'); }, 3500);
}

/* ══════════════════════════════════════════════════════════
   15. HTML Builders (mini template helpers)
══════════════════════════════════════════════════════════ */

function card(title, open, content) {
  return (
    '<div class="admin-card' + (open ? ' is-open' : '') + '">' +
      '<div class="admin-card__header">' +
        '<span class="admin-card__title">' + title + '</span>' +
        '<span class="admin-card__toggle">▾</span>' +
      '</div>' +
      '<div class="admin-card__body">' + content + '</div>' +
    '</div>'
  );
}

function field(label, inputHtml) {
  return '<div class="admin-field"><label class="admin-label">' + label + '</label>' + inputHtml + '</div>';
}

function row() {
  return '<div class="admin-row">' + Array.from(arguments).join('') + '</div>';
}

function inp(id, value, type, placeholder) {
  return (
    '<input id="' + id + '" class="admin-input" type="' + (type || 'text') + '"' +
    ' value="' + esc(value || '') + '"' +
    (placeholder ? ' placeholder="' + esc(placeholder) + '"' : '') +
    '>'
  );
}

function textarea(id, value, rows) {
  return '<textarea id="' + id + '" class="admin-textarea" rows="' + (rows || 3) + '">' + esc(value || '') + '</textarea>';
}

function toggle(id, checked, label) {
  return (
    '<div class="admin-toggle-row">' +
      '<label class="admin-toggle">' +
        '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="admin-toggle__track"></span>' +
      '</label>' +
      '<label class="admin-toggle-label" for="' + id + '">' + label + '</label>' +
    '</div>'
  );
}

/**
 * Google Drive 공유 링크 → <img> 직접 사용 가능한 URL로 변환
 * (components.js와 동일 로직 — admin.js는 독립 로드)
 */
function driveToImg(url, fullSize) {
  if (!url) return '';
  var m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
          url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) {
    var id = m[1];
    return fullSize
      ? 'https://drive.google.com/uc?export=view&id=' + id
      : 'https://lh3.googleusercontent.com/d/' + id;
  }
  return url;
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════════════════════════
   16. DOM Event Utilities
══════════════════════════════════════════════════════════ */

function on(id, event, handler) {
  var el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

function delegate(containerId, selector, event, handler) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener(event, function(e) {
    var target = e.target.closest(selector);
    if (target) handler({ target: target, originalEvent: e });
  });
}

function liveInput(id, setter) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', function() {
    setter(el.value);
    markDirty();
  });
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

function checked(id) {
  var el = document.getElementById(id);
  return el ? el.checked : false;
}

function bindCardToggles() {
  document.querySelectorAll('.admin-card__header').forEach(function(header) {
    header.addEventListener('click', function() {
      header.closest('.admin-card').classList.toggle('is-open');
    });
  });
}
