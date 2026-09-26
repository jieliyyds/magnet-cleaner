/* Shared, offline Magnet parser. No browser permissions or network calls. */
const MagnetCleaner = (() => {
  'use strict';
  function decodeHTML(text) {
    for (let i = 0; i < 8; i++) {
      const next = text.replace(/&(?:amp|#0*38|#x0*26);/gi, '&')
        .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (all, n) => {
          const value = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
          return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : all;
        })
        .replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
        .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
      if (next === text) break;
      text = next;
    }
    return text;
  }
  function trimWrappers(value) {
    value = value.trim();
    while (/[\])]/.test(value.slice(-1))) {
      const close = value.slice(-1), open = close === ']' ? '[' : '(';
      if (value.split(close).length <= value.split(open).length) break;
      value = value.slice(0, -1).trimEnd();
    }
    return value;
  }
  function clean(input) {
    let text = decodeHTML(String(input)).replace(/\\([\\[\]()&_*`<>])/g, '$1');
    const start = text.search(/magnet:\?/i);
    if (start < 0) throw new Error('未找到 magnet:? 链接。');
    text = text.slice(start + 8);
    // The second half of a Markdown link often repeats the same long URL.
    text = text.split(/\]\s*\(/, 1)[0];
    text = text.split(/magnet:\?/i, 1)[0];
    text = text.split(/[<>"`]/, 1)[0];
    text = trimWrappers(text.replace(/[\r\n\t]/g, ''));
    if (text.includes('#')) text = text.slice(0, text.indexOf('#'));
    const raw = text.split('&').map(part => part.trim()).filter(Boolean);
    const seen = new Set(), kept = [];
    let duplicates = 0;
    for (let part of raw) {
      part = part.replace(/^\[+/, '').replace(/=\[+(?=(?:https?|udp|wss?):\/\/)/i, '=');
      part = trimWrappers(part);
      if (!part) continue;
      const equal = part.indexOf('='), key = equal < 0 ? part : part.slice(0, equal);
      if (!key || /[\s[\]()]/.test(key)) throw new Error('参数格式不完整，请检查复制内容。');
      if (seen.has(part)) { duplicates++; continue; }
      seen.add(part);
      kept.push(part.replace(/[^\x21-\x7e]/gu, char => encodeURIComponent(char)));
    }
    if (!kept.some(part => /^xt=.+/i.test(part))) throw new Error('链接缺少有效的 xt 参数。');
    return { uri: 'magnet:?' + kept.join('&'), before: raw.length, after: kept.length, duplicates };
  }
  return { clean };
})();
