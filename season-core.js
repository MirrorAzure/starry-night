/* Pure date/state helpers, shared by the page and its tests. */
(function (root) {
  'use strict';
  function zonedDate(value, timeZone) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || '');
    if (!m) throw new Error('Дата должна иметь формат YYYY-MM-DDTHH:mm[:ss].');
    const numbers = m.slice(1).map(Number); numbers[5] = numbers[5] || 0;
    const [year, month, day, hour, minute, second] = numbers;
    const wall = Date.UTC(year, month - 1, day, hour, minute, second);
    const d = new Date(wall);
    if (year < 2000 || d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) throw new Error('Несуществующая дата или время.');
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    function wallAt(epoch) {
      const p = Object.fromEntries(formatter.formatToParts(epoch).map(part => [part.type, part.value]));
      return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    }
    // Sample both sides of DST transitions. Ambiguous/nonexistent wall times fail closed.
    const offsets = new Set([-36, 0, 36].map(h => { const sample = wall + h * 3600000; return wallAt(sample) - sample; }));
    const candidates = [...offsets].map(offset => wall - offset).filter(epoch => wallAt(epoch) === wall);
    if (candidates.length !== 1) throw new Error('Время попало на перевод часов. Выберите однозначное время в указанном часовом поясе.');
    return candidates[0];
  }
  function schedule(settings) {
    if (!settings || !settings.enabled) return { enabled: false };
    if (typeof settings.timeZone !== 'string' || !settings.timeZone.trim()) throw new Error('Укажите timeZone.');
    const start = zonedDate(settings.startsAt, settings.timeZone);
    const end = settings.endsAt ? zonedDate(settings.endsAt, settings.timeZone) : null;
    if (end !== null && end <= start) throw new Error('Конец сезона должен быть позже открытия.');
    return { enabled: true, start, end, timeZone: settings.timeZone };
  }
  function state(plan, now) {
    if (!plan.enabled) return 'disabled';
    if (!Number.isFinite(now)) return 'syncing';
    if (now < plan.start) return 'upcoming';
    if (plan.end !== null && now >= plan.end) return 'ended';
    return 'active';
  }
  function remaining(target, now) {
    const total = Math.max(0, Math.ceil((target - now) / 1000));
    return [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
  }
  const api = { zonedDate, schedule, state, remaining };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StarrySeasonCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
