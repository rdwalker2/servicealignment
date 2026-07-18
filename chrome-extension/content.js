/* ═══════════════════════════════════════════════════════
   Teamtailor Signal Board — LinkedIn Content Script
   Injects Signal Board intelligence on LinkedIn pages
   ═══════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const PANEL_ID = 'tt-signal-board-panel';
  const BADGE_ID = 'tt-signal-badge';
  let currentUrl = location.href;
  let debounceTimer = null;

  // ── URL Detection ──

  function getPageType() {
    const path = location.pathname;
    if (path.match(/^\/company\/[^/]+\/?$/)) return 'company';
    if (path.match(/^\/in\/[^/]+\/?$/)) return 'profile';
    if (path.includes('/search/results/people')) return 'search';
    return null;
  }

  function getCompanySlug() {
    const m = location.pathname.match(/^\/company\/([^/]+)/);
    return m ? m[1] : null;
  }

  function getProfileSlug() {
    const m = location.pathname.match(/^\/in\/([^/]+)/);
    return m ? m[1] : null;
  }

  // ── Extract Company Domain from LinkedIn ──

  function extractCompanyDomain() {
    // Try "About this company" section for website
    const links = document.querySelectorAll('a[href]');
    for (const a of links) {
      const href = a.href || '';
      if (a.closest('.org-top-card') || a.closest('.org-page-details')) {
        if (href.includes('http') && !href.includes('linkedin.com')) {
          try {
            const url = new URL(href);
            return url.hostname.replace(/^www\./, '');
          } catch {}
        }
      }
    }

    // Try the company info sidebar
    const aboutSection = document.querySelector('.org-top-card-summary-info-list');
    if (aboutSection) {
      const text = aboutSection.textContent || '';
      const domainMatch = text.match(/([a-z0-9-]+\.[a-z]{2,})/i);
      if (domainMatch) return domainMatch[1].toLowerCase();
    }

    return null;
  }

  // ── Extract Profile Company ──

  function extractProfileCompany() {
    // Get current company from headline
    const headline = document.querySelector('.text-body-medium.break-words');
    const experience = document.querySelector('#experience');
    const topCard = document.querySelector('.pv-top-card');

    let company = null;
    let title = null;
    let name = null;

    // Name
    const nameEl = document.querySelector('h1.text-heading-xlarge');
    if (nameEl) name = nameEl.textContent.trim();

    // Title from headline
    const headlineEl = document.querySelector('.text-body-medium.break-words');
    if (headlineEl) title = headlineEl.textContent.trim();

    // Company — try experience section first
    const expItems = document.querySelectorAll('.pvs-list .pvs-entity--padded');
    if (expItems.length > 0) {
      const firstExp = expItems[0];
      const spans = firstExp.querySelectorAll('span[aria-hidden="true"]');
      if (spans.length >= 2) {
        company = spans[1]?.textContent?.trim();
      }
    }

    // Fallback: company link in top card
    if (!company) {
      const companyLink = document.querySelector('.pv-top-card .pv-top-card-v2-ctas a[href*="/company/"]');
      if (companyLink) {
        company = companyLink.textContent.trim();
      }
    }

    return { name, title, company };
  }

  // ── Create Signal Board Panel ──

  function createPanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="tt-panel-header">
        <div class="tt-logo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>Signal Board</span>
        </div>
        <button class="tt-close" id="tt-close-btn">×</button>
      </div>
      <div class="tt-panel-body" id="tt-panel-body">
        <div class="tt-loading">
          <div class="tt-spinner"></div>
          <span>Looking up account...</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById('tt-close-btn').addEventListener('click', () => {
      panel.classList.add('tt-collapsed');
    });

    return panel;
  }

  // ── Render Company Intel ──

  function renderCompanyIntel(panel, data) {
    const body = panel.querySelector('#tt-panel-body');
    if (!data.found) {
      body.innerHTML = `
        <div class="tt-empty">
          <div class="tt-empty-icon">🔍</div>
          <div class="tt-empty-text">Not in Signal Board</div>
          <div class="tt-empty-sub">This company hasn't triggered any signals yet</div>
        </div>
      `;
      return;
    }

    const { account, signals, contacts, committeeGaps } = data;
    const signalCount = signals?.length || 0;
    const contactCount = contacts?.length || 0;
    const owner = account?.sf_account_owner || 'Unassigned';
    const ats = account?.current_ats || '—';
    const tier = account?.firmographic_tier || '—';

    // ISP Score badge
    const ispScore = account?.isp_score;
    const ispColor = ispScore >= 70 ? '#10b981' : ispScore >= 40 ? '#f59e0b' : '#6b7280';

    // Committee gap labels
    const ROLE_LABELS = {
      decision_maker: 'Decision Maker',
      champion: 'Champion',
      end_user: 'End User',
      evaluator: 'Evaluator',
      technical_buyer: 'Tech / Ops',
      economic_buyer: 'Finance',
    };

    const gapBadges = (committeeGaps || []).map(r =>
      `<span class="tt-gap-badge">${ROLE_LABELS[r] || r}</span>`
    ).join('');

    const filledBadges = Object.keys(ROLE_LABELS)
      .filter(r => !(committeeGaps || []).includes(r))
      .map(r => `<span class="tt-filled-badge">✓ ${ROLE_LABELS[r]}</span>`)
      .join('');

    // Recent signals
    const signalList = signals.slice(0, 5).map(s => {
      const icon = s.signal_source === 'rb2b' ? '🌐' : s.signal_source === 'linkedin' ? '👤' : s.signal_source === 'job_board' ? '💼' : '📊';
      const ago = timeAgo(s.detected_at);
      return `<div class="tt-signal-row">
        <span class="tt-signal-icon">${icon}</span>
        <span class="tt-signal-name">${s.signal_name}</span>
        <span class="tt-signal-ago">${ago}</span>
      </div>`;
    }).join('');

    // Contact list
    const contactList = contacts.slice(0, 5).map(c => {
      const initials = (c.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2);
      return `<div class="tt-contact-row">
        <div class="tt-contact-avatar">${initials}</div>
        <div class="tt-contact-info">
          <div class="tt-contact-name">${c.full_name || c.email}</div>
          <div class="tt-contact-title">${c.title || '—'}</div>
        </div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <div class="tt-account-header">
        ${ispScore ? `<div class="tt-isp" style="background:${ispColor}">${ispScore}</div>` : ''}
        <div class="tt-account-meta">
          <div class="tt-account-owner">${owner}</div>
          <div class="tt-account-details">${signalCount} signals · ${contactCount} contacts · ATS: ${ats}</div>
        </div>
      </div>

      ${committeeGaps?.length > 0 ? `
        <div class="tt-section">
          <div class="tt-section-label">BUYING COMMITTEE GAPS</div>
          <div class="tt-gap-list">${gapBadges}</div>
          ${filledBadges ? `<div class="tt-filled-list">${filledBadges}</div>` : ''}
        </div>
      ` : `
        <div class="tt-section">
          <div class="tt-section-label">BUYING COMMITTEE</div>
          <div class="tt-filled-list">${filledBadges || '<span class="tt-empty-sub">No contacts mapped</span>'}</div>
        </div>
      `}

      ${signalList ? `
        <div class="tt-section">
          <div class="tt-section-label">RECENT SIGNALS</div>
          ${signalList}
        </div>
      ` : ''}

      ${contactList ? `
        <div class="tt-section">
          <div class="tt-section-label">CONTACTS</div>
          ${contactList}
        </div>
      ` : ''}

      <a href="https://teamtailor-gtm-workspace-production.up.railway.app/team/audience/rippling" target="_blank" class="tt-open-link">
        Open in Signal Board →
      </a>
    `;
  }

  // ── Render Profile Intel ──

  function renderProfileIntel(panel, profileData, domainData) {
    const body = panel.querySelector('#tt-panel-body');
    const { name, title, company } = profileData;

    const inSignalBoard = domainData?.found;
    const owner = domainData?.account?.sf_account_owner || 'Unassigned';
    const committeeGaps = domainData?.committeeGaps || [];

    const ROLE_OPTIONS = [
      { id: 'decision_maker', label: 'Decision Maker', icon: '👔' },
      { id: 'champion', label: 'Champion', icon: '⭐' },
      { id: 'evaluator', label: 'Evaluator', icon: '🔍' },
      { id: 'end_user', label: 'End User', icon: '👤' },
      { id: 'technical_buyer', label: 'Tech / Ops', icon: '⚙️' },
      { id: 'economic_buyer', label: 'Finance', icon: '💰' },
    ];

    const roleButtons = ROLE_OPTIONS.map(r => {
      const isGap = committeeGaps.includes(r.id);
      return `<button class="tt-role-btn ${isGap ? 'tt-role-gap' : ''}" data-role="${r.id}">
        <span>${r.icon}</span>
        <span>${r.label}</span>
        ${isGap ? '<span class="tt-gap-dot"></span>' : ''}
      </button>`;
    }).join('');

    body.innerHTML = `
      <div class="tt-profile-header">
        <div class="tt-profile-name">${name || 'Unknown'}</div>
        <div class="tt-profile-title">${title || '—'}</div>
        ${company ? `<div class="tt-profile-company">${company}</div>` : ''}
        ${inSignalBoard ? `<div class="tt-profile-owner">Owner: ${owner}</div>` : ''}
      </div>

      <div class="tt-section">
        <div class="tt-section-label">ADD AS BUYING COMMITTEE ROLE</div>
        <div class="tt-section-sub">Select a role to add this contact to the Signal Board</div>
        <div class="tt-role-grid">${roleButtons}</div>
      </div>

      <div id="tt-add-status" class="tt-add-status"></div>
    `;

    // Wire up role buttons
    body.querySelectorAll('.tt-role-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const role = btn.dataset.role;
        const statusEl = document.getElementById('tt-add-status');
        statusEl.innerHTML = '<div class="tt-spinner-sm"></div> Adding to Signal Board...';
        statusEl.className = 'tt-add-status tt-status-loading';

        const slug = getProfileSlug();
        const linkedinUrl = `https://www.linkedin.com/in/${slug}`;

        chrome.runtime.sendMessage({
          type: 'ADD_TO_SIGNAL_BOARD',
          data: {
            name: name || slug,
            title: title || '',
            linkedinUrl,
            companyName: company || '',
            companyDomain: domainData?.domain || '',
            committeeRole: role,
          },
        }, (resp) => {
          if (resp?.success) {
            statusEl.innerHTML = '✅ Added to Signal Board';
            statusEl.className = 'tt-add-status tt-status-success';
            btn.classList.add('tt-role-selected');
          } else {
            statusEl.innerHTML = '❌ ' + (resp?.error || 'Failed to add');
            statusEl.className = 'tt-add-status tt-status-error';
          }
        });
      });
    });
  }

  // ── Time Ago ──

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return `${Math.floor(days / 30)}mo`;
  }

  // ── Main Logic ──

  async function handlePage() {
    const pageType = getPageType();
    if (!pageType) return;

    // Wait a bit for LinkedIn to render
    await new Promise(r => setTimeout(r, 1500));

    if (pageType === 'company') {
      const panel = createPanel();
      const domain = extractCompanyDomain();
      const companySlug = getCompanySlug();

      if (domain) {
        chrome.runtime.sendMessage({ type: 'LOOKUP_DOMAIN', domain }, (data) => {
          renderCompanyIntel(panel, data || { found: false });
        });
      } else {
        // Try using company name from the page
        const nameEl = document.querySelector('h1.org-top-card-summary__title span');
        const companyName = nameEl?.textContent?.trim();
        if (companyName) {
          // Use company name to search — basic domain guess
          const guessedDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
          chrome.runtime.sendMessage({ type: 'LOOKUP_DOMAIN', domain: guessedDomain }, (data) => {
            renderCompanyIntel(panel, data || { found: false });
          });
        } else {
          renderCompanyIntel(panel, { found: false });
        }
      }
    }

    if (pageType === 'profile') {
      const panel = createPanel();
      const profileData = extractProfileCompany();
      const slug = getProfileSlug();

      // Look up this person's company in our DB
      if (profileData.company) {
        const guessedDomain = profileData.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
        chrome.runtime.sendMessage({ type: 'LOOKUP_DOMAIN', domain: guessedDomain }, (domainData) => {
          renderProfileIntel(panel, profileData, domainData);
        });
      } else {
        renderProfileIntel(panel, profileData, { found: false });
      }
    }
  }

  // ── URL Change Detection (LinkedIn is SPA) ──

  function checkUrlChange() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handlePage, 1000);
    }
  }

  // Watch for SPA navigation
  const observer = new MutationObserver(checkUrlChange);
  observer.observe(document.body, { childList: true, subtree: true });

  // Also check periodically (backup)
  setInterval(checkUrlChange, 2000);

  // Initial run
  handlePage();
})();
