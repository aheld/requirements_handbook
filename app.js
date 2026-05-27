/* Requirements & User Story Handbook — vanilla SPA behavior */
(function () {
  'use strict';

  var SECTIONS = [
    { id: 'start',     title: 'Welcome' },
    { id: 'reqs',      title: 'Requirements 101' },
    { id: 'smart',     title: 'SMART & the Top 10' },
    { id: 'verbs',     title: 'Verbs to use (and avoid)' },
    { id: 'anatomy',   title: 'Anatomy of a story' },
    { id: 'lifecycle', title: 'Life of a story' },
    { id: 'tips',      title: 'Writing tips' },
    { id: 'invest',    title: 'The INVEST check' },
    { id: 'ac',        title: 'Acceptance criteria' },
    { id: 'splitting', title: 'Splitting & mapping' },
    { id: 'questions', title: 'Finding hidden stories' },
    { id: 'glossary',  title: 'Glossary' }
  ];
  var IDS = SECTIONS.map(function (s) { return s.id; });

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- Theme toggle ---------- */
  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    lsSet('ush-theme', dark ? 'dark' : 'light');
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = dark ? SUN : MOON;
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function initTheme() {
    var dark = lsGet('ush-theme') === 'dark';
    applyTheme(dark);
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(!isDark);
    });
  }

  /* ---------- Routing ---------- */
  function renderPageNav(id) {
    var nav = document.getElementById('page-nav');
    var idx = IDS.indexOf(id);
    var prev = idx > 0 ? SECTIONS[idx - 1] : null;
    var next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;
    var html = '';
    if (prev) {
      html += '<button class="page-nav-btn" data-go="' + prev.id + '">' +
        '<span class="dir">← Previous</span>' +
        '<span class="label">' + prev.title + '</span></button>';
    } else {
      html += '<div style="flex:1"></div>';
    }
    if (next) {
      html += '<button class="page-nav-btn next" data-go="' + next.id + '">' +
        '<span class="dir">Next →</span>' +
        '<span class="label">' + next.title + '</span></button>';
    } else {
      html += '<div style="flex:1"></div>';
    }
    nav.innerHTML = html;
  }

  function go(id) {
    if (IDS.indexOf(id) === -1) id = 'start';

    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.toggle('active', pages[i].getAttribute('data-id') === id);
    }

    var links = document.querySelectorAll('.nav-link');
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('active', links[j].getAttribute('data-go') === id);
    }

    renderPageNav(id);
    lsSet('ush-active', id);
    if (window.location.hash.replace('#', '') !== id) {
      history.replaceState(null, '', '#' + id);
    }

    var main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function initialId() {
    var hash = window.location.hash.replace('#', '');
    if (hash && IDS.indexOf(hash) !== -1) return hash;
    var stored = lsGet('ush-active');
    if (stored && IDS.indexOf(stored) !== -1) return stored;
    return 'start';
  }

  function initRouting() {
    document.body.addEventListener('click', function (e) {
      var el = e.target.closest('[data-go]');
      if (!el) return;
      e.preventDefault();
      go(el.getAttribute('data-go'));
    });
    window.addEventListener('hashchange', function () {
      var h = window.location.hash.replace('#', '');
      if (h && IDS.indexOf(h) !== -1) go(h);
    });
    go(initialId());
  }

  /* ---------- Accordions ---------- */
  function initAccordions() {
    document.body.addEventListener('click', function (e) {
      var head = e.target.closest('.accordion-head');
      if (!head) return;
      var acc = head.parentElement;
      var open = acc.classList.toggle('open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- INVEST checklist ---------- */
  var INVEST_ITEMS = [
    { letter: 'I', name: 'Independent', desc: 'The story stands on its own — you can build, test, and ship it without other stories holding it hostage.' },
    { letter: 'N', name: 'Negotiable',  desc: "It's a conversation starter, not a contract. Details get refined together, not chiseled in stone." },
    { letter: 'V', name: 'Valuable',    desc: 'Someone — a user, a customer, the business — is measurably better off when this ships.' },
    { letter: 'E', name: 'Estimable',   desc: "The team understands it well enough to make a sizing call. If you can't estimate it, you can't plan it." },
    { letter: 'S', name: 'Small',       desc: "It fits comfortably in a single sprint. If it doesn't, split it." },
    { letter: 'T', name: 'Testable',    desc: "There's a clear way to prove it's done. Acceptance criteria do this work." }
  ];

  function loadInvest() {
    try { var raw = lsGet('ush-invest'); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }

  function initInvest() {
    var root = document.getElementById('invest-root');
    if (!root) return;
    var state = loadInvest();

    var list = document.createElement('div');
    list.className = 'checklist';

    INVEST_ITEMS.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'check-item' + (state[item.letter] ? ' checked' : '');
      row.setAttribute('role', 'checkbox');
      row.setAttribute('aria-checked', state[item.letter] ? 'true' : 'false');
      row.setAttribute('tabindex', '0');
      row.innerHTML =
        '<div class="letter">' + item.letter + '</div>' +
        '<div class="check-body"><span class="name">' + item.name + '</span>' +
        '<span class="desc">' + item.desc + '</span></div>';

      function toggle() {
        state[item.letter] = !state[item.letter];
        lsSet('ush-invest', JSON.stringify(state));
        row.classList.toggle('checked', !!state[item.letter]);
        row.setAttribute('aria-checked', state[item.letter] ? 'true' : 'false');
        updateProgress();
      }
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
      list.appendChild(row);
    });

    var progress = document.createElement('div');
    progress.className = 'check-progress';

    root.appendChild(list);
    root.appendChild(progress);

    function updateProgress() {
      var checked = INVEST_ITEMS.filter(function (i) { return state[i.letter]; }).length;
      var pct = (checked / INVEST_ITEMS.length) * 100;
      progress.innerHTML =
        '<span>' + checked + ' of ' + INVEST_ITEMS.length + ' checked</span>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        (checked > 0 ? '<button class="reset-btn" type="button">Reset</button>' : '');
      var reset = progress.querySelector('.reset-btn');
      if (reset) {
        reset.addEventListener('click', function () {
          state = {};
          lsSet('ush-invest', JSON.stringify(state));
          var rows = list.querySelectorAll('.check-item');
          for (var k = 0; k < rows.length; k++) {
            rows[k].classList.remove('checked');
            rows[k].setAttribute('aria-checked', 'false');
          }
          updateProgress();
        });
      }
    }
    updateProgress();
  }

  /* ---------- Boot ---------- */
  function init() {
    initTheme();
    initAccordions();
    initInvest();
    initRouting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
