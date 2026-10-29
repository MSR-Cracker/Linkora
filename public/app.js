const root = document.getElementById('page-root');
const year = document.getElementById('year');
const i18n = window.LinkoraI18n;
const tr = (value) => i18n.translate(value);
const composerDraft = { mode: 'note', note: '', file: null, expiry: '86400', burn: false, passwordEnabled: false, password: '' };
let lastCreatedDrop = null;
let lastShareView = null;
let sharePasswordDraft = '';
if (year) year.textContent = new Date().getFullYear();

function copyAllowed(target) {
  const element = target instanceof Element ? target : window.getSelection()?.anchorNode?.parentElement;
  return Boolean(element?.closest('input, textarea, select, .note-content, .result-link, .copy-buffer, [data-copy-allowed]'));
}

document.addEventListener('copy', (event) => { if (!copyAllowed(event.target)) event.preventDefault(); });
document.addEventListener('cut', (event) => { if (!copyAllowed(event.target)) event.preventDefault(); });
document.addEventListener('selectstart', (event) => { if (!copyAllowed(event.target)) event.preventDefault(); });
document.addEventListener('contextmenu', (event) => {
  const element = event.target instanceof Element ? event.target : null;
  if (element && !element.closest('input, textarea, select, a, .note-content, .result-link, [data-copy-allowed]')) event.preventDefault();
});
document.addEventListener('dragstart', (event) => {
  const element = event.target instanceof Element ? event.target : null;
  if (element && !element.closest('a, button, input, textarea, .note-content, [data-copy-allowed]')) event.preventDefault();
});

const icons = {
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 15h8M8 18h5"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 14h8M8 17h6"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.4 3l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3A5 5 0 0 0 10.6 21l1.7-1.7"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
};

function toast(message) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  region.appendChild(item);
  setTimeout(() => item.remove(), 3000);
}

function formatBytes(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = Number(bytes), index = 0;
  while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
  return `${i18n.formatNumber(Number(size.toFixed(index === 0 || size >= 10 ? 0 : 1)))} ${units[index]}`;
}

function timeUntil(iso) {
  const difference = new Date(iso).getTime() - Date.now();
  if (difference <= 0) return tr('Expired');
  const units = [['day', 86400000], ['hour', 3600000], ['minute', 60000]];
  const [unit, size] = units.find(([, value]) => difference >= value) || units[2];
  const count = Math.max(1, Math.ceil(difference / size));
  return new Intl.RelativeTimeFormat(i18n.getLocale(), { numeric: 'auto' }).format(count, unit);
}

function dateLabel(iso) {
  return new Intl.DateTimeFormat(i18n.getLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function setupNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', tr(open ? 'Open navigation' : 'Close navigation'));
    nav.classList.toggle('open', !open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}
setupNav();

const pickerDialog = document.getElementById('picker-dialog');
const pickerOptions = document.getElementById('picker-options');
let pickerCloseTimer = null;

function closePicker(afterClose) {
  if (!pickerDialog?.open) { afterClose?.(); return; }
  clearTimeout(pickerCloseTimer);
  pickerDialog.classList.add('closing');
  pickerCloseTimer = setTimeout(() => {
    if (pickerDialog.open) pickerDialog.close();
    pickerDialog.classList.remove('closing');
    document.getElementById('language-trigger')?.setAttribute('aria-expanded', 'false');
    document.getElementById('expiry-picker')?.setAttribute('aria-expanded', 'false');
    afterClose?.();
  }, 180);
}

function showPicker(title, description, options, onSelect, footnote = '') {
  if (!pickerDialog || !pickerOptions) return;
  clearTimeout(pickerCloseTimer);
  pickerDialog.classList.remove('closing');
  document.getElementById('picker-title').textContent = tr(title);
  document.getElementById('picker-description').textContent = tr(description);
  document.getElementById('picker-overline').textContent = tr('LINKORA PREFERENCES');
  document.getElementById('picker-footnote').textContent = tr(footnote);
  pickerOptions.innerHTML = options.map((option) => `
    <button class="picker-option${option.selected ? ' selected' : ''}" type="button" data-picker-value="${escapeHtml(option.value)}" aria-pressed="${String(Boolean(option.selected))}">
      <span class="picker-option-mark" aria-hidden="true">${escapeHtml(option.mark)}</span>
      <span class="picker-option-copy"><strong>${escapeHtml(option.nativeLabel ? option.label : tr(option.label))}</strong><small>${escapeHtml(tr(option.detail))}</small></span>
      <span class="picker-option-check" aria-hidden="true">${option.selected ? '✓' : ''}</span>
    </button>`).join('');
  pickerOptions.querySelectorAll('[data-picker-value]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.pickerValue;
      closePicker(() => onSelect(value));
    });
  });
  document.getElementById('language-trigger')?.setAttribute('aria-expanded', String(title === 'Choose your language'));
  document.getElementById('expiry-picker')?.setAttribute('aria-expanded', String(title === 'Link expiration'));
  if (!pickerDialog.open) pickerDialog.showModal();
  (pickerDialog.querySelector('.picker-option[aria-pressed="true"]') || pickerDialog.querySelector('.picker-option'))?.focus({ preventScroll: true });
}

