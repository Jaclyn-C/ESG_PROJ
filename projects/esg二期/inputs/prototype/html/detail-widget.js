/*!
 * ESG 管理平台 · 监控看板「指标收集进度详情」页面专属 Widget（交互原型）
 * ============================================================
 * 功能（仅注入本详情页，与全局 AI 助手相互独立、界面风格统一）：
 *   1. 页头信息栏（flex flex-wrap gap-10）右侧新增「下载」按钮
 *   2. 点击下载按钮弹出浮框：
 *      · ⬇ 下载 —— 将本页面数据导出为 Word
 *      · ✨ AI 分析 —— 打开本页面专属 AI 分析助手（右侧抽屉，蓝色主题，
 *        与全局聊天助手配色、输入框样式一致）
 *   3. AI 分析助手：输入提示词 / 从知识库选择附件 → 对话生成页面分析
 *      → 「下载完整报告」= 页面数据 + AI 分析 合并为一个 Word 下载
 *
 * 说明：纯前端原型，分析文本为固定脚本模拟；Word 由浏览器本地生成（Blob）。
 * 引入方式：页面 </body> 前加 <script src="./detail-widget.js"></script>
 */
(function () {
  'use strict';
  if (window.__ESG_DETAIL_WIDGET__) return;
  window.__ESG_DETAIL_WIDGET__ = true;

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
  function md(s) {
    return escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
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

  /* ================================================================
   * 二、页面数据提取（快照页 DOM 读取 + 兜底数据）
   * ================================================================ */
  var HEADER_FALLBACK = [
    { k: '申请单号', v: '20260826-001' },
    { k: '任务名称', v: '0826' },
    { k: '收集时间', v: '2026年' },
    { k: '创建人', v: 'X2007490 劉丹' }
  ];
  var TABLE_FALLBACK = [
    ['社会', '人力资源', '员工组成', 'L-S-1-2-0005', '全体员工中女性人数', '100%', '100%'],
    ['社会', '人力资源', '员工组成', 'L-S-1-2-0006', '全职或正式员工人数', '100%', '100%']
  ];

  function pageHeader() {
    var hd = document.querySelector('.flex.flex-wrap.gap-10');
    if (!hd) return HEADER_FALLBACK;
    var out = [];
    Array.prototype.forEach.call(hd.children, function (d) {
      var spans = d.querySelectorAll('span');
      if (spans.length >= 2) {
        var k = (spans[0].textContent || '').trim().replace(/：$/, '');
        var v = (spans[spans.length - 1].textContent || '').trim();
        if (k && v) out.push({ k: k, v: v });
      }
    });
    return out.length ? out : HEADER_FALLBACK;
  }
  function pageTable() {
    var tables = document.querySelectorAll('table');
    var seen = {}, rows = [];
    Array.prototype.forEach.call(tables, function (t) {
      if ((t.textContent || '').indexOf('指标代码') < 0) return;
      Array.prototype.forEach.call(t.querySelectorAll('tr'), function (tr) {
        var tds = tr.querySelectorAll('td');
        if (tds.length < 6) return;                       /* 跳过表头/隐藏行 */
        var r = [];
        Array.prototype.forEach.call(tds, function (td) {
          var v = (td.textContent || '').trim();
          if (v && v !== '进度详情') r.push(v);            /* 丢弃空操作列 */
        });
        if (r.length >= 6 && !seen[r[3]]) { seen[r[3]] = 1; rows.push(r.slice(0, 7)); }
      });
    });
    return rows.length ? rows : TABLE_FALLBACK;
  }
  function wordPageData() {
    var head = pageHeader().map(function (h) { return escapeHtml(h.k) + '：' + escapeHtml(h.v); }).join(' ｜ ');
    var tbl = pageTable().map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + escapeHtml(c) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<h1 style="font-family:微软雅黑">指标收集进度详情报告</h1>' +
      '<p style="color:#555">' + head + '</p>' +
      '<h2 style="font-family:微软雅黑">一、页面数据</h2>' +
      '<p>总收集进度：<b>100%</b>（填写进度 100%，审批进度 100%）</p>' +
      '<p>指标收集进度（共 ' + pageTable().length + ' 项）：</p>' +
      '<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:微软雅黑;font-size:12px">' +
      '<tr style="background:#f5f7fb"><th>维度</th><th>主题</th><th>议题</th><th>指标代码</th><th>指标名称</th><th>填写进度</th><th>审批进度</th></tr>' +
      tbl + '</table>';
  }

  /* ================================================================
   * 三、固定分析文本（演示：与用户输入无关）
   * ================================================================ */
  var ANALYSIS_HTML =
    '<p><b>一、总体进度</b></p>' +
    '<p>2026 年信息收集整体进度约 <b>68%</b>，较时间进度（80%）落后约 12 个百分点，<b>整体偏慢</b>；若维持当前速度，预计将逾期 5 个工作日。</p>' +
    '<p><b>二、各法人进度差异</b></p>' +
    '<p>· 「富鼎精密科技(深圳)法人」填写进度 <b>42%</b>，为当前最慢单位，已有 3 项指标超时 2 天未提交；</p>' +
    '<p>· 「FII 科技(杭州)法人」填写进度 57%，审批进度仅 30%，签核环节滞留明显；</p>' +
    '<p>· 「富弘科技法人」已完成 100%，处于领先，可作为标杆口径输出。</p>' +
    '<p><b>三、存在问题</b></p>' +
    '<p>1. 整体进度落后时间进度 12 个百分点，存在集中补报引发的质量与审批拥堵风险；</p>' +
    '<p>2. 深圳法人 HR 类指标（如「全体员工中女性人数」）因跨部门取数延迟，已驳回返工 2 次；</p>' +
    '<p>3. 部分单位对指标口径理解不一致，沟通成本高，跟催记录未闭环。</p>' +
    '<p><b>四、改善建议与行动提醒</b></p>' +
    '<p>1. 跟催：对填写进度低于 50% 的法人（深圳、杭州）今日内发送「派发&审阅跟催」提醒，并抄送所属分会执行秘书；</p>' +
    '<p>2. 口径：对驳回率最高的 HR 类指标补充《指标口径说明》，并组织 15 分钟线上答疑；</p>' +
    '<p>3. 预警：若 3 个工作日内整体进度未回升至 80%，建议升级至策进组层面协调资源；</p>' +
    '<p>4. 沉淀：参考富弘法人做法，形成《填报操作指引》供落后单位复用。</p>';

  /* 知识库演示文件 */
  var KB_FILES = [
    { name: '2026年信息收集工作要求.docx', tag: '工作要求' },
    { name: '进度分析提示词模板.docx', tag: '提示词' },
    { name: '上交所可持续发展报告披露要求.docx', tag: '披露要求' },
    { name: '2025年可持续发展报告（终版）.pdf', tag: '参考报告' }
  ];

  /* ================================================================
   * 四、样式（.edw- 前缀；AI 抽屉与全局助手统一蓝色主题）
   * ================================================================ */
  var CSS = [
    '.edw-btnwrap{position:relative;margin-left:auto;display:flex;align-items:center;align-self:center;gap:8px}',
    '.edw-pop{position:fixed;z-index:3000;width:236px;background:#fff;',
    ' border:1px solid #e6e6e6;border-radius:8px;box-shadow:0 12px 32px rgba(19,51,104,.18);padding:10px;display:none}',
    '.edw-pop.open{display:block;animation:edwIn .18s ease}',
    '.edw-pop-title{font-size:12px;color:#8a919f;padding:0 2px 8px;font-family:inherit}',
    '.edw-pop-btn{width:100%;margin:0 0 8px !important}',
    '.edw-pop-btn:last-child{margin-bottom:0 !important}',
    '.edw-w100{width:100%}',

    /* ---- AI 分析抽屉（与全局助手统一的蓝色主题） ---- */
    '.edw-mask{position:fixed;inset:0;background:rgba(19,51,104,.28);z-index:2147483200;display:none}',
    '.edw-mask.open{display:block;animation:edwIn .2s ease}',
    '.edw-drawer{position:fixed;top:0;right:0;bottom:0;width:440px;max-width:94vw;background:#fff;',
    ' z-index:2147483201;display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(19,51,104,.2);',
    ' transform:translateX(100%);transition:transform .25s ease;font-family:-apple-system,BlinkMacSystemFont,',
    ' "PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",sans-serif;font-size:13px;color:#1f2329;text-align:left}',
    '.edw-drawer.open{transform:none}',
    '.edw-drawer *,.edw-drawer *::before,.edw-drawer *::after{box-sizing:border-box;margin:0;padding:0}',
    '.edw-drawer p,.edw-drawer ul,.edw-drawer li{margin:0;padding:0;list-style:none}',
    '@keyframes edwIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',

    '.edw-dhead{height:56px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:0 14px;',
    ' background:#fff;border-bottom:1px solid #eef0f5}',
    '.edw-davatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#3f7afa,#133368);',
    ' display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}',
    '.edw-dname{font-size:14px;font-weight:600;color:#133368}',
    '.edw-dsub{font-size:11px;color:#8a919f;display:flex;align-items:center;gap:5px}',
    '.edw-dbadge{font-size:10px;border:1px solid #c9d8ff;background:#e8efff;color:#2f5fd9;border-radius:999px;',
    ' padding:0 7px;line-height:16px;flex-shrink:0}',
    '.edw-dclose{margin-left:auto;width:28px;height:28px;border:1px solid #e6e6e6;background:#fff;',
    ' color:#5a6472;border-radius:4px;cursor:pointer;font-size:13px;transition:all .15s}',
    '.edw-dclose:hover{border-color:#3f7afa;color:#3f7afa}',

    '.edw-msgs{flex:1;overflow-y:auto;background:#f5f5fc;padding:14px 12px;display:flex;flex-direction:column;gap:12px}',
    '.edw-msgs::-webkit-scrollbar{width:6px}',
    '.edw-msgs::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '.edw-row{display:flex;gap:8px;align-items:flex-start;animation:edwIn .25s ease}',
    '.edw-row.edw-user{justify-content:flex-end}',
    '.edw-mavatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;margin-top:2px;',
    ' background:linear-gradient(135deg,#3f7afa,#133368);color:#fff;font-size:13px;',
    ' display:flex;align-items:center;justify-content:center}',
    '.edw-bubble{max-width:86%;padding:9px 12px;border-radius:8px;font-size:13px;word-break:break-word;',
    ' line-height:1.6;background:#fff;border:1px solid #e6e6e6;border-top-left-radius:2px}',
    '.edw-user .edw-bubble{background:#3f7afa;color:#fff;border:none;border-top-right-radius:2px}',
    '.edw-bubble b{color:#133368}',
    '.edw-user .edw-bubble b{color:#fff}',
    '.edw-sys{align-self:center;max-width:92%;font-size:11px;padding:4px 12px;border-radius:999px;',
    ' background:#eceff5;color:#6b7280;text-align:center;animation:edwIn .25s ease}',

    '.edw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-width:86%}',
    '.edw-chip{border:1px solid #c9d8ff;background:#fff;color:#2f5fd9;border-radius:999px;',
    ' padding:3px 12px;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit}',
    '.edw-chip:hover{background:#3f7afa;border-color:#3f7afa;color:#fff;box-shadow:0 2px 6px rgba(63,122,250,.3)}',
    '.edw-chips.done .edw-chip{opacity:.45;pointer-events:none}',

    '.edw-card{background:#fff;border:1px solid #e9edf4;border-radius:8px;overflow:hidden;width:100%;',
    ' box-shadow:0 2px 10px rgba(19,51,104,.07)}',
    '.edw-cardtitle{padding:8px 10px;font-size:12px;font-weight:600;color:#133368;',
    ' border-bottom:1px solid #f0f0f5;border-left:3px solid #3f7afa;display:flex;align-items:center;',
    ' gap:6px;background:#fafbfe}',
    '.edw-kbitem{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:4px;cursor:pointer;',
    ' font-size:12.5px;transition:background .12s;margin:2px 6px}',
    '.edw-kbitem:hover{background:#f0f4fc}',
    '.edw-kbitem.sel{background:#eef3ff}',
    '.edw-kbitem .nm{flex:1;min-width:0;color:#24292f}',
    '.edw-kbitem.sel .nm{color:#133368;font-weight:600}',
    '.edw-kbtag{font-size:10px;color:#2f5fd9;background:#e8efff;border-radius:3px;padding:1px 6px;flex-shrink:0}',
    '.edw-kbchk{width:15px;height:15px;border:1px solid #c9d0dc;border-radius:3px;flex-shrink:0;',
    ' background:#fff;position:relative}',
    '.edw-kbitem.sel .edw-kbchk{background:#3f7afa;border-color:#3f7afa}',
    '.edw-kbitem.sel .edw-kbchk::after{content:"✓";position:absolute;inset:0;color:#fff;font-size:11px;',
    ' display:flex;align-items:center;justify-content:center}',
    '.edw-kbfoot{padding:8px 10px;border-top:1px solid #f0f0f5;display:flex;align-items:center;gap:8px}',
    '.edw-kbwarn{font-size:11px;color:#d97a00;flex:1}',

    '.edw-steps{padding:8px 10px}',
    '.edw-step{display:flex;gap:8px;padding:4px 0;opacity:.45;transition:opacity .2s}',
    '.edw-step.run,.edw-step.ok{opacity:1}',
    '.edw-sicon{width:16px;height:16px;flex-shrink:0;margin-top:2px;display:flex;align-items:center;',
    ' justify-content:center;font-size:13px;color:#67c23a}',
    '.edw-spin{width:13px;height:13px;border:2px solid #d5e0f5;border-top-color:#3f7afa;',
    ' border-radius:50%;animation:edwSpin .7s linear infinite}',
    '@keyframes edwSpin{to{transform:rotate(360deg)}}',
    '.edw-slabel{font-size:12px;color:#1f2329;font-weight:500}',
    '.edw-ssubs{margin:2px 0 4px 24px;display:flex;flex-direction:column;gap:2px}',
    '.edw-ssubs span{font-size:11px;color:#7b8494}',

    '.edw-dochead{padding:8px 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.edw-doctitle{font-size:12.5px;font-weight:600;color:#133368;flex:1;min-width:0}',
    '.edw-aitag{font-size:10.5px;color:#d97a00;border:1px solid #ffd9ae;background:#fff8ef;',
    ' border-radius:3px;padding:1px 6px;white-space:nowrap;font-weight:500}',
    '.edw-docbody{padding:10px 12px;background:#fbfcff;border-top:1px solid #f0f0f5;border-bottom:1px solid #f0f0f5;',
    ' font-size:12.5px;color:#24292f;max-height:280px;overflow-y:auto;outline:none;line-height:1.8}',
    '.edw-docbody p{margin:0 0 8px}',
    '.edw-docbody:focus{box-shadow:inset 0 0 0 2px #c9d8ff}',
    '.edw-docfoot{padding:8px 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.edw-docnote{font-size:11px;color:#8a919f;flex:1;min-width:120px}',
    '.edw-btn{border-radius:3px;border:1px solid #3f7afa;color:#3f7afa;background:#fff;',
    ' font-size:11.5px;padding:3px 10px;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}',
    '.edw-btn:hover{background:#3f7afa;color:#fff}',
    '.edw-btn.solid{background:#3f7afa;color:#fff}',
    '.edw-btn.solid:hover{background:#2f5fd9}',
    '.edw-btn:disabled{opacity:.5;cursor:not-allowed}',

    '.edw-inbar{background:#fff;border-top:1px solid #eef0f5;padding:10px 12px 6px;flex-shrink:0}',
    /* 统一输入框：🗂 小按钮 + 无边框输入 + 发送，与全局助手一致 */
    '.edw-inputbox{display:flex;align-items:flex-end;gap:6px;border:1px solid #dfe3ee;border-radius:10px;',
    ' background:#fbfcff;padding:6px 6px 6px 5px;transition:border-color .15s,background .15s,box-shadow .15s}',
    '.edw-inputbox:focus-within{border-color:#3f7afa;background:#fff;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '.edw-kbbtn{width:26px;height:26px;border:none;background:transparent;border-radius:6px;cursor:pointer;',
    ' color:#8a94a6;font-size:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;',
    ' transition:all .15s;font-family:inherit;padding:0}',
    '.edw-kbbtn:hover{background:#e8efff;color:#3f7afa}',
    '.edw-ta{flex:1;border:none;background:transparent;padding:5px 2px;font-size:13px;',
    ' font-family:inherit;resize:none;outline:none;max-height:96px;line-height:1.5;color:#1f2329}',
    '.edw-ta::placeholder{color:#aab1bd}',
    '.edw-send{width:28px;height:28px;border:none;border-radius:8px;background:#3f7afa;cursor:pointer;',
    ' flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background .15s}',
    '.edw-send svg{width:14px;height:14px;fill:#fff}',
    '.edw-send:hover{background:#2f5fd9}',
    '.edw-send:disabled{background:#c3cdf3;cursor:not-allowed}',
    '.edw-foot{font-size:10.5px;color:#aab1bd;text-align:center;padding:5px 0 2px}',
    '.edw-typing{display:flex;gap:3px;align-items:center}',
    '.edw-typing i{width:5px;height:5px;border-radius:50%;background:#3f7afa;display:inline-block;',
    ' animation:edwBlink 1s infinite}',
    '.edw-typing i:nth-child(2){animation-delay:.2s}',
    '.edw-typing i:nth-child(3){animation-delay:.4s}',
    '@keyframes edwBlink{0%,100%{opacity:.25}50%{opacity:1}}'
  ].join('');
  var styleTag = el('style');
  styleTag.textContent = CSS;
  document.head.appendChild(styleTag);

  /* ================================================================
   * 五、页头下载按钮 + 浮框
   * ================================================================ */
  var host = document.querySelector('.flex.flex-wrap.gap-10');
  if (!host) return;   /* 非本详情页则不注入 */

  var wrap = el('div', 'edw-btnwrap');
  var dlBtn = el('button', 'el-button el-button--primary', '<span>⬇ 下载</span>');
  dlBtn.type = 'button';
  wrap.appendChild(dlBtn);

  var pop = el('div', 'edw-pop');
  pop.innerHTML =
    '<div class="edw-pop-title">请选择操作</div>' +
    '<button type="button" class="el-button edw-pop-btn edw-w100"><span>⬇ 下载页面数据（Word）</span></button>' +
    '<button type="button" class="el-button el-button--primary edw-pop-btn edw-w100"><span> AI 分析（生成报告）</span></button>';
  /* 挂到 body + fixed 定位：避免被外层 el-card 的 overflow:hidden 裁剪 */
  document.body.appendChild(pop);
  host.appendChild(wrap);

  /* 按按钮实际位置定位：出现在按钮正下方、右对齐 */
  function placePop() {
    var r = dlBtn.getBoundingClientRect();
    pop.style.top = (r.bottom + 8) + 'px';
    pop.style.left = Math.max(8, r.right - 236) + 'px';
  }
  dlBtn.onclick = function (e) {
    e.stopPropagation();
    if (pop.classList.contains('open')) { pop.classList.remove('open'); return; }
    placePop();
    pop.classList.add('open');
  };
  window.addEventListener('scroll', function () {
    if (pop.classList.contains('open')) placePop();
  }, true);
  window.addEventListener('resize', function () {
    if (pop.classList.contains('open')) placePop();
  });
  document.addEventListener('click', function (e) {
    if (!pop.contains(e.target) && e.target !== dlBtn) pop.classList.remove('open');
  });
  var popBtns = pop.querySelectorAll('button');
  popBtns[0].onclick = function () {         /* 直接下载页面数据 */
    pop.classList.remove('open');
    downloadWord('指标收集进度详情_20260826-001（页面数据）.doc', wordPageData() +
      '<p style="color:#888;font-size:11px">注：数据取自「监控看板 · 指标收集进度详情」页面。</p>');
  };
  popBtns[1].onclick = function () {         /* 打开 AI 分析抽屉 */
    pop.classList.remove('open');
    openDrawer();
  };

  /* ================================================================
   * 六、AI 分析抽屉（页面专属助手）
   * ================================================================ */
  var drawer = el('div', 'edw-drawer');
  drawer.innerHTML =
    '<div class="edw-dhead">' +
    '  <div class="edw-davatar">🪄</div>' +
    '  <div style="min-width:0">' +
    '    <div class="edw-dname">AI 页面分析助手</div>' +
    '    <div class="edw-dsub"><span>仅分析当前页面数据</span></div>' +
    '  </div>' +
    '  <span class="edw-dbadge">本页面专属</span>' +
    '  <button class="edw-dclose" title="关闭">✕</button>' +
    '</div>' +
    '<div class="edw-msgs" id="edw-msgs"></div>' +
    '<div class="edw-inbar">' +
    '  <div class="edw-inputbox">' +
    '    <button class="edw-kbbtn" id="edw-kbbtn" title="从知识库选择附件（免重复上传）">🗂</button>' +
    '    <textarea class="edw-ta" id="edw-ta" rows="1" placeholder="清输入文本"></textarea>' +
    '    <button class="edw-send" id="edw-sendbtn" title="发送">' +
    '      <svg viewBox="0 0 24 24"><path d="M3 11.5l17.2-8.1c.8-.4 1.7.5 1.3 1.3L13.4 21.9c-.4.8-1.6.7-1.9-.2l-2.1-6.1-6.1-2.1c-.9-.3-1-1.5-.2-1.9z" transform="translate(0,-1)"/></svg>' +
    '    </button>' +
    '  </div>' +
    '  <div class="edw-foot">内容由 AI 生成/提取，请人工核实 · 本原型数据均为模拟</div>' +
    '</div>';
  var mask = el('div', 'edw-mask');
  document.body.appendChild(mask);
  document.body.appendChild(drawer);

  var msgs = drawer.querySelector('#edw-msgs');
  var ta = drawer.querySelector('#edw-ta');
  var sendBtn = drawer.querySelector('#edw-sendbtn');
  var busy = false;
  var kbPicked = [];
  var greeted = false;

  function scrollBottom() {
    requestAnimationFrame(function () { msgs.scrollTop = msgs.scrollHeight; });
  }
  function killChips() {
    drawer.querySelectorAll('.edw-chips:not(.done)').forEach(function (c) { c.classList.add('done'); });
  }
  function addUser(text) {
    killChips();
    var row = el('div', 'edw-row edw-user');
    row.appendChild(el('div', 'edw-bubble', md(text)));
    msgs.appendChild(row);
    scrollBottom();
  }
  function addSystem(text) {
    killChips();
    msgs.appendChild(el('div', 'edw-sys', md(text)));
    scrollBottom();
  }
  function addAgent(opts) {
    opts = opts || {};
    killChips();
    var row = el('div', 'edw-row');
    var av = el('div', 'edw-mavatar', '🪄');
    var box = el('div');
    box.style.maxWidth = '100%';
    box.appendChild(el('div', 'edw-bubble', md(opts.text || '')));
    if (opts.chips && opts.chips.length) {
      var chipRow = el('div', 'edw-chips');
      opts.chips.forEach(function (c) {
        var b = el('button', 'edw-chip', escapeHtml(c.label));
        b.onclick = function () {
          if (busy) return;
          chipRow.classList.add('done');
          addUser(c.label);
          if (c.act) c.act();
        };
        chipRow.appendChild(b);
      });
      box.appendChild(chipRow);
    }
    row.appendChild(av); row.appendChild(box);
    msgs.appendChild(row);
    scrollBottom();
  }
  var typingRow = null;
  function showTyping(label) {
    hideTyping(); killChips();
    typingRow = el('div', 'edw-row');
    typingRow.innerHTML = '<div class="edw-mavatar">🪄</div>' +
      '<div class="edw-bubble" style="display:flex;align-items:center;gap:8px">' +
      '<span class="edw-typing"><i></i><i></i><i></i></span>' +
      '<span style="font-size:12px;color:#7b8494">' + escapeHtml(label || '正在思考…') + '</span></div>';
    msgs.appendChild(typingRow);
    scrollBottom();
  }
  function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

  function addProgress(title, steps) {
    return new Promise(function (resolve) {
      var row = el('div', 'edw-row');
      var card = el('div', 'edw-card');
      card.appendChild(el('div', 'edw-cardtitle', '⚙️ ' + escapeHtml(title)));
      var list = el('div', 'edw-steps');
      card.appendChild(list);
      (async function run() {
        for (var i = 0; i < steps.length; i++) {
          var st = steps[i];
          var item = el('div', 'edw-step');
          item.innerHTML = '<span class="edw-sicon"><span class="edw-spin"></span></span>' +
            '<span style="flex:1"><span class="edw-slabel">' + escapeHtml(st.label) + '</span>' +
            '<span class="edw-ssubs"></span></span>';
          list.appendChild(item);
          item.classList.add('run');
          scrollBottom();
          await sleep(st.dur || 900);
          item.classList.remove('run');
          item.classList.add('ok');
          item.querySelector('.edw-sicon').innerHTML = '✓';
          if (st.sub && st.sub.length) {
            var subs = item.querySelector('.edw-ssubs');
            st.sub.forEach(function (s) { subs.appendChild(el('span', null, '· ' + md(s))); });
          }
          scrollBottom();
          await sleep(220);
        }
        await sleep(250);
        resolve();
      })();
      row.appendChild(el('div', 'edw-mavatar', '🪄'));
      row.appendChild(card);
      msgs.appendChild(row);
      scrollBottom();
    });
  }

  /* 知识库附件选择卡（多选） */
  function addKbCard() {
    var row = el('div', 'edw-row');
    var card = el('div', 'edw-card');
    card.appendChild(el('div', 'edw-cardtitle', '🗂 从知识库选择附件（可多选）'));
    var sel = [];
    KB_FILES.forEach(function (f, i) {
      var item = el('div', 'edw-kbitem');
      var icon = /\.pdf$/.test(f.name) ? '📕' : '📄';
      item.innerHTML = '<span class="edw-kbchk"></span><span>' + icon + '</span>' +
        '<span class="nm">' + escapeHtml(f.name) + '</span>' +
        '<span class="edw-kbtag">' + escapeHtml(f.tag) + '</span>';
      item.onclick = function () {
        var k = sel.indexOf(i);
        if (k >= 0) { sel.splice(k, 1); item.classList.remove('sel'); }
        else { sel.push(i); item.classList.add('sel'); }
      };
      card.appendChild(item);
    });
    var foot = el('div', 'edw-kbfoot');
    var warn = el('span', 'edw-kbwarn');
    var bOk = el('button', 'edw-btn solid', '确认引用');
    bOk.onclick = function () {
      if (!sel.length) { warn.textContent = '请至少选择一个文件'; return; }
      kbPicked = sel.map(function (i) { return KB_FILES[i]; });
      card.remove();
      addUser('已引用：' + kbPicked.map(function (f) { return '《' + f.name + '》'; }).join('、'));
      addAgent({
        text: '附件已作为分析依据 ✅ 请输入分析要求（可选），或直接开始：',
        chips: [{ label: '开始分析', act: runAnalysis }]
      });
    };
    foot.appendChild(warn); foot.appendChild(bOk);
    card.appendChild(foot);
    row.appendChild(el('div', 'edw-mavatar', '🪄'));
    row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* 分析结果文档卡（可编辑）+ 下载完整报告 */
  function addAnalysisCard() {
    var row = el('div', 'edw-row');
    var card = el('div', 'edw-card');
    card.style.width = '100%';
    var head = el('div', 'edw-dochead');
    head.appendChild(el('div', 'edw-doctitle', '页面进度分析（AI 草稿 · 可编辑）'));
    head.appendChild(el('span', 'edw-aitag', '⚠ AI生成/提取，请人工核实'));
    card.appendChild(head);
    var body = el('div', 'edw-docbody');
    body.contentEditable = 'true';
    body.spellcheck = false;
    body.innerHTML = ANALYSIS_HTML;
    card.appendChild(body);
    var foot = el('div', 'edw-docfoot');
    foot.appendChild(el('div', 'edw-docnote', '下载 = 页面数据 + 本分析文本（含你的修改）'));
    var bCopy = el('button', 'edw-btn', '复制分析');
    bCopy.onclick = function () {
      var text = body.innerText;
      function done() {
        bCopy.textContent = '✓ 已复制'; bCopy.disabled = true;
        setTimeout(function () { bCopy.textContent = '复制分析'; bCopy.disabled = false; }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      }
    };
    var bDl = el('button', 'edw-btn solid', '⬇ 下载完整报告（Word）');
    bDl.onclick = function () {
      var analysisHtml = '<h2 style="font-family:微软雅黑">二、AI 分析</h2>' +
        '<div style="font-family:微软雅黑;font-size:12px;line-height:1.8">' + body.innerHTML + '</div>' +
        '<p style="color:#888;font-size:11px">AI生成/提取，请人工核实。</p>';
      downloadWord('指标收集进度详情报告_20260826-001（含AI分析）.doc', wordPageData() + analysisHtml);
      bDl.textContent = '✓ 已下载';
      bDl.disabled = true;
      setTimeout(function () { bDl.textContent = '⬇ 下载完整报告（Word）'; bDl.disabled = false; }, 1800);
    };
    foot.appendChild(bCopy);
    foot.appendChild(bDl);
    card.appendChild(foot);
    row.appendChild(el('div', 'edw-mavatar', '🪄'));
    row.appendChild(card);
    msgs.appendChild(row);
    scrollBottom();
  }

  /* 分析流程（固定演示：与输入无关） */
  async function runAnalysis() {
    busy = true;
    showTyping('正在读取页面数据…');
    await sleep(800);
    hideTyping();
    await addProgress('生成页面分析', [
      {
        label: '读取当前页面数据（监控看板 · 指标收集进度详情）', dur: 900,
        sub: ['申请单 20260826-001「0826」· 总进度 100% · 指标 2 项']
      },
      {
        label: kbPicked.length ? '结合提示词与知识库附件' : '结合输入的提示词要求', dur: 900,
        sub: kbPicked.length
          ? ['引用附件：' + kbPicked.map(function (f) { return '《' + f.name + '》'; }).join('、')]
          : ['（未引用附件，仅按提示词与页面数据生成）']
      },
      { label: '生成分析：进度总结 / 问题 / 建议与预警', dur: 1100 }
    ]);
    addAgent({ text: '**分析完成** ✅ 结果如下，可直接编辑后下载：' });
    addAnalysisCard();
    addAgent({
      text: '点击卡片上的 **⬇ 下载完整报告**，将「页面数据 + AI 分析」合并为一个 Word 下载；页头下载按钮浮框中的「下载页面数据」则仅导出页面数据。',
      chips: [
        { label: '重新分析', act: runAnalysis },
        { label: '🗂 选择知识库附件', act: addKbCard }
      ]
    });
    busy = false;
  }

  function drawerGreeting() {
    addSystem('本助手仅针对当前页面（指标收集进度详情）工作，与全局 AI 助手相互独立');
    addAgent({
      text: '🪄 你好，我是**页面分析助手**，已读取当前页面数据：申请单 **20260826-001**「0826」· 总进度 **100%** · 指标 2 项。\n\n请输入分析提示词，或从知识库选择附件作为依据（均为可选，任意输入即可开始演示）。',
      chips: [
        { label: '生成页面进度分析', act: runAnalysis },
        { label: '🗂 选择知识库附件', act: addKbCard }
      ]
    });
  }
  function openDrawer() {
    mask.classList.add('open');
    drawer.classList.add('open');
    if (!greeted) { greeted = true; drawerGreeting(); }
    setTimeout(function () { ta.focus(); }, 250);
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    mask.classList.remove('open');
  }
  drawer.querySelector('.edw-dclose').onclick = closeDrawer;
  mask.onclick = closeDrawer;
  drawer.querySelector('#edw-kbbtn').onclick = function () {
    if (busy) return;
    addAgent({ text: '请选择作为分析依据的知识库附件：' });
    addKbCard();
  };

  function onSend() {
    var text = ta.value.trim();
    if (!text || busy) return;
    ta.value = '';
    autoGrow();
    addUser(text);
    runAnalysis();          /* 固定演示：任意输入 → 相同分析 */
  }
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
})();
