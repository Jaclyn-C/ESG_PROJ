/*!
 * ESG 管理平台 · AI 聊天助手 Widget（交互原型 v2）
 * ============================================================
 * 功能：
 *   · 左侧历史对话列表（localStorage 持久化，跨页面共享）
 *   · 智能问答（默认）—— 知识库检索、附件内容提取演示
 *   · 报告生成 Agent —— 固定演示流程：解析→指标匹配确认→生成报告
 *   · 指标信息采集表 Agent —— 模板解析→映射确认→按年填充→文件下载
 *   · 数据选择（REQ-01 v4）—— 指标库→维度→主题→议题→指标 五层下钻 / 子树搜索 /
 *     已选区逐指标配置年份与维度（FII·分会·法人·策进组 二级弹窗），多选提交后 AI 一次性以单一表格返回查询结果
 *   · 附件仅通过 📎 上传按钮提供（支持单选/多选真实文件）
 *
 * 说明：纯前端原型，所有对话为预设脚本模拟，不含后端逻辑；
 *       下载文件由浏览器本地生成（Blob）。
 *
 * 引入方式：页面 </body> 前加一行 <script src="./chat-widget.js"></script>
 */
(function () {
  'use strict';
  if (window.__ESG_CHAT_WIDGET_LOADED__) return;
  window.__ESG_CHAT_WIDGET_LOADED__ = true;

  /* ================================================================
   * 一、工具函数
   * ================================================================ */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* 极简 markdown：**加粗**、`代码`、换行 */
  function md(s) {
    return escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function scrollBottom() {
    requestAnimationFrame(function () { msgs.scrollTop = msgs.scrollHeight; });
  }
  function fmtSize(b) {
    if (b == null) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function fmtTime() {
    var t = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(t.getHours()) + ':' + p(t.getMinutes());
  }
  function uid() { return 'c' + Date.now() + Math.floor(Math.random() * 1000); }
  /* 生成 Word 兼容文件（HTML 格式、.doc 后缀，Word/WPS 可直接打开）并触发下载 */
  function downloadWord(filename, bodyHtml) {
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
      'xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8">' +
      '<title>' + escapeHtml(filename) + '</title></head><body>' + bodyHtml + '</body></html>';
    var blob = new Blob(['﻿', html], { type: 'application/msword;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = '✓ 已复制';
      btn.disabled = true;
      setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = el('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { alert('复制失败，请手动选择文本复制'); }
      ta.remove();
    }
  }

  /* ================================================================
   * 二、样式（对齐平台设计：主色 #3f7afa / 深蓝 #133368 / 背景 #f5f5fc）
   * ================================================================ */
  var CSS = [
    '#ecw-root{position:fixed;right:28px;bottom:28px;z-index:2147483000;',
    ' font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",sans-serif;',
    ' font-size:13px;color:#1f2329;line-height:1.6;text-align:left}',
    '#ecw-root *,#ecw-root *::before,#ecw-root *::after{box-sizing:border-box;margin:0;padding:0}',
    '#ecw-root p,#ecw-root ul,#ecw-root li{margin:0;padding:0;list-style:none}',
    '#ecw-root code{background:#eef1f8;border-radius:3px;padding:1px 5px;font-size:12px;color:#133368;font-family:Menlo,Consolas,monospace}',

    /* ---- 悬浮按钮 ---- */
    '#ecw-root .ecw-launcher{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;',
    ' background:linear-gradient(135deg,#3f7afa 0%,#2f5fd9 100%);box-shadow:0 8px 24px rgba(63,122,250,.45);',
    ' display:flex;align-items:center;justify-content:center;transition:transform .2s;position:relative}',
    '#ecw-root .ecw-launcher:hover{transform:scale(1.06)}',
    '#ecw-root .ecw-launcher svg{width:26px;height:26px;fill:#fff}',
    '#ecw-root .ecw-launcher .ecw-dot{position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;',
    ' background:#ff3b30;border:2px solid #fff;animation:ecwPulse 1.6s infinite}',
    '#ecw-root.ecw-open .ecw-launcher .ecw-dot{display:none}',
    '@keyframes ecwPulse{0%{box-shadow:0 0 0 0 rgba(255,59,48,.5)}70%{box-shadow:0 0 0 8px rgba(255,59,48,0)}100%{box-shadow:0 0 0 0 rgba(255,59,48,0)}}',

    /* ---- 面板（左：历史对话栏；右：会话区） ---- */
    '#ecw-root .ecw-panel{position:absolute;right:0;bottom:70px;display:flex;background:#fff;',
    ' border:1px solid #e6e6e6;border-radius:10px;box-shadow:0 16px 48px rgba(19,51,104,.22);overflow:hidden;',
    ' opacity:0;pointer-events:none;transform:translateY(14px) scale(.98);transition:all .22s ease}',
    '#ecw-root.ecw-open .ecw-panel{opacity:1;pointer-events:auto;transform:none}',

    /* ---- 历史对话侧栏 ---- */
    '#ecw-root .ecw-side{width:192px;background:#f7f8fc;border-right:1px solid #eef0f5;',
    ' display:flex;flex-direction:column;flex-shrink:0;height:min(680px,calc(100vh - 110px))}',
    '#ecw-root .ecw-sideh{height:56px;display:flex;align-items:center;padding:0 14px;flex-shrink:0;',
    ' font-size:13px;font-weight:600;color:#133368;border-bottom:1px solid #eef0f5}',
    '#ecw-root .ecw-newbtn{margin:10px 10px 4px;height:30px;border:1px solid #3f7afa;background:#fff;color:#3f7afa;',
    ' border-radius:4px;font-size:12px;cursor:pointer;flex-shrink:0;transition:all .15s;display:flex;',
    ' align-items:center;justify-content:center;gap:4px}',
    '#ecw-root .ecw-newbtn:hover{background:#3f7afa;color:#fff}',
    '#ecw-root .ecw-sidelist{flex:1;overflow-y:auto;padding:4px 8px}',
    '#ecw-root .ecw-sidelist::-webkit-scrollbar{width:5px}',
    '#ecw-root .ecw-sidelist::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-sidehint{font-size:11px;color:#aab1bd;text-align:center;padding:16px 6px}',
    '#ecw-root .ecw-sitem{padding:7px 9px;border-radius:4px;cursor:pointer;position:relative;margin-bottom:2px}',
    '#ecw-root .ecw-sitem:hover{background:#edf1f9}',
    '#ecw-root .ecw-sitem.on{background:#e3ebfd}',
    '#ecw-root .ecw-sitem .ecw-st{font-size:12px;color:#24292f;white-space:nowrap;overflow:hidden;',
    ' text-overflow:ellipsis;padding-right:16px}',
    '#ecw-root .ecw-sitem.on .ecw-st{color:#133368;font-weight:600}',
    '#ecw-root .ecw-sitem .ecw-ss{font-size:10.5px;color:#98a0ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-sdel{position:absolute;right:5px;top:50%;transform:translateY(-50%);display:none;',
    ' width:18px;height:18px;border:none;background:transparent;color:#98a0ad;cursor:pointer;font-size:11px;',
    ' align-items:center;justify-content:center;border-radius:3px}',
    '#ecw-root .ecw-sitem:hover .ecw-sdel{display:flex}',
    '#ecw-root .ecw-sdel:hover{color:#ff371d;background:#ffe9e5}',

    /* ---- 会话主区 ---- */
    '#ecw-root .ecw-main{display:flex;flex-direction:column;width:452px;min-width:0;',
    ' height:min(680px,calc(100vh - 110px));background:#fff}',
    '#ecw-root.ecw-noside .ecw-side{display:none}',
    '@media (max-width:560px){#ecw-root .ecw-side{display:none}#ecw-root .ecw-main{width:calc(100vw - 64px)}}',

    /* ---- 头部 ---- */
    '#ecw-root .ecw-header{height:56px;background:#fff;border-bottom:1px solid #eef0f5;',
    ' display:flex;align-items:center;gap:9px;padding:0 12px;flex-shrink:0}',
    '#ecw-root .ecw-sidebtn{width:28px;height:28px;border:1px solid #e6e6e6;background:#fff;border-radius:4px;',
    ' cursor:pointer;color:#5a6472;font-size:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}',
    '#ecw-root .ecw-sidebtn:hover{border-color:#3f7afa;color:#3f7afa}',
    '#ecw-root .ecw-avatar{width:34px;height:34px;border-radius:50%;flex-shrink:0;',
    ' background:linear-gradient(135deg,#3f7afa,#133368);display:flex;align-items:center;justify-content:center;',
    ' font-size:17px;color:#fff}',
    '#ecw-root .ecw-hinfo{flex:1;min-width:0}',
    '#ecw-root .ecw-hname{font-size:14px;font-weight:600;color:#133368;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-hstatus{font-size:11px;color:#8a919f;display:flex;align-items:center;gap:4px}',
    '#ecw-root .ecw-hstatus i{width:6px;height:6px;border-radius:50%;background:#67c23a;display:inline-block}',
    '#ecw-root .ecw-hbtn{border:1px solid #e6e6e6;background:#fff;border-radius:4px;height:26px;padding:0 8px;',
    ' font-size:11px;color:#5a6472;cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .15s;white-space:nowrap}',
    '#ecw-root .ecw-hbtn:hover{border-color:#3f7afa;color:#3f7afa}',

    /* ---- Agent 模式条 ---- */
    '#ecw-root .ecw-modebar{display:none;background:#eef3ff;border-bottom:1px solid #dfe8ff;',
    ' padding:5px 12px;font-size:11px;color:#133368;flex-shrink:0}',
    '#ecw-root[data-mode="report"] .ecw-modebar,#ecw-root[data-mode="collect"] .ecw-modebar{display:block}',

    /* ---- 消息区 ---- */
    '#ecw-root .ecw-msgs{flex:1;overflow-y:auto;background:#f5f5fc;padding:14px 12px;',
    ' display:flex;flex-direction:column;gap:12px}',
    '#ecw-root .ecw-msgs::-webkit-scrollbar{width:6px}',
    '#ecw-root .ecw-msgs::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-row{display:flex;gap:8px;align-items:flex-start;animation:ecwIn .25s ease}',
    '#ecw-root .ecw-row.ecw-user{justify-content:flex-end}',
    '@keyframes ecwIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '#ecw-root .ecw-mavatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;margin-top:2px;',
    ' background:linear-gradient(135deg,#3f7afa,#133368);color:#fff;font-size:13px;',
    ' display:flex;align-items:center;justify-content:center}',
    '#ecw-root .ecw-bubble{max-width:86%;padding:9px 12px;border-radius:8px;font-size:13px;word-break:break-word}',
    '#ecw-root .ecw-agent .ecw-bubble{background:#fff;border:1px solid #e6e6e6;border-top-left-radius:2px;color:#1f2329}',
    '#ecw-root .ecw-user .ecw-bubble{background:#3f7afa;color:#fff;border-top-right-radius:2px}',
    '#ecw-root .ecw-bubble b{color:#133368;font-weight:600}',
    '#ecw-root .ecw-user .ecw-bubble b{color:#fff}',

    /* 历史会话恢复后的只读消息 */
    '#ecw-root .ecw-archived .ecw-chip,#ecw-root .ecw-archived .ecw-btn,',
    '#ecw-root .ecw-archived .ecw-kbitem,#ecw-root .ecw-archived .ecw-mopt{opacity:.55;pointer-events:none}',

    /* 系统提示（居中胶囊） */
    '#ecw-root .ecw-sys{align-self:center;max-width:92%;font-size:11px;padding:4px 12px;border-radius:999px;',
    ' background:#eceff5;color:#6b7280;text-align:center;animation:ecwIn .25s ease}',
    '#ecw-root .ecw-sys.ecw-warn{background:#fff3e8;color:#c25708;font-weight:500}',

    /* 快捷指令 chips */
    '#ecw-root .ecw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-width:86%}',
    '#ecw-root .ecw-chip{border:1px solid #c9d8ff;background:#fff;color:#2f5fd9;border-radius:999px;',
    ' padding:3px 12px;font-size:12px;cursor:pointer;transition:all .15s}',
    '#ecw-root .ecw-chip:hover{background:#3f7afa;border-color:#3f7afa;color:#fff;box-shadow:0 2px 6px rgba(63,122,250,.3)}',
    '#ecw-root .ecw-chips.ecw-done .ecw-chip{opacity:.45;pointer-events:none;background:#fff;color:#2f5fd9}',

    /* 卡片通用 */
    '#ecw-root .ecw-card{background:#fff;border:1px solid #e9edf4;border-radius:8px;overflow:hidden;',
    ' max-width:100%;box-shadow:0 2px 10px rgba(19,51,104,.07)}',
    '#ecw-root .ecw-cardtitle{padding:8px 10px;font-size:12px;font-weight:600;color:#133368;',
    ' border-bottom:1px solid #f0f0f5;border-left:3px solid #3f7afa;display:flex;align-items:center;',
    ' gap:6px;background:#fafbfe}',

    /* 进度步骤 */
    '#ecw-root .ecw-steps{padding:8px 10px}',
    '#ecw-root .ecw-step{display:flex;gap:8px;padding:4px 0;opacity:.45;transition:opacity .2s}',
    '#ecw-root .ecw-step.ecw-run,#ecw-root .ecw-step.ecw-ok{opacity:1}',
    '#ecw-root .ecw-sicon{width:16px;height:16px;flex-shrink:0;margin-top:2px;display:flex;',
    ' align-items:center;justify-content:center;font-size:13px}',
    '#ecw-root .ecw-step.ecw-ok .ecw-sicon{color:#4e9e44;background:#eaf7e6;border-radius:50%}',
    '#ecw-root .ecw-spin{width:13px;height:13px;border:2px solid #d5e0f5;border-top-color:#3f7afa;',
    ' border-radius:50%;animation:ecwSpin .7s linear infinite}',
    '@keyframes ecwSpin{to{transform:rotate(360deg)}}',
    '#ecw-root .ecw-slabel{font-size:12px;color:#1f2329;font-weight:500}',
    '#ecw-root .ecw-ssubs{margin:2px 0 4px 24px;display:flex;flex-direction:column;gap:2px}',
    '#ecw-root .ecw-ssubs span{font-size:11px;color:#7b8494;animation:ecwIn .25s ease}',

    /* 表格 */
    '#ecw-root .ecw-tblwrap{max-height:300px;overflow:auto}',
    '#ecw-root table.ecw-tbl{width:100%;border-collapse:collapse;font-size:11.5px}',
    '#ecw-root .ecw-tbl th{position:sticky;top:0;background:#f5f7fb;color:#133368;font-weight:600;',
    ' padding:6px 8px;text-align:left;white-space:nowrap;border-bottom:1px solid #e6e6e6}',
    '#ecw-root .ecw-tbl td{padding:6px 8px;border-bottom:1px solid #f0f0f5;color:#333;vertical-align:top}',
    '#ecw-root .ecw-tbl tbody tr:nth-child(even) td{background:#fafcfe}',
    '#ecw-root .ecw-tbl tbody tr:hover td{background:#f2f6ff}',
    '#ecw-root .ecw-tbl tr:last-child td{border-bottom:none}',
    '#ecw-root .ecw-ok-tag{color:#4e9e44;font-weight:500;white-space:nowrap}',
    '#ecw-root .ecw-warn-tag{color:#d97a00;font-weight:500;white-space:nowrap;background:#fff3e8;',
    ' border-radius:3px;padding:0 5px}',
    '#ecw-root .ecw-tblfoot{padding:6px 10px;font-size:11px;color:#8a919f;border-top:1px solid #f0f0f5}',

    /* 指标匹配确认卡片（报告生成 Agent） */
    '#ecw-root .ecw-match{width:100%}',
    '#ecw-root .ecw-mgroup{padding:9px 10px;border-bottom:1px dashed #eceef4}',
    '#ecw-root .ecw-mgroup:last-of-type{border-bottom:none}',
    '#ecw-root .ecw-mgname{font-size:12.5px;font-weight:600;color:#133368;margin-bottom:6px}',
    '#ecw-root .ecw-mopt{display:flex;flex-direction:column;padding:5px 8px;border:1px solid #e6e6e6;',
    ' border-radius:5px;margin-bottom:5px;cursor:pointer;transition:all .12s;background:#fff}',
    '#ecw-root .ecw-mopt:hover{border-color:#b9ccff}',
    '#ecw-root .ecw-mopt.on{border-color:#3f7afa;background:#f5f8ff}',
    '#ecw-root .ecw-ml1{display:flex;align-items:center;gap:6px;min-width:0}',
    '#ecw-root .ecw-radio{width:14px;height:14px;border-radius:50%;border:1.5px solid #c2cad8;',
    ' flex-shrink:0;position:relative;transition:border-color .12s}',
    '#ecw-root .ecw-mopt.on .ecw-radio{border-color:#3f7afa}',
    '#ecw-root .ecw-mopt.on .ecw-radio::after{content:"";position:absolute;inset:3px;border-radius:50%;background:#3f7afa}',
    '#ecw-root .ecw-mcode{font-size:10px;color:#2f5fd9;background:#e8efff;border-radius:3px;padding:0 4px;flex-shrink:0;font-weight:600}',
    '#ecw-root .ecw-mname{font-size:12px;color:#24292f;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-mopt.on .ecw-mname{color:#133368;font-weight:500}',
    '#ecw-root .ecw-mscore{font-size:11px;font-weight:600;flex-shrink:0;color:#98a0ad}',
    '#ecw-root .ecw-mscore.hi{color:#4e9e44}',
    '#ecw-root .ecw-mval{font-size:11px;color:#8a919f;margin:3px 0 0 20px;white-space:nowrap;',
    ' overflow:hidden;text-overflow:ellipsis;max-width:340px}',
    '#ecw-root .ecw-mopt.ecw-skipopt .ecw-ml1 span:last-child{font-size:11.5px;color:#8a6d3b}',
    '#ecw-root .ecw-mopt.ecw-skipopt{background:#fdfaf4}',
    '#ecw-root .ecw-mopt.ecw-skipopt.on{border-color:#e6a23c;background:#fdf3e3}',
    '#ecw-root .ecw-mopt.ecw-skipopt.on .ecw-radio{border-color:#e6a23c}',
    '#ecw-root .ecw-mopt.ecw-skipopt.on .ecw-radio::after{background:#e6a23c}',
    '#ecw-root .ecw-mcustom{display:none;margin:4px 0 2px 20px;gap:6px}',
    '#ecw-root .ecw-mopt.ecw-showin .ecw-mcustom{display:flex}',
    '#ecw-root .ecw-mcin{flex:1;border:1px solid #e6e6e6;border-radius:4px;padding:4px 8px;font-size:12px;',
    ' font-family:inherit;outline:none;min-width:0}',
    '#ecw-root .ecw-mcin:focus{border-color:#3f7afa}',
    '#ecw-root .ecw-mfoot{padding:8px 10px;display:flex;align-items:center;gap:8px;background:#fafbfe;border-top:1px solid #f0f0f5}',
    '#ecw-root .ecw-mfhint{font-size:11px;color:#8a919f;flex:1}',
    '#ecw-root .ecw-match.ecw-locked .ecw-mopt{pointer-events:none;opacity:.6}',
    '#ecw-root .ecw-match.ecw-locked .ecw-mopt.on{opacity:1}',

    /* 生成文档卡片 */
    '#ecw-root .ecw-doc{width:100%}',
    '#ecw-root .ecw-dochead{padding:8px 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '#ecw-root .ecw-doctitle{font-size:12.5px;font-weight:600;color:#133368;flex:1;min-width:0}',
    '#ecw-root .ecw-aitag{font-size:10.5px;color:#d97a00;border:1px solid #ffd9ae;background:#fff8ef;',
    ' border-radius:3px;padding:1px 6px;white-space:nowrap;font-weight:500}',
    '#ecw-root .ecw-docbody{padding:10px 12px;background:#fbfcff;border-top:1px solid #f0f0f5;',
    ' border-bottom:1px solid #f0f0f5;font-size:12.5px;color:#24292f;max-height:260px;overflow-y:auto;',
    ' outline:none;line-height:1.8}',
    '#ecw-root .ecw-docbody p{margin:0 0 8px}',
    '#ecw-root .ecw-docbody:focus{box-shadow:inset 0 0 0 2px #c9d8ff}',
    '#ecw-root .ecw-docfoot{padding:8px 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '#ecw-root .ecw-docnote{font-size:11px;color:#8a919f;flex:1;min-width:120px}',
    '#ecw-root .ecw-btn{border-radius:3px;border:1px solid #3f7afa;color:#3f7afa;background:#fff;',
    ' font-size:11.5px;padding:3px 10px;cursor:pointer;transition:all .15s;white-space:nowrap}',
    '#ecw-root .ecw-btn:hover{background:#3f7afa;color:#fff}',
    '#ecw-root .ecw-btn.ecw-solid{background:#3f7afa;color:#fff}',
    '#ecw-root .ecw-btn.ecw-solid:hover{background:#2f5fd9}',
    '#ecw-root .ecw-btn:disabled{opacity:.5;cursor:not-allowed}',

    /* 文件下载卡片 */
    '#ecw-root .ecw-file{padding:10px;display:flex;align-items:center;gap:10px}',
    '#ecw-root .ecw-ficon{width:38px;height:38px;border-radius:4px;background:#eef3ff;flex-shrink:0;',
    ' display:flex;align-items:center;justify-content:center;font-size:19px}',
    '#ecw-root .ecw-fmeta{flex:1;min-width:0}',
    '#ecw-root .ecw-fname{font-size:12.5px;font-weight:600;color:#133368;word-break:break-all}',
    '#ecw-root .ecw-fsub{font-size:11px;color:#8a919f}',

    /* 列表卡片（知识库目录展示） */
    '#ecw-root .ecw-kb{width:100%}',
    '#ecw-root .ecw-kbhint{font-size:11px;color:#8a919f;font-weight:400;margin-left:auto}',
    '#ecw-root .ecw-kblist{padding:6px 8px;display:flex;flex-direction:column;gap:2px}',
    '#ecw-root .ecw-kbitem{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:6px;',
    ' font-size:12.5px;transition:background .12s}',
    '#ecw-root .ecw-kbitem:hover{background:#f5f8ff}',
    '#ecw-root .ecw-kbitem .ecw-fname{font-weight:400;color:#24292f;flex:1;min-width:0}',
    '#ecw-root .ecw-kbtag{font-size:10px;color:#2f5fd9;background:#e8efff;border-radius:3px;padding:1px 6px;flex-shrink:0}',

    /* 输入区 */
    '#ecw-root .ecw-inputbar{background:#fff;border-top:1px solid #eef0f5;padding:8px 10px 6px;flex-shrink:0}',
    '#ecw-root .ecw-agentbtns{display:flex;gap:8px;margin-bottom:8px}',
    '#ecw-root .ecw-agentbtn{flex:1;height:34px;border:1px solid #dfe3ec;background:#fafbfe;border-radius:4px;',
    ' font-size:12.5px;color:#133368;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;',
    ' transition:all .15s;font-weight:500}',
    '#ecw-root .ecw-agentbtn:hover{border-color:#3f7afa;color:#3f7afa;background:#f5f8ff}',
    '#ecw-root .ecw-agentbtn.ecw-on{background:#3f7afa;border-color:#3f7afa;color:#fff;',
    ' box-shadow:0 3px 8px rgba(63,122,250,.35)}',
    /* 统一输入框：📎/🗂 小按钮 + 无边框输入 + 发送，整体对齐在一个框内 */
    '#ecw-root .ecw-inputbox{display:flex;align-items:flex-end;gap:6px;border:1px solid #dfe3ee;border-radius:10px;',
    ' background:#fbfcff;padding:6px 6px 6px 5px;transition:border-color .15s,background .15s,box-shadow .15s}',
    '#ecw-root .ecw-inputbox:focus-within{border-color:#3f7afa;background:#fff;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '#ecw-root .ecw-leftbtns{display:flex;gap:2px;flex-shrink:0;padding-bottom:1px}',
    '#ecw-root .ecw-attach{width:26px;height:26px;border:none;background:transparent;border-radius:6px;',
    ' cursor:pointer;color:#8a94a6;font-size:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;',
    ' transition:all .15s;position:relative;overflow:hidden}',
    '#ecw-root .ecw-attach:hover{background:#e8efff;color:#3f7afa}',
    '#ecw-root .ecw-filein{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:0}',
    '#ecw-root .ecw-ta{flex:1;border:none;background:transparent;padding:5px 2px;font-size:13px;',
    ' font-family:inherit;resize:none;outline:none;max-height:96px;line-height:1.5;color:#1f2329}',
    '#ecw-root .ecw-ta::placeholder{color:#aab1bd}',
    '#ecw-root .ecw-send{width:28px;height:28px;border:none;border-radius:8px;background:#3f7afa;cursor:pointer;',
    ' flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background .15s}',
    '#ecw-root .ecw-send svg{width:14px;height:14px;fill:#fff}',
    '#ecw-root .ecw-send:hover{background:#2f5fd9}',
    '#ecw-root .ecw-send:disabled{background:#c3cdf3;cursor:not-allowed}',
    '#ecw-root .ecw-footnote{font-size:10.5px;color:#aab1bd;text-align:center;padding:5px 0 2px}',

    /* ---- 知识库文件选择弹窗 ---- */
    '#ecw-root .ecw-kbmask{position:fixed;inset:0;background:rgba(15,25,50,.42);z-index:2147483400;',
    ' display:none;align-items:flex-start;justify-content:center;padding-top:8vh}',
    '#ecw-root .ecw-kbmask.open{display:flex;animation:ecwIn .18s ease}',
    '#ecw-root .ecw-kbdlg{width:440px;max-width:92vw;background:#fff;border-radius:8px;overflow:hidden;',
    ' box-shadow:0 18px 50px rgba(19,51,104,.28);display:flex;flex-direction:column}',
    '#ecw-root .ecw-kbh{height:48px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid #eef0f5;',
    ' font-size:14px;font-weight:600;color:#133368;flex-shrink:0}',
    '#ecw-root .ecw-kbh button{margin-left:auto;border:none;background:transparent;cursor:pointer;',
    ' font-size:14px;color:#98a0ad}',
    '#ecw-root .ecw-kbh button:hover{color:#333}',
    '#ecw-root .ecw-kbbody{max-height:56vh;overflow-y:auto;padding:10px 12px}',
    '#ecw-root .ecw-kbbody::-webkit-scrollbar{width:6px}',
    '#ecw-root .ecw-kbbody::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-ksec{font-size:12px;font-weight:600;color:#133368;background:#f5f7fb;',
    ' border-radius:4px;padding:6px 10px;margin:8px 0 4px;display:flex;align-items:center;gap:6px}',
    '#ecw-root .ecw-ksec:first-child{margin-top:0}',
    '#ecw-root .ecw-kfolder{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:4px;',
    ' cursor:pointer;font-size:12.5px;color:#24292f;transition:background .12s}',
    '#ecw-root .ecw-kfolder:hover{background:#f0f4fc}',
    '#ecw-root .ecw-karrow{font-size:10px;color:#98a0ad;width:10px;flex-shrink:0;transition:transform .15s;',
    ' display:inline-block;text-align:center}',
    '#ecw-root .ecw-karrow.open{transform:rotate(90deg)}',
    '#ecw-root .ecw-kfname{color:#133368;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-kcnt{font-size:10.5px;color:#98a0ad;flex-shrink:0}',
    '#ecw-root .ecw-kkids{display:none}',
    '#ecw-root .ecw-kkids.open{display:block}',
    '#ecw-root .ecw-kfile{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:4px;',
    ' cursor:pointer;font-size:12.5px;color:#24292f;transition:background .12s}',
    '#ecw-root .ecw-kfile:hover{background:#f0f4fc}',
    '#ecw-root .ecw-kfile.on{background:#eef3ff}',
    '#ecw-root .ecw-kfile.on .ecw-kfnm{color:#133368;font-weight:600}',
    '#ecw-root .ecw-kfnm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-kchk{width:15px;height:15px;border:1px solid #c9d0dc;border-radius:3px;flex-shrink:0;',
    ' background:#fff;position:relative;transition:all .12s}',
    '#ecw-root .ecw-kfile.on .ecw-kchk{background:#3f7afa;border-color:#3f7afa}',
    '#ecw-root .ecw-kfile.on .ecw-kchk::after{content:"✓";position:absolute;inset:0;color:#fff;',
    ' font-size:11px;display:flex;align-items:center;justify-content:center}',
    '#ecw-root .ecw-kbfoot{padding:10px 14px;border-top:1px solid #eef0f5;background:#fafbfe;',
    ' display:flex;align-items:center;gap:8px;flex-shrink:0}',
    '#ecw-root .ecw-kbhint{font-size:11.5px;color:#8a919f;flex:1}',
    '#ecw-root .ecw-kbhint.warn{color:#d97a00}',

    /* ---- Excel 样式可编辑表格 + 完整表格弹窗（采集表 Agent） ---- */
    '#ecw-root .ecw-xlsmore{padding:7px 10px;font-size:11.5px;color:#2f5fd9;background:#f5f8ff;',
    ' border-top:1px solid #f0f0f5;cursor:pointer;text-align:center;transition:background .12s}',
    '#ecw-root .ecw-xlsmore:hover{background:#eef3ff}',
    '#ecw-root td.ecw-edit{cursor:text}',
    '#ecw-root td.ecw-edit:hover{background:#fffbe8;box-shadow:inset 0 0 0 1px #f0d47a}',
    '#ecw-root td.ecw-edit:focus{outline:none;background:#fffdf4;box-shadow:inset 0 0 0 2px #3f7afa}',
    '#ecw-root .ecw-xlshint{font-size:11px;color:#8a919f;padding:6px 10px;background:#fafbfe;',
    ' border-bottom:1px solid #f0f0f5;line-height:1.6}',
    '#ecw-root .ecw-bigdlg{width:880px;max-width:94vw;max-height:84vh;background:#fff;border-radius:10px;',
    ' overflow:hidden;box-shadow:0 18px 50px rgba(19,51,104,.28);display:flex;flex-direction:column}',
    '#ecw-root .ecw-bigh{height:50px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid #eef0f5;',
    ' font-size:14px;font-weight:600;color:#133368;flex-shrink:0}',
    '#ecw-root .ecw-bigh button{margin-left:auto;border:none;background:transparent;cursor:pointer;',
    ' font-size:14px;color:#98a0ad}',
    '#ecw-root .ecw-bigh button:hover{color:#333}',
    '#ecw-root .ecw-bigb{flex:1;overflow-y:auto;padding:10px 14px}',
    '#ecw-root .ecw-bigb::-webkit-scrollbar{width:6px}',
    '#ecw-root .ecw-bigb::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-bigb .ecw-tbl{font-size:12px}',
    '#ecw-root .ecw-bigf{padding:10px 14px;border-top:1px solid #eef0f5;background:#fafbfe;display:flex;',
    ' align-items:center;gap:8px;flex-shrink:0}',

    /* ---- 📊 数据选择弹窗（REQ-01 v4：五层下钻 + 子树搜索 + 已选区逐指标配置年份/维度）----
       界面形态（弹窗/抽屉/面板）待确认：原型按【🗂】知识库选择弹窗形态实现，
       复用其遮罩 ecw-kbmask / 指标行 ecw-kbfile+ecw-kchk / 底栏 ecw-kbfoot。 */
    '#ecw-root .ecw-dsdlg{width:470px;max-width:92vw;background:#fff;border-radius:8px;overflow:hidden;',
    ' box-shadow:0 18px 50px rgba(19,51,104,.28);display:flex;flex-direction:column}',
    '#ecw-root .ecw-dscrumb{padding:9px 14px 0;font-size:12px;display:flex;align-items:center;',
    ' flex-wrap:wrap;gap:2px;flex-shrink:0}',
    '#ecw-root .ecw-dscrumb span{color:#3f7afa;cursor:pointer}',
    '#ecw-root .ecw-dscrumb span:hover{text-decoration:underline}',
    '#ecw-root .ecw-dscrumb em{color:#c2cad8;font-style:normal;padding:0 2px}',
    '#ecw-root .ecw-dscrumb b{color:#133368;font-weight:600}',
    '#ecw-root .ecw-dssearch{display:flex;align-items:center;gap:6px;margin:8px 12px;border:1px solid #dfe3ee;',
    ' border-radius:6px;background:#fbfcff;padding:6px 9px;flex-shrink:0;',
    ' transition:border-color .15s,background .15s,box-shadow .15s}',
    '#ecw-root .ecw-dssearch:focus-within{border-color:#3f7afa;background:#fff;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '#ecw-root .ecw-dssearch i{font-style:normal;font-size:12px;color:#8a94a6;flex-shrink:0}',
    '#ecw-root .ecw-dsin{flex:1;border:none;background:transparent;outline:none;font-size:12.5px;',
    ' font-family:inherit;color:#1f2329;min-width:0}',
    '#ecw-root .ecw-dsin::placeholder{color:#aab1bd}',
    /* v4：已选指标区改为逐指标配置条目（占高更多），压缩列表高度避免小屏下弹窗超出视口 */
    '#ecw-root .ecw-dslist{max-height:32vh;overflow-y:auto;padding:4px 8px 8px}',
    '#ecw-root .ecw-dslist::-webkit-scrollbar{width:6px}',
    '#ecw-root .ecw-dslist::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-dsback{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;margin:2px 0 4px;',
    ' font-size:12px;color:#3f7afa;cursor:pointer;border-radius:4px}',
    '#ecw-root .ecw-dsback:hover{background:#f0f4fc}',
    '#ecw-root .ecw-dstip{padding:6px 10px;font-size:11px;color:#8a919f;background:#fafbfe;',
    ' border-radius:4px;margin:2px 0 4px;line-height:1.6}',
    '#ecw-root .ecw-dsnav{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:6px;',
    ' cursor:pointer;font-size:12.5px;color:#24292f;transition:background .12s}',
    '#ecw-root .ecw-dsnav:hover{background:#f5f8ff}',
    '#ecw-root .ecw-dsnavname{color:#133368;font-weight:500;flex:1;min-width:0;white-space:nowrap;',
    ' overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-dscnt{font-size:10.5px;color:#98a0ad;flex-shrink:0}',
    '#ecw-root .ecw-dsarrow{font-size:12px;color:#c2cad8;flex-shrink:0}',
    '#ecw-root .ecw-dsempty{padding:28px 10px;text-align:center;font-size:12px;color:#aab1bd}',
    '#ecw-root .ecw-dssel{padding:8px 12px;border-top:1px solid #eef0f5;background:#fafbfe;display:flex;',
    ' flex-direction:column;align-items:stretch;gap:6px;max-height:26vh;overflow-y:auto;flex-shrink:0}',
    '#ecw-root .ecw-dsselh{font-size:11.5px;color:#8a919f}',
    /* 已选指标条目（REQ v4：每条自带年份/维度配置，条目间互相独立） */
    '#ecw-root .ecw-dsentry{background:#fff;border:1px solid #e3e8f2;border-radius:6px;',
    ' padding:6px 8px;display:flex;flex-direction:column;gap:5px}',
    '#ecw-root .ecw-dsehead{display:flex;align-items:center;gap:7px;min-width:0}',
    '#ecw-root .ecw-dsename{flex:1;min-width:0;font-size:12px;font-weight:600;color:#133368;',
    ' white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-dserm{width:18px;height:18px;flex-shrink:0;display:flex;align-items:center;',
    ' justify-content:center;border-radius:3px;cursor:pointer;color:#98a0ad;font-size:11px}',
    '#ecw-root .ecw-dserm:hover{color:#ff371d;background:#ffe9e5}',
    '#ecw-root .ecw-dsecfg{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',

    /* ---- 🧭 指标条目内的年份/维度配置控件（REQ-01 v4，指标级）与维度二级弹窗（前缀 ecw-dim*） ---- */
    '#ecw-root .ecw-dsyear{height:28px;border:1px solid #dfe3ee;border-radius:6px;background:#fbfcff;',
    ' font-size:12px;color:#1f2329;font-family:inherit;padding:0 6px;outline:none;cursor:pointer;',
    ' flex-shrink:0;transition:border-color .15s,background .15s}',
    '#ecw-root .ecw-dsyear:focus{border-color:#3f7afa;background:#fff;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '#ecw-root .ecw-dimopen{height:28px;border:1px solid #dfe3ee;border-radius:6px;background:#fbfcff;',
    ' font-size:12px;color:#133368;font-family:inherit;padding:0 10px;cursor:pointer;flex-shrink:0;',
    ' font-weight:500;transition:all .15s}',
    '#ecw-root .ecw-dimopen:hover{border-color:#3f7afa;color:#3f7afa;background:#f5f8ff}',
    '#ecw-root .ecw-dimecho{flex:1;min-width:120px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '#ecw-root .ecw-dimtxt{font-size:11.5px;color:#133368;max-width:100%;white-space:nowrap;',
    ' overflow:hidden;text-overflow:ellipsis}',
    '#ecw-root .ecw-dimtxt.ecw-dimdef{color:#8a919f}',
    '#ecw-root .ecw-dimclear{font-size:11px;color:#8a94a6;cursor:pointer;flex-shrink:0}',
    '#ecw-root .ecw-dimclear:hover{color:#ff371d}',
    /* 维度二级弹窗：叠在数据选择弹窗之上（z-index 高于 ecw-kbmask 的 2147483400） */
    '#ecw-root .ecw-dimmask{position:fixed;inset:0;background:rgba(15,25,50,.42);z-index:2147483450;',
    ' display:none;align-items:flex-start;justify-content:center;padding-top:8vh}',
    '#ecw-root .ecw-dimmask.open{display:flex;animation:ecwIn .18s ease}',
    '#ecw-root .ecw-dimdlg{width:470px;max-width:92vw;background:#fff;border-radius:8px;overflow:hidden;',
    ' box-shadow:0 18px 50px rgba(19,51,104,.28);display:flex;flex-direction:column}',
    '#ecw-root .ecw-dimtabs{display:flex;gap:6px;padding:10px 12px 0;flex-shrink:0}',
    '#ecw-root .ecw-dimtab{flex:1;text-align:center;padding:6px 4px;border:1px solid #dfe3ec;',
    ' border-radius:6px;background:#f2f4fa;font-size:12px;color:#5a6472;cursor:pointer;',
    ' transition:all .15s;white-space:nowrap}',
    '#ecw-root .ecw-dimtab:hover{color:#3f7afa}',
    '#ecw-root .ecw-dimtab.on{background:#fff;color:#133368;font-weight:600;box-shadow:inset 0 2px 0 #3f7afa}',
    '#ecw-root .ecw-dimtab i{font-style:normal;display:inline-block;min-width:15px;height:15px;',
    ' line-height:15px;border-radius:8px;background:#3f7afa;color:#fff;font-size:10px;margin-left:4px;padding:0 3px}',
    '#ecw-root .ecw-dimtip{margin:8px 12px 0;padding:6px 10px;font-size:11px;color:#8a919f;',
    ' background:#fafbfe;border-radius:4px;line-height:1.6;flex-shrink:0}',
    '#ecw-root .ecw-dimbody{max-height:46vh;overflow-y:auto;padding:6px 8px 10px}',
    '#ecw-root .ecw-dimbody::-webkit-scrollbar{width:6px}',
    '#ecw-root .ecw-dimbody::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '#ecw-root .ecw-dimgroup{margin-bottom:2px}',
    '#ecw-root .ecw-dimkids{border-left:1px dashed #e3e7f0;margin:0 0 2px 13px}',
    '#ecw-root .ecw-dimnote{font-size:10.5px;color:#98a0ad;flex-shrink:0}',
    '#ecw-root .ecw-cardtitle .ecw-aitag{margin-left:auto}'
  ].join('');

  /* ================================================================
   * 三、DOM 构建
   * ================================================================ */
  var styleTag = el('style');
  styleTag.id = 'ecw-style';
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7.4L4 20.4V4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12.5h5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M3 11.5l17.2-8.1c.8-.4 1.7.5 1.3 1.3L13.4 21.9c-.4.8-1.6.7-1.9-.2l-2.1-6.1-6.1-2.1c-.9-.3-1-1.5-.2-1.9z" transform="translate(0,-1)"/></svg>';

  var root = el('div');
  root.id = 'ecw-root';
  root.setAttribute('data-mode', 'chat');
  root.innerHTML =
    '<button class="ecw-launcher" title="AI 助手">' + ICON_CHAT + '<span class="ecw-dot"></span></button>' +
    '<div class="ecw-panel">' +
    '  <div class="ecw-side">' +
    '    <div class="ecw-sideh">对话历史</div>' +
    '    <button class="ecw-newbtn">＋ 新对话</button>' +
    '    <div class="ecw-sidelist" id="ecw-sidelist"></div>' +
    '  </div>' +
    '  <div class="ecw-main">' +
    '    <div class="ecw-header">' +
    '      <button class="ecw-sidebtn" id="ecw-sidebtn" title="展开/收起历史对话">☰</button>' +
    '      <div class="ecw-avatar" id="ecw-avatar">💬</div>' +
    '      <div class="ecw-hinfo">' +
    '        <div class="ecw-hname" id="ecw-hname">ESG 智能助手</div>' +
    '        <div class="ecw-hstatus"><i></i><span>在线 · 已连接知识库与指标库</span></div>' +
    '      </div>' +
    // '      <button class="ecw-hbtn" id="ecw-newbtn2" title="开启新对话">⟳ 新对话</button>' +
    '      <button class="ecw-hbtn" id="ecw-closebtn" title="收起">✕</button>' +
    '    </div>' +
    '    <div class="ecw-modebar" id="ecw-modebar"></div>' +
    '    <div class="ecw-msgs" id="ecw-msgs"></div>' +
    '    <div class="ecw-inputbar">' +
    '      <div class="ecw-agentbtns">' +
    '        <button class="ecw-agentbtn" data-mode="report">报告生成</button>' +
    '        <button class="ecw-agentbtn" data-mode="collect">指标信息采集表</button>' +
    // 📊 数据选择（REQ-01 v4）：排在【指标信息采集表】之后。
    // 正式口径：仅管理员可见（全局规则 7，与上两个功能按钮一致）——
    // 原型 mock 无角色体系，故与既有按钮一致无条件显示；无 data-mode（不切换对话模式）。
    '        <button class="ecw-agentbtn" id="ecw-databtn">数据选择</button>' +
    '      </div>' +
    '      <div class="ecw-inputbox">' +
    '        <div class="ecw-leftbtns">' +
    '          <button class="ecw-attach" id="ecw-attachbtn" title="上传附件（可多选）">📎' +
    '            <input type="file" class="ecw-filein" id="ecw-filein" multiple></button>' +
    '          <button class="ecw-attach" id="ecw-kbbtn" title="从知识库选择文件（免重复上传）">🗂</button>' +
    '        </div>' +
    '        <textarea class="ecw-ta" id="ecw-ta" rows="1" placeholder="向智能助手提问，如：知识库里有哪些文件？"></textarea>' +
    '        <button class="ecw-send" id="ecw-sendbtn" title="发送">' + ICON_SEND + '</button>' +
    '      </div>' +
    '      <div class="ecw-footnote">内容由 AI 生成/提取，请人工核实 · 本原型数据均为模拟</div>' +
    '    </div>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(root);

  var blinkCss = el('style');
  blinkCss.textContent = '@keyframes ecwBlink{0%,100%{opacity:.25}50%{opacity:1}}';
  document.head.appendChild(blinkCss);

  var $ = function (id) { return root.querySelector('#' + id); };
  var msgs = $('ecw-msgs');
  var ta = $('ecw-ta');
  var sendBtn = $('ecw-sendbtn');
  var busy = false;

  /* ================================================================
   * 四、消息渲染
   * ================================================================ */
  function killChips() {
    root.querySelectorAll('.ecw-chips:not(.ecw-done)').forEach(function (c) { c.classList.add('ecw-done'); });
  }

  function addUser(text) {
    killChips();
    var row = el('div', 'ecw-row ecw-user');
    row.appendChild(el('div', 'ecw-bubble', md(text)));
    msgs.appendChild(row);
    ensureConv(text);
    scrollBottom();
    return row;
  }

  function addSystem(text, type) {
    killChips();
    var n = el('div', 'ecw-sys' + (type === 'warn' ? ' ecw-warn' : ''), md(text));
    msgs.appendChild(n);
    scrollBottom();
    return n;
  }

  /* Agent 文本消息；opts: {text, html, chips:[{label, act}]} */
  function addAgent(opts) {
    opts = opts || {};
    killChips();
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var box = el('div');
    box.style.maxWidth = '100%';
    box.appendChild(el('div', 'ecw-bubble', opts.html || md(opts.text || '')));
    if (opts.chips && opts.chips.length) {
      var chipRow = el('div', 'ecw-chips');
      opts.chips.forEach(function (c) {
        var b = el('button', 'ecw-chip', escapeHtml(c.label));
        b.onclick = function () {
          if (busy) return;
          chipRow.classList.add('ecw-done');
          addUser(c.label);
          if (c.act) c.act();
        };
        chipRow.appendChild(b);
      });
      box.appendChild(chipRow);
    }
    row.appendChild(av);
    row.appendChild(box);
    msgs.appendChild(row);
    scrollBottom();
    return row;
  }

  /* “正在输入”指示 */
  var typingRow = null;
  function showTyping(label) {
    hideTyping();
    killChips();
    typingRow = el('div', 'ecw-row ecw-agent');
    typingRow.innerHTML = '<div class="ecw-mavatar">' + agentEmoji() + '</div>' +
      '<div class="ecw-bubble" style="display:flex;align-items:center;gap:8px">' +
      '<span style="display:inline-flex;gap:3px">' +
      '<i style="width:5px;height:5px;border-radius:50%;background:#3f7afa;display:inline-block;animation:ecwBlink 1s infinite"></i>' +
      '<i style="width:5px;height:5px;border-radius:50%;background:#3f7afa;display:inline-block;animation:ecwBlink 1s .2s infinite"></i>' +
      '<i style="width:5px;height:5px;border-radius:50%;background:#3f7afa;display:inline-block;animation:ecwBlink 1s .4s infinite"></i>' +
      '</span><span style="font-size:12px;color:#7b8494">' + escapeHtml(label || '正在思考…') + '</span></div>';
    msgs.appendChild(typingRow);
    scrollBottom();
  }
  function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

  /* 工具调用进度卡片 → Promise */
  function addProgress(title, steps) {
    return new Promise(function (resolve) {
      var row = el('div', 'ecw-row ecw-agent');
      var av = el('div', 'ecw-mavatar', agentEmoji());
      var card = el('div', 'ecw-card');
      card.style.width = '100%';
      if (title) card.appendChild(el('div', 'ecw-cardtitle', '⚙️ ' + escapeHtml(title)));
      var list = el('div', 'ecw-steps');
      card.appendChild(list);

      (async function run() {
        for (var i = 0; i < steps.length; i++) {
          var st = steps[i];
          var item = el('div', 'ecw-step');
          item.innerHTML = '<span class="ecw-sicon"><span class="ecw-spin"></span></span>' +
            '<span style="flex:1"><span class="ecw-slabel">' + escapeHtml(st.label) + '</span>' +
            '<span class="ecw-ssubs"></span></span>';
          list.appendChild(item);
          item.classList.add('ecw-run');
          scrollBottom();
          await sleep(st.dur || 900);
          item.classList.remove('ecw-run');
          item.classList.add('ecw-ok');
          item.querySelector('.ecw-sicon').innerHTML = '✓';
          if (st.sub && st.sub.length) {
            var subs = item.querySelector('.ecw-ssubs');
            st.sub.forEach(function (s) { subs.appendChild(el('span', null, '· ' + md(s))); });
          }
          scrollBottom();
          await sleep(220);
        }
        await sleep(300);
        resolve();
      })();

      row.appendChild(av);
      row.appendChild(card);
      msgs.appendChild(row);
      scrollBottom();
    });
  }

  /* 数据表格卡片 */
  function addTable(cfg) {
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card');
    card.style.width = '100%';
    if (cfg.title) card.appendChild(el('div', 'ecw-cardtitle', escapeHtml(cfg.title)));
    var wrap = el('div', 'ecw-tblwrap');
    var t = el('table', 'ecw-tbl');
    var thead = el('thead');
    thead.innerHTML = '<tr>' + cfg.columns.map(function (c) { return '<th>' + escapeHtml(c) + '</th>'; }).join('') + '</tr>';
    t.appendChild(thead);
    var tbody = el('tbody');
    cfg.rows.forEach(function (r) {
      var tr = el('tr');
      r.forEach(function (cell) {
        if (cell && typeof cell === 'object' && cell.tag) {
          tr.appendChild(el('td', null, '<span class="' + (cell.tag === 'warn' ? 'ecw-warn-tag' : 'ecw-ok-tag') + '">' + escapeHtml(cell.text) + '</span>'));
        } else {
          tr.appendChild(el('td', null, md(String(cell))));
        }
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    wrap.appendChild(t);
    card.appendChild(wrap);
    if (cfg.foot) card.appendChild(el('div', 'ecw-tblfoot', md(cfg.foot)));
    row.appendChild(av); row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
    return row;
  }

  /* AI 生成文档卡片 */
  function addDocCard(cfg) {
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card ecw-doc');
    card.style.width = '100%';
    var head = el('div', 'ecw-dochead');
    head.appendChild(el('div', 'ecw-doctitle', escapeHtml(cfg.title)));
    head.appendChild(el('span', 'ecw-aitag', '⚠ AI生成/提取，请人工核实'));
    card.appendChild(head);
    var body = el('div', 'ecw-docbody');
    body.contentEditable = 'true';
    body.innerHTML = cfg.html;
    body.spellcheck = false;
    card.appendChild(body);
    var foot = el('div', 'ecw-docfoot');
    foot.appendChild(el('div', 'ecw-docnote', md(cfg.note || '')));
    var bCopy = el('button', 'ecw-btn', '复制全文');
    bCopy.onclick = function () { copyText(body.innerText, bCopy); };
    foot.appendChild(bCopy);
    if (cfg.download) {
      var bDl = el('button', 'ecw-btn ecw-solid', '⬇ 下载 .docx');
      bDl.onclick = function () { downloadWord(cfg.download.name, cfg.download.build()); };
      foot.appendChild(bDl);
    }
    card.appendChild(foot);
    row.appendChild(av); row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* 文件下载卡片 */
  function addFileCard(cfg) {
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card');
    card.style.width = '100%';
    var f = el('div', 'ecw-file');
    f.appendChild(el('div', 'ecw-ficon', cfg.icon || '📄'));
    var meta = el('div', 'ecw-fmeta');
    meta.appendChild(el('div', 'ecw-fname', escapeHtml(cfg.name)));
    meta.appendChild(el('div', 'ecw-fsub', escapeHtml(cfg.sub || '')));
    f.appendChild(meta);
    var b = el('button', 'ecw-btn ecw-solid', escapeHtml(cfg.btn || '⬇ 下载'));
    b.onclick = function () {
      cfg.onDownload();
      b.textContent = '✓ 已下载';
      b.disabled = true;
      setTimeout(function () { b.textContent = cfg.btn || '⬇ 下载'; b.disabled = false; }, 1800);
    };
    f.appendChild(b);
    card.appendChild(f);
    if (cfg.note) card.appendChild(el('div', 'ecw-tblfoot', md(cfg.note)));
    row.appendChild(av); row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* 列表展示卡片（只读，如知识库目录） */
  function addListCard(cfg) {
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card ecw-kb');
    card.style.width = '100%';
    var head = el('div', 'ecw-cardtitle', '📁 ' + escapeHtml(cfg.title));
    if (cfg.hint) head.appendChild(el('span', 'ecw-kbhint', escapeHtml(cfg.hint)));
    card.appendChild(head);
    var list = el('div', 'ecw-kblist');
    cfg.items.forEach(function (it) {
      var icon = /\.xlsx?$/.test(it.name) ? '📊' : /\.pdf$/.test(it.name) ? '📕' : '📄';
      var item = el('div', 'ecw-kbitem',
        '<span>' + icon + '</span><span class="ecw-fname">' + escapeHtml(it.name) + '</span>' +
        (it.tag ? '<span class="ecw-kbtag">' + escapeHtml(it.tag) + '</span>' : ''));
      list.appendChild(item);
    });
    card.appendChild(list);
    if (cfg.foot) card.appendChild(el('div', 'ecw-tblfoot', md(cfg.foot)));
    row.appendChild(av); row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* ================================================================
   * 五、历史对话（左侧栏 + localStorage 持久化）
   * ================================================================ */
  var HISTORY_KEY = 'ecw-history-v2';
  var historyMem = [];                    /* localStorage 不可用时的内存兜底 */
  var currentId = null;
  var conversations = [];

  function readHistory() {
    try {
      var v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return historyMem; }
  }
  function writeHistory() {
    historyMem = conversations;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations)); } catch (e) { /* 忽略 */ }
  }
  function findConv(id) {
    for (var i = 0; i < conversations.length; i++) if (conversations[i].id === id) return conversations[i];
    return null;
  }
  /* 首次用户发言时创建会话条目 */
  function ensureConv(firstText) {
    if (currentId && findConv(currentId)) {
      var c = findConv(currentId);
      if (c.title === '新对话') c.title = shortTitle(firstText);
      renderSide();
      return;
    }
    var conv = { id: uid(), title: shortTitle(firstText), time: fmtTime(), mode: state.mode, html: '' };
    conversations.unshift(conv);
    if (conversations.length > 20) conversations.length = 20;
    currentId = conv.id;
    renderSide();
  }
  function shortTitle(text) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    return text ? text.slice(0, 12) : '新对话';
  }
  /* 内容变化时自动保存快照（含恢复的历史会话） */
  var saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var c = currentId && findConv(currentId);
      if (!c) return;
      c.html = msgs.innerHTML;
      c.mode = state.mode;
      writeHistory();
    }, 250);
  }
  new MutationObserver(scheduleSave).observe(msgs, { childList: true, subtree: true, characterData: true });

  function renderSide() {
    var listEl = $('ecw-sidelist');
    listEl.innerHTML = '';
    if (!conversations.length) {
      listEl.appendChild(el('div', 'ecw-sidehint', '暂无历史对话'));
      return;
    }
    conversations.forEach(function (c) {
      var item = el('div', 'ecw-sitem' + (c.id === currentId ? ' on' : ''));
      item.innerHTML = '<div class="ecw-st">' + escapeHtml(c.title) + '</div>' +
        '<div class="ecw-ss">' + (MODES[c.mode] ? MODES[c.mode].emoji + ' ' : '') +
        escapeHtml(MODES[c.mode] ? MODES[c.mode].name.replace('ESG ', '') : '会话') + ' · ' + escapeHtml(c.time) + '</div>';
      item.onclick = function () { loadConv(c.id); };
      var del = el('button', 'ecw-sdel', '✕');
      del.title = '删除该对话';
      del.onclick = function (e) {
        e.stopPropagation();
        conversations = conversations.filter(function (x) { return x.id !== c.id; });
        if (c.id === currentId) { currentId = null; newChat(); } else renderSide();
        writeHistory();
      };
      item.appendChild(del);
      listEl.appendChild(item);
    });
  }

  /* 加载历史会话：恢复为只读快照，可继续发消息（新内容可交互） */
  function loadConv(id) {
    var c = findConv(id);
    if (!c || id === currentId) return;
    clearTimeout(saveTimer);
    var cur = currentId && findConv(currentId);
    if (cur) { cur.html = msgs.innerHTML; cur.mode = state.mode; }
    currentId = id;
    msgs.innerHTML = c.html || '';
    /* 旧消息标记为只读（按钮/选项失效） */
    Array.prototype.forEach.call(msgs.children, function (n) { n.classList.add('ecw-archived'); });
    if (c.mode && c.mode !== state.mode) setMode(c.mode, true);
    renderSide();
    writeHistory();
    scrollBottom();
  }

  function newChat() {
    interrupt();
    clearTimeout(saveTimer);
    var cur = currentId && findConv(currentId);
    if (cur) { cur.html = msgs.innerHTML; }
    writeHistory();
    currentId = null;
    msgs.innerHTML = '';
    resetCollect();
    setMode('chat', true);
    addSystem('已开启新对话 · 原型演示数据为模拟');
    chatIntro();
    renderSide();
  }

  /* ================================================================
   * 六、模式管理
   * ================================================================ */
  var MODES = {
    chat: {
      emoji: '💬', name: 'ESG 智能助手',
      ph: '向智能助手提问，如：知识库里有哪些文件？',
      banner: ''
    },
    report: {
      emoji: '📄', name: '报告生成 Agent',
      ph: '输入任意内容或描述要求，开始报告生成演示…',
      banner: '当前 Agent：<b>报告生成</b> · 输入任意内容或上传附件即可开始演示'
    },
    collect: {
      emoji: '📋', name: '指标信息采集表 Agent',
      ph: '请输入内容',
      banner: '当前 Agent：<b>指标信息采集表</b> · 本期仅支持上交所《2026年FII可持续发展报告》模板'
    }
  };
  var state = { mode: 'chat' };

  /* ---- 会话中断机制：切换 Agent / 新对话时中止进行中的演示流程 ---- */
  var sessionCounter = 0;
  var busyOwner = null;
  function startSession() { sessionCounter++; busyOwner = sessionCounter; busy = true; return sessionCounter; }
  /* 流程在每个 await 后调用：若已被更新会话取代则释放并返回 true */
  function stale(s) {
    if (s === sessionCounter) return false;
    if (busyOwner === s) { busy = false; busyOwner = null; hideTyping(); }
    return true;
  }
  function endSession(s) {
    if (busyOwner === s) { busy = false; busyOwner = null; }
  }
  /* 用户主动打断（切换模式 / 新对话 / 关闭面板） */
  function interrupt() {
    sessionCounter++;
    busy = false;
    busyOwner = null;
    hideTyping();
  }

  function agentEmoji() { return MODES[state.mode].emoji; }

  function setMode(mode, silent) {
    interrupt();
    state.mode = mode;
    root.setAttribute('data-mode', mode);
    $('ecw-avatar').textContent = MODES[mode].emoji;
    $('ecw-hname').textContent = MODES[mode].name;
    $('ecw-modebar').innerHTML = MODES[mode].banner;
    ta.placeholder = MODES[mode].ph;
    root.querySelectorAll('.ecw-agentbtn').forEach(function (b) {
      b.classList.toggle('ecw-on', b.getAttribute('data-mode') === mode);
    });
    if (!silent) {
      if (mode === 'report') { addSystem('已切换至「报告生成」Agent'); reportIntro(); }
      else if (mode === 'collect') { addSystem('已切换至「指标信息采集表」Agent'); collectIntro(); }
      else { addSystem('已切换回「智能助手」'); chatIntro(); }
    }
  }

  /* ================================================================
   * 七、对话脚本与模拟数据
   * ================================================================ */

  /* ---------- 报告生成演示数据（固定脚本，与用户输入无关） ---------- */
  var MATCH_DATA = [
    {
      name: '供应商区域分布',
      opts: [
        { code: 'SOC-007', name: '供应商区域分布', score: '0.9', hi: true, val: '非洲3642家、美洲793家、欧洲618家、其他…' },
        { code: 'SOC-005', name: '供应商总数', score: '0.4', val: '5,173 家' },
        { code: 'SOC-008', name: '供应商筛选原则', score: '0.1', val: '涵盖环境面向、社会面向、治理面向和业务四大面向,…' }
      ]
    },
    {
      name: '供应商类型分布',
      opts: [
        { code: 'SOC-005', name: '供应商总数', score: '0.3', val: '5,173 家' },
        { code: 'SOC-007', name: '供应商区域分布', score: '0.2', val: '非洲3642家、美洲793家、欧洲618家、其他…' },
        { code: 'SOC-008', name: '供应商筛选原则', score: '0.1', val: '涵盖环境面向、社会面向、治理面向和业务四大面向,…' }
      ]
    },
    {
      name: '供应商总数',
      opts: [
        { code: 'SOC-005', name: '供应商总数', score: '0.95', hi: true, val: '5,173 家' },
        { code: 'SOC-007', name: '供应商区域分布', score: '0.4', val: '非洲3642家、美洲793家、欧洲618家、其他…' },
        { code: 'SOC-008', name: '供应商筛选原则', score: '0.1', val: '涵盖环境面向、社会面向、治理面向和业务四大面向,…' }
      ]
    },
    {
      name: '重大供应商筛选原则',
      opts: [
        { code: 'SOC-008', name: '供应商筛选原则', score: '0.98', hi: true, val: '涵盖环境面向、社会面向、治理面向和业务四大面向,…' },
        { code: 'SOC-005', name: '供应商总数', score: '0.1', val: '5,173 家' },
        { code: 'SOC-007', name: '供应商区域分布', score: '0.05', val: '非洲3642家、美洲793家、欧洲618家、其他…' }
      ]
    }
  ];

  var REPORT_TEXT =
    '<p>工业富联的供应商遍及亚洲、美洲、欧洲等多个国家和地区，主要涉及电子件、机构件和服务类供应商，' +
    '报告期内供应商总数为 <b>5,099 家</b>。对于合作供应商，我们制定重大供应商筛选原则，涵盖环境面向、社会面向、' +
    '治理面向和业务四大面向，以及国家、产业及商品三大考量风险。</p>';

  /* ---------- 采集表数据（模板指标名取自《工业富联_ESG信息采集表_定量指标.xlsx》指标名称列；
     「平台指标」与数值为演示模拟数据） ---------- */
  var COLLECT_ROWS = [
    { tpl: '披露的温室气体范围1排放量（二氧化碳当量公吨）', ind: '温室气体排放-范围一', v25: '81,607.46', v24: '92,983.81', st: 'ok' },
    { tpl: '披露的温室气体范围2排放量（二氧化碳当量公吨）', ind: '温室气体排放-范围二', v25: '750,516.01', v24: '746,866.14', st: 'ok' },
    { tpl: '如是，披露的温室气体范围3排放量（二氧化碳当量公吨）', ind: '温室气体排放-范围三（价值链）', v25: '16,555,532.07', v24: '18,166,382.83', st: 'warn' },
    { tpl: '温室气体减排资金投入（万元）', ind: '温室气体减排资金投入', v25: '15,467.25', v24: '27,205.55', st: 'ok' },
    { tpl: '披露的温室气体减排量（二氧化碳当量公吨）', ind: '年度温室气体减排量', v25: '207', v24: '208.6', st: 'ok' },
    { tpl: '颗粒物（PM）', ind: '颗粒物（PM）排放量', v25: '66.95', v24: '70.21', st: 'ok' },
    { tpl: '硫氧化物（SOx）', ind: '硫氧化物（SOx）排放量', v25: '8.18', v24: '10.71', st: 'ok' },
    { tpl: '氮氧化物（NOX）', ind: '氮氧化物（NOx）排放量', v25: '5.14', v24: '8.49', st: 'ok' },
    { tpl: '挥发性有机物（VOCs）', ind: '挥发性有机物（VOCs）排放量', v25: '100.8', v24: '100.46', st: 'ok' },
    { tpl: '化学需氧量（COD）', ind: '化学需氧量（COD）排放量', v25: '412.36', v24: '428.51', st: 'ok' },
    { tpl: '生化需氧量（BOD）', ind: '生化需氧量（BOD）排放量', v25: '87.2', v24: '90.4', st: 'ok' },
    { tpl: '氨氮（NH3-N）', ind: '氨氮排放量', v25: '35.8', v24: '38.6', st: 'ok' },
    { tpl: '总氮（TN）', ind: '总氮排放量', v25: '128.4', v24: '132.7', st: 'ok' },
    { tpl: '总磷（TP）', ind: '总磷排放量', v25: '9.6', v24: '10.2', st: 'ok' },
    { tpl: '产生的有害废弃物总量（吨）', ind: '有害废弃物产生总量', v25: '24,618.5', v24: '25,872.3', st: 'ok' },
    { tpl: '产生的无害废弃物总量（吨）', ind: '无害废弃物产生总量', v25: '486,210.7', v24: '502,315.4', st: 'ok' },
    { tpl: '直接能源总消耗量（吨标准煤）', ind: '直接能源消耗量', v25: '268,432', v24: '279,105', st: 'ok' },
    { tpl: '间接能源总消耗量（吨标准煤）', ind: '间接能源消耗量', v25: '1,502,884', v24: '1,536,407', st: 'ok' },
    { tpl: '能源消费总量（吨标准煤）', ind: '综合能源消耗总量', v25: '1,771,316', v24: '1,815,512', st: 'ok' },
    { tpl: '其中：清洁能源使用量（吨标准煤）', ind: '清洁能源使用量', v25: '503,207', v24: '468,913', st: 'ok' },
    { tpl: '总能耗强度（吨标煤/万元）', ind: '单位营收综合能耗', v25: '0.0387', v24: '0.0402', st: 'warn' },
    { tpl: '总耗水量（吨）', ind: '总耗水量', v25: '35,216,804', v24: '34,872,315', st: 'ok' },
    { tpl: '水资源使用强度（吨/万元）', ind: '单位营收水耗', v25: '0.77', v24: '0.79', st: 'ok' },
    { tpl: '废弃物循环利用量（吨）', ind: '废弃物循环利用量', v25: '273,532.19', v24: '195,593.11', st: 'ok' },
    { tpl: '乡村振兴总投入金额（万元）', ind: '乡村振兴投入总额', v25: '3,286.4', v24: '2,915.8', st: 'ok' },
    { tpl: '乡村振兴惠及人数（人）', ind: '乡村振兴惠及人数', v25: '128,560', v24: '96,420', st: 'ok' },
    { tpl: '公益慈善、志愿活动等投入资金金额（万元）', ind: '公益慈善及志愿服务投入', v25: '1,053.2', v24: '986.5', st: 'ok' },
    { tpl: '研发投入金额（万元）', ind: '研发投入金额', v25: '1,115,107.6', v24: '1,063,077.8', st: 'ok' },
    { tpl: '研发投入占主营业务收入比例（%）', ind: '研发投入占营收比例', v25: '1.24', v24: '1.75', st: 'ok' },
    { tpl: '报告期末逾期未支付款项的金额（万元）', ind: '逾期未支付款项总额', v25: '0', v24: '128.6', st: 'warn' },
    { tpl: '逾期未支付中小企业款项金额（万元）', ind: '逾期未支付中小企业款项', v25: '0', v24: '0', st: 'ok' },
    { tpl: '员工流失率（%）（剔除适龄退休）', ind: '员工流失率（剔除适龄退休）', v25: '16.22', v24: '24.16', st: 'ok' },
    { tpl: '员工培训覆盖率（%）', ind: '员工培训覆盖率', v25: '100', v24: '100', st: 'ok' },
    { tpl: '年度培训支出金额（万元）', ind: '年度培训支出', v25: '1,699.1', v24: '1,774.2', st: 'ok' },
    { tpl: '接受反商业贿赂及反贪污培训的董事百分比（%）', ind: '反贪培训覆盖-董事', v25: '100', v24: '100', st: 'ok' },
    { tpl: '接受反商业贿赂及反贪污培训的管理层人员百分比（%）', ind: '反贪培训覆盖-管理层', v25: '100', v24: '100', st: 'ok' },
    { tpl: '接受反商业贿赂及反贪污培训的员工百分比（%）', ind: '反贪培训覆盖-员工', v25: '98.6', v24: '97.2', st: 'ok' }
  ];

  /* 各行置信度（演示值；< 0.85 的行与 st=warn 对应，橙色提示人工确认） */
  var WARN_CONFS = ['0.58', '0.72', '0.64'];
  var COLLECT_CONF = [];
  (function () {
    var wi = 0;
    COLLECT_ROWS.forEach(function (r, i) {
      COLLECT_CONF.push(r.st === 'warn' ? (WARN_CONFS[wi++] || '0.70') : (0.86 + (i % 12) * 0.01).toFixed(2));
    });
  })();

  function statusCellOf(d, idx) {
    if (d.edited) return { tag: 'ok', text: '✓ 已修正' };
    var c = COLLECT_CONF[idx] || '0.90';
    return { tag: parseFloat(c) >= 0.85 ? 'ok' : 'warn', text: c };
  }

  /* Excel 样式表格；editable=true 时「平台指标 / 数值」单元格可直接点击编辑 */
  function buildXlsTable(editable, from, to) {
    var t = el('table', 'ecw-tbl');
    var thead = el('thead');
    thead.innerHTML = '<tr><th style="width:34px">#</th><th style="width:37%">模板要求字段（提取自模板）</th>' +
      '<th>平台指标（匹配）</th><th style="width:92px">2025年数值</th><th style="width:64px">置信度</th></tr>';
    t.appendChild(thead);
    var tbody = el('tbody');
    for (var i = from; i < to; i++) {
      (function (idx) {
        var d = collectData[idx];
        var tr = el('tr');
        tr.innerHTML = '<td>' + (idx + 1) + '</td>' +
          '<td>' + escapeHtml(d.tpl) + '</td>' +
          '<td class="ecw-edit" data-i="' + idx + '" data-f="ind"' + (editable ? ' contenteditable="true"' : '') + '>' + escapeHtml(d.ind) + '</td>' +
          '<td class="ecw-edit" data-i="' + idx + '" data-f="val"' + (editable ? ' contenteditable="true"' : '') + '>' + escapeHtml(d.val) + '</td>';
        var stc = statusCellOf(d, idx);
        tr.appendChild(el('td', null, '<span class="' + (stc.tag === 'warn' ? 'ecw-warn-tag' : 'ecw-ok-tag') + '">' + stc.text + '</span>'));
        tbody.appendChild(tr);
      })(i);
    }
    t.appendChild(tbody);
    return t;
  }

  function collectDocHtml() {
    var rows = collectData.map(function (d, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(d.tpl) + '</td><td>' + escapeHtml(d.ind) + '</td><td>' + escapeHtml(d.val) + '</td></tr>';
    }).join('');
    return '<h2 style="font-family:微软雅黑">上交所《2026年FII可持续发展报告》定量指标信息采集表（2025年数据）</h2>' +
      '<p style="color:#888">单位：集团合并口径 · 由AI自动填充，请人工核实</p>' +
      '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:微软雅黑;font-size:12px">' +
      '<tr style="background:#f5f7fb"><th>序号</th><th>模板要求字段</th><th>平台指标（映射）</th><th>2025年数值</th></tr>' +
      rows + '</table>' +
      '<p style="color:#888;font-size:11px">注：数值由平台指标库自动抓取，与平台录入数据一致（目标100%准确率，请务必人工复核）。</p>';
  }

  /* ================================================================
   * 八、各模式流程
   * ================================================================ */

  /* ---------- 智能助手（默认） ---------- */
  function chatIntro() {
    addAgent({
      text: '你好，张家源 👋 我是 **ESG 智能助手**，已接入平台知识库与指标库。你可以直接向我提问，或点击输入框上方的按钮调用专属 Agent：\n\n🔍 **智能问答** —— 检索知识库、按指标提取平台附件内容\n📄 **报告生成** —— 指标匹配确认后生成报告草稿\n📋 **指标信息采集表** —— 自动匹配并填充上交所定量指标采集表\n\n需要提供文件时，请通过 **📎 上传按钮** 选择附件（支持多选）。',
      chips: [
        { label: '知识库里有哪些文件？', act: kbListDemo },
        { label: '帮我提取附件中的员工数据', act: extractDemo },
        { label: '查看收集进度', act: progressDemo }
      ]
    });
  }

  async function kbListDemo() {
    var s = startSession();
    showTyping('正在检索知识库…');
    await sleep(800);
    if (stale(s)) return;
    hideTyping();
    await addProgress('检索知识库（权限范围：本人可见）', [
      { label: '调用知识库文件树接口（按用户权限过滤）', dur: 800 }
    ]);
    if (stale(s)) return;
    addListCard({
      title: '知识库文件（5 个文件夹）',
      hint: '演示数据',
      items: [
        { name: '上交所定量指标信息采集表（3个文件）', tag: '采集表模板' },
        { name: '报告撰写素材（6个文件）', tag: '参考文档' },
        { name: '历年可持续发展报告（6个文件）', tag: '参考报告' },
        { name: '指标附件-员工管理（9个文件）', tag: '指标附件' },
        { name: 'ESG评级回应案例（24个文件）', tag: '评级案例' }
      ],
      foot: '以上为你权限范围内可见的知识库目录。'
    });
    endSession(s);
    addAgent({
      text: '你可以让我检索、总结其中内容，或在生成报告时直接引用，无需重复上传。',
      chips: [
        { label: '帮我提取附件中的员工数据', act: extractDemo },
        { label: '查看收集进度', act: progressDemo }
      ]
    });
  }

  async function extractDemo() {
    var s = startSession();
    showTyping('正在定位指标附件…');
    await sleep(700);
    if (stale(s)) return;
    hideTyping();
    await addProgress('AI 检索与提取', [
      { label: '定位指标附件：《员工管理聘用与待遇政策及执行情况》', dur: 800 },
      { label: '解析《2024员工统计表.xlsx》文本内容', dur: 900, sub: ['Sheet1 · 表头1行 · 数据7行（非文本内容不解析）'] },
      { label: '按指令分门别类提取并标注出处', dur: 700 }
    ]);
    if (stale(s)) return;
    addTable({
      title: '提取结果（含信息出处）',
      columns: ['项目', '数值', '出处'],
      rows: [
        ['总员工数量（2024）', '18,742 人', '《2024员工统计表.xlsx》Sheet1 · 第2行'],
        ['其中：女性员工', '7,231 人', 'Sheet1 · 第3行'],
        ['女性员工占比', '38.6%', 'Sheet1 · 第4行（计算）'],
        ['全职员工（男 / 女）', '11,326 / 7,231 人', 'Sheet1 · 第5-6行']
      ],
      foot: '若附件中仅有一处对应内容，AI 将精准抓取（准确率目标100%，请人工核实）。'
    });
    endSession(s);
    addAgent({
      text: '已按你的指令完成提取并标注出处。需要我**继续提取其他指标附件**，还是**生成报告**？',
      chips: [
        { label: '生成报告', act: function () { setMode('report'); } },
        { label: '查看收集进度', act: progressDemo }
      ]
    });
  }

  async function progressDemo() {
    var s = startSession();
    showTyping('正在查询监控看板数据…');
    await sleep(700);
    if (stale(s)) return;
    hideTyping();
    endSession(s);
    addAgent({
      text: '当前进行中的收集任务（2026年，摘自监控看板）：\n\n· **测试-26**（20260826-005）：填写 0% ／ 审批 0%\n· **0826**（20260826-001）：填写 100% ／ 审批 100%\n· **beck0825_1**（20260825-004）：填写 100% ／ 审批 0%\n\n共 **103** 条任务。完整进度、排名与预警请查看「监控看板」页面。',
      chips: [
        { label: '知识库里有哪些文件？', act: kbListDemo },
        { label: '帮我提取附件中的员工数据', act: extractDemo }
      ]
    });
  }

  /* ---------- 报告生成 Agent（固定演示流程） ---------- */
  function reportIntro() {
    addAgent({
      text: ' 你好，我是**报告生成助手**。\n\n生成依据**完全可选**——你可以：\n· 通过 **📎 上传按钮** 提供文档（支持多选）\n· 直接粘贴章节内容或素材\n· 或用自然语言描述要求\n\n**输入任意内容即可开始演示**（原型为固定脚本，与输入内容无关）。',
      chips: [
        // { label: '开始演示', act: startReportDemo },
        // { label: '上传附件开始（模拟）', act: function () {
        //     addUser('📎 《供应商管理素材.docx》（1.4 MB）');
        //     startReportDemo();
        //   } }
      ]
    });
  }

  /* 指标匹配确认卡片 → Promise 返回每项选择 ['default'|'adj'|'skip'] */
  function addMatchCard() {
    return new Promise(function (resolve) {
      var row = el('div', 'ecw-row ecw-agent');
      var av = el('div', 'ecw-mavatar', agentEmoji());
      var card = el('div', 'ecw-card ecw-match');
      card.style.width = '100%';
      card.appendChild(el('div', 'ecw-cardtitle', '请确认指标匹配（4 项）'));

      var sels = [];                              /* 'default' | 'adj' | 'skip' */
      MATCH_DATA.forEach(function (grp, gi) {
        sels.push('default');
        var g = el('div', 'ecw-mgroup');
        g.appendChild(el('div', 'ecw-mgname', (gi + 1) + '.「' + escapeHtml(grp.name) + '」'));

        /* 候选指标选项（第一个默认选中） */
        grp.opts.forEach(function (o, oi) {
          var opt = el('div', 'ecw-mopt' + (oi === 0 ? ' on' : ''));
          opt.innerHTML =
            '<div class="ecw-ml1"><span class="ecw-radio"></span>' +
            '<span class="ecw-mcode">' + escapeHtml(o.code) + '</span>' +
            '<span class="ecw-mname">' + escapeHtml(o.name) + '</span>' +
            '<span class="ecw-mscore' + (o.hi ? ' hi' : '') + '">' + escapeHtml(o.score) + '</span></div>' +
            '<div class="ecw-mval" title="' + escapeHtml(o.val) + '">' + escapeHtml(o.val) + '</div>';
          opt.onclick = function () {
            g.querySelectorAll('.ecw-mopt').forEach(function (n) { n.classList.remove('on'); });
            opt.classList.add('on');
            sels[gi] = oi === 0 ? 'default' : 'adj';
          };
          g.appendChild(opt);
        });

        /* 不采用 */
        var skip = el('div', 'ecw-mopt ecw-skipopt');
        skip.innerHTML = '<div class="ecw-ml1"><span class="ecw-radio"></span><span style="font-size:12px">不采用</span>' +
          '<span style="font-size:11px;color:#8a6d3b">（跳过该指标，原文保留）</span></div>';
        skip.onclick = function () {
          g.querySelectorAll('.ecw-mopt').forEach(function (n) { n.classList.remove('on'); });
          skip.classList.add('on');
          sels[gi] = 'skip';
        };
        g.appendChild(skip);

        /* 其他（自定义指标名） */
        var other = el('div', 'ecw-mopt');
        var customVal = '';
        other.innerHTML = '<div class="ecw-ml1"><span class="ecw-radio"></span>' +
          '<span style="font-size:12px">其他</span>' +
          '<span style="font-size:11px;color:#98a0ad">（手动输入指标名称）</span></div>' +
          '<div class="ecw-mcustom"><input class="ecw-mcin" placeholder="请输入指标名称">' +
          '<button class="ecw-btn ecw-solid">确定</button></div>';
        var input = other.querySelector('.ecw-mcin');
        var okBtn = other.querySelector('.ecw-btn');
        other.onclick = function (e) {
          if (e.target === input || e.target === okBtn) return;   /* 输入框/按钮自行处理 */
          g.querySelectorAll('.ecw-mopt').forEach(function (n) { n.classList.remove('on'); });
          other.classList.add('on', 'ecw-showin');
          sels[gi] = 'adj';
          setTimeout(function () { input.focus(); }, 50);
        };
        okBtn.onclick = function (e) {
          e.stopPropagation();
          customVal = input.value.trim();
          if (!customVal) { input.focus(); input.placeholder = '请输入指标名称后再确定'; return; }
          other.querySelector('.ecw-ml1 span:nth-child(3)').textContent = '自定义：' + customVal;
        };
        g.appendChild(other);

        card.appendChild(g);
      });

      /* 底部确认 */
      var foot = el('div', 'ecw-mfoot');
      var hint = el('span', 'ecw-mfhint', '默认采用最高分匹配，可调整或跳过');
      var bOk = el('button', 'ecw-btn ecw-solid', '确认匹配');
      bOk.onclick = function () {
        /* 校验：选了「其他」但未填名称 */
        var groups = card.querySelectorAll('.ecw-mgroup');
        for (var i = 0; i < groups.length; i++) {
          var optList = groups[i].querySelectorAll('.ecw-mopt');
          var o = optList[optList.length - 1];   /* 最后一个选项 = 其他 */
          if (o.classList.contains('on') && o.querySelector('.ecw-mcin').value.trim() === '') {
            hint.textContent = '第 ' + (i + 1) + ' 项选择了「其他」，请输入指标名称后确定';
            hint.style.color = '#d97a00';
            o.querySelector('.ecw-mcin').focus();
            return;
          }
        }
        card.classList.add('ecw-locked');
        bOk.textContent = '✓ 已确认';
        bOk.disabled = true;
        hint.textContent = '';
        resolve(sels.slice());
      };
      foot.appendChild(hint);
      foot.appendChild(bOk);
      card.appendChild(foot);

      row.appendChild(av); row.appendChild(card);
      msgs.appendChild(row);
      scrollBottom();
    });
  }

  /* 报告生成固定演示：解析 → 匹配确认 → 已确认 → 报告 */
  async function startReportDemo() {
    var s = startSession();
    /* ① 解析完成 */
    showTyping('正在解析素材…');
    await sleep(1000);
    if (stale(s)) return;
    hideTyping();
    addAgent({
      text: '**解析完成：提取到 4 个指标**\n指标列表：\n· 供应商区域分布\n· 供应商类型分布\n· 供应商总数\n· 重大供应商筛选原则'
    });
    await sleep(700);
    if (stale(s)) return;
    /* ② 匹配确认（交互） */
    showTyping('正在匹配平台指标库…');
    await sleep(900);
    if (stale(s)) return;
    hideTyping();
    var sels = await addMatchCard();
    if (stale(s)) return;
    /* ③ 已确认汇总（按实际选择统计） */
    var adopt = 0, adj = 0, skip = 0;
    sels.forEach(function (s) {
      if (s === 'default') adopt++;
      else if (s === 'adj') adj++;
      else skip++;
    });
    var summary = '已确认：' + adopt + '/4 个指标采用' +
      (adj ? '，人工调整 ' + adj + ' 个' : '') +
      (skip ? '，跳过 ' + skip + ' 个' : '');
    addAgent({ text: '**' + summary + '**' });
    /* ④ 报告生成 */
    showTyping('正在生成报告…');
    await sleep(1500);
    if (stale(s)) return;
    hideTyping();
    endSession(s);
    addAgent({ text: '**报告生成完成（1.9s）**' });
    addDocCard({
      title: '报告生成结果',
      html: REPORT_TEXT,
      note: '可编辑纯文本 · 指标数值已按接口数据替换',
      download: {
        name: '报告生成结果（AI草稿）.doc',
        build: function () { return '<h2>报告生成结果（AI草稿）</h2>' + REPORT_TEXT; }
      }
    });
    addAgent({
      text: '草稿已生成 ✅ 数值替换策略：原文逐字保留，仅将指标数值替换为接口最新值。可继续演示或开启新对话。',
      chips: [
        // { label: '再来一次', act: startReportDemo },
        // { label: '⟳ 开启新对话', act: newChat }
      ]
    });
  }

  /* ---------- 指标信息采集表 Agent（新流程：模板 → 可选提示词 → 提取 → 表格内修改 → 确认填充） ---------- */
  var PREVIEW_N = 6;                 /* 表格过长时聊天内仅预览的行数 */
  var collectStage = 'await-file';   /* await-file | await-extract | review | filling */
  var collectData = [];              /* 当前会话的匹配数据（含人工编辑） */

  function resetCollect() {
    collectStage = 'await-file';
    collectData = [];
  }

  function collectIntro() {
    resetCollect();
    addAgent({
      text: '📋 你好，我是**上交所定量指标采集表助手**，流程如下：\n\n**1. 提供模板文档** —— 通过 📎 上传或 🗂 从知识库引用；\n**2. 输入提示词（可选）** —— 发送后 AI 提取文档中所有需填写的**定量指标**，并自动匹配平台指标与数值；\n**3. 表格核对** —— 结果以表格展示在对话中（过长仅预览部分行），点击可放大查看完整表格并**直接修改**；\n**4. 确认生成** —— 有修改时确认将返回更新后的结果；无修改时确认即自动填充数值并生成报告文件下载。\n\n⚠️ 本期仅支持上交所《2026年FII可持续发展报告》模板；模板指标变更时需重新确认映射关系。',
      chips: [
        { label: '上传模板（模拟）', act: function () {
            addUser('📎 《工业富联_ESG信息采集表_定量指标.xlsx》（模板）');
            awaitPrompt();
          } }
      ]
    });
  }

  /* 模板已提供 → 等待可选提示词 */
  function awaitPrompt() {
    collectStage = 'await-extract';
    addAgent({
      text: '模板文档已收到 ✅\n\n可输入**提示词**（可选，如：仅提取定量指标、按模板顺序输出），发送后开始提取；也可直接点击下方按钮开始。',
      chips: [
        { label: '直接开始提取', act: function () { startExtract(''); } }
      ]
    });
  }

  async function startExtract(prompt) {
    var s = startSession();
    collectStage = 'review';
    showTyping('正在提取定量指标并匹配…');
    await sleep(700);
    if (stale(s)) return;
    hideTyping();
    var warnN = 0;
    COLLECT_ROWS.forEach(function (r) { if (r.st === 'warn') warnN++; });
    var steps = [
      { label: '解析模板文档，提取所有需填写的定量指标', dur: 1000, sub: ['共提取 ' + COLLECT_ROWS.length + ' 项定量指标'] },
      { label: '从平台指标库匹配对应指标并读取数值', dur: 1100, sub: ['置信度 ≥ 0.85：' + (COLLECT_ROWS.length - warnN) + ' 项 · < 0.85：' + warnN + ' 项（建议人工确认）'] }
    ];
    if (prompt) steps.splice(1, 0, { label: '结合提示词要求', dur: 700, sub: ['提示词：' + prompt] });
    await addProgress('提取指标并匹配平台数据', steps);
    if (stale(s)) return;
    endSession(s);
    collectData = COLLECT_ROWS.map(function (r) {
      return { tpl: r.tpl, ind: r.ind, val: r.v25, st: r.st, edited: false };
    });
    showReviewTable(false);
  }

  /* 聊天内预览卡片（过长仅显示前 PREVIEW_N 行，点击放大完整表格） */
  function showReviewTable(updated) {
    addAgent({
      text: updated
        ? '已按你的修改更新匹配结果 ✅（修改行标注「已修正」）。请再次核对：仍有修改可继续编辑确认；**无修改时点击【确认】即开始填充**。'
        : '匹配结果如下，请核对：**「平台指标」与「数值」可直接点击修改**；有修改点【确认】我将返回更新结果，无修改点【确认】即开始填充。'
    });
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card');
    card.style.width = '100%';
    var total = collectData.length;
    card.appendChild(el('div', 'ecw-cardtitle', '指标匹配结果（共 ' + total + ' 项 · 表格可编辑）'));
    var wrap = el('div', 'ecw-tblwrap');
    wrap.appendChild(buildXlsTable(false, 0, Math.min(PREVIEW_N, total)));
    card.appendChild(wrap);
    if (total > PREVIEW_N) {
      var more = el('div', 'ecw-xlsmore', '仅预览前 ' + PREVIEW_N + ' 行 / 共 ' + total + ' 项 · 点击查看/编辑完整表格');
      more.onclick = openFullTable;
      card.appendChild(more);
    }
    var foot = el('div', 'ecw-mfoot');
    foot.appendChild(el('span', 'ecw-mfhint', '「平台指标 / 2025年数值」可直接编辑'));
    var bOpen = el('button', 'ecw-btn', '查看/编辑完整表格');
    bOpen.onclick = openFullTable;
    foot.appendChild(bOpen);
    card.appendChild(foot);
    row.appendChild(av);
    row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* 完整表格弹窗（可编辑；确认时读取修改：有修改 → 返回更新结果；无修改 → 开始填充） */
  function openFullTable() {
    if (busy || collectStage !== 'review') return;
    var mask = el('div', 'ecw-kbmask');
    var dlg = el('div', 'ecw-bigdlg');
    var h = el('div', 'ecw-bigh', '📊 指标匹配结果 · 完整表格（共 ' + collectData.length + ' 项）<button title="关闭">✕</button>');
    var b = el('div', 'ecw-bigb');
    b.appendChild(el('div', 'ecw-xlshint', '💡 直接点击「平台指标」或「2025年数值」单元格即可修改；修改后点击【确认】将返回更新结果，未修改点击【确认】则开始填充数值并生成报告。'));
    b.appendChild(buildXlsTable(true, 0, collectData.length));
    var f = el('div', 'ecw-bigf');
    var warn = el('span', 'ecw-mfhint');
    var bCancel = el('button', 'ecw-btn', '取消');
    var bOk = el('button', 'ecw-btn ecw-solid', '确认，开始填充');
    f.appendChild(warn);
    f.appendChild(bCancel);
    f.appendChild(bOk);
    dlg.appendChild(h);
    dlg.appendChild(b);
    dlg.appendChild(f);
    mask.appendChild(dlg);
    root.appendChild(mask);
    requestAnimationFrame(function () { mask.classList.add('open'); });

    function close() { mask.classList.remove('open'); mask.remove(); }
    h.querySelector('button').onclick = close;
    bCancel.onclick = close;

    function collectEdits() {
      var edits = [];
      Array.prototype.forEach.call(dlg.querySelectorAll('td.ecw-edit'), function (cell) {
        var idx = +cell.getAttribute('data-i');
        var fld = cell.getAttribute('data-f');
        var v = (cell.innerText || '').replace(/\s+/g, ' ').trim();
        if (v && v !== collectData[idx][fld]) edits.push({ idx: idx, f: fld, v: v });
      });
      return edits;
    }
    bOk.onclick = function () {
      var edits = collectEdits();
      close();
      if (edits.length) applyEdits(edits);
      else fillCollect();
    };
  }

  /* 人工修改后：AI 返回更新后的匹配结果（可继续修改或确认） */
  async function applyEdits(edits) {
    var s = startSession();
    showTyping('正在按修改更新匹配结果…');
    await sleep(700);
    if (stale(s)) return;
    hideTyping();
    var subs = edits.slice(0, 4).map(function (e) {
      return '第' + (e.idx + 1) + '行 ' + (e.f === 'ind' ? '平台指标 → ' + e.v : '数值 → ' + e.v);
    });
    if (edits.length > 4) subs.push('…共 ' + edits.length + ' 处修改');
    await addProgress('按人工修改更新匹配', [
      { label: '按修改更新映射关系与数值（' + edits.length + ' 处）', dur: 900, sub: subs },
      { label: '重新校验平台指标数值', dur: 700 }
    ]);
    if (stale(s)) return;
    endSession(s);
    edits.forEach(function (e) {
      collectData[e.idx][e.f] = e.v;
      collectData[e.idx].edited = true;
    });
    showReviewTable(true);
  }

  /* 确认无修改后：抓取数值填充模板，生成报告文件返回聊天窗口 */
  async function fillCollect() {
    var s = startSession();
    collectStage = 'filling';
    showTyping('正在填充数值并生成报告…');
    await sleep(600);
    if (stale(s)) return;
    hideTyping();
    var editedN = 0;
    collectData.forEach(function (d) { if (d.edited) editedN++; });
    await addProgress('自动填充并生成报告', [
      { label: '锁定确认后的映射关系（' + collectData.length + ' 项' + (editedN ? ' · 含人工修正 ' + editedN + ' 项' : '') + '）', dur: 700 },
      { label: '从平台指标库抓取 2025 年度数值', dur: 1000, sub: [collectData.length + ' / ' + collectData.length + ' 项获取成功'] },
      { label: '按模板原格式填充，生成 Word 文件', dur: 800 }
    ]);
    if (stale(s)) return;
    endSession(s);
    addFileCard({
      name: '工业富联_ESG信息采集表_定量指标（已填充2025年数据）.docx',
      sub: 'Word 格式 · 与原模板格式一致 · 定量指标已全部填充',
      btn: '⬇ 下载文件',
      note: '填充数值与平台录入数据一致（目标100%准确率，**请人工复核**）。',
      onDownload: function () {
        downloadWord('工业富联_ESG信息采集表_定量指标（已填充2025年数据）.doc', collectDocHtml());
      }
    });
    addAgent({
      text: '📄 报告已生成 ✅ 同时，本次确认的**指标映射关系已自动存入知识库**「上交所定量指标信息采集表」文件夹，后续可直接复用，无需重新匹配。',
      chips: [
        { label: '重新匹配模板', act: collectIntro },
        { label: '⟳ 开启新对话', act: newChat }
      ]
    });
  }

  /* ================================================================
   * 九、输入路由与附件上传
   * ================================================================ */
  function onSend() {
    var text = ta.value.trim();
    if (!text || busy) return;
    ta.value = '';
    autoGrow();
    addUser(text);
    if (state.mode === 'chat') routeChat(text);
    else if (state.mode === 'report') startReportDemo();   /* 任意输入 → 固定演示 */
    else routeCollect(text);
  }

  function routeChat(text) {
    if (/薪资|薪酬|工资|待遇/.test(text)) {
      addAgent({ text: '该信息受权限保护，无法提供。\n\n（演示：用户提问涉及业务方预设的敏感字段时，AI 按需求返回该话术）' });
      return;
    }
    if (/知识库|文件|有哪些|目录/.test(text)) return kbListDemo();
    if (/员工|附件|提取|统计/.test(text)) return extractDemo();
    if (/进度|收集|看板|任务/.test(text)) return progressDemo();
    addAgent({
      text: '（原型演示）已收到你的消息：「' + text.replace(/\n/g, ' ') + '」。\n\n正式版本中，我将基于**知识库与平台数据**检索后作答，并标注信息出处。你也可以试试：',
      chips: [
        { label: '知识库里有哪些文件？', act: kbListDemo },
        { label: '帮我提取附件中的员工数据', act: extractDemo },
        { label: '查看收集进度', act: progressDemo }
      ]
    });
  }

  function routeCollect(text) {
    if (collectStage === 'await-file') {
      if (/模板|上传|引用|重新/.test(text)) return collectIntro();
      return addAgent({
        text: '请先提供**模板文档**：点击输入框左下 📎 上传，或 🗂 从知识库引用；也可点击下方按钮模拟上传。',
        chips: [
          { label: '上传模板（模拟）', act: function () {
              addUser('📎 《工业富联_ESG信息采集表_定量指标.xlsx》（模板）');
              awaitPrompt();
            } }
        ]
      });
    }
    if (collectStage === 'await-extract') return startExtract(text);   /* 输入内容作为提示词（可选） */
    if (collectStage === 'review') {
      if (/重新|模板/.test(text)) return collectIntro();
      return addAgent({
        text: '请在表格中操作：点击【📋 查看/编辑完整表格】打开面板，**直接点击单元格修改**「平台指标」或「数值」；修改后点【确认】我将返回更新结果，未修改点【确认】即开始填充。',
        chips: [
          { label: '查看/编辑完整表格', act: openFullTable },
          { label: '重新匹配模板', act: collectIntro }
        ]
      });
    }
    addAgent({
      text: '（原型演示）已收到：「' + text.slice(0, 60).replace(/\n/g, ' ') + '」。可重新开始匹配：',
      chips: [{ label: '重新匹配模板', act: collectIntro }]
    });
  }

  /* 📎 附件上传（真实文件选择，支持多选；演示按模式触发对应流程） */
  function handleFiles(fileList) {
    if (busy || !fileList.length) return;
    var names = [];
    Array.prototype.forEach.call(fileList, function (f) {
      names.push('📎 《' + f.name + '》（' + fmtSize(f.size) + '）');
    });
    addUser(names.join('\n'));
    if (state.mode === 'collect') awaitPrompt();
    else if (state.mode === 'report') startReportDemo();
    else extractDemo();
  }

  /* ---- 🗂 知识库选择：读取知识库页面的目录（localStorage kb-files-v1）+ 指标映射表 ---- */
  var KB_SEED = {
    name: '全部文件', folders: [
      { name: '上交所定量指标信息采集表', folders: [], files: [
        { name: '2026年FII可持续发展报告-定量指标采集表模板.docx' },
        { name: '指标映射表-2025确认版.xlsx' }
      ] },
      { name: '报告撰写素材', folders: [
        { name: '提示词', folders: [], files: [
          { name: '报告撰写提示词-环境章节（E）.docx' },
          { name: '报告撰写提示词-社会章节（S）.docx' },
          { name: '报告撰写提示词-治理章节（G）.docx' }
        ] }
      ], files: [{ name: '2024年可持续发展报告（终版）.pdf' }] },
      { name: 'ESG评级回应案例', folders: [], files: [
        { name: 'MSCI评级回应案例-劳工管理.docx' },
        { name: 'MSCI评级回应案例-碳排放.docx' }
      ] },
      { name: '指标附件-员工管理', folders: [], files: [
        { name: '2024员工统计表.xlsx' },
        { name: '员工管理聘用与待遇政策.docx' }
      ] }
    ], files: []
  };
  function loadKbTree() {
    try {
      var v = JSON.parse(localStorage.getItem('kb-files-v1') || 'null');
      if (v && v.name) return v;
    } catch (e) { /* 忽略 */ }
    return KB_SEED;
  }
  function kbIcon(name) {
    if (/\.xlsx?$/.test(name)) return '📊';
    if (/\.pdf$/.test(name)) return '📕';
    if (/\.(png|jpe?g|gif)$/i.test(name)) return '🖼';
    return '📄';
  }
  function countOf(node) {
    var n = (node.files || []).length;
    (node.folders || []).forEach(function (f) { n += countOf(f); });
    return n;
  }
  /* 文件树选择弹窗；onOk(files) — files: [{name, path}] */
  function openKbPicker(onOk) {
    var tree = loadKbTree();
    var sections = [
      { name: '知识库文件', node: tree, open: true },
      { name: '信息采集指标映射表', node: { folders: [], files: [
        { name: '指标映射表-2025确认版.xlsx', tag: '采集表模板' },
        { name: '指标映射表-2026FII草稿.xlsx', tag: '采集表模板' }
      ] }, open: true }
    ];
    var sel = {};   /* key → {name, path} */
    var selCount = 0;

    var mask = el('div', 'ecw-kbmask');
    var dlg = el('div', 'ecw-kbdlg');
    dlg.innerHTML =
      '<div class="ecw-kbh">🗂 从知识库选择文件<button title="关闭">✕</button></div>' +
      '<div class="ecw-kbbody"></div>' +
      '<div class="ecw-kbfoot"><span class="ecw-kbhint">文件夹层级与「知识库」页面一致，可多选文件</span>' +
      '<button class="ecw-btn">取消</button><button class="ecw-btn ecw-solid">确认引用</button></div>';
    mask.appendChild(dlg);
    root.appendChild(mask);
    mask.classList.add('open');

    var body = dlg.querySelector('.ecw-kbbody');
    var hint = dlg.querySelector('.ecw-kbhint');

    function updateHint() {
      hint.textContent = selCount
        ? '已选择 ' + selCount + ' 个文件，点击「确认引用」'
        : '文件夹层级与「知识库」页面一致，可多选文件';
      hint.classList.toggle('warn', false);
    }
    function renderNode(container, node, depth, pkey) {
      (node.folders || []).forEach(function (f) {
        var key = pkey + '/' + f.name;
        var isOpen = depth === 0;
        var wrap = el('div');
        var folder = el('div', 'ecw-kfolder');
        folder.style.paddingLeft = (8 + depth * 16) + 'px';
        folder.innerHTML = '<span class="ecw-karrow' + (isOpen ? ' open' : '') + '">▸</span><span>📁</span>' +
          '<span class="ecw-kfname">' + escapeHtml(f.name) + '</span>' +
          '<span class="ecw-kcnt">' + countOf(f) + ' 项</span>';
        var kids = el('div', 'ecw-kkids' + (isOpen ? ' open' : ''));
        folder.onclick = function () {
          isOpen = !isOpen;
          folder.querySelector('.ecw-karrow').classList.toggle('open', isOpen);
          kids.classList.toggle('open', isOpen);
        };
        renderNode(kids, f, depth + 1, key);
        wrap.appendChild(folder); wrap.appendChild(kids);
        container.appendChild(wrap);
      });
      (node.files || []).forEach(function (f) {
        var key = pkey + '/' + f.name;
        var row = el('div', 'ecw-kfile');
        row.style.paddingLeft = (8 + depth * 16) + 'px';
        row.innerHTML = '<span class="ecw-kchk"></span><span>' + kbIcon(f.name) + '</span>' +
          '<span class="ecw-kfnm" title="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</span>';
        row.onclick = function () {
          if (sel[key]) { delete sel[key]; selCount--; row.classList.remove('on'); }
          else { sel[key] = { name: f.name, path: pkey }; selCount++; row.classList.add('on'); }
          updateHint();
        };
        container.appendChild(row);
      });
    }
    sections.forEach(function (s) {
      body.appendChild(el('div', 'ecw-ksec', '🗂 ' + escapeHtml(s.name) + '<span class="ecw-kcnt">共 ' + countOf(s.node) + ' 个文件</span>'));
      renderNode(body, s.node, 0, s.name);
    });

    function close() { mask.classList.remove('open'); mask.remove(); }
    dlg.querySelector('.ecw-kbh button').onclick = close;
    dlg.querySelector('.ecw-kbfoot .ecw-btn').onclick = close;
    dlg.querySelector('.ecw-btn.ecw-solid').onclick = function () {
      var files = Object.keys(sel).map(function (k) { return sel[k]; });
      if (!files.length) {
        hint.textContent = '请至少选择一个文件';
        hint.classList.add('warn');
        return;
      }
      close();
      onOk(files);
    };
  }

  /* 🗂 知识库按钮：选择后按当前模式触发对应流程 */
  $('ecw-kbbtn').onclick = function () {
    if (busy) return;
    openKbPicker(function (files) {
      var names = files.map(function (f) { return '《' + f.name + '》'; }).join('、');
      addUser('🗂 已引用知识库文件：' + names);
      if (state.mode === 'report') startReportDemo();
      else if (state.mode === 'collect') awaitPrompt();
      else {
        addAgent({
          text: '已引用 **' + files.length + ' 个知识库文件** ✅（正式版本中 AI 将直接检索引用，无需重复上传）。\n\n你可以让我基于这些文件检索、总结内容：',
          chips: [
            { label: '帮我总结这些文件的内容', act: extractDemo },
            { label: '基于文件生成报告', act: function () { setMode('report'); } }
          ]
        });
      }
    });
  };

  /* ================================================================
   * 九·二、📊 数据选择（REQ-01 v4）：五层下钻 + 子树搜索 + 已选区逐指标配置 + 多选提交
   * ------------------------------------------------------------
   * 层级：指标库（第 1 层，仅「有效」库）→ 维度 → 主题 → 议题 → 指标（第 5 层）。
   * 年份与维度为**指标级配置**（v4 纠正：不放在全局条件行，而在每个已选指标条目内）：
   * 条目＝指标代码＋名称＋该指标自己的 年份下拉（可不选，默认当年＝2026）＋【维度选择】入口
   * （四维度单选切换、维度内多选、可不选，默认 FII）＋移除（移除即丢弃其配置）。
   * · 界面形态（弹窗/抽屉/面板）待确认 —— 原型按【🗂】知识库选择弹窗形态实现，维度为叠层二级弹窗；
   * · 【数据选择】按钮正式口径仅管理员可见（全局规则 7）—— 原型 mock 无角色体系，
   *   与【报告生成】【指标信息采集表】一致无条件显示；
   * · mock：无论选择哪个指标库，第 2-5 层均复用同一棵 环境→主题→议题→指标 树（REQ v2 拍板）；
   * · 搜索范围 = 当前停留层级节点的子树内所有指标（跨下级直达），仅匹配指标名称；
   *   搜索不扩展到维度选项、不覆盖年份与维度（REQ v4 流程 B 第 5 步默认口径）；
   * · 结果表格：行＝Σ(每个指标 × 该指标所选维度对象数)（未选维度＝1 个默认对象 FII），年份列/
   *   维度对象列取各指标各自配置，列＝指标代码/指标名称/年份/维度对象/数值/单位/数据来源
   *   —— 列集与列序待确认（REQ v4 待确认 1）；
   * · 搜索无结果的空态表现（文案/样式）待确认 —— 原型先按「暂无匹配指标」展示。
   * ================================================================ */

  /* 第 1 层 · 指标库（image1：仅显示「有效」库共 5 个，2 个「无效」旧库不显示） */
  var DS_LIBS = ['E维度指标库', 'S维度指标库', 'G维度指标库', 'SC指标库', 'O维度指标库'];

  /* 第 2-5 层 · 维度→主题→议题→指标 树（结构对照 image2）。
   * 「能源」主题指标清单取自 image2 整理；指标代码为 E-E-14-x 格式 mock；
   * 「环境政策与管理体系」主题下的指标为原型补充 mock（使五层下钻可完整演示）。 */
  var DS_TREE = {
    dims: [
      { name: '环境', code: 'E', themes: [
        { name: '环境政策与管理体系', topics: [
          { name: '环境管理体系', inds: [
            { code: 'E-E-3-1-0001', name: '环境管理政策', val: '已发布《环境管理制度（2025修订版）》', unit: '—', src: '知识库 · 制度文件' },
            { code: 'E-E-3-1-0002', name: '环境管理体系认证', val: 'ISO 14001（19/19 园区通过）', unit: '—', src: '指标填报（2025年度）' }
          ] },
          { name: '环境目标', inds: [
            { code: 'E-E-3-2-0001', name: '环境保护目标达成率', val: '96.8', unit: '%', src: '指标填报（2025年度）' },
            { code: 'E-E-3-2-0002', name: '环境违规事件次数', val: '0', unit: '起', src: '平台指标库（自动汇总）' }
          ] }
        ] },
        { name: '能源', topics: [
          { name: '能源消耗', inds: [
            { code: 'E-E-14-1-0001', name: '能源消耗总量', val: '1,771,316', unit: '吨标准煤', src: '平台指标库（自动汇总）' },
            { code: 'E-E-14-1-0002', name: '不可再生能源消耗总量', val: '1,268,109', unit: '吨标准煤', src: '平台指标库（自动汇总）' },
            { code: 'E-E-14-1-0003', name: '可再生能源消耗总量', val: '503,207', unit: '吨标准煤', src: '平台指标库（自动汇总）' },
            { code: 'E-E-14-1-0004', name: '直接能源消耗量', val: '268,432', unit: '吨标准煤', src: '指标填报（2025年度）' },
            { code: 'E-E-14-1-0005', name: '间接能源消耗量', val: '1,502,884', unit: '吨标准煤', src: '指标填报（2025年度）' }
          ] },
          { name: '能源管理与政策', inds: [
            { code: 'E-E-14-2-0001', name: '能源政策', val: '已发布《能源管理制度》', unit: '—', src: '知识库 · 制度文件' },
            { code: 'E-E-14-2-0002', name: '能源管理计划', val: '已发布（2026—2028年）', unit: '—', src: '知识库 · 制度文件' },
            { code: 'E-E-14-2-0003', name: '各类消耗目标', val: '综合能耗较上年下降 2.3%', unit: '—', src: '知识库 · 目标文件' }
          ] },
          { name: '可再生能源', inds: [
            { code: 'E-E-14-3-0001', name: '可再生能源项目', val: '12', unit: '个', src: '指标填报（2025年度）' },
            { code: 'E-E-14-3-0002', name: '可再生清洁能源', val: '28.4', unit: '%', src: '平台指标库（自动汇总）' },
            { code: 'E-E-14-3-0003', name: '清洁发电量', val: '125,680', unit: '兆瓦时', src: '指标填报（2025年度）' }
          ] }
        ] }
      ] }
    ]
  };

  function dsKids(node) { return node.dims || node.themes || node.topics || null; }
  function dsCountInds(node) {                    /* 节点子树内的指标总数 */
    if (node.inds) return node.inds.length;
    var n = 0;
    (dsKids(node) || []).forEach(function (c) { n += dsCountInds(c); });
    return n;
  }
  function dsFlattenInds(node, out) {              /* 节点子树内全部指标（跨下级直达） */
    if (node.inds) { node.inds.forEach(function (i) { out.push(i); }); return out; }
    (dsKids(node) || []).forEach(function (c) { dsFlattenInds(c, out); });
    return out;
  }

  /* ---- REQ-01 v4：年份与维度（指标级配置）的数据与工具函数 -------------------
   * （v3 引入、v4 纠正为指标级：年份/维度随各已选指标条目各自配置，非全局条件） */

  var DS_CUR_YEAR = 2026;                                /* 当年（年份可不选，不选默认当年） */
  var DS_YEARS = [2026, 2025, 2024, 2023, 2022, 2021];   /* mock：近六年（「近年若干年」） */

  /* 维度类型（REQ v4 流程 C 第 2 步：四维度单选切换） */
  var DIM_TYPES = [
    { key: 'fii', name: 'FII' },
    { key: 'branch', name: '分会层级' },
    { key: 'legal', name: '法人层级' },
    { key: 'cpa', name: '策进组层级' }
  ];

  /* 分会层级 · 13 项扁平单层（REQ v4 第 9.2 节，照抄 分会.png，含系统测试数据） */
  var DIM_BRANCHES = [
    'Angel-test', 'beck-分会', 'CESBG', 'CNSBG', 'iPEBG-iPEG', 'iPEBG-PMEG', 'SEG',
    'TARG', 'TEST', 'TEST2', 'WTT-test', 'Xuyu-Test', 'zhushen'
  ];

  /* 法人层级 · 10 项扁平单层，每项＝法人代码＋法人名称（REQ v4 第 9.3 节，照抄 法人.png） */
  var DIM_LEGALS = [
    { code: 'Xuyu-test2', name: '法人2' },
    { code: '67890', name: 'MZ测试' },
    { code: 'A086440', name: '富联科技(晋城)有限公司' },
    { code: '12345', name: 'JY测试' },
    { code: 'A086582', name: '富联科技（山西）有限公司' },
    { code: 'A084031', name: '富联精密科技公司' },
    { code: 'A886022-1', name: '鸿佰科技股份有限公司' },
    { code: 'A886022-2', name: '鸿佰科技股份有限公司-新竹' },
    { code: 'A886022-3', name: '鸿佰科技股份有限公司-大园' },
    { code: 'A086996', name: '富联裕康医疗科技(深圳)有限公司' }
  ];

  /* 策进组层级 · 两级：3 个一级策进组＋各自二级组织（REQ v4 第 9.4 节，照抄 策进组.png）。
   * G 策进组第 10 项截图截断，按 REQ 原样记录为「G1商业道德-弊弊防治处」，
   * 疑为「G10商业道德-弊端防治处」—— 待核实 */
  var DIM_CPA = [
    { name: 'E策进组', kids: ['E1气候行动', 'E2能源效率', 'E3环境保护', 'E4循环经济', 'E5绿色产品'] },
    { name: 'S策进组', kids: ['S1劳动人权', 'S2公共发展', 'S3健康安全', 'S4化学品安全'] },
    { name: 'G策进组', kids: [
      'G1商业道德-审计处', 'G2公司治理', 'G3经济与税务', 'G4法务合规', 'G5风险与机遇',
      'G6资讯安全', 'G7数智化', 'G8价值链', 'G9信披治理', 'G1商业道德-弊弊防治处'
    ] }
  ];

  function dimTypeName(key) {
    for (var i = 0; i < DIM_TYPES.length; i++) if (DIM_TYPES[i].key === key) return DIM_TYPES[i].name;
    return 'FII';
  }
  function dsIsCpaGroup(name) {
    for (var i = 0; i < DIM_CPA.length; i++) if (DIM_CPA[i].name === name) return true;
    return false;
  }
  /* 维度对象展示名：法人＝法人代码＋法人名称；只勾一级策进组＝「XX策进组（整组）」 */
  function dimObjLabel(type, it) {
    if (type === 'legal') return it.code + ' ' + it.name;
    if (type === 'cpa' && dsIsCpaGroup(it)) return String(it) + '（整组）';
    return String(it);
  }
  /* 维度摘要（紧凑，用户消息/进度用）：如「分会层级×3」；未选＝FII（默认） */
  function dimSum(dim) {
    if (!dim) return 'FII（默认）';
    if (dim.type === 'fii') return 'FII';
    return dimTypeName(dim.type) + '×' + dim.items.length;
  }
  /* 维度摘要（带对象名，条目内回显用）：如「分会层级×3（CESBG、SEG…）」 */
  function dimBrief(dim) {
    if (!dim) return 'FII（默认）';
    if (dim.type === 'fii') return 'FII';
    var labels = dim.items.slice(0, 2).map(function (it) { return dimObjLabel(dim.type, it); }).join('、');
    return dimSum(dim) + (labels ? '（' + labels + (dim.items.length > 2 ? '…' : '') + '）' : '');
  }

  /* 维度对象分担系数（mock）：FII＝1（整体口径）；各组织对象按标签稳定散列出 0.20~1.05 的占比，
   * 使「指标 × 维度对象」各行的 mock 数值合理互异且可复现 */
  function dsObjFactor(seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    return 0.2 + (h % 100) / 100 * 0.85;
  }
  function dsParseNum(v) {
    var s = String(v).replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    return { num: parseFloat(s), dec: s.indexOf('.') >= 0 ? s.length - s.indexOf('.') - 1 : 0 };
  }
  function dsFmtNum(num, dec) {
    return dec ? num.toFixed(dec)
      : Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  /* 结果单元格数值（mock）：以既有数值为当年整体口径基准，按年份（往年约 +3.5%/年，呈现总量
   * 逐年下降趋势）与维度对象占比微调；文本型数值（政策/认证类指标）原样返回 */
  function dsCellVal(ind, year, obj) {
    var p = dsParseNum(ind.val);
    if (!p) return ind.val;
    var off = DS_CUR_YEAR - (year || DS_CUR_YEAR);
    return dsFmtNum(p.num * (1 + 0.035 * off) * obj.f, p.dec);
  }
  /* 查询口径的维度对象列表：未选维度（或维度＝FII）＝1 个默认对象 FII；否则展开为已选对象 */
  function dimQueryObjs(dim) {
    if (!dim || dim.type === 'fii') return [{ label: 'FII', f: 1 }];
    return dim.items.map(function (it) {
      var label = dimObjLabel(dim.type, it);
      return { label: label, f: dsObjFactor(dim.type + '|' + label) };
    });
  }

  /* 维度选择二级弹窗（REQ v4 流程 C）：叠在数据选择弹窗之上（遮罩 z-index 更高），风格对齐既有弹窗。
   * 入口与落点＝**当前配置的指标条目**：cur 传入该条目已设维度，onOk(dim) 由条目回调把结果只写回该条目，
   * 其他条目不受影响。
   * 四维度单选切换（tab）＋维度内多选；可不选（确认时当前类型未勾选任何项＝不设定维度，默认 FII）。
   * 不提供搜索 —— 搜索仅作用于指标选择，维度弹窗是否需要搜索待确认（REQ v4 待确认 2）。
   * cur：当前条目已设维度（null＝未选）；onOk(dim)：确认后回调（null＝清除为默认 FII） */
  function openDimPicker(cur, onOk) {
    var active = cur ? cur.type : 'fii';                       /* 当前维度类型（tab 单选切换） */
    var picked = { fii: [], branch: [], legal: [], cpa: [] };  /* 各类型的临时勾选 */
    if (cur && picked[cur.type] && cur.items) picked[cur.type] = cur.items.slice();

    var mask = el('div', 'ecw-dimmask');
    var dlg = el('div', 'ecw-dimdlg');
    dlg.innerHTML =
      '<div class="ecw-kbh">🧭 维度选择 · 圈定查询对象<button title="关闭">✕</button></div>' +
      '<div class="ecw-dimtabs"></div>' +
      '<div class="ecw-dimtip"></div>' +
      '<div class="ecw-dimbody"></div>' +
      '<div class="ecw-kbfoot"><span class="ecw-kbhint">维度可不选，不选默认 FII；确认以当前维度类型下的勾选为准</span>' +
      '<button class="ecw-btn">取消</button><button class="ecw-btn ecw-solid">确 认</button></div>';
    mask.appendChild(dlg);
    root.appendChild(mask);
    mask.classList.add('open');

    var tabsBox = dlg.querySelector('.ecw-dimtabs');
    var tip = dlg.querySelector('.ecw-dimtip');
    var body = dlg.querySelector('.ecw-dimbody');
    var hint = dlg.querySelector('.ecw-kbhint');

    function close() { mask.classList.remove('open'); mask.remove(); }
    dlg.querySelector('.ecw-kbh button').onclick = close;
    dlg.querySelector('.ecw-kbfoot .ecw-btn').onclick = close;

    function updateHint() {
      var n = picked[active].length;
      hint.textContent = n
        ? dimTypeName(active) + '：已选 ' + n + ' 项，点击「确 认」回到数据选择'
        : '维度可不选，不选默认 FII；确认以当前维度类型下的勾选为准';
      hint.classList.remove('warn');
    }

    /* 多选行（四维度共用，复用 ecw-kbfile 行＋ecw-kchk 勾选样式）：
     * meta＝左侧徽标（法人代码），note＝右侧灰色说明 */
    function dimRow(label, meta, items, it, note) {
      var row = el('div', 'ecw-kbfile' + (items.indexOf(it) >= 0 ? ' on' : ''));
      row.innerHTML = '<span class="ecw-kchk"></span>' +
        (meta ? '<span class="ecw-mcode" style="flex-shrink:0">' + escapeHtml(meta) + '</span>' : '') +
        '<span class="ecw-kfnm" title="' + escapeHtml(label) + '">' + escapeHtml(label) + '</span>' +
        (note ? '<span class="ecw-dimnote">' + escapeHtml(note) + '</span>' : '');
      row.onclick = function () {
        var idx = items.indexOf(it);
        if (idx >= 0) { items.splice(idx, 1); row.classList.remove('on'); }
        else { items.push(it); row.classList.add('on'); }
        renderTabs();                     /* 同步 tab 上的已选数量角标 */
        updateHint();
      };
      return row;
    }

    function renderTabs() {
      tabsBox.innerHTML = '';
      DIM_TYPES.forEach(function (t) {
        var tab = el('div', 'ecw-dimtab' + (t.key === active ? ' on' : ''),
          escapeHtml(t.name) + (picked[t.key].length ? '<i>' + picked[t.key].length + '</i>' : ''));
        tab.onclick = function () {
          if (active === t.key) return;
          active = t.key;
          renderTabs();
          renderBody();
          updateHint();
        };
        tabsBox.appendChild(tab);
      });
    }

    function renderBody() {
      body.innerHTML = '';
      if (active === 'fii') {                       /* 仅 1 个选项「FII」（流程 C 第 3 步） */
        tip.textContent = 'FII：仅 1 个选项，勾选后查询口径为 FII 整体；不勾选＝不设定维度（默认 FII）。';
        body.appendChild(dimRow('FII', '', picked.fii, 'FII'));
        return;
      }
      if (active === 'branch') {                    /* 13 项扁平多选（流程 C 第 4 步） */
        tip.textContent = '分会层级：共 ' + DIM_BRANCHES.length + ' 项，可多选（选项示例来自「分会管理」页）。';
        DIM_BRANCHES.forEach(function (b) { body.appendChild(dimRow(b, '', picked.branch, b)); });
        return;
      }
      if (active === 'legal') {                     /* 10 项扁平多选，显示 法人代码＋法人名称（流程 C 第 5 步） */
        tip.textContent = '法人层级：共 ' + DIM_LEGALS.length + ' 项，可多选；每项显示 法人代码＋法人名称（示例来自「法人管理」页）。';
        DIM_LEGALS.forEach(function (l) { body.appendChild(dimRow(l.name, l.code, picked.legal, l)); });
        return;
      }
      /* 策进组层级：两级 —— 可只勾一级策进组（＝覆盖整组），也可勾二级组织；组内可多选（流程 C 第 6 步） */
      tip.textContent = '策进组层级：可直接勾选一级策进组（＝覆盖该组、不限定二级组织），也可勾选其下二级组织；可多选（示例来自「策进组管理」页）。';
      DIM_CPA.forEach(function (g) {
        var grp = el('div', 'ecw-dimgroup');
        grp.appendChild(dimRow(g.name, '', picked.cpa, g.name, '勾选＝覆盖整组'));
        var kids = el('div', 'ecw-dimkids');
        g.kids.forEach(function (k) {
          var r = dimRow(k, '', picked.cpa, k);
          r.style.paddingLeft = '34px';
          kids.appendChild(r);
        });
        grp.appendChild(kids);
        body.appendChild(grp);
      });
    }

    renderTabs();
    renderBody();
    updateHint();

    dlg.querySelector('.ecw-btn.ecw-solid').onclick = function () {
      var items = picked[active];
      close();
      /* 当前类型未勾选任何项＝不设定维度 → 回到默认 FII（流程 C 第 7 步） */
      onOk(items.length ? { type: active, items: items.slice() } : null);
    };
  }

  /* 【数据选择】按钮（输入区上方按钮区，排在【指标信息采集表】之后）：
   * 点击打开选择弹窗，提交后由 AI 一次性返回表格结果 */
  $('ecw-databtn').onclick = function () {
    if (busy) return;
    openDataPicker();
  };

  /* 数据选择弹窗：五层下钻 + 每层子树搜索 + 指标多选 + 已选区逐指标配置年份/维度
   * （形态待确认，对齐知识库选择弹窗；年份与维度在各已选指标条目内 —— REQ v4 流程 A 第 10-12 步） */
  function openDataPicker() {
    var lib = null;        /* 已选指标库（第 1 层，未选时不能进下层） */
    var path = [];         /* 已选 维度/主题/议题 节点（第 2-4 层） */
    var kw = '';           /* 搜索关键词（仅匹配指标名称，不作用于年份/维度选项 —— 流程 B 第 5 步） */
    var sel = {};          /* 已选指标条目：指标代码 → {ind, year, dim}（多选，可跨层级累计）；
                             year/dim 为该指标各自的配置，null＝未选，默认 当年/FII —— FP-6/FP-7 */

    var mask = el('div', 'ecw-kbmask');
    var dlg = el('div', 'ecw-dsdlg');
    dlg.innerHTML =
      '<div class="ecw-kbh">📊 数据选择 · 选择指标并配置年份/维度<button title="关闭">✕</button></div>' +
      '<div class="ecw-dscrumb"></div>' +
      '<div class="ecw-dssearch"><i>🔍</i><input class="ecw-dsin"></div>' +
      '<div class="ecw-dslist"></div>' +
      '<div class="ecw-dssel"></div>' +
      '<div class="ecw-kbfoot"><span class="ecw-kbhint"></span>' +
      '<button class="ecw-btn">取消</button><button class="ecw-btn ecw-solid">提交查询</button></div>';
    mask.appendChild(dlg);
    root.appendChild(mask);
    mask.classList.add('open');

    var crumb = dlg.querySelector('.ecw-dscrumb');
    var input = dlg.querySelector('.ecw-dsin');
    var list = dlg.querySelector('.ecw-dslist');
    var selBox = dlg.querySelector('.ecw-dssel');
    var hint = dlg.querySelector('.ecw-kbhint');
    var okBtn = dlg.querySelector('.ecw-btn.ecw-solid');

    function scopeNode() { return path.length ? path[path.length - 1] : DS_TREE; }
    function scopeLabel() {
      if (!lib) return '全部指标库';
      var names = [lib];
      path.forEach(function (n) { names.push(n.name); });
      return names.join(' / ');
    }
    function clearKw() { kw = ''; input.value = ''; }

    function renderCrumb() {
      crumb.innerHTML = '';
      var parts = [{ label: '指标库', go: function () { lib = null; path = []; } }];
      if (lib) parts.push({ label: lib, go: function () { path = []; } });
      path.forEach(function (n, i) {
        parts.push({ label: n.name, go: function () { path = path.slice(0, i + 1); } });
      });
      parts.forEach(function (p, i) {
        if (i) crumb.appendChild(el('em', null, ' › '));
        if (i === parts.length - 1) { crumb.appendChild(el('b', null, escapeHtml(p.label))); return; }
        var s = el('span', null, escapeHtml(p.label));
        s.onclick = function () { p.go(); clearKw(); renderAll(); };
        crumb.appendChild(s);
      });
    }

    /* 下钻导航行（指标库 / 维度 / 主题 / 议题） */
    function navRow(node, isLib) {
      var cnt = isLib ? dsCountInds(DS_TREE) : dsCountInds(node);   /* mock：各库共用同一棵树 */
      var row = el('div', 'ecw-dsnav');
      row.innerHTML = '<span>' + (isLib ? '📚' : '📁') + '</span>' +
        '<span class="ecw-dsnavname">' + escapeHtml(node.name) + '</span>' +
        '<span class="ecw-dscnt">' + cnt + ' 个指标</span>' +
        '<span class="ecw-dsarrow">›</span>';
      row.onclick = function () {
        clearKw();
        if (isLib) { lib = node.name; path = []; }
        else path.push(node);
        renderAll();
      };
      return row;
    }

    /* 指标行（列表与搜索结果共用）：仅显示 指标代码 + 指标名称，可勾选 */
    function indRow(ind) {
      var row = el('div', 'ecw-kbfile' + (sel[ind.code] ? ' on' : ''));
      row.innerHTML = '<span class="ecw-kchk"></span>' +
        '<span class="ecw-mcode" style="flex-shrink:0">' + escapeHtml(ind.code) + '</span>' +
        '<span class="ecw-kfnm" title="' + escapeHtml(ind.name) + '">' + escapeHtml(ind.name) + '</span>';
      row.onclick = function () {
        if (sel[ind.code]) { delete sel[ind.code]; row.classList.remove('on'); }
        else { sel[ind.code] = { ind: ind, year: null, dim: null }; row.classList.add('on'); }
        renderSel();
      };
      return row;
    }

    function renderList() {
      list.innerHTML = '';
      if (lib || path.length) {                    /* 返回上一级 */
        var back = el('div', 'ecw-dsback', '‹ 返回上一级');
        back.onclick = function () {
          clearKw();
          if (path.length) path.pop(); else lib = null;
          renderAll();
        };
        list.appendChild(back);
      }
      if (kw) {                                    /* 搜索：当前停留层级子树内、仅匹配指标名称 */
        var all = dsFlattenInds(scopeNode(), []);
        var hits = all.filter(function (i) { return i.name.indexOf(kw) >= 0; });
        list.appendChild(el('div', 'ecw-dstip',
          '搜索范围：「' + escapeHtml(scopeLabel()) + '」子树共 ' + all.length +
          ' 个指标，名称命中 <b>' + hits.length + '</b> 个（仅匹配指标名称，可跨下级直达）'));
        if (!hits.length) {
          list.appendChild(el('div', 'ecw-dsempty', '暂无匹配指标'));   /* 空态表现待确认 */
          return;
        }
        hits.forEach(function (i) { list.appendChild(indRow(i)); });
        return;
      }
      if (!lib) {                                  /* 第 1 层 · 指标库（仅显示有效库） */
        DS_LIBS.forEach(function (name) { list.appendChild(navRow({ name: name }, true)); });
        return;
      }
      var kids = dsKids(scopeNode());              /* 第 2-4 层：维度/主题/议题（单选下钻） */
      if (kids) {
        kids.forEach(function (n) { list.appendChild(navRow(n, false)); });
      } else {                                     /* 第 5 层 · 指标（多选） */
        list.appendChild(el('div', 'ecw-dstip', '第 5 层 · 指标：仅显示指标代码与指标名称，可多选'));
        scopeNode().inds.forEach(function (i) { list.appendChild(indRow(i)); });
      }
    }

    /* 已选指标区（REQ v4）：每个已选指标为一条可配置条目 —— 指标代码＋名称＋该条目自己的
     * 年份下拉＋【维度选择】入口＋维度回显（可清除）＋移除；条目间配置互相独立 */
    function renderSel() {
      selBox.innerHTML = '';
      var codes = Object.keys(sel);
      selBox.appendChild(el('span', 'ecw-dsselh',
        codes.length ? '已选指标（' + codes.length + '）· 年份与维度按指标单独配置：'
                     : '已选指标（0）：暂未选择，勾选指标后提交'));
      codes.forEach(function (c) { selBox.appendChild(entryBox(c)); });
      hint.textContent = '未配置的指标按默认（年份＝当年 ' + DS_CUR_YEAR + ' · 维度＝FII）提交；可跨层级多选';
      hint.classList.remove('warn');
    }

    /* 单条已选指标条目（REQ v4 流程 A 第 10-12 步）：
     * 行 1＝指标代码＋名称＋移除；行 2＝年份下拉＋【维度选择】＋维度回显。
     * 所有子控件均在创建处直接绑 onclick / onchange。 */
    function entryBox(code) {
      var cfg = sel[code];                          /* {ind, year, dim} */
      var box = el('div', 'ecw-dsentry');

      var head = el('div', 'ecw-dsehead');
      head.innerHTML =
        '<span class="ecw-mcode" style="flex-shrink:0">' + escapeHtml(cfg.ind.code) + '</span>' +
        '<span class="ecw-dsename" title="' + escapeHtml(cfg.ind.name) + '">' + escapeHtml(cfg.ind.name) + '</span>';
      var rm = el('span', 'ecw-dserm', '✕');
      rm.title = '移除该指标（其年份/维度配置一并丢弃）';
      rm.onclick = function () {                    /* 移除＝丢弃该条目全部配置（REQ v4 边界） */
        delete sel[code];
        renderSel();
        renderList();                               /* 同步列表/搜索结果行的勾选状态 */
      };
      head.appendChild(rm);
      box.appendChild(head);

      var cf = el('div', 'ecw-dsecfg');
      /* ① 年份下拉（指标级 FP-6）：可不选（首项），不选＝默认当年 */
      var ys = el('select', 'ecw-dsyear');
      ys.title = '年份可不选，不选默认当年（' + DS_CUR_YEAR + '）';
      var ph = el('option', null, '年份 · 默认 ' + DS_CUR_YEAR);
      ph.value = '';
      ys.appendChild(ph);
      DS_YEARS.forEach(function (y) {
        var o = el('option', null, y + ' 年');
        o.value = String(y);
        ys.appendChild(o);
      });
      ys.value = cfg.year ? String(cfg.year) : '';
      ys.onchange = function () { sel[code].year = ys.value ? parseInt(ys.value, 10) : null; };
      cf.appendChild(ys);
      /* ② 【维度选择】入口（指标级 FP-7）：二级弹窗的确认结果只落到当前条目，其他条目不受影响 */
      var db = el('button', 'ecw-dimopen', '🧭 维度选择');
      db.type = 'button';
      db.onclick = function () {
        openDimPicker(sel[code].dim, function (d) {
          sel[code].dim = d;
          renderSel();
        });
      };
      cf.appendChild(db);
      /* ③ 维度回显：维度名＋已选对象摘要，可清除（清除后该指标回到默认 FII）—— 流程 C 第 8 步 */
      var echo = el('span', 'ecw-dimecho');
      if (cfg.dim) {
        echo.appendChild(el('span', 'ecw-dimtxt', '维度：' + escapeHtml(dimBrief(cfg.dim))));
        var clr = el('span', 'ecw-dimclear', '✕ 清除');
        clr.title = '清除该指标的维度选择，回到默认 FII';
        clr.onclick = function () { sel[code].dim = null; renderSel(); };
        echo.appendChild(clr);
      } else {
        echo.appendChild(el('span', 'ecw-dimtxt ecw-dimdef', '维度：FII（默认）'));
      }
      cf.appendChild(echo);
      box.appendChild(cf);
      return box;
    }

    function renderAll() {
      renderCrumb();
      input.placeholder = '搜索「' + scopeLabel() + '」子树内的指标名称';
      renderList();
      renderSel();
    }

    input.addEventListener('input', function () {
      kw = input.value.trim();
      renderList();
    });

    function close() { mask.classList.remove('open'); mask.remove(); }
    dlg.querySelector('.ecw-kbh button').onclick = close;
    dlg.querySelector('.ecw-kbfoot .ecw-btn').onclick = close;
    okBtn.onclick = function () {
      var codes = Object.keys(sel);
      if (!codes.length) {
        hint.textContent = '请至少选择一个指标';
        hint.classList.add('warn');
        return;
      }
      var picked = codes.map(function (c) { return sel[c]; });   /* [{ind, year, dim}] 逐指标配置 */
      close();
      runDataQuery(picked, lib);
    };
    renderAll();
  }

  /* 提交后：思考动效 → 进度 → 一次性以单一表格返回全部指标 × 各自维度对象的结果
   * （items＝[{ind, year, dim}]：每个指标携带各自年份与维度，未配置＝当年＋FII —— REQ v4 FP-4） */
  async function runDataQuery(items, libName) {
    var s = startSession();
    var lines = items.map(function (it) {
      return '· ' + it.ind.name + '：年份 ' + (it.year || DS_CUR_YEAR) +
        (it.year ? '' : '（默认）') + ' · ' + dimSum(it.dim);
    });
    addUser('📊 数据选择' + (libName ? '（' + libName + '）' : '') +
      '：已提交 ' + items.length + ' 项指标（年份/维度各自配置）\n' + lines.join('\n'));
    showTyping('正在查询指标数据…');
    await sleep(900);
    if (stale(s)) return;
    hideTyping();
    var totalRows = 0;
    items.forEach(function (it) { totalRows += dimQueryObjs(it.dim).length; });
    var steps = [];
    if (libName) steps.push({ label: '定位指标库：' + libName, dur: 600 });
    steps.push({
      label: '按各指标自身口径读取数值与数据来源（共 ' + totalRows + ' 行）', dur: 1000,
      sub: items.slice(0, 3).map(function (it) {
        return it.ind.code + ' ' + it.ind.name + ' · ' + (it.year || DS_CUR_YEAR) + ' · ' + dimSum(it.dim);
      })
    });
    await addProgress('数据选择 · 查询平台指标数据', steps);
    if (stale(s)) return;
    endSession(s);
    addDataResultCard(items, libName);
    addAgent({
      text: '已按本次提交**一次性**返回 ' + items.length + ' 项指标共 ' + totalRows +
        ' 行查询结果（单一表格）✅\n\n年份与维度为**指标级配置**：未配置的指标分别按当年（**' + DS_CUR_YEAR +
        '**）与 **FII** 处理；可继续选择指标追加查询。',
      chips: [
        { label: '继续选择指标', act: function () { openDataPicker(); } },
        { label: '⟳ 开启新对话', act: newChat }
      ]
    });
  }

  /* 数据选择 · 查询结果卡片：一个表格承载本次全部提交指标 × 各自维度对象
   * （行＝Σ(每个指标 × 该指标所选维度对象数)，维度未选的指标按 1 个默认对象 FII 计；
   *   年份列/维度对象列取各指标各自的配置；列＝指标代码/指标名称/年份/维度对象/数值/单位/数据来源，
   *   为 REQ v4 默认口径 —— 列集与列序待确认），
   * 带 AI 标注角标（对齐 addDocCard 的 ecw-aitag 用法 / 全局规则 1） */
  function addDataResultCard(items, libName) {
    var totalRows = 0;
    items.forEach(function (it) { totalRows += dimQueryObjs(it.dim).length; });
    var row = el('div', 'ecw-row ecw-agent');
    var av = el('div', 'ecw-mavatar', agentEmoji());
    var card = el('div', 'ecw-card');
    card.style.width = '100%';
    var title = el('div', 'ecw-cardtitle',
      '📊 指标数据查询结果' + (libName ? '（' + escapeHtml(libName) + '）' : '') +
      ' · ' + items.length + ' 项指标 × ' + totalRows + ' 行');
    title.appendChild(el('span', 'ecw-aitag', '⚠ AI生成/提取，请人工核实'));
    card.appendChild(title);
    var wrap = el('div', 'ecw-tblwrap');
    var t = el('table', 'ecw-tbl');
    var thead = el('thead');
    thead.innerHTML = '<tr><th>指标代码</th><th>指标名称</th><th>年份</th><th>维度对象</th><th>数值</th><th>单位</th><th>数据来源</th></tr>';
    t.appendChild(thead);
    var tbody = el('tbody');
    items.forEach(function (it) {
      var yearTxt = String(it.year || DS_CUR_YEAR);
      dimQueryObjs(it.dim).forEach(function (o) {
        var tr = el('tr');
        [it.ind.code, it.ind.name, yearTxt, o.label, dsCellVal(it.ind, it.year, o), it.ind.unit, it.ind.src]
          .forEach(function (cell) { tr.appendChild(el('td', null, md(String(cell)))); });
        tbody.appendChild(tr);
      });
    });
    t.appendChild(tbody);
    wrap.appendChild(t);
    card.appendChild(wrap);
    card.appendChild(el('div', 'ecw-tblfoot', md(
      '行＝各指标 × 其所选维度对象（未选维度＝1 个默认对象 FII）· 年份/维度按各指标各自配置 · **列集与列序待确认**')));
    row.appendChild(av);
    row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* ================================================================
   * 十、面板交互
   * ================================================================ */
  function openPanel() {
    root.classList.add('ecw-open');
    root.querySelector('.ecw-launcher').innerHTML = ICON_CLOSE;
    if (window.innerWidth < 700) root.classList.add('ecw-noside');
    if (!root.querySelector('#ecw-msgs').children.length) {
      addSystem('原型演示 · 对话与数据均为模拟，正式版由后端 Agent 驱动');
      chatIntro();
    }
    ta.focus();
  }
  function closePanel() {
    root.classList.remove('ecw-open');
    root.querySelector('.ecw-launcher').innerHTML = ICON_CHAT + '<span class="ecw-dot"></span>';
  }
  root.querySelector('.ecw-launcher').onclick = function () {
    root.classList.contains('ecw-open') ? closePanel() : openPanel();
  };
  $('ecw-closebtn').onclick = closePanel;
  var nb2 = $('ecw-newbtn2');
  if (nb2) nb2.onclick = newChat;                      /* 头部新对话按钮（如存在） */
  root.querySelector('.ecw-newbtn').onclick = newChat; /* 侧栏 + 新对话 */

  $('ecw-sidebtn').onclick = function () { root.classList.toggle('ecw-noside'); };

  root.querySelectorAll('.ecw-agentbtn').forEach(function (b) {
    var m = b.getAttribute('data-mode');
    if (!m) return;   /* 无 data-mode 的功能按钮（如【数据选择】）不在此绑定，避免覆盖其专属 onclick */
    b.onclick = function () {
      /* 再次点击当前 Agent 按钮 = 切回智能助手 */
      setMode(m === state.mode ? 'chat' : m);
    };
  });

  function autoGrow() {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
    sendBtn.disabled = !ta.value.trim() || busy;
  }
  ta.addEventListener('input', autoGrow);
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  });
  sendBtn.onclick = onSend;
  sendBtn.disabled = true;

  $('ecw-filein').addEventListener('change', function () {
    handleFiles(this.files);
    this.value = '';   /* 允许重复选择同一文件 */
  });

  /* ================================================================
   * 十一、初始化：载入历史对话列表（首次打开时新建会话）
   * ================================================================ */
  conversations = readHistory();
  renderSide();
})();
