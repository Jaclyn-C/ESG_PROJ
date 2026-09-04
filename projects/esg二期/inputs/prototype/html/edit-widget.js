/*!
 * ESG 原型 ·「编辑指标」页面专属 Widget（AI 附件总结助手）
 * ============================================================
 * 对应需求五（AI辅助指标填写与内容提取）的原型演示：
 *   1. 强制显示快照中隐藏的「编辑指标」对话框（原型可直接操作）
 *   2. 「补充附件」上传文件后，出现「✨ AI 总结」按钮
 *   3. 点击打开右侧抽屉 AI 助手（本附件专属，蓝色主题，与全局助手风格统一）：
 *      自动以该指标的描述（统计口径）为提示词总结附件内容；
 *      可对话提出修改要求（回复为写死的演示文案，措辞略有变化）；
 *      点击「应用到指标值(文本)」把最终总结填回页面表单。
 *
 * 引入：<script src="./edit-widget.js"></script>（仅编辑指标页）
 */
(function () {
  'use strict';
  if (window.__ESG_EDIT_WIDGET__) return;
  window.__ESG_EDIT_WIDGET__ = true;

  /* ================================================================
   * 一、工具
   * ================================================================ */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function md(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function fmtSize(b) {
    if (b == null) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  var IND_NAME = '员工管理聘用与待遇政策及执行情况';   /* 本对话框对应的指标（快照数据） */
  var IND_CODE = 'L-S-1-1-0001';

  /* ================================================================
   * 二、样式
   * ================================================================ */
  var CSS = [
    /* 强制显示的编辑对话框 */
    '.ewg-dlgwrap{display:block !important;background:rgba(15,25,50,.45) !important;overflow:auto}',
    /* 上传文件列表项 */
    '.ewg-file{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #e6e6e6;',
    ' border-radius:4px;background:#fafcff;font-size:12.5px;color:#24292f;margin-top:6px}',
    '.ewg-file .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
    ' color:#133368;font-weight:500}',
    '.ewg-file .sz{font-size:11px;color:#98a0ad;flex-shrink:0}',
    '.ewg-file .rm{border:none;background:transparent;color:#98a0ad;cursor:pointer;font-size:11px;flex-shrink:0}',
    '.ewg-file .rm:hover{color:#ff5a3c}',
    '.ewg-aibtn{margin-left:8px !important}',

    /* 指标值文本框闪烁提示 */
    '@keyframes ewgFlash{0%{background:#fff3d6;box-shadow:0 0 0 3px rgba(255,193,66,.35)}100%{background:#fff;box-shadow:none}}',
    '.ewg-flash{animation:ewgFlash 1.6s ease}',

    /* ---- AI 附件总结助手抽屉（与全局助手统一的蓝色主题） ---- */
    '.ewg-mask{position:fixed;inset:0;background:rgba(19,51,104,.28);z-index:2147483200;display:none}',
    '.ewg-mask.open{display:block}',
    '.ewg-drawer{position:fixed;top:0;right:0;bottom:0;width:440px;max-width:94vw;background:#fff;',
    ' z-index:2147483201;display:flex;flex-direction:column;box-shadow:-12px 0 40px rgba(19,51,104,.2);',
    ' transform:translateX(100%);transition:transform .25s ease;font-family:-apple-system,BlinkMacSystemFont,',
    ' "PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",sans-serif;font-size:13px;color:#1f2329;text-align:left}',
    '.ewg-drawer.open{transform:none}',
    '.ewg-drawer *,.ewg-drawer *::before,.ewg-drawer *::after{box-sizing:border-box;margin:0;padding:0}',
    '.ewg-drawer p,.ewg-drawer ul,.ewg-drawer li{margin:0;padding:0;list-style:none}',
    '@keyframes ewgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '.ewg-dhead{height:56px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:0 14px;',
    ' background:#fff;border-bottom:1px solid #eef0f5}',
    '.ewg-davatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#3f7afa,#133368);',
    ' display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}',
    '.ewg-dname{font-size:14px;font-weight:600;color:#133368}',
    '.ewg-dsub{font-size:11px;color:#8a919f;max-width:250px;white-space:nowrap;overflow:hidden;',
    ' text-overflow:ellipsis}',
    '.ewg-dbadge{font-size:10px;border:1px solid #c9d8ff;background:#e8efff;color:#2f5fd9;border-radius:999px;',
    ' padding:0 7px;line-height:16px;flex-shrink:0}',
    '.ewg-dclose{margin-left:auto;width:28px;height:28px;border:1px solid #e6e6e6;background:#fff;',
    ' color:#5a6472;border-radius:4px;cursor:pointer;font-size:13px;flex-shrink:0;transition:all .15s}',
    '.ewg-dclose:hover{border-color:#3f7afa;color:#3f7afa}',
    '.ewg-msgs{flex:1;overflow-y:auto;background:#f5f5fc;padding:14px 12px;display:flex;',
    ' flex-direction:column;gap:12px}',
    '.ewg-msgs::-webkit-scrollbar{width:6px}',
    '.ewg-msgs::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '.ewg-row{display:flex;gap:8px;align-items:flex-start;animation:ewgIn .25s ease}',
    '.ewg-row.ewg-user{justify-content:flex-end}',
    '.ewg-mavatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;margin-top:2px;',
    ' background:linear-gradient(135deg,#3f7afa,#133368);color:#fff;font-size:13px;',
    ' display:flex;align-items:center;justify-content:center}',
    '.ewg-bubble{max-width:86%;padding:9px 12px;border-radius:8px;font-size:13px;word-break:break-word;',
    ' line-height:1.6;background:#fff;border:1px solid #e6e6e6;border-top-left-radius:2px}',
    '.ewg-user .ewg-bubble{background:#3f7afa;color:#fff;border:none;border-top-right-radius:2px}',
    '.ewg-bubble b{color:#133368}',
    '.ewg-user .ewg-bubble b{color:#fff}',
    '.ewg-sys{align-self:center;max-width:92%;font-size:11px;padding:4px 12px;border-radius:999px;',
    ' background:#eceff5;color:#6b7280;text-align:center;animation:ewgIn .25s ease}',
    '.ewg-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-width:86%}',
    '.ewg-chip{border:1px solid #c9d8ff;background:#fff;color:#2f5fd9;border-radius:999px;',
    ' padding:3px 12px;font-size:12px;cursor:pointer;transition:all .15s;font-family:inherit}',
    '.ewg-chip:hover{background:#3f7afa;border-color:#3f7afa;color:#fff;box-shadow:0 2px 6px rgba(63,122,250,.3)}',
    '.ewg-chips.done .ewg-chip{opacity:.45;pointer-events:none}',
    '.ewg-card{background:#fff;border:1px solid #e9edf4;border-radius:8px;overflow:hidden;width:100%;',
    ' box-shadow:0 2px 10px rgba(19,51,104,.07)}',
    '.ewg-cardtitle{padding:8px 10px;font-size:12px;font-weight:600;color:#133368;',
    ' border-bottom:1px solid #f0f0f5;border-left:3px solid #3f7afa;display:flex;align-items:center;',
    ' gap:6px;background:#fafbfe}',
    '.ewg-steps{padding:8px 10px}',
    '.ewg-step{display:flex;gap:8px;padding:4px 0;opacity:.45;transition:opacity .2s}',
    '.ewg-step.run,.ewg-step.ok{opacity:1}',
    '.ewg-sicon{width:16px;height:16px;flex-shrink:0;margin-top:2px;display:flex;align-items:center;',
    ' justify-content:center;font-size:13px;color:#67c23a}',
    '.ewg-step.ok .ewg-sicon{color:#4e9e44;background:#eaf7e6;border-radius:50%}',
    '.ewg-spin{width:13px;height:13px;border:2px solid #d5e0f5;border-top-color:#3f7afa;',
    ' border-radius:50%;animation:ewgSpin .7s linear infinite}',
    '@keyframes ewgSpin{to{transform:rotate(360deg)}}',
    '.ewg-slabel{font-size:12px;color:#1f2329;font-weight:500}',
    '.ewg-aitag{font-size:10.5px;color:#d97a00;border:1px solid #ffd9ae;background:#fff8ef;',
    ' border-radius:3px;padding:1px 6px;white-space:nowrap;font-weight:500;margin-left:auto}',
    '.ewg-dochead{padding:8px 10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.ewg-doctitle{font-size:12.5px;font-weight:600;color:#133368;flex:1;min-width:0}',
    '.ewg-docbody{padding:10px 12px;background:#fbfcff;border-top:1px solid #f0f0f5;',
    ' border-bottom:1px solid #f0f0f5;font-size:12.5px;color:#24292f;max-height:280px;overflow-y:auto;',
    ' outline:none;line-height:1.8}',
    '.ewg-docbody p{margin:0 0 8px}',
    '.ewg-docbody:focus{box-shadow:inset 0 0 0 2px #c9d8ff}',
    '.ewg-docfoot{padding:8px 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.ewg-docnote{font-size:11px;color:#8a919f;flex:1;min-width:120px}',
    '.ewg-btn{border-radius:3px;border:1px solid #3f7afa;color:#3f7afa;background:#fff;',
    ' font-size:11.5px;padding:3px 10px;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit}',
    '.ewg-btn:hover{background:#3f7afa;color:#fff}',
    '.ewg-btn.solid{background:#3f7afa;color:#fff}',
    '.ewg-btn.solid:hover{background:#2f5fd9}',
    '.ewg-inbar{background:#fff;border-top:1px solid #eef0f5;padding:10px 12px 6px;flex-shrink:0}',
    /* 统一输入框：🗂 小按钮 + 无边框输入 + 发送，与全局助手一致 */
    '.ewg-inputbox{display:flex;align-items:flex-end;gap:6px;border:1px solid #dfe3ee;border-radius:10px;',
    ' background:#fbfcff;padding:6px 6px 6px 5px;transition:border-color .15s,background .15s,box-shadow .15s}',
    '.ewg-inputbox:focus-within{border-color:#3f7afa;background:#fff;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '.ewg-kbbtn{width:26px;height:26px;border:none;background:transparent;border-radius:6px;cursor:pointer;',
    ' color:#8a94a6;font-size:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;',
    ' transition:all .15s;padding:0}',
    '.ewg-kbbtn:hover{background:#e8efff;color:#3f7afa}',
    /* 知识库文件选择弹窗（与全局助手一致） */
    '.ewg-kbmask{position:fixed;inset:0;background:rgba(15,25,50,.42);z-index:2147483400;',
    ' display:none;align-items:flex-start;justify-content:center;padding-top:8vh}',
    '.ewg-kbmask.open{display:flex;animation:ewgIn .18s ease}',
    '.ewg-kbdlg{width:440px;max-width:92vw;background:#fff;border-radius:8px;overflow:hidden;',
    ' box-shadow:0 18px 50px rgba(19,51,104,.28);display:flex;flex-direction:column}',
    '.ewg-kbh{height:48px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid #eef0f5;',
    ' font-size:14px;font-weight:600;color:#133368;flex-shrink:0}',
    '.ewg-kbh button{margin-left:auto;border:none;background:transparent;cursor:pointer;',
    ' font-size:14px;color:#98a0ad}',
    '.ewg-kbh button:hover{color:#333}',
    '.ewg-kbbody{max-height:56vh;overflow-y:auto;padding:10px 12px}',
    '.ewg-kbbody::-webkit-scrollbar{width:6px}',
    '.ewg-kbbody::-webkit-scrollbar-thumb{background:#d8dce6;border-radius:3px}',
    '.ewg-ksec{font-size:12px;font-weight:600;color:#133368;background:#f5f7fb;border-radius:4px;',
    ' padding:6px 10px;margin:8px 0 4px;display:flex;align-items:center;gap:6px}',
    '.ewg-ksec:first-child{margin-top:0}',
    '.ewg-kfolder{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:4px;',
    ' cursor:pointer;font-size:12.5px;color:#24292f;transition:background .12s}',
    '.ewg-kfolder:hover{background:#f0f4fc}',
    '.ewg-karrow{font-size:10px;color:#98a0ad;width:10px;flex-shrink:0;transition:transform .15s;',
    ' display:inline-block;text-align:center}',
    '.ewg-karrow.open{transform:rotate(90deg)}',
    '.ewg-kfname{color:#133368;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ewg-kcnt{font-size:10.5px;color:#98a0ad;flex-shrink:0}',
    '.ewg-kkids{display:none}',
    '.ewg-kkids.open{display:block}',
    '.ewg-kfile{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:4px;',
    ' cursor:pointer;font-size:12.5px;color:#24292f;transition:background .12s}',
    '.ewg-kfile:hover{background:#f0f4fc}',
    '.ewg-kfile.on{background:#eef3ff}',
    '.ewg-kfile.on .ewg-kfnm{color:#133368;font-weight:600}',
    '.ewg-kfnm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ewg-kchk{width:15px;height:15px;border:1px solid #c9d0dc;border-radius:3px;flex-shrink:0;',
    ' background:#fff;position:relative;transition:all .12s}',
    '.ewg-kfile.on .ewg-kchk{background:#3f7afa;border-color:#3f7afa}',
    '.ewg-kfile.on .ewg-kchk::after{content:"✓";position:absolute;inset:0;color:#fff;',
    ' font-size:11px;display:flex;align-items:center;justify-content:center}',
    '.ewg-kbfoot{padding:10px 14px;border-top:1px solid #eef0f5;background:#fafbfe;',
    ' display:flex;align-items:center;gap:8px;flex-shrink:0}',
    '.ewg-kbhint{font-size:11.5px;color:#8a919f;flex:1}',
    '.ewg-kbhint.warn{color:#d97a00}',
    '.ewg-ta{flex:1;border:none;background:transparent;padding:5px 2px;font-size:13px;',
    ' font-family:inherit;resize:none;outline:none;max-height:96px;line-height:1.5;color:#1f2329}',
    '.ewg-ta::placeholder{color:#aab1bd}',
    '.ewg-send{width:28px;height:28px;border:none;border-radius:8px;background:#3f7afa;cursor:pointer;',
    ' flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background .15s}',
    '.ewg-send svg{width:14px;height:14px;fill:#fff}',
    '.ewg-send:hover{background:#2f5fd9}',
    '.ewg-send:disabled{background:#c3cdf3;cursor:not-allowed}',
    '.ewg-foot{font-size:10.5px;color:#aab1bd;text-align:center;padding:5px 0 2px}',
    '.ewg-typing{display:flex;gap:3px;align-items:center}',
    '.ewg-typing i{width:5px;height:5px;border-radius:50%;background:#3f7afa;display:inline-block;',
    ' animation:ewgBlink 1s infinite}',
    '.ewg-typing i:nth-child(2){animation-delay:.2s}',
    '.ewg-typing i:nth-child(3){animation-delay:.4s}',
    '@keyframes ewgBlink{0%,100%{opacity:.25}50%{opacity:1}}'
  ].join('');
  var st = el('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ================================================================
   * 三、强制显示第一个「编辑指标」对话框
   * ================================================================ */
  var wrappers = [];
  Array.prototype.forEach.call(document.querySelectorAll('.el-dialog__wrapper'), function (w) {
    var t = w.querySelector('.el-dialog__title');
    if (t && t.textContent.trim() === '编辑指标') wrappers.push(w);
  });
  if (!wrappers.length) return;    /* 非编辑指标页不注入 */
  wrappers[0].classList.add('ewg-dlgwrap');

  /* ================================================================
   * 四、写死的总结文案（v1 起始 + 变体池）
   * ================================================================ */
  var SUMMARY_V1 =
    '<p>· <b>政策覆盖</b>：集团制定并执行员工聘用、薪酬、工时与休假、职业健康及职业发展等管理制度，适用于全体正式员工及劳务派遣人员；</p>' +
    '<p>· <b>执行情况</b>：2025 年员工总数 18,742 人，其中女性占比 38.6%；全年未发生重大劳动纠纷，劳动合规培训覆盖率 100%；</p>' +
    '<p>· <b>待改进</b>：部分法人单位休假审批仍为纸质流程，建议推进线上化以提升可追溯性。</p>';
  var SUMMARY_VARIANTS = [
    SUMMARY_V1,
    '<p>· <b>政策覆盖</b>：员工聘用、薪酬、工时休假、职业健康与发展制度持续执行，覆盖全体正式员工；</p>' +
    '<p>· <b>执行情况</b>：2025 年员工总数 18,742 人（2024 年 17,905 人，同比 +4.7%），女性占比 38.6%（同比 +0.8pct）；未发生重大劳动纠纷；</p>' +
    '<p>· <b>待改进</b>：纸质休假审批线上化推进中，预计 2026 年 Q2 全面上线。</p>',
    '<p>集团员工聘用与待遇政策覆盖薪酬、工时、休假、职业健康与发展各环节并有效执行；2025 年员工总数 18,742 人、女性占比 38.6%，全年无重大劳动纠纷，合规培训覆盖率 100%。</p>'
  ];
  var REPLY_VARIANTS = [
    '已根据你的要求调整总结 ✅ 补充了同比对比表述，要点保持不变，可继续提要求或直接应用。',
    '好的，已重新组织语言，使表述更精炼、更贴合披露口径 ✅ 如需再改请继续描述。',
    '已按最新反馈再次更新 ✅ 确认无误可点击「应用到指标值(文本)」，或继续提出修改要求。'
  ];
  var variantIdx = 0;

  /* ================================================================
   * 五、为每个「补充附件」区块接上：真实上传 + AI 总结按钮
   * ================================================================ */
  function scopeOf(attachLabel) {   /* 附件表单项 → 共同容器（含 indexValue） */
    var item = attachLabel.closest('.el-form-item');
    var box = item ? item.parentElement : null;
    while (box && !box.querySelector('label[for="indexValue"]') && box !== document.body) box = box.parentElement;
    return box || document;
  }

  Array.prototype.forEach.call(document.querySelectorAll('label[for="attachmentData"]'), function (lb) {
    var scope = scopeOf(lb);
    var valueTa = null;
    var vlb = scope.querySelector('label[for="indexValue"]');
    if (vlb) {
      var vitem = vlb.closest('.el-form-item');
      valueTa = vitem ? vitem.querySelector('textarea.el-textarea__inner') : null;
    }
    var content = lb.closest('.el-form-item').querySelector('.el-form-item__content');
    if (!content) return;
    var holder = content.querySelector('div');            /* 按钮+input+ul 的容器 */
    var fileIn = holder.querySelector('input[type="file"]');
    var listUl = holder.querySelector('ul');
    var upBtn = holder.querySelector('button');
    if (!fileIn || !listUl || !upBtn) return;

    var files = [];   /* 本区块已上传（演示）的文件 */

    /* AI 总结按钮（有文件后才显示） */
    var aiBtn = el('button', 'el-button el-button--default el-button--mini ewg-aibtn',
      '<span>AI 总结</span>');
    aiBtn.type = 'button';
    aiBtn.style.display = 'none';
    aiBtn.title = '基于该指标的描述自动总结附件内容';
    upBtn.parentElement.insertBefore(aiBtn, fileIn);

    function renderList() {
      listUl.innerHTML = '';
      files.forEach(function (f, i) {
        var li = el('li', 'ewg-file',
          '<span>📎</span><span class="nm" title="' + esc(f.name) + '">' + esc(f.name) + '</span>' +
          '<span class="sz">' + fmtSize(f.size) + '</span><button class="rm" title="移除">✕</button>');
        li.querySelector('.rm').onclick = function () {
          files.splice(i, 1);
          renderList();
        };
        listUl.appendChild(li);
      });
      aiBtn.style.display = files.length ? '' : 'none';
    }

    upBtn.addEventListener('click', function () { fileIn.click(); });
    fileIn.addEventListener('change', function () {
      Array.prototype.forEach.call(fileIn.files || [], function (f) { files.push(f); });
      fileIn.value = '';
      renderList();
    });

    aiBtn.addEventListener('click', function () {
      if (files.length) openDrawer(files, valueTa);
    });
  });

  /* ================================================================
   * 六、AI 附件总结助手抽屉
   * ================================================================ */
  var drawer = el('div', 'ewg-drawer');
  drawer.innerHTML =
    '<div class="ewg-dhead">' +
    '  <div class="ewg-davatar"></div>' +
    '  <div style="min-width:0">' +
    '    <div class="ewg-dname">AI 附件总结助手</div>' +
    '    <div class="ewg-dsub" id="ewg-sub"></div>' +
    '  </div>' +
    '  <span class="ewg-dbadge">本附件专属</span>' +
    '  <button class="ewg-dclose" title="关闭">✕</button>' +
    '</div>' +
    '<div class="ewg-msgs" id="ewg-msgs"></div>' +
    '<div class="ewg-inbar">' +
    '  <div class="ewg-inputbox">' +
    '    <button class="ewg-kbbtn" id="ewg-kbbtn" title="从知识库选择参考文件（免重复上传）">🗂</button>' +
    '    <textarea class="ewg-ta" id="ewg-ta" rows="1" placeholder="请输入文本"></textarea>' +
    '    <button class="ewg-send" id="ewg-sendbtn" title="发送">' +
    '      <svg viewBox="0 0 24 24"><path d="M3 11.5l17.2-8.1c.8-.4 1.7.5 1.3 1.3L13.4 21.9c-.4.8-1.6.7-1.9-.2l-2.1-6.1-6.1-2.1c-.9-.3-1-1.5-.2-1.9z" transform="translate(0,-1)"/></svg>' +
    '    </button>' +
    '  </div>' +
    '  <div class="ewg-foot">内容由 AI 生成/提取，请人工核实 · 本原型数据均为模拟</div>' +
    '</div>';
  var mask = el('div', 'ewg-mask');
  document.body.appendChild(mask);
  document.body.appendChild(drawer);

  var msgs = drawer.querySelector('#ewg-msgs');
  var ta = drawer.querySelector('#ewg-ta');
  var sendBtn = drawer.querySelector('#ewg-sendbtn');
  var busy = false;
  var curFiles = [];
  var curValueTa = null;
  var docBodies = [];   /* 历次版本的可编辑正文 */

  function scrollBottom() {
    requestAnimationFrame(function () { msgs.scrollTop = msgs.scrollHeight; });
  }
  function killChips() {
    drawer.querySelectorAll('.ewg-chips:not(.done)').forEach(function (c) { c.classList.add('done'); });
  }
  function addUser(text) {
    killChips();
    var row = el('div', 'ewg-row ewg-user');
    row.appendChild(el('div', 'ewg-bubble', md(text)));
    msgs.appendChild(row);
    scrollBottom();
  }
  function addSystem(text) {
    killChips();
    msgs.appendChild(el('div', 'ewg-sys', md(text)));
    scrollBottom();
  }
  function addAgent(text, chips) {
    killChips();
    var row = el('div', 'ewg-row');
    var box = el('div');
    box.style.maxWidth = '100%';
    box.appendChild(el('div', 'ewg-bubble', md(text)));
    if (chips && chips.length) {
      var cr = el('div', 'ewg-chips');
      chips.forEach(function (c) {
        var b = el('button', 'ewg-chip', esc(c.label));
        b.onclick = function () {
          if (busy) return;
          cr.classList.add('done');
          if (c.asUser) addUser(c.label);
          c.act();
        };
        cr.appendChild(b);
      });
      box.appendChild(cr);
    }
    row.appendChild(el('div', 'ewg-mavatar'));
    row.appendChild(box);
    msgs.appendChild(row);
    scrollBottom();
  }
  var typingRow = null;
  function showTyping(label) {
    hideTyping(); killChips();
    typingRow = el('div', 'ewg-row');
    typingRow.innerHTML = '<div class="ewg-mavatar"></div>' +
      '<div class="ewg-bubble" style="display:flex;align-items:center;gap:8px">' +
      '<span class="ewg-typing"><i></i><i></i><i></i></span>' +
      '<span style="font-size:12px;color:#7b8494">' + esc(label || '正在思考…') + '</span></div>';
    msgs.appendChild(typingRow);
    scrollBottom();
  }
  function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

  function addProgress(title, steps) {
    return new Promise(function (resolve) {
      var row = el('div', 'ewg-row');
      var card = el('div', 'ewg-card');
      card.appendChild(el('div', 'ewg-cardtitle', '⚙️ ' + esc(title)));
      var list = el('div', 'ewg-steps');
      card.appendChild(list);
      (async function run() {
        for (var i = 0; i < steps.length; i++) {
          var stp = steps[i];
          var item = el('div', 'ewg-step');
          item.innerHTML = '<span class="ewg-sicon"><span class="ewg-spin"></span></span>' +
            '<span style="flex:1"><span class="ewg-slabel">' + esc(stp.label) + '</span></span>';
          list.appendChild(item);
          item.classList.add('run');
          scrollBottom();
          await sleep(stp.dur || 900);
          item.classList.remove('run');
          item.classList.add('ok');
          item.querySelector('.ewg-sicon').innerHTML = '✓';
          scrollBottom();
          await sleep(200);
        }
        await sleep(250);
        resolve();
      })();
      row.appendChild(el('div', 'ewg-mavatar'));
      row.appendChild(card);
      msgs.appendChild(row);
      scrollBottom();
    });
  }

  /* 总结结果卡（可编辑） */
  function addSummaryCard(html, versionLabel) {
    var row = el('div', 'ewg-row');
    var card = el('div', 'ewg-card');
    card.style.width = '100%';
    var head = el('div', 'ewg-dochead');
    head.appendChild(el('div', 'ewg-doctitle', '附件总结' + (versionLabel ? '（' + versionLabel + '）' : '') + ' · 可编辑'));
    head.appendChild(el('span', 'ewg-aitag', '⚠ AI生成/提取，请人工核实'));
    card.appendChild(head);
    var body = el('div', 'ewg-docbody');
    body.contentEditable = 'true';
    body.spellcheck = false;
    body.innerHTML = html;
    card.appendChild(body);
    var foot = el('div', 'ewg-docfoot');
    foot.appendChild(el('div', 'ewg-docnote', '确认后可应用到页面「指标值(文本)」'));
    var bApply = el('button', 'ewg-btn solid', '✅ 应用到「指标值(文本)」');
    bApply.onclick = function () { applySummary(body); };
    foot.appendChild(bApply);
    card.appendChild(foot);
    row.appendChild(el('div', 'ewg-mavatar'));
    row.appendChild(card);
    msgs.appendChild(row);
    docBodies.push(body);
    scrollBottom();
  }
  function applySummary(body) {
    if (!curValueTa) { addSystem('未找到「指标值(文本)」输入框（演示环境）'); return; }
    var text = (body.innerText || body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    curValueTa.value = text;
    curValueTa.dispatchEvent(new Event('input', { bubbles: true }));
    curValueTa.classList.remove('ewg-flash');
    void curValueTa.offsetWidth;                       /* 重启动画 */
    curValueTa.classList.add('ewg-flash');
    addSystem('✅ 已应用到「指标值(文本)」，可在页面表单中继续人工修改');
    addAgent('总结已填入表单 ✅ 你也可以继续在本助手中修改后再次应用。', [
      { label: '继续修改总结', asUser: false, act: function () { ta.focus(); } },
      { label: '关闭助手', asUser: false, act: closeDrawer }
    ]);
  }

  /* 打开抽屉：自动按指标提示词总结（写死流程） */
  async function autoSummarize() {
    busy = true;
    showTyping('正在读取附件…');
    await sleep(800);
    hideTyping();
    await addProgress('AI 自动总结（需求五 5.1）', [
      { label: '读取附件：《' + (curFiles[0] ? curFiles[0].name : '附件') + '》', dur: 800 },
      { label: '以指标「' + IND_NAME + '」的描述（统计口径）作为提示词', dur: 900 },
      { label: '生成结构化总结文本', dur: 1000 }
    ]);
    addAgent('已依据指标「' + IND_NAME + '」（' + IND_CODE + '）的统计口径自动完成总结 ✅ 结果如下（可直接编辑），确认后可应用到「指标值(文本)」：');
    addSummaryCard(SUMMARY_VARIANTS[0], 'v1');
    variantIdx = 0;
    addAgent('如需调整，直接输入修改要求即可；也可以在卡片中直接编辑文字。', [
      { label: '✅ 应用到「指标值(文本)」', asUser: false, act: function () { applySummary(docBodies[docBodies.length - 1]); } },
      { label: '🔄 重新生成', asUser: false, act: iterate }
    ]);
    busy = false;
  }
  /* 用户追问 → 写死的变体回复（措辞略有变化） */
  async function iterate() {
    busy = true;
    showTyping('正在根据要求修改总结…');
    await sleep(900);
    hideTyping();
    variantIdx = (variantIdx + 1) % SUMMARY_VARIANTS.length;
    addAgent(REPLY_VARIANTS[(variantIdx - 1 + REPLY_VARIANTS.length) % REPLY_VARIANTS.length]);
    addSummaryCard(SUMMARY_VARIANTS[variantIdx], 'v' + (docBodies.length + 1));
    addAgent('以上为最新版本（历史版本保留在上方，可回看）。', [
      { label: '✅ 应用最新版到「指标值(文本)」', asUser: false, act: function () { applySummary(docBodies[docBodies.length - 1]); } },
      { label: '🔄 再改一版', asUser: false, act: iterate }
    ]);
    busy = false;
  }

  function openDrawer(files, valueTa) {
    curFiles = files;
    curValueTa = valueTa;
    drawer.querySelector('#ewg-sub').textContent =
      '附件《' + (files[0] ? files[0].name : '') + '》· 指标「' + IND_NAME + '」';
    mask.classList.add('open');
    drawer.classList.add('open');
    autoSummarize();
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    mask.classList.remove('open');
  }
  drawer.querySelector('.ewg-dclose').onclick = closeDrawer;
  mask.onclick = closeDrawer;

  /* ---- 🗂 知识库选择（与全局助手一致：读知识库页面目录 + 指标映射表） ---- */
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
  function kbCount(node) {
    var n = (node.files || []).length;
    (node.folders || []).forEach(function (f) { n += kbCount(f); });
    return n;
  }
  function openKbPicker(onOk) {
    var tree = loadKbTree();
    var sections = [
      { name: '知识库文件', node: tree },
      { name: '信息采集指标映射表', node: { folders: [], files: [
        { name: '指标映射表-2025确认版.xlsx' },
        { name: '指标映射表-2026FII草稿.xlsx' }
      ] } }
    ];
    var sel = {}, selCount = 0;
    var mask = el('div', 'ewg-kbmask');
    var dlg = el('div', 'ewg-kbdlg');
    dlg.innerHTML =
      '<div class="ewg-kbh">🗂 从知识库选择参考文件<button title="关闭">✕</button></div>' +
      '<div class="ewg-kbbody"></div>' +
      '<div class="ewg-kbfoot"><span class="ewg-kbhint">文件夹层级与「知识库」页面一致，可多选文件</span>' +
      '<button class="ewg-btn">取消</button><button class="ewg-btn solid">确认引用</button></div>';
    mask.appendChild(dlg);
    document.body.appendChild(mask);
    mask.classList.add('open');
    var body = dlg.querySelector('.ewg-kbbody');
    var hint = dlg.querySelector('.ewg-kbhint');
    function updateHint() {
      hint.textContent = selCount ? '已选择 ' + selCount + ' 个文件，点击「确认引用」'
        : '文件夹层级与「知识库」页面一致，可多选文件';
      hint.classList.remove('warn');
    }
    function renderNode(container, node, depth, pkey) {
      (node.folders || []).forEach(function (f) {
        var isOpen = depth === 0;
        var wrapEl = el('div');
        var folder = el('div', 'ewg-kfolder');
        folder.style.paddingLeft = (8 + depth * 16) + 'px';
        folder.innerHTML = '<span class="ewg-karrow' + (isOpen ? ' open' : '') + '">▸</span><span>📁</span>' +
          '<span class="ewg-kfname">' + esc(f.name) + '</span>' +
          '<span class="ewg-kcnt">' + kbCount(f) + ' 项</span>';
        var kids = el('div', 'ewg-kkids' + (isOpen ? ' open' : ''));
        folder.onclick = function () {
          isOpen = !isOpen;
          folder.querySelector('.ewg-karrow').classList.toggle('open', isOpen);
          kids.classList.toggle('open', isOpen);
        };
        renderNode(kids, f, depth + 1, pkey + '/' + f.name);
        wrapEl.appendChild(folder); wrapEl.appendChild(kids);
        container.appendChild(wrapEl);
      });
      (node.files || []).forEach(function (f) {
        var key = pkey + '/' + f.name;
        var row = el('div', 'ewg-kfile');
        row.style.paddingLeft = (8 + depth * 16) + 'px';
        row.innerHTML = '<span class="ewg-kchk"></span><span>' + kbIcon(f.name) + '</span>' +
          '<span class="ewg-kfnm" title="' + esc(f.name) + '">' + esc(f.name) + '</span>';
        row.onclick = function () {
          if (sel[key]) { delete sel[key]; selCount--; row.classList.remove('on'); }
          else { sel[key] = { name: f.name }; selCount++; row.classList.add('on'); }
          updateHint();
        };
        container.appendChild(row);
      });
    }
    sections.forEach(function (s) {
      body.appendChild(el('div', 'ewg-ksec', '🗂 ' + esc(s.name) +
        '<span class="ewg-kcnt">共 ' + kbCount(s.node) + ' 个文件</span>'));
      renderNode(body, s.node, 0, s.name);
    });
    function close() { mask.classList.remove('open'); mask.remove(); }
    dlg.querySelector('.ewg-kbh button').onclick = close;
    dlg.querySelector('.ewg-kbfoot .ewg-btn').onclick = close;
    dlg.querySelector('.ewg-btn.solid').onclick = function () {
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

  /* 引用知识库文件 → 写死的"结合参考重新整理"回复 */
  async function kbRefIterate(names) {
    busy = true;
    showTyping('正在结合知识库文件重新整理…');
    await sleep(900);
    hideTyping();
    variantIdx = (variantIdx + 1) % SUMMARY_VARIANTS.length;
    addAgent('已将 ' + names + ' 纳入参考依据，并结合附件内容重新整理总结 ✅ 结果如下（可直接编辑）：');
    addSummaryCard(SUMMARY_VARIANTS[variantIdx], 'v' + (docBodies.length + 1));
    addAgent('如需继续调整请直接描述，确认后应用到「指标值(文本)」。', [
      { label: '✅ 应用最新版到「指标值(文本)」', asUser: false, act: function () { applySummary(docBodies[docBodies.length - 1]); } },
      { label: '🔄 再改一版', asUser: false, act: iterate }
    ]);
    busy = false;
  }
  drawer.querySelector('#ewg-kbbtn').onclick = function () {
    if (busy) return;
    openKbPicker(function (files) {
      var names = files.map(function (f) { return '《' + f.name + '》'; }).join('、');
      addUser('🗂 已引用知识库文件：' + names);
      kbRefIterate(names);
    });
  };

  function onSend() {
    var text = ta.value.trim();
    if (!text || busy) return;
    ta.value = '';
    autoGrow();
    addUser(text);
    iterate();          /* 任意要求 → 写死的变体回复 */
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
