(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function simplify() {
    try {
      const data = MagnetCleaner.clean($('source').value);
      $('result').value = data.uri; $('copy').disabled = false;
      $('status').textContent = `已移除 ${data.duplicates} 个重复参数。`;
    } catch (error) {
      $('result').value = ''; $('copy').disabled = true; $('status').textContent = error.message;
    }
  }
  $('source').oninput = () => { $('result').value = ''; $('copy').disabled = true; $('status').textContent = ''; };
  $('clean').onclick = simplify;
  $('paste').onclick = async () => {
    try { $('source').value = await navigator.clipboard.readText(); simplify(); }
    catch { $('source').focus(); $('status').textContent = '请在输入框按 Ctrl+V（Mac 用 ⌘V）粘贴。'; }
  };
  $('copy').onclick = async () => {
    if (!$('result').value) return;
    try { await navigator.clipboard.writeText($('result').value); window.close(); }
    catch {
      $('result').focus(); $('result').select();
      let copied = false; try { copied = document.execCommand('copy'); } catch {}
      if (copied) window.close(); else $('status').textContent = '请在结果框按 Ctrl+C（Mac 用 ⌘C）复制。';
    }
  };
})();