function openLanguagePicker() {
  const options = [
    { value: 'en', mark: 'EN', label: 'English', nativeLabel: true, detail: 'English language', selected: i18n.getLanguage() === 'en' },
    { value: 'ar', mark: 'ع', label: 'العربية', nativeLabel: true, detail: 'Arabic language', selected: i18n.getLanguage() === 'ar' },
    { value: 'id', mark: 'ID', label: 'Bahasa Indonesia', nativeLabel: true, detail: 'Indonesian language', selected: i18n.getLanguage() === 'id' },
  ];
  showPicker('Choose your language', 'Choose the language you want to use across Linkora.', options, (value) => i18n.setLanguage(value), 'Your device language is selected automatically on your first visit.');
}

function openExpiryPicker() {
  const expiry = document.getElementById('expiry');
  if (!expiry) return;
  const options = [
    { value: '3600', mark: '01', label: '1 hour', detail: 'Available for one hour', selected: expiry.value === '3600' },
    { value: '86400', mark: '24', label: '24 hours', detail: 'Available for one day', selected: expiry.value === '86400' },
    { value: '604800', mark: '07', label: '7 days', detail: 'Available for seven days', selected: expiry.value === '604800' },
  ];
  showPicker('Link expiration', 'Choose how long this share link stays available.', options, (value) => {
    expiry.value = value;
    expiry.dispatchEvent(new Event('change', { bubbles: true }));
    updateExpiryLabel();
  });
}

function updateExpiryLabel() {
  const expiry = document.getElementById('expiry');
  const label = document.getElementById('expiry-current');
  if (!expiry || !label) return;
  label.textContent = tr(expiry.options[expiry.selectedIndex]?.textContent || '24 hours');
}

document.getElementById('language-trigger')?.addEventListener('click', openLanguagePicker);
document.getElementById('picker-close')?.addEventListener('click', () => closePicker());
pickerDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closePicker(); });
pickerDialog?.addEventListener('click', (event) => { if (event.target === pickerDialog) closePicker(); });

function saveComposerDraft() {
  const note = document.getElementById('note-text');
  const expiry = document.getElementById('expiry');
  const burn = document.getElementById('burn-after-read');
  const passwordToggle = document.getElementById('password-toggle');
  const password = document.getElementById('password');
  if (note) composerDraft.note = note.value;
  if (expiry) composerDraft.expiry = expiry.value;
  if (burn) composerDraft.burn = burn.checked;
  if (passwordToggle) composerDraft.passwordEnabled = passwordToggle.checked;
  if (password) composerDraft.password = password.value;
}

function redrawForLanguage() {
  i18n.translateTree(document.body);
  const route = window.location.pathname;
  if (route === '/app' || route === '/app/') {
    saveComposerDraft();
    renderApp();
    return;
  }
  if (route === '/' || route === '') { renderHome(); return; }
  const match = route.match(/^\/s\/([A-Za-z0-9_-]{1,24})\/?$/);
  if (match) {
    const state = lastShareView;
    if (state?.id === match[1]) {
      if (state.type === 'drop') renderDrop(state.id, state.data);
      else if (state.type === 'gate') renderOpenGate(state.id, state.data);
      else if (state.type === 'password') {
        sharePasswordDraft = document.getElementById('share-password')?.value ?? sharePasswordDraft;
        renderPasswordGate(state.id, state.data);
      }
      else if (state.type === 'state') renderState(state.status, state.message, state.id);
      else renderShare(match[1]);
    } else renderShare(match[1]);
    return;
  }
  renderState(404, 'The page you are looking for does not exist.');
}

