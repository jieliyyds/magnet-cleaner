(() => {
  'use strict';
  let host = null, ignoreCopy = false, sequence = 0;
  function selectionText() {
    const el = document.activeElement;
    if (el && /^(TEXTAREA|INPUT)$/.test(el.tagName) && typeof el.selectionStart === 'number') {
      return el.value.slice(el.selectionStart, el.selectionEnd);
    }
    return window.getSelection()?.toString() || '';
  }
  function close() { host?.remove(); host = null; }
  function panel(original) {
    close();
    host = document.createElement('div');
    host.id = 'magnet-cleaner-extension-host';
    const root = host.attachShadow({mode: 'closed'});
    const style = document.createElement('style');
    style.textContent = `:host{all:initial;position:fixed;right:18px;bottom:18px;z-index:2147483647;width:min(430px,calc(100vw - 36px));font:14px/1.5 system-ui,"Microsoft YaHei",sans-serif;color:#183342}*{box-sizing:border-box}.box{background:#fff;border:1px solid #cbd9dd;border-radius:14px;box-shadow:0 12px 40px #152f3b45;padding:16px}.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.title{font-size:17px;font-weight:700}.x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:#536875}label{display:block;font-weight:600;margin:10px 0 5px}textarea{display:block;width:100%;height:77px;resize:vertical;padding:8px;border:1px solid #b8c9d0;border-radius:7px;font:12px/1.5 ui-monospace,Consolas,monospace;color:#193645}.row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}button{cursor:pointer;border:1px solid #14796c;border-radius:7px;padding:8px 12px;background:#fff;color:#14796c;font:inherit}button.primary{background:#14796c;color:#fff}button:disabled{opacity:.45;cursor:default}.hint{min-height:18px;margin-top:8px;color:#476476;font-size:12px}`;
    const box = document.createElement('section'); box.className = 'box';
    const head = document.createElement('div'); head.className = 'head';
    const title = document.createElement('span'); title.className = 'title'; title.textContent = 'Magnet 链接清理';
    const x = document.createElement('button'); x.className = 'x'; x.textContent = '×'; x.title = '关闭'; x.onclick = close;
    head.append(title, x); box.append(head);
    function field(labelText, value, readOnly) {
      const label = document.createElement('label'); label.textContent = labelText;
      const area = document.createElement('textarea'); area.value = value; area.readOnly = readOnly; area.spellcheck = false;
      box.append(label, area); return area;
    }
    field('原始 Magnet', original, true);
    const result = field('规范化预览', '', true);
    const row = document.createElement('div'); row.className = 'row';
    const simplify = document.createElement('button'); simplify.textContent = '简化';
    const copy = document.createElement('button'); copy.textContent = '复制结果'; copy.className = 'primary'; copy.disabled = true;
    const hint = document.createElement('div'); hint.className = 'hint'; hint.setAttribute('role', 'status');
    function update() {
      try {
        const cleaned = MagnetCleaner.clean(original);
        result.value = cleaned.uri; copy.disabled = false;
        hint.textContent = `已移除 ${cleaned.duplicates} 个重复参数。`;
      } catch (error) { result.value = ''; copy.disabled = true; hint.textContent = error.message; }
    }
    simplify.onclick = update;
    copy.onclick = async () => {
      if (!result.value) return;
      try {
        ignoreCopy = true;
        await navigator.clipboard.writeText(result.value);
        close();
      } catch {
        result.focus(); result.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        if (copied) close(); else hint.textContent = '复制未成功，请在结果框按 Ctrl+C（Mac 用 ⌘C）。';
      } finally { setTimeout(() => { ignoreCopy = false; }, 0); }
    };
    row.append(simplify, copy); box.append(row, hint); root.append(style, box);
    (document.documentElement || document.body).append(host);
    update();
  }
  document.addEventListener('copy', event => {
    if (ignoreCopy || host?.contains(event.target)) return;
    const selected = selectionText();
    const supplied = event.clipboardData?.getData('text/plain') || '';
    const token = ++sequence;
    setTimeout(async () => {
      let copied = '';
      try { copied = await navigator.clipboard.readText(); } catch { copied = supplied || selected; }
      // Ordinary copied text is discarded without opening UI or retaining it.
      if (token !== sequence || !/magnet:\?/i.test(copied)) return;
      panel(copied);
    }, 0);
  }, true);
})();
