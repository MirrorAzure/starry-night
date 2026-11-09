const config = window.STARRY_CONFIG;
document.querySelector('#server-address').textContent = (!config.season?.enabled || window.STARRY_SEASON?.canCopy()) ? config.serverAddress : '';
if (!config.addressIsExample) document.querySelector('.server-meta').textContent = 'Minecraft · Добавь адрес в список серверов';
let toastTimer;
function notify(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500); }
async function copyAddress() {
  if (config.season?.enabled && !window.STARRY_SEASON?.canCopy()) {
    notify(window.STARRY_SEASON?.message() || 'Адрес пока недоступен.'); return;
  }
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(config.serverAddress);
    else { const field = document.createElement('textarea'); field.value = config.serverAddress; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select(); const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('copy unavailable'); }
    notify(config.addressIsExample ? 'Адрес-пример скопирован. Замените его перед запуском.' : 'Адрес скопирован. До встречи под звёздами!');
  } catch { notify('Не удалось скопировать. Адрес: ' + config.serverAddress); }
}
document.querySelector('#copy').addEventListener('click', copyAddress);
document.querySelector('#join').addEventListener('click', copyAddress);
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) { tabs.forEach(t => { const selected = t === tab; t.setAttribute('aria-selected', selected); t.tabIndex = selected ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !selected; }); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectTab(tab)); tab.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight') next = (index + 1) % tabs.length; if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = tabs.length - 1; if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); } }); });

// Optional links and the roster are configured without changing page markup.
function safeWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
const applicationUrl = safeWebUrl(config.applicationUrl);
if (applicationUrl) {
  const link = document.querySelector('#application-link');
  link.href = applicationUrl; link.hidden = false;
  document.querySelector('#application-pending').hidden = true;
}
function renderChannels(id, channels) {
  const links = (channels || []).filter(channel => channel.name && safeWebUrl(channel.url));
  if (!links.length) return;
  const container = document.getElementById(id); container.replaceChildren();
  links.forEach(channel => { const a = document.createElement('a'); a.href = safeWebUrl(channel.url); a.textContent = channel.name + ' ↗'; container.append(a); });
}
renderChannels('trusted-channels', config.trustedChannels);
renderChannels('partner-channels', config.partnerChannels);
const members = (config.members || []).filter(member => typeof member.name === 'string' && member.name.trim());
if (members.length) {
  document.querySelector('#members-empty').hidden = true;
  const container = document.querySelector('#members-list');
  members.forEach(member => {
    const fullBody = member.view === 'full-body';
    const card = document.createElement('article'); card.className = 'member ' + (fullBody ? 'member-fullbody' : 'member-head');
    if (member.isDemo) card.classList.add('member-is-demo');
    if (member.isDemo) { const demo = document.createElement('span'); demo.className = 'member-demo'; demo.textContent = 'Тестовая карточка'; card.append(demo); }
    const header = document.createElement('div'); header.className = 'member-header';
    const avatar = document.createElement('span'); avatar.className = 'member-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    const fallback = document.createElement('span'); fallback.className = 'member-initial'; fallback.textContent = Array.from(member.name.trim())[0].toUpperCase(); avatar.append(fallback);
    const identifier = typeof member.uuid === 'string' && /^(?:[0-9a-f]{32}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/i.test(member.uuid) ? member.uuid : member.name.trim();
    if (/^[a-z0-9_]{3,16}$/i.test(identifier) || /^[0-9a-f-]{32,36}$/i.test(identifier)) {
      const img = document.createElement('img'); img.alt = ''; img.width = fullBody ? 160 : 64; img.height = fullBody ? 320 : 64;
      // Hidden images must load eagerly: lazy loading waits for visibility,
      // while visibility here is enabled only after the image has loaded.
      img.loading = 'eager'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer'; img.hidden = true;
      img.addEventListener('load', () => { if (img.naturalWidth > 0) { img.hidden = false; fallback.hidden = true; } });
      img.addEventListener('error', () => { img.remove(); fallback.hidden = false; }, { once: true });
      img.src = 'https://api.mcheads.org/' + (fullBody ? 'avatar/' : 'head/') + encodeURIComponent(identifier) + (fullBody ? '/right/256' : '/128/hat'); avatar.append(img);
    }
    const info = document.createElement('div'); info.className = 'member-identity';
    const name = document.createElement('h4'); name.textContent = member.name; info.append(name);
    const role = document.createElement('span'); role.className = 'member-role'; role.textContent = member.role || 'Участник'; info.append(role);
    header.append(avatar, info); card.append(header);
    if (member.description) { const description = document.createElement('p'); description.className = 'member-description'; description.textContent = member.description; info.append(description); }
    if (typeof member.daysPlayed === 'number' && Number.isFinite(member.daysPlayed) && member.daysPlayed >= 0) {
      const days = document.createElement('p'); days.className = 'member-days'; days.textContent = 'Дней в игре: ' + member.daysPlayed.toLocaleString('ru-RU'); info.append(days);
    }
    container.append(card);
  });
  if (config.membersUpdated) { const updated = document.querySelector('#members-updated'); updated.textContent = config.membersUpdated; updated.hidden = false; }
}
const chapters = [...document.querySelectorAll('.rule-chapter')];
const expandRules = document.querySelector('#rules-toggle');
function updateExpandLabel() { expandRules.textContent = chapters.every(chapter => chapter.open) ? 'Свернуть все главы' : 'Развернуть все главы'; }
expandRules.addEventListener('click', () => { const open = !chapters.every(chapter => chapter.open); chapters.forEach(chapter => { chapter.open = open; }); updateExpandLabel(); });
chapters.forEach(chapter => chapter.addEventListener('toggle', updateExpandLabel));
function openRuleHash() {
  const chapter = chapters.find(item => '#' + item.id === location.hash);
  if (!chapter) return;
  selectTab(document.querySelector('#tab-rules')); chapter.open = true;
  requestAnimationFrame(() => { chapter.scrollIntoView({ block: 'start' }); chapter.querySelector('summary').focus({ preventScroll: true }); });
}
document.querySelectorAll('[data-rule-link]').forEach(link => link.addEventListener('click', () => {
  const chapter = document.getElementById(link.hash.slice(1)); if (chapter) chapter.open = true;
  if (location.hash === link.hash) openRuleHash();
}));
window.addEventListener('hashchange', openRuleHash);
openRuleHash();
