# Magnet 链接清理

一个离线运行的 Chrome Manifest V3 扩展。复制包含 `magnet:?` 的文字时，当前网页右下角会显示原文和清理预览。也可以点击扩展图标，手动粘贴链接。

## 安装

1. 从 [Releases](../../releases) 下载 `magnet-cleaner-extension-v1.0.0.zip` 并解压。
2. 打开 Chrome 的 `chrome://extensions/`，启用「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择解压后包含 `manifest.json` 的文件夹。

## 使用

在普通网页复制 Magnet 链接。窗口会显示原文和规范化预览。点击「简化」可以重新计算，点击「复制结果」将结果写入剪贴板并关闭窗口。复制普通文本时没有界面响应。如果网页的复制方式未触发自动检测，点击工具栏中的扩展图标即可手动粘贴。

清理包括 HTML 转义（如 `&amp;`）、Markdown 链接包裹、转义反斜杠、多余包装括号以及完全重复的参数或 Tracker。保留 `xt`、`dn`、`xl`、`tr` 等不同值的参数和原有顺序。

## 隐私与权限

全部处理在本地进行。扩展不请求网络权限，不上传链接，也不保存剪贴板历史。`clipboardRead` 用于识别当前复制的内容，`clipboardWrite` 用于「复制结果」。网页中的普通复制内容在检查后立即丢弃。

Chrome 不允许扩展脚本在 `chrome://` 页面和部分受保护页面运行。部分网站的自定义复制脚本不触发网页 `copy` 事件，可使用工具栏入口。

## 开发

无第三方依赖。清理逻辑位于 `cleaner.js`；自动检测与悬浮窗位于 `content.js`；手动入口位于 `popup.html` / `popup.js`。

运行 `node tests/test.cjs` 检查示例链接、普通文本复制和 Manifest。该测试不替代 Chrome 中的交互测试。

## 许可证

MIT，详见 [LICENSE](LICENSE)。
