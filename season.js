(function () {
  'use strict';
  const config = window.STARRY_CONFIG || {};
  const settings = config.season || {};
  // Install a fail-closed guard before any initialization that could throw.
  window.STARRY_SEASON = { canCopy: () => !settings.enabled, message: () => 'Адрес пока недоступен.' };
  if (!settings.enabled) return;
  const copy = document.querySelector('#copy'), join = document.querySelector('#join');
  const address = document.querySelector('#server-address');
  const meta = document.querySelector('.server-meta'), label = document.querySelector('.address-label');
  const joinTitle = document.querySelector('.join h3'), joinDescription = document.querySelector('.join p');
  copy.disabled = join.disabled = true; copy.hidden = true; address.textContent = ''; meta.hidden = label.hidden = true;
  const box = document.createElement('section'); box.className = 'season-box'; box.setAttribute('aria-label', 'Сезон Starry Night');
  box.innerHTML = '<p class="season-kicker"></p><h2 class="season-title" role="status" aria-live="polite"></h2><div class="season-countdown" role="timer" aria-live="off"></div><p class="season-date"></p><p class="season-note"></p><button type="button" class="season-retry" hidden>Проверить время ещё раз</button>';
  document.querySelector('.connect').append(box);
  const kicker = box.querySelector('.season-kicker'), title = box.querySelector('.season-title');
  const countdown = box.querySelector('.season-countdown'), dateLabel = box.querySelector('.season-date');
  const note = box.querySelector('.season-note'), retry = box.querySelector('.season-retry');
  kicker.textContent = settings.name || 'STARRY NIGHT';
  const digits = ['ДНЕЙ', 'ЧАСОВ', 'МИНУТ', 'СЕКУНД'].map(unit => {
    const cell = document.createElement('div'), number = document.createElement('strong'), caption = document.createElement('span');
    number.textContent = '00'; caption.textContent = unit; cell.append(number, caption); countdown.append(cell); return number;
  });
  let plan;
  try { plan = window.StarrySeasonCore.schedule(settings); }
  catch (error) {
    title.textContent = 'Расписание уточняется'; note.textContent = 'Адрес откроется после обновления расписания.';
    countdown.hidden = dateLabel.hidden = true; join.textContent = 'Расписание уточняется';
    console.error('Starry Night: неверная настройка season.', error.message); return;
  }
  const core = window.StarrySeasonCore;
  const format = new Intl.DateTimeFormat('ru-RU', { timeZone: plan.timeZone, day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let anchor = null, busy = false, syncFailed = false, lastState = '', syncGeneration = 0;
  const maxAge = 180000;
  function currentTime() { return anchor && performance.now() - anchor.tick < maxAge ? anchor.epoch + performance.now() - anchor.tick : NaN; }
  function currentState() { return core.state(plan, currentTime()); }
  function message() {
    return { upcoming: 'Сервер ещё не открылся.', ended: 'Сезон завершён. До встречи в новом сезоне!', syncing: 'Сначала нужно подтвердить текущее время.' }[currentState()] || 'Адрес доступен.';
  }
  window.STARRY_SEASON = { canCopy: () => currentState() === 'active', message };
  function render() {
    const now = currentTime(), phase = core.state(plan, now), active = phase === 'active';
    copy.disabled = join.disabled = !active; copy.hidden = !active; label.hidden = meta.hidden = !active;
    address.textContent = active ? config.serverAddress : '';
    box.hidden = active && plan.end === null;
    box.setAttribute('data-phase', phase);
    countdown.hidden = !(phase === 'upcoming' || (active && plan.end !== null));
    dateLabel.hidden = phase === 'syncing' || phase === 'ended'; retry.hidden = phase !== 'syncing' || !syncFailed || busy;
    if (phase !== lastState) {
      title.textContent = { upcoming: 'До открытия сервера', active: 'До конца сезона', ended: settings.thanksTitle || 'Спасибо за этот сезон!', syncing: 'Сверяем время…' }[phase];
      joinTitle.textContent = phase === 'ended' ? 'Эта история останется с нами.' : phase === 'upcoming' ? 'До первой ночи осталось совсем немного.' : 'У каждой истории есть первая ночь.';
      joinDescription.textContent = phase === 'ended' ? 'До встречи под звёздами в новом сезоне!' : 'Пусть твоя начнётся в Starry Night.';
      lastState = phase;
    }
    if (phase === 'upcoming' || active) {
      note.textContent = '';
      const target = phase === 'upcoming' ? plan.start : plan.end;
      if (target !== null) {
        const values = core.remaining(target, now);
        values.forEach((value, i) => { digits[i].textContent = String(value).padStart(2, '0'); });
        dateLabel.textContent = (phase === 'upcoming' ? 'Открытие: ' : 'Завершение: ') + format.format(target) + ' · ' + plan.timeZone;
        if (!active) join.textContent = values[0] + ' д ' + String(values[1]).padStart(2, '0') + ' ч ' + String(values[2]).padStart(2, '0') + ' м ' + String(values[3]).padStart(2, '0') + ' с';
      }
      if (active) join.textContent = 'Скопировать адрес ↗';
    } else if (phase === 'ended') {
      note.textContent = settings.thanksMessage || 'Спасибо за постройки, приключения и тёплые вечера вместе. Увидимся в новом сезоне!';
      join.textContent = 'До встречи в новом сезоне';
    } else {
      note.textContent = syncFailed ? 'Не удалось подтвердить время. Проверьте интернет — адрес пока закрыт.' : 'Проверяем время открытия. Это займёт несколько секунд.';
      join.textContent = 'Проверяем время…';
    }
  }
  async function request(url, options = {}, json = false) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 6000);
    try { const response = await fetch(url, { ...options, cache: 'no-store', signal: controller.signal }); if (!response.ok) throw new Error('HTTP ' + response.status); return json ? await response.json() : response; }
    finally { clearTimeout(timer); }
  }
  async function internetTime() {
    // UTC from an independent source; local OS date is never used to unlock the IP.
    try {
      const data = await request('https://timeapi.io/api/time/current/zone?timeZone=UTC', {}, true);
      if (data.timeZone !== 'UTC' || ![data.year, data.month, data.day, data.hour, data.minute, data.seconds].every(Number.isInteger)) throw new Error('Invalid clock response');
      const epoch = Date.UTC(data.year, data.month - 1, data.day, data.hour, data.minute, data.seconds, data.milliSeconds || 0);
      if (!Number.isFinite(epoch) || data.year < 2020 || data.month < 1 || data.month > 12 || data.hour > 23 || data.minute > 59 || data.seconds > 59) throw new Error('Invalid UTC value');
      return epoch;
    } catch (error) {
      // GitHub Pages / VPS fallback: fresh HTTP Date from this site's host.
      if (!['http:', 'https:'].includes(location.protocol)) throw error;
      const url = new URL('index.html', location.href); url.search = '_clock=' + Math.random().toString(36).slice(2); url.hash = '';
      const response = await request(url.href, { method: 'HEAD' });
      const epoch = Date.parse(response.headers.get('Date'));
      const age = Number(response.headers.get('Age') || 0);
      if (!Number.isFinite(epoch) || !Number.isFinite(age) || age < 0 || age > 120) throw new Error('No fresh server clock');
      return epoch + age * 1000;
    }
  }
  async function synchronize() {
    if (busy) return;
    busy = true; const generation = syncGeneration; render();
    try { const epoch = await internetTime(); if (generation === syncGeneration) { anchor = { epoch, tick: performance.now() }; syncFailed = false; } }
    catch { syncFailed = true; }
    finally { busy = false; render(); if (generation !== syncGeneration && !document.hidden) synchronize(); }
  }
  retry.addEventListener('click', synchronize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { anchor = null; syncGeneration++; render(); synchronize(); } });
  window.addEventListener('online', synchronize);
  setInterval(render, 1000);
  setInterval(() => { if (!document.hidden) synchronize(); }, 60000);
  render(); synchronize();
})();