document.addEventListener('linkora-language-change', redrawForLanguage);

function renderHome() {
  root.innerHTML = `
    <section class="hero">
      <div class="eyebrow"><span class="pulse-dot"></span> FILES · NOTES · TEMPORARY LINKS</div>
      <h1>Drop. Share.<br><span>Simplify.</span></h1>
      <p class="hero-copy">Files and notes with a timer built in.<br><strong>Make a link, pass it along, and let it expire.</strong></p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/app">Create a drop <span aria-hidden="true">↗</span></a>
        <a class="btn btn-secondary" href="#how-it-works">See how it works</a>
      </div>
      <div class="drop-graphic" aria-label="Drop, link, timer, vanish">
        <div class="drop-node"><span class="node-icon">${icons.upload}</span><span>Drop</span></div>
        <span class="node-line"></span>
        <div class="drop-node"><span class="node-icon">${icons.link}</span><span>Link</span></div>
        <span class="node-line reverse"></span>
        <div class="drop-node"><span class="node-icon mint">${icons.clock}</span><span>Timer</span></div>
      </div>
    </section>
    <div class="trust-strip" aria-label="Linkora benefits">
      <span class="trust-item">${icons.shield} Private by default</span><span class="trust-separator"></span>
      <span class="trust-item">${icons.clock} Your timer, your call</span><span class="trust-separator"></span>
      <span class="trust-item">${icons.spark} No sign-up required</span>
    </div>
    <section class="section" id="how-it-works">
      <div class="section-heading"><span class="kicker">How it works</span><h2>Three steps. One less thing to worry about.</h2><p>Sharing should take seconds, not an account setup.</p></div>
      <div class="steps">
        <article class="step-card"><span class="step-number">01 / Drop</span><h3>Choose a file or write a note</h3><p>Upload one file or paste the words you need to share. Start right away — no account, no sign-up form.</p></article>
        <article class="step-card"><span class="step-number">02 / Link</span><h3>Get a private share link</h3><p>Copy your unique link in a tap. Add a password or make it disappear after its first open.</p></article>
        <article class="step-card"><span class="step-number">03 / Vanish</span><h3>Set the timer and move on</h3><p>Pick one hour, one day, or a week. Once it expires, the share page stops serving the content.</p></article>
      </div>
    </section>
    <section class="privacy-band" id="privacy">
      <div><span class="kicker">A lighter way to share</span><h2>Made for sharing.<br>Not for keeping tabs on you.</h2><p>Linkora works without an account. Your link is the key: only people you share it with can find the drop. Add a password when a link needs another layer.</p></div>
      <div class="privacy-points">
        <div class="privacy-point"><span class="check-mark">✓</span><span>No email, profile, or sign-in required</span></div>
        <div class="privacy-point"><span class="check-mark">✓</span><span>Optional password protection and burn-after-reading</span></div>
        <div class="privacy-point"><span class="check-mark">✓</span><span>Expired links stop showing notes and files</span></div>
        <div class="privacy-point"><span class="check-mark">✓</span><span>File downloads are checked by the share link before delivery</span></div>
      </div>
    </section>
    <section class="section" id="features">
      <div class="section-heading"><span class="kicker">Core features</span><h2>Everything you need.<br>Nothing to sign into.</h2><p>Simple controls for the moments when a regular attachment is too much.</p></div>
      <div class="features-grid">
        <article class="feature-card"><span class="feature-icon">${icons.file}</span><h3>Temporary file links</h3><p>Share one file up to 25 MB, with a clear link and expiry timer.</p></article>
        <article class="feature-card"><span class="feature-icon">${icons.note}</span><h3>Private notes</h3><p>Pass a code snippet, address, or short message that does not need a long home.</p></article>
        <article class="feature-card"><span class="feature-icon">${icons.clock}</span><h3>Your expiry window</h3><p>Choose an hour, a day, or seven days. See the remaining time on the share page.</p></article>
        <article class="feature-card"><span class="feature-icon">${icons.spark}</span><h3>Burn after reading</h3><p>Let the first successful open use up the link. Handy for one-time handoffs.</p></article>
        <article class="feature-card"><span class="feature-icon">${icons.lock}</span><h3>Optional password</h3><p>Add a second layer for people who have the link but should not open it alone.</p></article>
        <article class="feature-card"><span class="feature-icon">${icons.eye}</span><h3>Views & QR</h3><p>See the number of opens and show a QR code for sharing face to face.</p></article>
      </div>
    </section>
    <section class="cta-panel"><span class="kicker">Ready when you are</span><h2>Drop it. Share it. Done.</h2><p>Your next temporary link is one click away. No account to make and no inbox to check.</p><a class="btn btn-primary" href="/app">Make your first drop <span aria-hidden="true">↗</span></a></section>
  `;
}

function renderApp() {
  root.innerHTML = `
    <section class="workspace-shell">
      <div class="workspace-top">
        <div class="workspace-heading"><span class="kicker">Linkora / web</span><h1>Make a drop.</h1><p>Pick what you want to share, then set how long it stays around.</p></div>
        <div class="no-account"><span class="pulse-dot"></span> No account needed</div>
      </div>
      <form id="drop-form" novalidate>
        <div class="workspace-card">
          <div class="compose-panel">
            <div class="mode-switch" role="tablist" aria-label="What do you want to share?">
              <button class="mode-button active" type="button" role="tab" aria-selected="true" data-mode="note">${icons.note} A note</button>
              <button class="mode-button" type="button" role="tab" aria-selected="false" data-mode="file">${icons.file} A file</button>
            </div>
            <div id="note-panel">
              <label class="field-label" for="note-text">Your note <span class="field-hint">— only share what you mean to</span></label>
              <div class="textarea-wrap"><textarea id="note-text" name="text" maxlength="20000" placeholder="Write something to share…" spellcheck="false"></textarea><span class="char-count"><span id="char-count">${i18n.formatNumber(composerDraft.note.length)}</span> / ${i18n.formatNumber(20000)}</span></div>
            </div>
            <div id="file-panel" class="hidden">
              <span class="field-label">Choose one file <span class="field-hint">— up to 25 MB</span></span>
              <label class="file-dropzone" id="file-dropzone" for="file-input">
                <span class="file-drop-icon">${icons.upload}</span><strong id="file-prompt">Drop a file here, or click to browse</strong><small>One file per link · up to 25 MB</small>
                <input id="file-input" name="file" type="file" aria-label="Choose a file, up to 25 MB" />
              </label>
              <div class="file-selected" id="file-selected">${icons.file}<span id="file-name"></span></div>
            </div>
            <div class="form-message" id="form-message" role="alert"></div>
            <div class="upload-progress" id="upload-progress"><div class="progress-top"><span id="progress-label">${tr('Preparing your drop…')}</span><span id="progress-value">${i18n.formatNumber(0)}%</span></div><div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div></div>
            <div class="compose-bottom"><span class="field-hint">Your drop is saved without an account.</span><button class="btn btn-primary" id="create-button" type="submit">Create share link <span aria-hidden="true">↗</span></button></div>
          </div>
          <aside class="options-panel">
            <h2 class="option-title">Drop settings</h2>
            <div class="option-group"><span class="field-label" id="expiry-label">Link expires in</span><button class="expiry-trigger" id="expiry-picker" type="button" aria-haspopup="dialog" aria-controls="picker-dialog" aria-labelledby="expiry-label expiry-current"><span class="expiry-trigger-icon">${icons.clock}</span><span class="expiry-trigger-copy"><small>Selected expiry</small><strong id="expiry-current">24 hours</strong></span><svg class="chevron-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button><select class="sr-only" id="expiry" name="expirySeconds" aria-hidden="true" tabindex="-1"><option value="3600">1 hour</option><option value="86400" selected>24 hours</option><option value="604800">7 days</option></select><span class="field-hint">After the timer ends, this share link can no longer open the content.</span></div>
            <div class="option-group"><label class="checkbox-row"><input id="burn-after-read" type="checkbox" name="burnAfterRead" value="true" /><span>Burn after reading</span></label><span class="checkbox-help">The first successful open uses up this link.</span></div>
            <div class="option-group"><label class="checkbox-row"><input id="password-toggle" type="checkbox" /><span>Add a password</span></label><span class="checkbox-help">Only people with the link and password can open it.</span><div class="password-field hidden" id="password-field"><label class="field-label" for="password">Optional password</label><input class="password-input" id="password" name="password" type="password" minlength="4" maxlength="72" autocomplete="new-password" placeholder="At least 4 characters" /></div></div>
            <p class="workspace-footnote">${icons.shield}<span>Link holders can open a drop.</span> Share your URL carefully. Expired links stop serving content; uploaded file bytes may remain in storage after expiry.</p>
          </aside>
        </div>
      </form>
      <section class="result-card" id="result-card" aria-live="polite">
        <div class="result-copy"><h2>Your link is ready.</h2><p id="result-summary">Share it with someone you trust.</p><div class="result-link-row"><a class="result-link" id="result-link" href="#" target="_blank" rel="noopener"></a><button class="btn btn-secondary btn-small" id="copy-link" type="button" aria-label="Copy share link">${icons.copy} Copy</button></div><div class="result-actions"><a class="btn btn-secondary btn-small" id="open-link" href="#" target="_blank" rel="noopener">Open share page ↗</a></div></div>
        <div class="qr-box" id="qr-box" aria-label="QR code for your share link"><img id="qr-image" alt="QR code for this share link" /></div>
      </section>
      <p class="workspace-footnote">Want the overview first? <a href="/" style="color:var(--pink)">Back to Linkora ↗</a></p>
    </section>
  `;
  setupComposer();
}

function setupComposer() {
  const form = document.getElementById('drop-form');
  const notePanel = document.getElementById('note-panel');
  const filePanel = document.getElementById('file-panel');
  const fileInput = document.getElementById('file-input');
  const zone = document.getElementById('file-dropzone');
  let mode = composerDraft.mode;
  let selectedFile = composerDraft.file;

  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    mode = button.dataset.mode;
    composerDraft.mode = mode;
    document.querySelectorAll('[data-mode]').forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    notePanel.classList.toggle('hidden', mode !== 'note');
    filePanel.classList.toggle('hidden', mode !== 'file');
    clearMessage();
  }));

  const textArea = document.getElementById('note-text');
  textArea.value = composerDraft.note;
  textArea.addEventListener('input', () => {
    composerDraft.note = textArea.value;
    document.getElementById('char-count').textContent = i18n.formatNumber(textArea.value.length);
  });
  document.getElementById('expiry').value = composerDraft.expiry;
  updateExpiryLabel();
  document.getElementById('expiry-picker').addEventListener('click', openExpiryPicker);
  document.getElementById('expiry').addEventListener('change', (event) => { composerDraft.expiry = event.target.value; updateExpiryLabel(); });
  document.getElementById('burn-after-read').checked = composerDraft.burn;
  document.getElementById('burn-after-read').addEventListener('change', (event) => { composerDraft.burn = event.target.checked; });
  document.getElementById('password-toggle').checked = composerDraft.passwordEnabled;
  document.getElementById('password-field').classList.toggle('hidden', !composerDraft.passwordEnabled);
  document.getElementById('password-toggle').addEventListener('change', (event) => { composerDraft.passwordEnabled = event.target.checked; });
  document.getElementById('password').value = composerDraft.password;
  document.getElementById('password').addEventListener('input', (event) => { composerDraft.password = event.target.value; });

  const setFile = (file) => {
    selectedFile = file || null;
    composerDraft.file = selectedFile;
    const selected = document.getElementById('file-selected');
    const prompt = document.getElementById('file-prompt');
    if (!selectedFile) {
      selected.classList.remove('visible');
      prompt.textContent = tr('Drop a file here, or click to browse');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      selectedFile = null;
      fileInput.value = '';
      selected.classList.remove('visible');
      showMessage('Files must be 25 MB or smaller.');
      return;
    }
    selected.classList.add('visible');
    document.getElementById('file-name').textContent = `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
    prompt.textContent = tr('File selected');
    clearMessage();
  };
  fileInput.addEventListener('change', () => setFile(fileInput.files?.[0]));
  ['dragenter', 'dragover'].forEach((eventName) => zone.addEventListener(eventName, (event) => { event.preventDefault(); zone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach((eventName) => zone.addEventListener(eventName, (event) => { event.preventDefault(); zone.classList.remove('dragging'); }));
  zone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
      setFile(file);
    }
  });

  document.getElementById('password-toggle').addEventListener('change', (event) => {
    document.getElementById('password-field').classList.toggle('hidden', !event.target.checked);
    if (!event.target.checked) {
      document.getElementById('password').value = '';
      composerDraft.password = '';
    }
  });

  document.querySelector(`[data-mode="${mode}"]`)?.click();
  if (selectedFile) {
    try {
      const transfer = new DataTransfer();
      transfer.items.add(selectedFile);
      fileInput.files = transfer.files;
      setFile(selectedFile);
    } catch { composerDraft.file = null; selectedFile = null; }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage();
    const text = textArea.value.trim();
    if (mode === 'note' && !text) return showMessage('Write a note before creating your link.');
    if (mode === 'file' && !selectedFile) return showMessage('Choose a file before creating your link.');
    const password = document.getElementById('password').value;
    if (document.getElementById('password-toggle').checked && password.length < 4) return showMessage('Use at least 4 characters for the optional password.');

    const data = new FormData();
    data.append('kind', mode);
    data.append('text', text);
    data.append('expirySeconds', document.getElementById('expiry').value);
    data.append('burnAfterRead', String(document.getElementById('burn-after-read').checked));
    if (password) data.append('password', password);
    if (selectedFile && mode === 'file') data.append('file', selectedFile, selectedFile.name);
    submitDrop(data);
  });

  function showMessage(message) {
    const box = document.getElementById('form-message');
    box.textContent = tr(message);
    box.classList.add('visible');
  }
  function clearMessage() {
    const box = document.getElementById('form-message');
    if (!box) return;
    box.textContent = '';
    box.classList.remove('visible');
  }

  function submitDrop(data) {
    const xhr = new XMLHttpRequest();
    const button = document.getElementById('create-button');
    const progress = document.getElementById('upload-progress');
    const fill = document.getElementById('progress-fill');
    const progressValue = document.getElementById('progress-value');
    const label = document.getElementById('progress-label');
    button.disabled = true;
    button.innerHTML = `<span class="loader"></span> ${tr('Creating…')}`;
    progress.classList.add('visible');
    label.textContent = tr(mode === 'file' ? 'Uploading your file…' : 'Creating your note…');
    xhr.open('POST', '/api/drops');
    xhr.upload.onprogress = (event) => {
      if (mode === 'file' && event.lengthComputable) {
        const percent = Math.max(1, Math.round((event.loaded / event.total) * 100));
        fill.style.width = `${percent}%`;
        progressValue.textContent = `${i18n.formatNumber(percent)}%`;
      }
    };
    xhr.onload = () => {
      let response;
      try { response = JSON.parse(xhr.responseText); } catch { response = {}; }
      if (xhr.status >= 200 && xhr.status < 300) {
        fill.style.width = '100%';
        progressValue.textContent = '100%';
        label.textContent = tr('Ready to share');
        showResult(response);
      } else {
        showMessage(tr(response.error || 'Your drop could not be created. Please try again.'));
        progress.classList.remove('visible');
      }
      button.disabled = false;
      button.innerHTML = `${tr('Create share link')} <span aria-hidden="true">↗</span>`;
    };
    xhr.onerror = () => {
      showMessage(tr('Connection lost. Check your internet and try again.'));
      progress.classList.remove('visible');
      button.disabled = false;
      button.innerHTML = `${tr('Create share link')} <span aria-hidden="true">↗</span>`;
    };
    xhr.send(data);
  }

  async function showResult(drop) {
    lastCreatedDrop = drop;
    const card = document.getElementById('result-card');
    const url = new URL(drop.url, window.location.origin).href;
    const link = document.getElementById('result-link');
    link.href = url;
    link.textContent = url;
    document.getElementById('open-link').href = url;
    const summary = [];
    if (drop.protected) summary.push(tr('Password protected'));
    if (drop.burnAfterRead) summary.push(tr('Burns after first open'));
    const expiryLabel = new Intl.DateTimeFormat(i18n.getLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(drop.expiresAt));
    summary.push(`${tr('Expires')} ${expiryLabel}`);
    document.getElementById('result-summary').textContent = summary.join(' · ');
    card.classList.add('visible');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    document.getElementById('copy-link').addEventListener('click', () => copyText(url), { once: true });
    const qrImage = document.getElementById('qr-image');
    qrImage.src = `/api/qr?text=${encodeURIComponent(url)}`;
    qrImage.addEventListener('error', () => document.getElementById('qr-box').classList.add('hidden'), { once: true });
    document.getElementById('burn-after-read').checked = false;
    document.getElementById('password-toggle').checked = false;
    document.getElementById('password-field').classList.add('hidden');
    document.getElementById('password').value = '';
    composerDraft.burn = false;
    composerDraft.passwordEnabled = false;
    composerDraft.password = '';
  }
  if (lastCreatedDrop) showResult(lastCreatedDrop);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast(tr('Share link copied.'));
  } catch {
    const field = document.createElement('textarea');
    field.value = value;
    field.className = 'copy-buffer';
    field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.appendChild(field); field.select();
    const copied = document.execCommand('copy');
    field.remove();
    toast(tr(copied ? 'Share link copied.' : 'Could not copy automatically. Select and copy the link.'));
  }
}

async function renderShare(id) {
  lastShareView = { type: 'loading', id };
  root.innerHTML = '<section class="share-shell"><a class="back-link" href="/">← Linkora home</a><div class="loading-state"><span class="loader"></span><span>Opening your drop…</span></div></section>';
  let response;
  try {
    const request = await fetch(`/api/drops/${encodeURIComponent(id)}`, { cache: 'no-store' });
    response = await request.json();
    if (request.ok && response.requiresPassword) return renderPasswordGate(id, response);
    if (!request.ok) return renderState(request.status, response.error || 'This link could not be opened.', id);
    return renderOpenGate(id, response);
  } catch {
    return renderState(0, 'We could not connect to Linkora. Check your connection and try again.', id);
  }
}

function renderOpenGate(id, info) {
  lastShareView = { type: 'gate', id, data: info };
  const itemName = info.kind === 'file' ? (info.originalName || info.title || tr('Shared file')) : tr('A private note');
  const heading = info.title || tr('Your drop is ready');
  const itemType = info.kind === 'file' ? tr('A file is waiting') : tr('A note is waiting');
  const burnLabel = info.burnAfterRead ? ` · ${tr('opens once')}` : '';
  root.innerHTML = `
    <section class="share-shell"><a class="back-link" href="/">← Linkora home</a>
      <div class="share-heading" style="margin-bottom:20px"><span class="kicker">${tr('Linkora / private share')}</span><h1 data-copy-raw>${escapeHtml(heading)}</h1><p>${tr('This link is ready. Open it when you are ready to view the shared content.')}</p></div>
      <div class="password-gate"><span class="lock-icon">${info.kind === 'file' ? icons.file : icons.note}</span><h2>${itemType}</h2><p>${escapeHtml(itemName)} · ${escapeHtml(timeUntil(info.expiresAt))}${escapeHtml(burnLabel)}</p><button class="btn btn-primary btn-full" id="open-drop" type="button">${tr('Open drop')} <span aria-hidden="true">↗</span></button><div class="form-message" id="open-message" role="alert"></div></div>
    </section>`;
  document.getElementById('open-drop').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const request = await fetch(`/api/drops/${encodeURIComponent(id)}/open`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      });
      const data = await request.json();
      if (request.ok) return renderDrop(id, data);
      if (request.status === 410) return renderState(request.status, data.error || 'This drop is no longer available.', id);
      const message = document.getElementById('open-message');
      message.textContent = tr(data.error || 'This drop could not be opened.');
      message.classList.add('visible');
    } catch {
      const message = document.getElementById('open-message');
      message.textContent = tr('Connection lost. Please try again.');
      message.classList.add('visible');
    } finally {
      button.disabled = false;
    }
  });
}

function renderPasswordGate(id, info) {
  lastShareView = { type: 'password', id, data: info };
  const heading = info.title || tr('A private drop');
  root.innerHTML = `
    <section class="share-shell"><a class="back-link" href="/">← Linkora home</a>
    <div class="share-heading" style="margin-bottom:20px"><span class="kicker">${tr('Linkora / protected share')}</span><h1 data-copy-raw>${escapeHtml(heading)}</h1><p>${tr('This share needs its password before it can open.')}</p></div>
    <form class="password-gate" id="password-form"><span class="lock-icon">${icons.lock}</span><h2>${tr('Password protected')}</h2><p>${tr('Ask the person who sent you this link for the password.')}</p><label class="field-label" for="share-password">${tr('Password')}</label><input class="password-input" id="share-password" type="password" maxlength="72" autocomplete="current-password" placeholder="Enter the password" required /><div class="form-message" id="share-message" role="alert"></div><button class="btn btn-primary btn-full" type="submit">${tr('Open drop')} <span aria-hidden="true">↗</span></button></form>
    </section>`;
  const passwordInput = document.getElementById('share-password');
  passwordInput.value = sharePasswordDraft;
  passwordInput.addEventListener('input', () => { sharePasswordDraft = passwordInput.value; });
  document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    const password = document.getElementById('share-password').value;
    try {
      const request = await fetch(`/api/drops/${encodeURIComponent(id)}/open`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      const data = await request.json();
      if (request.ok) { sharePasswordDraft = ''; return renderDrop(id, data); }
      if (request.status === 410) { sharePasswordDraft = ''; return renderState(request.status, data.error || 'This drop is no longer available.', id); }
      const message = document.getElementById('share-message');
      message.textContent = tr(data.error || 'That password did not work.');
      message.classList.add('visible');
    } catch {
      const message = document.getElementById('share-message');
      message.textContent = tr('Connection lost. Please try again.');
      message.classList.add('visible');
    } finally {
      button.disabled = false;
    }
  });
}

function renderDrop(id, drop) {
  lastShareView = { type: 'drop', id, data: drop };
  const isFile = drop.kind === 'file';
  const when = timeUntil(drop.expiresAt);
  const title = escapeHtml(drop.title || (isFile ? drop.originalName : tr('A note for you')));
  const views = Number(drop.views || 0);
  const openCount = `${i18n.formatNumber(views)} ${tr(views === 1 ? 'open' : 'opens')}`;
  const fileType = drop.mimeType || tr('File');
  const mainContent = isFile
    ? `<div class="file-share-row"><span class="file-type-icon">${icons.file}</span><span class="file-info"><strong>${escapeHtml(drop.originalName || drop.title || tr('Shared file'))}</strong><small>${escapeHtml(formatBytes(drop.size))} · ${escapeHtml(fileType)}</small></span><a class="btn btn-primary btn-small" href="${escapeHtml(drop.fileHref || '#')}" download>${tr('Download')}</a></div>`
    : `<pre class="note-content">${escapeHtml(drop.content || '')}</pre>`;
  root.innerHTML = `
    <section class="share-shell"><a class="back-link" href="/">← Linkora home</a>
      <article class="share-card">
        <header class="share-card-head"><span class="share-status"><span class="pulse-dot"></span> ${tr('Secure drop opened')}</span><div class="share-heading"><h1 data-copy-raw>${title}</h1><p>${tr('Shared with Linkora — no account needed.')}</p></div>
          <div class="share-meta"><span>${icons.clock} ${escapeHtml(when)}</span><span>${icons.eye} ${escapeHtml(openCount)}</span>${drop.burnAfterRead ? `<span>${icons.spark} ${tr('Open once')}</span>` : ''}</div>
        </header>
        <div class="share-card-body">${mainContent}
          <div class="share-bottom"><small>${tr('Link ends')} ${escapeHtml(dateLabel(drop.expiresAt))}</small><button class="btn btn-secondary btn-small" id="copy-share-url" type="button">${icons.copy} ${tr('Copy share link')}</button></div>
          <div class="share-extra">${icons.shield}<span>${tr('Keep this link private. Expired links stop serving the content. Uploaded file bytes can remain in storage after a link expires.')}</span></div>
        </div>
      </article>
    </section>`;
  document.getElementById('copy-share-url').addEventListener('click', () => copyText(window.location.href));
}

function renderState(status, message, id = null) {
  const shareId = id || window.location.pathname.match(/^\/s\/([A-Za-z0-9_-]{1,24})\/?$/)?.[1] || null;
  if (shareId) lastShareView = { type: 'state', id: shareId, status, message };
  const titleSource = status === 410 ? (String(message).toLowerCase().includes('opened') ? 'Already opened' : 'This drop has expired') : status === 404 ? 'Drop not found' : 'Could not open this drop';
  const title = tr(titleSource);
  const localizedMessage = tr(message);
  root.innerHTML = `
    <section class="share-shell"><a class="back-link" href="/">← Linkora home</a><div class="state-card"><span class="state-symbol">${status === 410 ? '⌛' : '×'}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(localizedMessage)}</p><a class="btn btn-primary" href="/app">${tr('Make a new drop')} <span aria-hidden="true">↗</span></a></div></section>`;
}

const pathMatch = window.location.pathname.match(/^\/s\/([A-Za-z0-9_-]{1,24})\/?$/);
if (window.location.pathname === '/app' || window.location.pathname === '/app/') renderApp();
else if (pathMatch) renderShare(pathMatch[1]);
else if (window.location.pathname === '/') renderHome();
else renderState(404, 'The page you are looking for does not exist.');
