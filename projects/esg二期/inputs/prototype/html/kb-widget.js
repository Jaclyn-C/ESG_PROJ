/*!
 * ESG 原型 · 知识库页面专属 Widget
 * ============================================================
 * 1. 侧边栏改为三个菜单：
 *    · ▾ 最佳案例（二级：指标最佳高分/评级回应案例、案例管理）
 *    · ▸ 知识库文件（二级/三级…＝动态文件夹树，支持无限层级）
 *    · 信息采集指标映射表
 * 2. 知识库文件视图：搜索表单（el-form flex flex-wrap items-center gap-3）
 *    右侧新增「新建文件」「新建文件夹」按钮；面包屑导航；文件列表。
 * 3. 新建文件：本地选择文件 + 标签 + 开放范围（【＋ 添加人员】弹出"选择用户"窗口：
 *    查询结果页签未搜索时为空、搜索后点工号添加；历史记录页签多选快速添加；
 *    【🌐 全部公开】选中后添加人员置灰、对所有用户开放）。
 *    文件夹结构持久化到 localStorage（kb-files-v1）；人员历史持久化（kb-perm-history-v1）。
 * 4. 文件阅读日志：浏览列表"操作"列后新增「日志」列，卡片视图文件卡片同步提供
 *    【日志】入口，点击弹出浮窗展示阅读记录（工号、姓名、时间）；用户点击【预览】
 *    即记为一次阅读；仅文件上传者本人与肖东（主管，固定账号）可查看。
 * 5. 删除权限：文件【删除】（列表"操作"列·预览之后 / 卡片视图悬停✕）仅上传者
 *    本人可见，其他成员无权删除他人文件；文件夹【删除】（进入之后）不限制；
 *    工具栏提供"当前身份"切换以演示上述权限（kb-user-v1）。
 * 6. 权限修改：文件行新增【权限修改】（仅上传者本人可见），浮窗内可增/删可见人员
 *    或切换全部公开（复用"选择用户"窗口）；浮窗内【日志】查看格式化的权限修改
 *    记录（时间/修改人/变更内容，枚举句式），仅上传者本人可操作与查看。
 *
 * 引入：<script src="./kb-widget.js"></script>（仅知识库页面）
 */
(function () {
  'use strict';
  if (window.__ESG_KB_WIDGET__) return;
  window.__ESG_KB_WIDGET__ = true;

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
  function fmtSize(b) {
    if (b == null) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function now() {
    var t = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(t.getMonth() + 1) + '-' + p(t.getDate()) + ' ' + p(t.getHours()) + ':' + p(t.getMinutes());
  }
  function iconOf(name) {
    if (/\.xlsx?$/.test(name)) return '📊';
    if (/\.pdf$/.test(name)) return '📕';
    if (/\.(png|jpe?g|gif)$/i.test(name)) return '🖼';
    return '📄';
  }

  /* ================================================================
   * 二、数据（文件夹树，localStorage 持久化）
   * ================================================================ */
  var STORE_KEY = 'kb-files-v1';
  /* owner = 上传者（工号/姓名）；logs = 阅读记录 {no,name,time}，最新在前；
   * vis = 开放范围 {all:是否全部公开, people:[人员]}；permLogs = 权限修改记录
   * {time, by:{no,name}, lines:[格式化变更行]}，最新在前。 */
  var SEED = {
    name: '全部文件', folders: [
      {
        name: '上交所定量指标信息采集表', folders: [],
        files: [
          { name: '2026年FII可持续发展报告-定量指标采集表模板.docx', size: 1230000, tag: '采集表模板', time: '08-20 10:12',
            owner: { no: 'X2007887', name: '张家源' },
            vis: { all: true, people: [] },
            permLogs: [
              { time: '08-21 09:30', by: { no: 'X2007887', name: '张家源' }, lines: ['指定人员可见（1 人）→ 全部可见'] },
              { time: '08-20 10:12', by: { no: 'X2007887', name: '张家源' }, lines: ['初始开放范围：指定人员可见（1 人）'] }
            ],
            logs: [
              { no: 'F3430832', name: '周振軍', time: '08-25 16:42' },
              { no: 'X2008152', name: '陈志强', time: '08-23 10:05' },
              { no: 'X2008231', name: '林晓雯', time: '08-21 09:30' }
            ] },
          { name: '指标映射表-2025确认版.xlsx', size: 38912, tag: '采集表模板', time: '08-21 15:40',
            owner: { no: 'X2007887', name: '张家源' },
            vis: { all: false, people: [
              { no: 'X2007887', name: '张家源', bg: '次世代通讯事业群', dept: '研发中心', company: '工业富联（FII）' },
              { no: 'X2007490', name: '劉丹', bg: '智能制造事业群', dept: '品质管理部', company: '工业富联（FII）' }
            ] },
            permLogs: [
              { time: '08-23 10:00', by: { no: 'X2007887', name: '张家源' }, lines: ['全部可见 → 指定人员可见（2 人）', '+ 张家源（X2007887）、劉丹（X2007490）'] },
              { time: '08-21 15:40', by: { no: 'X2007887', name: '张家源' }, lines: ['初始开放范围：全部可见'] }
            ],
            logs: [
              { no: 'X2007490', name: '劉丹', time: '08-22 09:14' },
              { no: 'X2007111', name: '王俊杰', time: '08-21 16:05' }
            ] }
        ]
      },
      {
        name: '报告撰写素材',
        folders: [
          {
            name: '提示词', folders: [],
            files: [
              { name: '报告撰写提示词-环境章节（E）.docx', size: 24576, tag: '提示词文档', time: '08-18 09:30',
                owner: { no: 'X2007887', name: '张家源' },
                vis: { all: true, people: [] },
                permLogs: [
                  { time: '08-18 09:30', by: { no: 'X2007887', name: '张家源' }, lines: ['初始开放范围：全部可见'] }
                ],
                logs: [
                  { no: 'X2008152', name: '陈志强', time: '08-19 11:20' },
                  { no: 'X2007222', name: '李美玲', time: '08-18 15:47' }
                ] },
              { name: '报告撰写提示词-社会章节（S）.docx', size: 23552, tag: '提示词文档', time: '08-18 09:31',
                owner: { no: 'X2007887', name: '张家源' },
                vis: { all: true, people: [] },
                permLogs: [
                  { time: '08-18 09:31', by: { no: 'X2007887', name: '张家源' }, lines: ['初始开放范围：全部可见'] }
                ],
                logs: [
                  { no: 'X2008231', name: '林晓雯', time: '08-19 09:12' }
                ] },
              { name: '报告撰写提示词-治理章节（G）.docx', size: 23040, tag: '提示词文档', time: '08-18 09:32',
                owner: { no: 'X2007887', name: '张家源' },
                vis: { all: true, people: [] },
                permLogs: [],
                logs: [] }
            ]
          }
        ],
        files: [
          { name: '2024年可持续发展报告（终版）.pdf', size: 8493000, tag: '参考报告', time: '08-12 17:05',
            owner: { no: 'X2007887', name: '张家源' },
            vis: { all: true, people: [] },
            permLogs: [
              { time: '08-12 17:05', by: { no: 'X2007887', name: '张家源' }, lines: ['初始开放范围：全部可见'] }
            ],
            logs: [
              { no: 'F3430888', name: 'beck', time: '08-13 10:11' },
              { no: 'F3430832', name: '周振軍', time: '08-12 17:30' },
              { no: 'X2007490', name: '劉丹', time: '08-12 16:58' }
            ] }
        ]
      },
      {
        name: 'ESG评级回应案例', folders: [],
        files: [
          { name: 'MSCI评级回应案例-劳工管理.docx', size: 156672, tag: '评级案例', time: '08-15 11:20',
            owner: { no: 'X2007490', name: '劉丹' },
            vis: { all: false, people: [
              { no: 'F3430832', name: '周振軍', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' },
              { no: 'X2007330', name: '黄淑芬', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' },
              { no: 'X2007490', name: '劉丹', bg: '智能制造事业群', dept: '品质管理部', company: '工业富联（FII）' }
            ] },
            permLogs: [
              { time: '08-16 09:35', by: { no: 'X2007490', name: '劉丹' }, lines: ['+ 劉丹（X2007490）'] },
              { time: '08-15 11:20', by: { no: 'X2007490', name: '劉丹' }, lines: ['初始开放范围：指定人员可见（2 人）'] }
            ],
            logs: [
              { no: 'F3430888', name: 'beck', time: '08-16 09:40' },
              { no: 'X2007330', name: '黄淑芬', time: '08-15 14:22' }
            ] },
          { name: 'MSCI评级回应案例-碳排放.docx', size: 148480, tag: '评级案例', time: '08-15 11:22',
            owner: { no: 'X2007490', name: '劉丹' },
            vis: { all: false, people: [
              { no: 'F3430832', name: '周振軍', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' },
              { no: 'X2007330', name: '黄淑芬', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' }
            ] },
            permLogs: [
              { time: '08-15 11:22', by: { no: 'X2007490', name: '劉丹' }, lines: ['初始开放范围：指定人员可见（2 人）'] }
            ],
            logs: [
              { no: 'X2008152', name: '陈志强', time: '08-17 08:55' }
            ] }
        ]
      },
      {
        name: '指标附件-员工管理', folders: [],
        files: [
          { name: '2024员工统计表.xlsx', size: 131072, tag: '指标附件', time: '08-10 14:00',
            owner: { no: 'X2007330', name: '黄淑芬' },
            vis: { all: false, people: [
              { no: 'X2007490', name: '劉丹', bg: '智能制造事业群', dept: '品质管理部', company: '工业富联（FII）' }
            ] },
            permLogs: [
              { time: '08-10 14:00', by: { no: 'X2007330', name: '黄淑芬' }, lines: ['初始开放范围：指定人员可见（1 人）'] }
            ],
            logs: [
              { no: 'X2007490', name: '劉丹', time: '08-11 10:30' }
            ] },
          { name: '员工管理聘用与待遇政策.docx', size: 98304, tag: '指标附件', time: '08-10 14:02',
            owner: { no: 'X2007330', name: '黄淑芬' },
            vis: { all: false, people: [
              { no: 'X2007490', name: '劉丹', bg: '智能制造事业群', dept: '品质管理部', company: '工业富联（FII）' }
            ] },
            permLogs: [
              { time: '08-11 09:00', by: { no: 'X2007330', name: '黄淑芬' }, lines: ['- 王俊杰（X2007111）'] },
              { time: '08-10 14:02', by: { no: 'X2007330', name: '黄淑芬' }, lines: ['初始开放范围：指定人员可见（2 人）'] }
            ],
            logs: [
              { no: 'X2007111', name: '王俊杰', time: '08-10 15:12' }
            ] }
        ]
      }
    ],
    files: []
  };
  var tree;
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    tree = saved && saved.name ? saved : JSON.parse(JSON.stringify(SEED));
  } catch (e) { tree = JSON.parse(JSON.stringify(SEED)); }
  /* 旧数据迁移：为无 owner/logs/permLogs 的存量文件补齐字段（默认视作张家源上传；
   * 无 vis 的旧文件开放范围文案保留原样显示，首次权限修改时转为结构化 vis） */
  (function migrate(n) {
    n.files.forEach(function (f) {
      if (!f.owner) f.owner = { no: 'X2007887', name: '张家源' };
      if (!f.logs) f.logs = [];
      if (!f.permLogs) f.permLogs = [];
    });
    n.folders.forEach(migrate);
  })(tree);
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(tree)); } catch (e) { /* 忽略 */ }
  }
  function findFolder(path) {           /* path: ['A','B'] → 节点 */
    var node = tree;
    for (var i = 0; i < path.length; i++) {
      var next = null;
      for (var j = 0; j < node.folders.length; j++) {
        if (node.folders[j].name === path[i]) { next = node.folders[j]; break; }
      }
      if (!next) return null;
      node = next;
    }
    return node;
  }
  var curPath = [];                     /* 当前所在文件夹路径 */
  var viewMode = 'list';                /* 列表 / 卡片视图 */
  try { viewMode = localStorage.getItem('kb-viewmode-v1') === 'card' ? 'card' : 'list'; } catch (e) { /* 忽略 */ }

  /* ---- 当前登录身份（原型模拟，真实环境=当前登录账号）----
   * 用于演示「日志」与「删除」权限：日志=上传者本人+肖东（主管）可查，
   * 删除=仅上传者本人。 */
  var USER_KEY = 'kb-user-v1';
  var IDENTITIES = [
    { no: 'X2007887', name: '张家源', role: '上传者（多数演示文件的上传人）' },
    { no: 'X2007490', name: '劉丹', role: '上传者（ESG评级回应案例上传人）' },
    { no: 'X2008152', name: '陈志强', role: '普通用户（无日志查看权限；仅能删除本人上传的文件）' },
    { no: 'F1340620', name: '肖东', role: '主管（可查看全部文件的阅读日志）', allLog: true }
  ];
  var curUser = IDENTITIES[0];
  try {
    var savedUserNo = localStorage.getItem(USER_KEY);
    IDENTITIES.forEach(function (u) { if (u.no === savedUserNo) curUser = u; });
  } catch (e) { /* 忽略 */ }
  function userLabel(u) { return '👤 ' + u.name + '（' + u.no + '）'; }
  function setUser(u) {
    curUser = u;
    try { localStorage.setItem(USER_KEY, u.no); } catch (e) { /* 忽略 */ }
    var btn = document.querySelector('#kbf-user span');
    if (btn) btn.textContent = userLabel(u);
    renderFiles();
  }

  /* ================================================================
   * 三、样式
   * ================================================================ */
  var CSS = [
    /* 侧边栏菜单（快照页 scoped 样式不作用到新节点，自行补齐） */
    '.kbm-item{display:flex;align-items:center;gap:6px;height:44px;padding:0 16px 0 20px;',
    ' font-size:14px;color:#4c4c4c;cursor:pointer;white-space:nowrap;overflow:hidden;',
    ' text-overflow:ellipsis;border-right:3px solid transparent;transition:all .15s}',
    '.kbm-item:hover{background:#ecf1fb}',
    '.kbm-item.on{color:#133368;font-weight:600;background:#eef3ff;border-right-color:#3f7afa}',
    '.kbm-sub .kbm-item{padding-left:42px;font-size:13.5px;height:40px}',
    '.kbm-sub .kbm-sub .kbm-item{padding-left:60px}',
    '.kbm-arrow{font-size:10px;color:#98a0ad;width:12px;flex-shrink:0;transition:transform .15s;',
    ' display:inline-block;text-align:center}',
    '.kbm-arrow.open{transform:rotate(90deg)}',
    '.kbm-group{display:none}',
    '.kbm-group.open{display:block}',
    '.kbm-empty{padding:6px 16px 6px 42px;font-size:12px;color:#aab1bd}',

    /* 视图切换 */
    '.kbv{display:none}',
    '.kbv.on{display:block;animation:kbIn .2s ease}',
    '@keyframes kbIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}',

    /* 知识库文件视图 */
    '.kbf-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:12px}',
    '.kbf-crumb{display:flex;align-items:center;gap:4px;flex-wrap:wrap;font-size:13px;margin:2px 0 10px}',
    '.kbf-crumb b{color:#133368}',
    '.kbf-crumb span,.kbf-crumb i{color:#3f7afa;cursor:pointer;font-style:normal}',
    '.kbf-crumb span:hover{text-decoration:underline}',
    '.kbf-crumb em{color:#98a0ad;font-style:normal}',
    '.kbf-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e6e6e6;',
    ' border-radius:6px;overflow:hidden;font-size:12.5px}',
    '.kbf-table th{background:#f5f7fb;color:#133368;font-weight:600;text-align:left;',
    ' padding:9px 12px;border-bottom:1px solid #e6e6e6;white-space:nowrap}',
    '.kbf-table td{padding:9px 12px;border-bottom:1px solid #f0f0f5;color:#333;vertical-align:middle}',
    '.kbf-table tr:last-child td{border-bottom:none}',
    '.kbf-table tr:hover td{background:#f7faff}',
    '.kbf-name{display:flex;align-items:center;gap:8px;min-width:0}',
    '.kbf-name .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:340px}',
    '.kbf-name.folder .nm{color:#133368;font-weight:600;cursor:pointer}',
    '.kbf-name.folder:hover .nm{color:#3f7afa}',
    '.kb-tag{display:inline-block;font-size:10.5px;border-radius:3px;padding:1px 7px;white-space:nowrap}',
    '.kb-tag.c1{color:#2f5fd9;background:#e8efff}',
    '.kb-tag.c2{color:#8a6d3b;background:#fdf3e3}',
    '.kb-tag.c3{color:#4e9e44;background:#eaf7e6}',
    '.kb-tag.c4{color:#b0578b;background:#fdeaf3}',
    '.kb-tag.c5{color:#5b46d6;background:#efebff}',
    '.kb-tag.type{color:#2f5fd9;background:#fff;border:1px solid #b9ccff}',
    '.kbf-perm{font-size:11.5px;color:#7b8494}',
    '.kbf-perm b{color:#4a5a8a;font-weight:500}',
    '.kbf-op{color:#3f7afa;cursor:pointer;font-size:12px;margin-right:10px}',
    '.kbf-op:hover{text-decoration:underline}',
    '.kbf-op.del{color:#ff5a3c}',
    '.kbf-empty-tip{padding:36px;text-align:center;color:#aab1bd;font-size:13px;background:#fff;',
    ' border:1px dashed #dfe3ec;border-radius:6px}',

    /* 对话框（上层浮窗打开时下层自动虚化，避免"露出半截"的观感） */
    '.kbd-mask{position:fixed;inset:0;background:rgba(15,25,50,.42);z-index:2147483300;',
    ' display:none;align-items:flex-start;justify-content:center;padding-top:10vh}',
    '.kbd-mask.open{display:flex;animation:kbIn .18s ease}',
    '.kb-dimmed .kbd{opacity:.5;filter:blur(2px) saturate(.85);transform:scale(.985);transition:all .18s ease}',
    '.kbd{width:560px;max-width:92vw;background:#fff;border-radius:10px;overflow:hidden;',
    ' box-shadow:0 24px 64px rgba(19,51,104,.32);font-family:inherit}',
    '.kbd-h{height:52px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid #eef0f5;',
    ' font-size:15px;font-weight:600;color:#133368}',
    '.kbd-h button{margin-left:auto;border:none;background:transparent;cursor:pointer;font-size:15px;',
    ' color:#98a0ad;padding:4px 8px;border-radius:4px;transition:all .12s}',
    '.kbd-h button:hover{color:#333;background:#f0f2f7}',
    '.kbd-b{padding:18px 22px;max-height:64vh;overflow-y:auto;font-size:13.5px}',
    '.kbd-f{padding:14px 22px 18px;display:flex;justify-content:flex-end;gap:8px;',
    ' border-top:1px solid #eef0f5;background:#fafbfe}',
    '.kbd-lg{display:flex;flex-direction:column;min-height:520px}',   /* 大浮窗：选择用户/修改记录 */
    '.kbd-lg .kbd-b{flex:1}',
    '.kbd-label{font-size:12.5px;color:#4a5568;font-weight:600;margin:12px 0 7px}',
    '.kbd-label i{color:#ff5a3c;font-style:normal;margin-left:2px}',
    '.kbd-input{width:100%;border:1px solid #e6e6e6;border-radius:4px;height:34px;padding:0 10px;',
    ' font-size:13px;font-family:inherit;outline:none;box-sizing:border-box}',
    '.kbd-input:focus{border-color:#3f7afa;box-shadow:0 0 0 2px rgba(63,122,250,.12)}',
    '.kbd-filebtn{display:inline-flex;align-items:center;gap:6px;border:1px dashed #3f7afa;color:#3f7afa;',
    ' border-radius:4px;padding:6px 14px;cursor:pointer;font-size:12.5px;position:relative;overflow:hidden}',
    '.kbd-filebtn input{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:0}',
    '.kbd-filename{margin-top:8px;font-size:12.5px;color:#133368;display:flex;align-items:center;gap:6px}',
    '.kbd-chips{display:flex;flex-wrap:wrap;gap:7px}',
    '.kbd-chip{border:1px solid #dfe3ec;background:#fff;border-radius:999px;padding:4px 13px;',
    ' font-size:12px;color:#4a5568;cursor:pointer;transition:all .12s;font-family:inherit}',
    '.kbd-chip:hover{border-color:#3f7afa;color:#3f7afa}',
    '.kbd-chip.on{background:#3f7afa;border-color:#3f7afa;color:#fff}',
    '.kbd-note{margin-top:14px;padding:8px 10px;background:#fff8ef;border:1px solid #ffe3bd;',
    ' border-radius:4px;font-size:11.5px;color:#b26a05;line-height:1.6}',
    '.kbd-warn{margin-top:10px;font-size:12px;color:#d9480f}',
    '.kbd-subblock{margin-top:8px;padding:8px 0 2px;border-top:1px dashed #eef0f5}',

    /* 视图切换（列表 / 卡片） */
    '.kbf-vt{display:inline-flex;border:1px solid #dfe3ec;border-radius:4px;overflow:hidden;',
    ' background:#fff;flex-shrink:0}',
    '.kbf-vbtn{border:none;background:#fff;color:#5a6472;font-size:12px;padding:6px 13px;',
    ' cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap}',
    '.kbf-vbtn+.kbf-vbtn{border-left:1px solid #dfe3ec}',
    '.kbf-vbtn:hover{color:#3f7afa}',
    '.kbf-vbtn.on{background:#3f7afa;color:#fff}',

    /* 卡片视图（el-row 栅格风格） */
    '.kbf-cards{display:flex;flex-wrap:wrap;margin:0 -10px}',
    '.kbf-col{width:25%;padding:0 10px 20px;box-sizing:border-box}',
    '@media (max-width:1400px){.kbf-col{width:33.33%}}',
    '@media (max-width:1000px){.kbf-col{width:50%}}',
    '@media (max-width:640px){.kbf-col{width:100%}}',
    '.kbf-card{background:#fff;border:1px solid #e6e6e6;border-radius:6px;padding:16px;',
    ' cursor:pointer;position:relative;height:100%;transition:all .3s;overflow:hidden}',
    '.kbf-card:hover{box-shadow:0 8px 22px rgba(19,51,104,.15);transform:translateY(-3px);border-color:#c9d8ff}',
    '.kbf-cico{font-size:30px;line-height:1}',
    '.kbf-cname{font-size:14px;font-weight:600;color:#133368;margin:9px 0 7px;word-break:break-all;',
    ' line-height:1.45;max-height:41px;overflow:hidden}',
    '.kbf-cmeta{font-size:11.5px;color:#98a0ad;display:flex;flex-direction:column;gap:3px;margin-top:8px}',
    '.kbf-cmeta b{color:#4a5a8a;font-weight:500}',
    '.kbf-cfoot{display:flex;align-items:center;justify-content:space-between;margin-top:9px}',
    '.kbf-cdel{position:absolute;top:8px;right:8px;display:none;width:20px;height:20px;border:none;',
    ' background:#ffe9e5;color:#ff5a3c;border-radius:3px;cursor:pointer;font-size:11px;line-height:1}',
    '.kbf-card:hover .kbf-cdel{display:block}',
    '.kbf-cdel:hover{background:#ff5a3c;color:#fff}',

    /* 标签输入（多个，非必填） */
    '.kbd-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}',
    '.kbd-tagchip{display:inline-flex;align-items:center;gap:5px;background:#e8efff;color:#2f5fd9;',
    ' border-radius:3px;padding:2px 8px;font-size:12px}',
    '.kbd-tagchip i{cursor:pointer;font-style:normal;color:#8fa3d9;font-size:10px}',
    '.kbd-tagchip i:hover{color:#ff5a3c}',
    '.kbd-tagrow{display:flex;gap:8px}',

    /* 开放范围（人员选择） */
    '.kbd-casc{border:1px solid #eef0f5;border-radius:4px;padding:8px;background:#fff}',
    '.kbd-pchips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}',
    '.kbd-pchip{display:inline-flex;align-items:center;gap:6px;background:#e8efff;color:#133368;',
    ' border:1px solid #c9d8ff;border-radius:3px;padding:2px 8px;font-size:11.5px;line-height:1.5}',
    '.kbd-pchip i{cursor:pointer;font-style:normal;color:#8fa3d9;font-size:10px}',
    '.kbd-pchip i:hover{color:#ff5a3c}',
    '.kbd-cempty{padding:10px 8px;font-size:11px;color:#aab1bd}',
    '.kbd-cselrow{display:flex;align-items:center;margin-top:8px;font-size:12px;color:#4a5568;',
    ' line-height:1.5}',
    '.kbd-cselrow b{color:#133368;font-weight:600}',
    '.kbd-cclear{margin-left:auto;color:#98a0ad;cursor:pointer;font-size:11px;flex-shrink:0;padding-left:8px}',
    '.kbd-cclear:hover{color:#ff5a3c}',
    '.kbd-openbtn{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 13px;',
    ' border:1px dashed #67c23a;background:#fff;color:#67c23a;border-radius:4px;font-size:12px;',
    ' font-family:inherit;cursor:pointer;transition:all .15s;white-space:nowrap}',
    '.kbd-openbtn:hover{background:#f0f9eb}',
    '.kbd-openbtn.on{background:#67c23a;border:1px solid #67c23a;color:#fff}',
    '.kbd-qrow .el-button.is-disabled{opacity:.55;pointer-events:none;filter:grayscale(.35);cursor:not-allowed}',

    /* 选择用户弹窗（查询结果点工号添加 / 历史记录多选快速添加） */
    '.kbd-mask2{position:fixed;inset:0;background:rgba(15,25,50,.5);z-index:2147483301;',
    ' display:none;align-items:flex-start;justify-content:center;padding-top:6vh}',
    '.kbd-mask2.open{display:flex;animation:kbIn .18s ease}',
    '.kbd-picker{width:760px;max-width:94vw}',
    '.kbd-qrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.kbd-qlabel{font-size:12.5px;color:#4a5568;flex-shrink:0}',
    '.kbd-qrow .kbd-input{width:150px;flex:0 1 160px}',
    '.kbd-tip{font-size:11.5px;color:#b26a05;background:#fff8ef;border:1px solid #ffe3bd;',
    ' border-radius:4px;padding:6px 10px;margin:10px 0}',
    '.kbd-tabs{display:flex;gap:2px;border-bottom:1px solid #e6e6e6}',
    '.kbd-tab{padding:8px 18px;font-size:13px;color:#4a5568;cursor:pointer;border:1px solid transparent;',
    ' border-bottom:none;position:relative;top:1px;border-radius:4px 4px 0 0}',
    '.kbd-tab:hover{color:#3f7afa}',
    '.kbd-tab.on{color:#3f7afa;font-weight:600;background:#fff;border-color:#e6e6e6;border-bottom:1px solid #fff}',
    '.kbd-pane{display:none;padding:10px 0 0}',
    '.kbd-pane.on{display:block}',
    '.kbd-ptab{font-size:12.5px}',
    '.kbd-ptab th{padding:9px 12px}',
    '.kbd-ptab td{padding:8px 12px;white-space:nowrap}',
    '.kbd-pno{color:#3f7afa;cursor:pointer;font-weight:600}',
    '.kbd-pno:hover{text-decoration:underline}',
    '.kbd-pno.added{color:#aab1bd;cursor:default;font-weight:400}',
    '.kbd-pmail{color:#98a0ad}',
    '.kbd-hbar{display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap}',
    '.kbd-hcount{font-size:12px;color:#4a5568;font-weight:600}',
    '.kbd-hcount .sub{font-weight:400;font-size:10.5px;color:#98a0ad}',
    '.kbd-hop{color:#98a0ad;cursor:pointer;font-size:11px;padding-left:8px;flex-shrink:0}',
    '.kbd-hop:hover{color:#3f7afa}',
    '.kbd-hop.del:hover{color:#ff5a3c}',
    '.kbd-hrow{cursor:pointer}',
    '.kbd-hrow.added{cursor:default;color:#aab1bd}',
    '.kbd-hrow:not(.added):hover td{background:#f7faff}',
    '.kbd-ck{width:32px;text-align:center;color:#98a0ad;font-size:13px}',
    '.kbd-ck.on{color:#3f7afa}',
    '.kbd-hfoot{display:flex;align-items:center;margin-top:8px}',
    '.kbd-pinfo{margin-right:auto;font-size:12px;color:#4a5568;text-align:left}',
    '.kbd-pinfo b{color:#133368;font-weight:600}',

    /* 阅读日志浮窗表格 / 提示气泡 / 身份切换 */
    '.kbd-ltab td{padding:8px 12px;white-space:nowrap}',
    '.kb-toast{position:fixed;top:26px;left:50%;transform:translateX(-50%);z-index:2147483400;',
    ' background:#133368;color:#fff;font-size:12.5px;border-radius:4px;padding:8px 16px;',
    ' box-shadow:0 6px 18px rgba(19,51,104,.3);animation:kbToast 2.6s ease forwards;pointer-events:none}',
    '@keyframes kbToast{0%{opacity:0;transform:translate(-50%,-6px)}10%,80%{opacity:1;transform:translate(-50%,0)}',
    ' 100%{opacity:0;transform:translate(-50%,-6px)}}',
    '.kbd-irow{display:flex;align-items:center;gap:10px;border:1px solid #eef0f5;border-radius:4px;',
    ' padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:all .12s;font-family:inherit;background:#fff}',
    '.kbd-irow:hover{border-color:#3f7afa;background:#f7faff}',
    '.kbd-irow.on{border-color:#3f7afa;background:#eef3ff}',
    '.kbd-inm{font-size:13px;font-weight:600;color:#133368;flex-shrink:0}',
    '.kbd-ino{font-size:12px;color:#3f7afa;flex-shrink:0}',
    '.kbd-irole{margin-left:auto;font-size:11.5px;color:#98a0ad;text-align:right}'
  ].join('');
  var st = el('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ================================================================
   * 四、视图骨架：原内容 → 最佳案例视图；另建三个视图
   * ================================================================ */
  var appMain = document.querySelector('#app-main');
  var menuTree = document.querySelector('#menutree');
  if (!appMain || !menuTree) return;

  /* 把原内容整体包进「最佳案例」视图 */
  var bestView = el('div', 'kbv on');
  bestView.id = 'kbv-best';
  while (appMain.firstChild) bestView.appendChild(appMain.firstChild);
  appMain.appendChild(bestView);

  var caseView = el('div', 'kbv'); caseView.id = 'kbv-case';
  var filesView = el('div', 'kbv'); filesView.id = 'kbv-files';
  var mapView = el('div', 'kbv'); mapView.id = 'kbv-map';
  appMain.appendChild(caseView);
  appMain.appendChild(filesView);
  appMain.appendChild(mapView);

  /* ---- 案例管理（二级菜单，占位原型） ---- */
  caseView.innerHTML =
    '<div class="p-3"><div class="el-card is-always-shadow"><div class="el-card__body">' +
    '<div style="font-size:15px;font-weight:600;color:#133368;margin-bottom:12px">案例管理</div>' +
    '<table class="kbf-table"><thead><tr><th>案例名称</th><th>关联指标</th><th>标签</th><th>创建人</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
    '<tr><td>员工管理聘用与待遇政策及执行情况</td><td>总员工数量 - 2024</td><td><span class="kb-tag c4">评级案例</span></td><td>X2007887-張家源</td><td><span class="kb-tag c3">已发布</span></td><td><span class="kbf-op">编辑</span><span class="kbf-op del">删除</span></td></tr>' +
    '<tr><td>温室气体排放管理回应案例</td><td>温室气体排放-范围一</td><td><span class="kb-tag c4">评级案例</span></td><td>X2007490 劉丹</td><td><span class="kb-tag c2">待审核</span></td><td><span class="kbf-op">编辑</span><span class="kbf-op del">删除</span></td></tr>' +
    '</tbody></table>' +
    '<div style="font-size:11.5px;color:#98a0ad;margin-top:8px">原型说明：原「案例管理」入口收纳入「最佳案例」二级菜单。</div>' +
    '</div></div></div>';

  /* ---- 信息采集指标映射表 ---- */
  mapView.innerHTML =
    '<div class="p-3"><div class="el-card is-always-shadow"><div class="el-card__body">' +
    '<div style="font-size:15px;font-weight:600;color:#133368;margin-bottom:12px">信息采集指标映射表</div>' +
    '<table class="kbf-table"><thead><tr><th>映射表文件</th><th>关联模板</th><th>指标映射数</th><th>确认状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>' +
    '<tr><td>指标映射表-2025确认版.xlsx</td><td>2026年FII可持续发展报告-定量指标采集表</td><td>12 项</td><td><span class="kb-tag c3">已确认</span></td><td>2025-08-21</td><td><span class="kbf-op">下载</span><span class="kbf-op">查看</span></td></tr>' +
    '<tr><td>指标映射表-2026FII草稿.xlsx</td><td>2026年FII可持续发展报告-定量指标采集表</td><td>12 项</td><td><span class="kb-tag c2">待确认</span></td><td>2026-08-25</td><td><span class="kbf-op">下载</span><span class="kbf-op">查看</span></td></tr>' +
    '</tbody></table>' +
    '<div style="font-size:11.5px;color:#98a0ad;margin-top:8px">说明：采集表 Agent 确认的映射关系会自动存入此列表，供后续年份复用（需求三⑤）。</div>' +
    '</div></div></div>';

  /* ---- 知识库文件视图 ---- */
  filesView.innerHTML =
    '<div class="p-3">' +
    '  <form class="el-form flex flex-wrap items-center gap-3" onsubmit="return false">' +
    '    <div class="el-form-item el-form-item--mini"><div class="el-form-item__content">' +
    '      <div class="el-input el-input--mini el-input--suffix">' +
    '        <input type="text" autocomplete="off" placeholder="请输入文件名关键词" class="el-input__inner" id="kbf-search">' +
    '      </div></div></div>' +
    '    <div class="el-form-item el-form-item--mini"><div class="el-form-item__content">' +
    '      <button type="button" class="el-button el-button--primary el-button--mini"><span>搜索</span></button>' +
    '      <button type="button" class="el-button el-button--default el-button--mini" id="kbf-reset"><span>重置</span></button>' +
    '    </div></div>' +
    '    <div style="margin-left:auto;display:flex;gap:8px;padding-right:2px;align-items:center">' +
    '      <button type="button" class="el-button el-button--default el-button--mini" id="kbf-user" title="原型模拟：切换当前登录身份，演示「日志」与「删除」权限" style="flex-shrink:0"><span>' + userLabel(curUser) + '</span></button>' +
    '      <div class="kbf-vt" id="kbf-vt">' +
    '        <button type="button" class="kbf-vbtn" data-v="list" title="列表视图">☰ 列表</button>' +
    '        <button type="button" class="kbf-vbtn" data-v="card" title="卡片视图">▦ 卡片</button>' +
    '      </div>' +
    '      <button type="button" class="el-button el-button--default el-button--mini" id="kbf-newfolder"><span>新建文件夹</span></button>' +
    '      <button type="button" class="el-button el-button--primary el-button--mini" id="kbf-newfile"><span>⬆ 新建文件（上传）</span></button>' +
    '    </div>' +
    '  </form>' +
    '  <div class="kbf-crumb" id="kbf-crumb"></div>' +
    '  <div id="kbf-list"></div>' +
    '</div>';

  /* ================================================================
   * 五、侧边栏（三个菜单 + 动态文件夹树）
   * ================================================================ */
  var expanded = { best: true, files: true };
  var menuRoot = el('div');
  menuTree.innerHTML = '';
  menuTree.appendChild(menuRoot);

  var TAG_CLASS = { '提示词文档': 'c5', '参考报告': 'c1', '评级案例': 'c4', '指标附件': 'c3', '采集表模板': 'c2', '其他': 'c1' };

  function menuItem(label, opts) {
    opts = opts || {};
    var it = el('div', 'kbm-item' + (opts.on ? ' on' : ''));
    it.innerHTML = (opts.arrow != null ? '<span class="kbm-arrow' + (opts.arrow ? ' open' : '') + '">▸</span>' : '<span class="kbm-arrow"></span>') +
      '<span style="overflow:hidden;text-overflow:ellipsis">' + esc(label) + '</span>';
    if (opts.onclick) it.onclick = opts.onclick;
    return it;
  }

  function buildMenu() {
    menuRoot.innerHTML = '';

    /* ① 最佳案例（二级：原两个菜单） */
    var g1 = el('div');
    var h1 = menuItem('最佳案例', { arrow: expanded.best, onclick: function () { expanded.best = !expanded.best; buildMenu(); } });
    var sub1 = el('div', 'kbm-group' + (expanded.best ? ' open' : ''));
    sub1.appendChild(menuItem('指标最佳高分/评级回应案例', {
      on: active === 'best',
      onclick: function () { showView('best'); }
    }));
    sub1.appendChild(menuItem('案例管理', {
      on: active === 'case',
      onclick: function () { showView('case'); }
    }));
    g1.appendChild(h1); g1.appendChild(sub1);
    menuRoot.appendChild(g1);

    /* ② 知识库文件（二级/三级…＝文件夹树） */
    var g2 = el('div');
    var h2 = menuItem('知识库文件', {
      arrow: expanded.files,
      on: active === 'files',
      onclick: function () {
        expanded.files = !expanded.files;
        if (!expanded.files) { /* 收起时若有未跳转，仍保持视图 */ }
        showView('files');
      }
    });
    var sub2 = el('div', 'kbm-group kbm-sub' + (expanded.files ? ' open' : ''));
    buildFolderMenu(sub2, tree, [], 0);
    g2.appendChild(h2); g2.appendChild(sub2);
    menuRoot.appendChild(g2);

    /* ③ 信息采集指标映射表 */
    menuRoot.appendChild(menuItem('信息采集指标映射表', {
      on: active === 'map',
      onclick: function () { showView('map'); }
    }));
  }

  /* 递归渲染文件夹树（无限层级） */
  function buildFolderMenu(box, node, path, depth) {
    if (!node.folders.length) {
      box.appendChild(el('div', 'kbm-empty', depth === 0 ? '（暂无子文件夹）' : ''));
      if (depth === 0) return;
    }
    node.folders.forEach(function (f) {
      var p = path.concat([f.name]);
      var key = p.join('/');
      var isOpen = !!expanded[key];
      var isCur = curPath.join('/') === key;
      var wrap = el('div');
      var head = menuItem(f.name, {
        arrow: f.folders.length ? isOpen : null,
        on: active === 'files' && isCur,
        onclick: function () {
          curPath = p;
          if (f.folders.length) expanded[key] = !expanded[key]; else expanded[key] = true;
          showView('files');
        }
      });
      wrap.appendChild(head);
      if (f.folders.length) {
        var sub = el('div', 'kbm-group kbm-sub' + (isOpen ? ' open' : ''));
        buildFolderMenu(sub, f, p, depth + 1);
        wrap.appendChild(sub);
      }
      box.appendChild(wrap);
    });
  }

  /* ================================================================
   * 六、视图切换 + 文件列表渲染
   * ================================================================ */
  var active = 'best';
  function showView(v) {
    active = v;
    ['best', 'case', 'files', 'map'].forEach(function (k) {
      var n = document.getElementById('kbv-' + k);
      if (n) n.classList.toggle('on', k === v);
    });
    if (v === 'files') renderFiles();
    buildMenu();
  }

  function renderCrumb() {
    var c = document.getElementById('kbf-crumb');
    c.innerHTML = '<em></em><span data-p="">全部文件</span>';
    var acc = [];
    curPath.forEach(function (name, i) {
      acc.push(name);
      c.appendChild(el('em', null, ' / '));
      var s = el('span', null, esc(name));
      var p = acc.slice(0, i + 1).join('|');
      s.setAttribute('data-p', p);
      c.appendChild(s);
    });
    if (curPath.length) c.appendChild(el('b', null, '（当前）'));
    Array.prototype.forEach.call(c.querySelectorAll('span'), function (s) {
      s.onclick = function () {
        curPath = s.getAttribute('data-p') ? s.getAttribute('data-p').split('|') : [];
        renderFiles();
        buildMenu();
      };
    });
  }

  function renderFiles() {
    renderCrumb();
    var list = document.getElementById('kbf-list');
    var node = findFolder(curPath) || tree;
    var kw = (document.getElementById('kbf-search').value || '').trim();
    list.innerHTML = '';

    var folders = node.folders.filter(function (f) { return !kw || f.name.indexOf(kw) >= 0; });
    var files = node.files.filter(function (f) { return !kw || f.name.indexOf(kw) >= 0 || (f.tag || '').indexOf(kw) >= 0; });

    if (!folders.length && !files.length) {
      list.innerHTML = '<div class="kbf-empty-tip">当前文件夹为空，点击右上角「新建文件夹 / 新建文件」开始</div>';
      return;
    }
    var count = el('div');
    count.style.cssText = 'font-size:11.5px;color:#98a0ad;margin-top:8px';
    count.textContent = '共 ' + folders.length + ' 个文件夹、' + files.length + ' 个文件';

    if (viewMode === 'card') { renderCardView(list, node, folders, files, count); return; }
    var t = el('table', 'kbf-table');
    t.innerHTML = '<thead><tr><th style="width:34%">名称</th><th>标签</th><th>开放范围</th><th>大小</th><th>时间</th><th style="width:185px">操作</th><th style="width:60px">日志</th></tr></thead>';
    var tb = el('tbody');
    folders.forEach(function (f) {
      var tr = el('tr');
      tr.innerHTML =
        '<td><div class="kbf-name folder"><span>📁</span><span class="nm">' + esc(f.name) + '</span></div></td>' +
        '<td><span class="kb-tag c1">文件夹</span></td>' +
        '<td class="kbf-perm">—</td><td>—</td><td>—</td>' +
        '<td><span class="kbf-op op-in">进入</span><span class="kbf-op del op-delf">删除</span></td>' +
        '<td>—</td>';
      tr.querySelector('.kbf-name').onclick = function () { enterFolder(f.name); };
      tr.querySelector('.op-in').onclick = function () { enterFolder(f.name); };
      tr.querySelector('.op-delf').onclick = function () { delFolder(f.name); };
      tb.appendChild(tr);
    });
    files.forEach(function (f) {
      var tr = el('tr');
      var canLog = canViewLog(f);                       /* 仅上传者本人与肖东（主管）可见【日志】 */
      var mine = isOwner(f);                            /* 删除/权限修改：仅上传者本人 */
      tr.innerHTML =
        '<td><div class="kbf-name"><span>' + iconOf(f.name) + '</span><span class="nm" title="' + esc(f.name) + '">' + esc(f.name) + '</span></div></td>' +
        '<td>' + tagsHtml(f) + '</td>' +
        '<td class="kbf-perm">' + permHtmlOf(f) + '</td>' +
        '<td>' + fmtSize(f.size) + '</td><td>' + esc(f.time || '') + '</td>' +
        '<td><span class="kbf-op op-prev">预览</span>' + (mine ? '<span class="kbf-op op-perm">权限修改</span><span class="kbf-op del op-delf">删除</span>' : '') + '</td>' +
        '<td>' + (canLog ? '<span class="kbf-op op-log">日志</span>' : '—') + '</td>';
      tr.querySelector('.op-prev').onclick = function () { recordRead(f); };
      if (canLog) tr.querySelector('.op-log').onclick = function () { openLogDialog(f); };
      if (mine) {
        tr.querySelector('.op-perm').onclick = function () { openPermDialog(f); };
        tr.querySelector('.op-delf').onclick = function () {
          if (!confirm('确认删除文件「' + f.name + '」？')) return;
          node.files = node.files.filter(function (x) { return x !== f; });
          save(); renderFiles();
        };
      }
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    list.appendChild(t);
    list.appendChild(count);
  }

  /* 卡片视图（el-row 栅格风格） */
  function renderCardView(list, node, folders, files, count) {
    var wrap = el('div', 'kbf-cards');
    folders.forEach(function (f) {
      var col = el('div', 'kbf-col');
      var card = el('div', 'kbf-card');
      card.innerHTML =
        '<div class="kbf-cico">📁</div>' +
        '<div class="kbf-cname">' + esc(f.name) + '</div>' +
        '<span class="kb-tag c1">文件夹</span>' +
        '<div class="kbf-cmeta"><span>' + f.folders.length + ' 个子文件夹 · ' + f.files.length + ' 个文件</span><span style="color:#3f7afa">点击进入 →</span></div>';
      card.onclick = function () { enterFolder(f.name); };
      col.appendChild(card);
      wrap.appendChild(col);
    });
    files.forEach(function (f) {
      var col = el('div', 'kbf-col');
      var card = el('div', 'kbf-card');
      var canLog = canViewLog(f);                   /* 仅上传者本人与肖东（主管）可见【日志】 */
      var mine = isOwner(f);                        /* 删除/权限修改：仅上传者本人 */
      card.innerHTML =
        (mine ? '<button class="kbf-cdel" title="删除">✕</button>' : '') +
        '<div class="kbf-cico">' + iconOf(f.name) + '</div>' +
        '<div class="kbf-cname" title="' + esc(f.name) + '">' + esc(f.name) + '</div>' +
        '<div>' + tagsHtml(f) + '</div>' +
        '<div class="kbf-cmeta"><span>' + permHtmlOf(f) + '</span></div>' +
        '<div class="kbf-cfoot"><span style="font-size:11.5px;color:#98a0ad">' + fmtSize(f.size) + ' · ' + esc(f.time || '') + '</span>' +
        '<span class="kbf-op op-prev">预览</span>' + (canLog ? '<span class="kbf-op op-log">日志</span>' : '') +
        (mine ? '<span class="kbf-op op-perm">权限修改</span>' : '') + '</div>';
      card.querySelector('.op-prev').onclick = function (e) { e.stopPropagation(); recordRead(f); };
      if (canLog) card.querySelector('.op-log').onclick = function (e) { e.stopPropagation(); openLogDialog(f); };
      if (mine) {
        card.querySelector('.op-perm').onclick = function (e) { e.stopPropagation(); openPermDialog(f); };
        card.querySelector('.kbf-cdel').onclick = function (e) {
          e.stopPropagation();
          if (!confirm('确认删除文件「' + f.name + '」？')) return;
          node.files = node.files.filter(function (x) { return x !== f; });
          save(); renderFiles();
        };
      }
      col.appendChild(card);
      wrap.appendChild(col);
    });
    list.appendChild(wrap);
    list.appendChild(count);
  }

  function enterFolder(name) {
    curPath = curPath.concat([name]);
    expanded[curPath.join('/')] = true;
    renderFiles();
    buildMenu();
  }
  function delFolder(name) {
    if (!confirm('确认删除文件夹「' + name + '」及其全部内容？')) return;
    var node = findFolder(curPath);
    node.folders = node.folders.filter(function (f) { return f.name !== name; });
    save(); renderFiles(); buildMenu();
  }

  /* ================================================================
   * 六·二、文件阅读日志与删除权限
   * ================================================================ */
  function recordRead(f) {                    /* 点击【预览】= 一次阅读，自动记日志 */
    if (!f.logs) f.logs = [];
    var rec = { no: curUser.no, name: curUser.name, time: now() };
    f.logs.unshift(rec);                      /* 最新在前 */
    save();
    toast('📖 已记录阅读日志（原型提示）：' + curUser.name + '（' + curUser.no + '）· ' + rec.time);
  }
  function canViewLog(f) {                    /* 日志：上传者本人 + 肖东（主管，固定账号） */
    return !!curUser.allLog || !!(f.owner && f.owner.no === curUser.no);
  }
  function isOwner(f) {                      /* 删除/权限修改：仅上传者本人 */
    return !!(f.owner && f.owner.no === curUser.no);
  }
  function openLogDialog(f) {
    lmask.innerHTML = '';
    var dlg = el('div', 'kbd');
    var h = el('div', 'kbd-h', '阅读日志<button title="关闭">✕</button>');
    var b = el('div', 'kbd-b');
    b.appendChild(el('div', 'kbd-filename',
      iconOf(f.name) + ' ' + esc(f.name) +
      '<span style="color:#98a0ad;font-weight:400;margin-left:12px">上传者：' +
      (f.owner ? esc(f.owner.name + '（' + f.owner.no + '）') : '—') + '</span>'));
    var logs = f.logs || [];
    if (!logs.length) {
      b.appendChild(el('div', 'kbd-cempty', '暂无阅读记录：用户点击该文件【预览】后将自动记录'));
    } else {
      var t = el('table', 'kbf-table kbd-ptab kbd-ltab');
      t.innerHTML = '<thead><tr><th style="width:110px">工号</th><th style="width:90px">姓名</th><th>时间</th></tr></thead>';
      var tb = el('tbody');
      logs.forEach(function (r) {
        var tr = el('tr');
        tr.innerHTML = '<td>' + esc(r.no) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.time) + '</td>';
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      b.appendChild(t);
    }
    var fbar = el('div', 'kbd-f');
    var close = el('button', 'el-button el-button--primary', '<span>关闭</span>');
    close.type = 'button';
    function closeLog() { lmask.classList.remove('open'); lmask.innerHTML = ''; }
    close.onclick = closeLog;
    h.querySelector('button').onclick = closeLog;
    fbar.appendChild(close);
    dlg.appendChild(h); dlg.appendChild(b); dlg.appendChild(fbar);
    lmask.appendChild(dlg);
    lmask.classList.add('open');
  }
  function toast(msg) {
    var t = el('div', 'kb-toast', esc(msg));
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2700);
  }

  /* ================================================================
   * 六·三、文件开放范围修改（仅上传者本人；复用"选择用户"窗口）
   * ================================================================ */
  function personNames(arr) {                /* 姓名（工号）、姓名（工号）… */
    return arr.map(function (p) { return p.name + '（' + p.no + '）'; }).join('、');
  }
  function visOf(f) {                        /* 无 vis 的旧文件按 perm 文案推导初始态 */
    if (f.vis) return f.vis;
    return { all: /所有用户/.test(f.perm || ''), people: [] };
  }
  function openPermDialog(f) {
    var old = visOf(f);
    var draft = { all: old.all, people: old.people.slice() };

    var orgBox = el('div', 'kbd-casc');
    var addRow = el('div', 'kbd-qrow');
    var addBtn = el('button', 'el-button el-button--primary el-button--mini', '<span>＋ 添加人员</span>');
    addBtn.type = 'button';
    var openBtn = el('button', 'kbd-openbtn', '全部公开');
    openBtn.type = 'button';
    openBtn.title = '选中后对所有用户开放，不可再按人员添加';
    var logBtn = el('button', 'el-button el-button--default el-button--mini', '<span>日志</span>');
    logBtn.type = 'button';
    logBtn.title = '查看历次权限修改记录';
    logBtn.onclick = function () { openPermLogDialog(f); };
    function syncOpen() {                    /* 全部公开 ⇆ 添加人员 可用状态 */
      openBtn.classList.toggle('on', draft.all);
      addBtn.classList.toggle('is-disabled', draft.all);
      addBtn.disabled = draft.all;
    }
    openBtn.onclick = function () {
      draft.all = !draft.all;
      if (draft.all) draft.people = [];      /* 全部公开 = 不再按人员限定，清空已选 */
      syncOpen(); renderSel();
    };
    addBtn.onclick = function () {
      openUserPicker({
        list: function () { return draft.people; },
        has: function (p) { return draft.people.some(function (x) { return x.no === p.no; }); },
        add: function (p) { draft.people.push(p); },
        onChange: renderSel
      });
    };
    addRow.appendChild(addBtn);
    addRow.appendChild(openBtn);
    addRow.appendChild(logBtn);
    var selChips = el('div', 'kbd-pchips');
    var selBox = el('div', 'kbd-cselrow');
    var selText = el('span');
    var clearBtn = el('span', 'kbd-cclear', '✕ 清除全部');
    clearBtn.onclick = function () {
      draft.people = [];
      draft.all = false;                     /* 清除全部 = 同时重置全部公开 */
      syncOpen(); renderSel();
    };
    selBox.appendChild(selText); selBox.appendChild(clearBtn);
    function renderSel() {
      selChips.innerHTML = '';
      draft.people.forEach(function (p, i) {
        var chip = el('span', 'kbd-pchip', esc(personPath(p)) + '<i title="移除">✕</i>');
        chip.querySelector('i').onclick = function () { draft.people.splice(i, 1); renderSel(); };
        selChips.appendChild(chip);
      });
      selText.innerHTML = draft.all
        ? '当前状态：<b>全部可见</b>（所有用户可检索/引用）'
        : draft.people.length
          ? '当前状态：<b>指定人员可见（' + draft.people.length + ' 人）</b>'
          : '当前状态：<b>默认</b>（仅上传者与管理员可见）';
    }
    renderSel(); syncOpen();
    orgBox.appendChild(addRow);
    orgBox.appendChild(selChips);
    orgBox.appendChild(selBox);

    var warn = el('div', 'kbd-warn');
    openDialog('权限修改', [
      el('div', 'kbd-filename',
        iconOf(f.name) + ' ' + esc(f.name) +
        '<span style="color:#98a0ad;font-weight:400;margin-left:12px">上传者：' +
        (f.owner ? esc(f.owner.name + '（' + f.owner.no + '）') : '—') + '</span>'),
      el('div', 'kbd-label', '开放范围（仅上传者本人可修改）'), orgBox,
      warn
    ], function () {
      var rec = makePermRecord(curUser, old, draft);
      if (!rec) { warn.textContent = '未修改任何内容'; return false; }
      f.vis = { all: draft.all, people: draft.people };
      f.perms = draft.all ? [] : draft.people.map(personPath);
      f.perm = draft.all ? '所有用户可检索/引用'
        : (draft.people.length ? f.perms.join('；') : '仅上传者与管理员可见');
      if (!f.permLogs) f.permLogs = [];
      f.permLogs.unshift(rec);
      save();
      toast('✅ 开放范围已修改（原型提示）');
    });
  }
  function permState(v) {                     /* 三态：全部可见 / 指定人员可见 / 默认 */
    if (v.all) return '全部可见';
    return v.people.length ? '指定人员可见' : '默认';
  }
  function permStateLabel(v) {                /* 带人数的完整状态名 */
    if (v.all) return '全部可见';
    return v.people.length ? '指定人员可见（' + v.people.length + ' 人）' : '默认';
  }
  function makePermRecord(user, oldV, newV) {   /* 一次保存 → 一条记录，变更行固定句式 */
    var lines = [];
    var added = newV.people.filter(function (p) {
      return !oldV.people.some(function (q) { return q.no === p.no; });
    });
    var removed = oldV.people.filter(function (p) {
      return !newV.people.some(function (q) { return q.no === p.no; });
    });
    if (permState(oldV) !== permState(newV)) {
      lines.push(permStateLabel(oldV) + ' → ' + permStateLabel(newV));   /* 范围切换：旧状态 → 新状态 */
    }
    if (added.length) lines.push('+ ' + personNames(added));             /* 新指定的可见人员 */
    if (removed.length && !newV.all) lines.push('- ' + personNames(removed));
    /* ↑ 失去可见资格的指定人员；但切换为"全部可见"时原人员仍可见，不生成 - 行 */
    if (!lines.length) return null;
    return { time: now(), by: { no: user.no, name: user.name }, lines: lines };
  }
  function openPermLogDialog(f) {
    hmask.innerHTML = '';
    var dlg = el('div', 'kbd kbd-lg');
    dlg.style.width = '720px';
    var h = el('div', 'kbd-h', '权限修改记录<button title="关闭">✕</button>');
    var b = el('div', 'kbd-b');
    b.appendChild(el('div', 'kbd-filename', iconOf(f.name) + ' ' + esc(f.name)));
    var logs = f.permLogs || [];
    if (!logs.length) {
      b.appendChild(el('div', 'kbd-cempty', '暂无修改记录'));
    } else {
      var t = el('table', 'kbf-table kbd-ptab');
      t.innerHTML = '<thead><tr><th style="width:96px">时间</th><th style="width:150px">修改人</th><th>变更内容</th></tr></thead>';
      var tb = el('tbody');
      logs.forEach(function (r) {
        var tr = el('tr');
        tr.innerHTML =
          '<td style="white-space:nowrap">' + esc(r.time) + '</td>' +
          '<td style="white-space:nowrap">' + esc(r.by.name + '（' + r.by.no + '）') + '</td>' +
          '<td>' + r.lines.map(function (l) { return esc(l); }).join('<br>') + '</td>';
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      b.appendChild(t);
    }
    var fbar = el('div', 'kbd-f');
    var close = el('button', 'el-button el-button--primary', '<span>关闭</span>');
    close.type = 'button';
    function closeLog() {
      hmask.classList.remove('open'); hmask.innerHTML = '';
      mask.classList.remove('kb-dimmed');              /* 恢复下层浮窗 */
    }
    close.onclick = closeLog;
    h.querySelector('button').onclick = closeLog;
    fbar.appendChild(close);
    dlg.appendChild(h); dlg.appendChild(b); dlg.appendChild(fbar);
    hmask.appendChild(dlg);
    hmask.classList.add('open');
    mask.classList.add('kb-dimmed');                   /* 虚化下层浮窗 */
  }

  document.getElementById('kbf-reset').onclick = function () {
    document.getElementById('kbf-search').value = '';
    renderFiles();
  };
  filesView.querySelector('.el-button--primary.el-button--mini').onclick = renderFiles;  /* 搜索 */

  /* ================================================================
   * 七、对话框（新建文件夹 / 新建文件）
   * ================================================================ */
  var mask = el('div', 'kbd-mask');
  document.body.appendChild(mask);
  var pmask = el('div', 'kbd-mask2');        /* 选择用户弹窗（叠在上传对话框之上） */
  document.body.appendChild(pmask);
  var lmask = el('div', 'kbd-mask2');        /* 阅读日志浮窗 */
  document.body.appendChild(lmask);
  var hmask = el('div', 'kbd-mask2');        /* 权限修改记录浮窗（悬浮于权限修改浮窗之上） */
  document.body.appendChild(hmask);

  function openDialog(title, bodyNodes, onOk, okLabel) {
    mask.innerHTML = '';
    var dlg = el('div', 'kbd');
    var h = el('div', 'kbd-h', esc(title) + '<button title="关闭">✕</button>');
    var b = el('div', 'kbd-b');
    bodyNodes.forEach(function (n) { b.appendChild(n); });
    var f = el('div', 'kbd-f');
    var bc = el('button', 'el-button el-button--default', '<span>取消</span>');
    var bo = el('button', 'el-button el-button--primary', '<span>' + esc(okLabel || '确定') + '</span>');
    bc.onclick = closeDialog;
    bo.onclick = function () { if (onOk() !== false) closeDialog(); };
    f.appendChild(bc); f.appendChild(bo);
    h.querySelector('button').onclick = closeDialog;
    dlg.appendChild(h); dlg.appendChild(b); dlg.appendChild(f);
    mask.appendChild(dlg);
    mask.classList.add('open');
  }
  function closeDialog() { mask.classList.remove('open'); mask.innerHTML = ''; }

  /* ---- 新建文件夹 ---- */
  document.getElementById('kbf-newfolder').onclick = function () {
    var input = el('input', 'kbd-input');
    input.placeholder = '请输入文件夹名称（中英文、数字、下划线等）';
    var warn = el('div', 'kbd-warn');
    var loc = el('div', 'kbd-filename', '将创建于：' + (curPath.length ? curPath.join(' / ') : '全部文件（根目录）'));
    openDialog('新建文件夹', [
      el('div', 'kbd-label', '文件夹名称<i>*</i>'), input, loc, warn
    ], function () {
      var name = input.value.trim();
      if (!name) { warn.textContent = '请输入文件夹名称'; return false; }
      var node = findFolder(curPath);
      if (node.folders.some(function (f) { return f.name === name; })) {
        warn.textContent = '同名文件夹已存在'; return false;
      }
      node.folders.push({ name: name, folders: [], files: [] });
      save();
      expanded[curPath.concat([name]).join('/')] = true;
      curPath = curPath.concat([name]);
      renderFiles(); buildMenu();
    });
    setTimeout(function () { input.focus(); }, 60);
  };

  /* ---- 新建文件（本地选择 + 自由标签(可多个/非必填) + 开放范围【＋ 添加人员】弹窗） ---- */
  /* 人员名单：原型为固定数据（真实环境对接通讯录接口），字段 = 账号 no / 姓名 name /
   * 事业群 bg / 部门 dept / 公司 company；邮件按账号推导。 */
  var PEOPLE = [
    { no: 'X2007887', name: '张家源', bg: '次世代通讯事业群', dept: '研发中心', company: '工业富联（FII）' },
    { no: 'X2008152', name: '陈志强', bg: '次世代通讯事业群', dept: '研发中心', company: '工业富联（FII）' },
    { no: 'X2008231', name: '林晓雯', bg: '次世代通讯事业群', dept: '产品工程部', company: '工业富联（FII）' },
    { no: 'F3430832', name: '周振軍', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' },
    { no: 'X2007330', name: '黄淑芬', bg: '智能制造事业群', dept: '制造总部', company: '工业富联（FII）' },
    { no: 'X2007490', name: '劉丹', bg: '智能制造事业群', dept: '品质管理部', company: '工业富联（FII）' },
    { no: 'F3430888', name: 'beck', bg: '云网络事业群', dept: '运营管理部', company: '工业富联（FII）' },
    { no: 'X2007111', name: '王俊杰', bg: '数字健康事业群', dept: '软件工程部', company: '富士康科技集团' },
    { no: 'X2007222', name: '李美玲', bg: '数字健康事业群', dept: '软件工程部', company: '富士康科技集团' }
  ];
  function mailOf(p) { return p.no.toLowerCase() + '@fii.com'; }
  function personLabel(p) { return p.name + '（' + p.no + '）'; }
  function personPath(p) { return p.company + ' / ' + p.bg + ' / ' + p.dept + ' / ' + personLabel(p); }
  var TAG_CYCLE = ['c1', 'c5', 'c3', 'c4', 'c2'];
  function tagsOf(f) { return f.tags && f.tags.length ? f.tags : (f.tag ? [f.tag] : []); }
  function typeOf(f) {                     /* 文件类型：新上传有 ftype；存量按标签推导，默认参考文档 */
    if (f.ftype) return f.ftype;
    return tagsOf(f).indexOf('提示词文档') >= 0 ? '提示词文档' : '参考文档';
  }
  function tagsHtml(f) {
    var ts = tagsOf(f);
    var html = '<span class="kb-tag type" title="文件类型">' + esc(typeOf(f)) + '</span>';
    if (!ts.length) return html;
    return html + ' ' + ts.map(function (t, i) {
      return '<span class="kb-tag ' + (TAG_CLASS[t] || TAG_CYCLE[i % 5]) + '">' + esc(t) + '</span>';
    }).join(' ');
  }
  function permHtmlOf(f) {
    if (f.vis) {                                       /* 结构化开放范围（权限修改后的统一形态） */
      if (f.vis.all) return '<b>所有用户可检索/引用</b>';
      if (f.vis.people.length) {
        return f.vis.people.map(function (p) { return '<b>' + esc(personPath(p)) + '</b>'; }).join('<br>');
      }
      return '<b>仅上传者与管理员可见</b>';
    }
    if (f.perms && f.perms.length) {
      return f.perms.map(function (p) { return '<b>' + esc(p) + '</b>'; }).join('<br>');
    }
    return '<b>' + esc(f.perm) + '</b>' + (f.permDetail ? '<br>' + esc(f.permDetail) : '');
  }

  /* ---- 开放范围 · 人员历史记录（跨次上传共用，localStorage 持久化） ---- */
  var HIST_KEY = 'kb-perm-history-v1';
  var HIST_MAX = 20;                      /* 最多保留 20 条 */
  var permHist = [];                      /* 每条 = 人员对象 {no,name,bg,dept,company} */
  try {
    var rawHist = JSON.parse(localStorage.getItem(HIST_KEY) || '[]') || [];
    permHist = rawHist.filter(function (x) { return x && x.no && x.name; });   /* 兼容旧版数组格式 */
  } catch (e) { permHist = []; }
  function saveHist() {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(permHist)); } catch (e) { /* 忽略 */ }
  }
  function pushHist(p) {                  /* 最近使用在前；重复添加置顶不重复记录 */
    permHist = permHist.filter(function (x) { return x.no !== p.no; });
    permHist.unshift({ no: p.no, name: p.name, bg: p.bg, dept: p.dept, company: p.company });
    if (permHist.length > HIST_MAX) permHist.length = HIST_MAX;
    saveHist();
  }
  function removeHist(p) {
    permHist = permHist.filter(function (x) { return x.no !== p.no; });
    saveHist();
  }
  function clearHist() { permHist = []; saveHist(); }

  /* ---- "选择用户"弹窗（账号/姓名查询 · 查询结果点工号添加 · 历史记录多选）
   * 上传对话框（6.1.3）与权限修改浮窗共用；
   * cfg = { list():已选人员数组, has(p):是否已添加, add(p):添加, onChange():关闭/添加后回调 } ---- */
  /* ---- "选择用户"弹窗（账号/姓名查询 · 查询结果点工号添加 · 历史记录多选） ---- */
  function openUserPicker(cfg) {
    var histChecked = {};                               /* 历史记录页签勾选的工号 → 人员 */
    pmask.innerHTML = '';
    var dlg = el('div', 'kbd kbd-picker kbd-lg');
    var h = el('div', 'kbd-h', '选择用户<button title="关闭">✕</button>');
    var b = el('div', 'kbd-b');

    /* 查询区：账号 / 姓名 */
    var qrow = el('div', 'kbd-qrow');
    var noIn = el('input', 'kbd-input'); noIn.placeholder = '请输入工号';
    var nmIn = el('input', 'kbd-input'); nmIn.placeholder = '请输入姓名';
    var sBtn = el('button', 'el-button el-button--primary el-button--mini', '<span>搜索</span>');
    var rBtn = el('button', 'el-button el-button--default el-button--mini', '<span>重置</span>');
    sBtn.type = 'button'; rBtn.type = 'button';
    qrow.appendChild(el('span', 'kbd-qlabel', '账号'));
    qrow.appendChild(noIn);
    qrow.appendChild(el('span', 'kbd-qlabel', '姓名'));
    qrow.appendChild(nmIn);
    qrow.appendChild(sBtn);
    qrow.appendChild(rBtn);
    [noIn, nmIn].forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); renderQ(); }
      });
    });
    sBtn.onclick = renderQ;
    rBtn.onclick = function () { noIn.value = ''; nmIn.value = ''; renderQ(); };

    var tip = el('div', 'kbd-tip', '请输入工号 或 姓名 进行人员查找，查询结果最多显示前 20 条记录。');

    /* 页签：查询结果 / 历史记录 */
    var tabs = el('div', 'kbd-tabs');
    var tabQ = el('span', 'kbd-tab on', '查询结果');
    var tabH = el('span', 'kbd-tab', '历史记录');
    tabs.appendChild(tabQ); tabs.appendChild(tabH);
    var paneQ = el('div', 'kbd-pane on');
    var paneH = el('div', 'kbd-pane');
    tabQ.onclick = function () {
      tabQ.classList.add('on'); tabH.classList.remove('on');
      paneQ.classList.add('on'); paneH.classList.remove('on');
    };
    tabH.onclick = function () {
      tabH.classList.add('on'); tabQ.classList.remove('on');
      paneH.classList.add('on'); paneQ.classList.remove('on');
      renderH();
    };

    function queryList() {
      var no = noIn.value.trim().toLowerCase(), nm = nmIn.value.trim().toLowerCase();
      return PEOPLE.filter(function (p) {
        if (no && p.no.toLowerCase().indexOf(no) < 0) return false;
        if (nm && p.name.toLowerCase().indexOf(nm) < 0) return false;
        return true;
      }).slice(0, 20);                                  /* 最多显示 20 条 */
    }
    function tableOf(headCells) {                       /* 查询结果/历史记录共用的表格 */
      var t = el('table', 'kbf-table kbd-ptab');
      t.innerHTML = '<thead><tr>' + headCells + '</tr></thead>';
      return t;
    }

    /* 查询结果：未搜索时为空，点击【🔍 搜索】后才显示；点工号即添加 */
    function renderQ() {
      paneQ.innerHTML = '';
      if (!noIn.value.trim() && !nmIn.value.trim()) {   /* 未输入查询条件 */
        paneQ.appendChild(el('div', 'kbd-cempty', '请输入工号或姓名'));
        return;
      }
      var list = queryList();
      if (!list.length) { paneQ.appendChild(el('div', 'kbd-cempty', '无匹配人员')); return; }
      var t = tableOf('<th style="width:40px">#</th><th style="width:110px">账号</th>' +
        '<th style="width:90px">姓名</th><th>邮件</th><th>事业群</th><th>部门</th>');
      var tb = el('tbody');
      list.forEach(function (p, i) {
        var tr = el('tr');
        tr.innerHTML =
          '<td>' + (i + 1) + '</td>' +
          '<td>' + (cfg.has(p)
            ? '<span class="kbd-pno added">✓ 已添加</span>'
            : '<span class="kbd-pno" title="点击工号添加">' + esc(p.no) + '</span>') + '</td>' +
          '<td>' + esc(p.name) + '</td>' +
          '<td class="kbd-pmail">' + esc(mailOf(p)) + '</td>' +
          '<td>' + esc(p.bg) + '</td><td>' + esc(p.dept) + '</td>';
        var link = tr.querySelector('.kbd-pno:not(.added)');
        if (link) link.onclick = function () {
          cfg.add(p);                                 /* 点工号 = 添加该人员 */
          renderQ(); renderH(); updInfo(); cfg.onChange();
        };
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      paneQ.appendChild(t);
    }

    /* 历史记录：勾选（多选）一键加入开放范围 */
    function renderH() {
      paneH.innerHTML = '';
      var bar = el('div', 'kbd-hbar');
      bar.appendChild(el('span', 'kbd-hcount',
        '历史记录 <span class="sub">（添加过的人员按最近使用排序，勾选后可多选添加）</span>'));
      if (permHist.length) {
        var pickAll = el('span', 'kbd-hop', '全选');
        var clr = el('span', 'kbd-hop del', '✕ 清空历史');
        pickAll.onclick = function () {
          permHist.forEach(function (p) { if (!cfg.has(p)) histChecked[p.no] = p; });
          renderH();
        };
        clr.onclick = function () {
          if (!confirm('确认清空历史记录？')) return;
          clearHist(); histChecked = {}; renderH();
        };
        bar.appendChild(pickAll); bar.appendChild(clr);
      }
      paneH.appendChild(bar);

      if (!permHist.length) {
        paneH.appendChild(el('div', 'kbd-cempty',
          '暂无历史记录：在「查询结果」中点击工号添加过的人员会自动记录在此'));
        return;
      }
      var t = tableOf('<th class="kbd-ck">选</th><th style="width:110px">账号</th>' +
        '<th style="width:90px">姓名</th><th>邮件</th><th>事业群</th><th>部门</th>');
      var tb = el('tbody');
      permHist.forEach(function (p) {
        var added = cfg.has(p);
        var on = !!histChecked[p.no] && !added;
        var tr = el('tr', 'kbd-hrow' + (added ? ' added' : ''));
        tr.innerHTML =
          '<td class="kbd-ck' + (on ? ' on' : '') + '">' + (added ? '✓' : (on ? '☑' : '☐')) + '</td>' +
          '<td><span class="kbd-pno' + (added ? ' added' : '') + '">' + esc(p.no) + '</span></td>' +
          '<td>' + esc(p.name) + '</td>' +
          '<td class="kbd-pmail">' + esc(mailOf(p)) + '</td>' +
          '<td>' + esc(p.bg) + '</td><td>' + esc(p.dept) + '</td>';
        if (!added) {
          tr.onclick = function () {
            if (histChecked[p.no]) delete histChecked[p.no]; else histChecked[p.no] = p;
            renderH();
          };
        }
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      paneH.appendChild(t);

      var foot = el('div', 'kbd-hfoot');
      var n = Object.keys(histChecked).filter(function (k) { return !cfg.has(histChecked[k]); }).length;
      var addSel = el('button', 'el-button el-button--primary el-button--mini' + (n ? '' : ' is-disabled'),
        '<span>＋ 添加所选（' + n + '）</span>');
      addSel.type = 'button';
      addSel.onclick = function () {
        if (addSel.classList.contains('is-disabled')) return;
        Object.keys(histChecked).forEach(function (k) { cfg.add(histChecked[k]); });
        histChecked = {};
        renderH(); renderQ(); updInfo(); cfg.onChange();
      };
      foot.appendChild(addSel);
      paneH.appendChild(foot);
    }

    /* 底部：已选统计 + 完成 */
    var f = el('div', 'kbd-f');
    var info = el('span', 'kbd-pinfo', '');
    function updInfo() {
      info.innerHTML = cfg.list().length
        ? '已选开放范围：<b>' + cfg.list().length + '</b> 人（' +
          cfg.list().map(function (p) { return esc(personLabel(p)); }).join('、') + '）'
        : '已选开放范围：<b>0</b> 人（未选择 → 默认仅上传者与管理员可见）';
    }
    var done = el('button', 'el-button el-button--primary', '<span>完成</span>');
    done.type = 'button';
    f.appendChild(info); f.appendChild(done);

    function closePicker() {
      pmask.classList.remove('open'); pmask.innerHTML = '';
      mask.classList.remove('kb-dimmed');              /* 恢复下层浮窗 */
      cfg.onChange();
    }
    done.onclick = closePicker;
    h.querySelector('button').onclick = closePicker;

    b.appendChild(qrow);
    b.appendChild(tip);
    b.appendChild(tabs);
    b.appendChild(paneQ);
    b.appendChild(paneH);
    dlg.appendChild(h); dlg.appendChild(b); dlg.appendChild(f);
    pmask.appendChild(dlg);
    pmask.classList.add('open');
    mask.classList.add('kb-dimmed');                   /* 虚化下层浮窗 */

    renderQ(); renderH(); updInfo(); cfg.onChange();
    setTimeout(function () { noIn.focus(); }, 60);
  }


  document.getElementById('kbf-newfile').onclick = function () {
    /* picked.people = 已添加的开放范围人员（对象数组） */
    var picked = { file: null, ftype: '', tags: [], people: [] };

    /* 本地文件选择 */
    var fileBox = el('div');
    var fbtn = el('label', 'kbd-filebtn', '📎 从本地选择文件<input type="file">');
    var fin = fbtn.querySelector('input');
    var fname = el('div', 'kbd-filename', '未选择文件');
    fin.onchange = function () {
      picked.file = fin.files[0] || null;
      fname.innerHTML = picked.file
        ? iconOf(picked.file.name) + ' ' + esc(picked.file.name) + '（' + fmtSize(picked.file.size) + '）'
        : '未选择文件';
    };
    fileBox.appendChild(fbtn); fileBox.appendChild(fname);

    /* 文件类型：参考文档 / 提示词文档（单选、必选） */
    var typeBox = el('div', 'kbd-chips');
    ['参考文档', '提示词文档'].forEach(function (t) {
      var c = el('button', 'kbd-chip', esc(t));
      c.type = 'button';
      c.onclick = function () {
        picked.ftype = t;
        typeBox.querySelectorAll('.kbd-chip').forEach(function (n) { n.classList.remove('on'); });
        c.classList.add('on');
      };
      typeBox.appendChild(c);
    });

    /* 标签：自由输入，可多个（非必填） */
    var tagChips = el('div', 'kbd-tags');
    var tagRow = el('div', 'kbd-tagrow');
    var tagInput = el('input', 'kbd-input');
    tagInput.placeholder = '输入标签后回车或点「添加」（可选，可添加多个）';
    var tagAdd = el('button', 'el-button el-button--default el-button--mini', '<span>添加</span>');
    tagAdd.type = 'button';
    function addTag() {
      var v = tagInput.value.trim();
      tagInput.value = '';
      if (!v || picked.tags.indexOf(v) >= 0) return;
      picked.tags.push(v);
      var chip = el('span', 'kbd-tagchip', esc(v) + '<i title="移除">✕</i>');
      chip.querySelector('i').onclick = function () {
        picked.tags = picked.tags.filter(function (t) { return t !== v; });
        chip.remove();
      };
      tagChips.appendChild(chip);
    }
    tagAdd.onclick = addTag;
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    });
    tagRow.appendChild(tagInput); tagRow.appendChild(tagAdd);
    var tagWrap = el('div');
    tagWrap.appendChild(tagChips); tagWrap.appendChild(tagRow);

    /* 开放范围：【＋ 添加人员】打开"选择用户"弹窗；【🌐 全部公开】选中后添加人员置灰 */
    var orgBox = el('div', 'kbd-casc');
    var addRow = el('div', 'kbd-qrow');
    var allOpen = false;                                  /* 全部公开：选中后【＋ 添加人员】置灰 */
    var addBtn = el('button', 'el-button el-button--primary el-button--mini', '<span>＋ 添加人员</span>');
    addBtn.type = 'button';
    addBtn.onclick = function () {
      openUserPicker({
        list: function () { return picked.people; },
        has: hasPerson,
        add: addPerson,
        onChange: renderSel
      });
    };
    var openBtn = el('button', 'kbd-openbtn', '全部公开');
    openBtn.type = 'button';
    openBtn.title = '选中后对所有用户开放，不可再按人员添加';
    openBtn.onclick = function () {
      allOpen = !allOpen;
      if (allOpen) picked.people = [];                    /* 全部公开 = 不再按人员限定，清空已选 */
      syncOpen();
      renderSel();
    };
    function syncOpen() {                                 /* 全部公开 ⇆ 添加人员 可用状态 */
      openBtn.classList.toggle('on', allOpen);
      addBtn.classList.toggle('is-disabled', allOpen);
      addBtn.disabled = allOpen;
    }
    addRow.appendChild(addBtn);
    addRow.appendChild(openBtn);
    var selChips = el('div', 'kbd-pchips');
    var selBox = el('div', 'kbd-cselrow');
    var selText = el('span', null, '未选择 → 默认：<b>仅上传者与管理员可见</b>');
    var clearBtn = el('span', 'kbd-cclear', '✕ 清除全部');
    clearBtn.onclick = function () {
      picked.people = [];
      allOpen = false;                                    /* 清除全部 = 同时重置全部公开 */
      syncOpen();
      renderSel();
    };
    selBox.appendChild(selText); selBox.appendChild(clearBtn);

    function renderSel() {
      selChips.innerHTML = '';
      picked.people.forEach(function (p, i) {
        var chip = el('span', 'kbd-pchip', esc(personPath(p)) + '<i title="移除">✕</i>');
        chip.querySelector('i').onclick = function () {
          picked.people.splice(i, 1);
          renderSel();
        };
        selChips.appendChild(chip);
      });
      selText.innerHTML = allOpen
        ? '已选：<b>全部公开</b> → 所有用户可检索/引用'
        : picked.people.length
          ? '已选 <b>' + picked.people.length + '</b> 个开放范围（可多个）：'
          : '未选择 → 默认：<b>仅上传者与管理员可见</b>';
    }
    function hasPerson(p) {
      return picked.people.some(function (x) { return x.no === p.no; });
    }
    function addPerson(p) {                               /* 添加人员并自动记入历史（最近使用置顶） */
      if (hasPerson(p)) return;                           /* 重复点击同一人不重复添加 */
      picked.people.push(p);
      pushHist(p);
      renderSel();
    }
    renderSel();
    orgBox.appendChild(addRow);
    orgBox.appendChild(selChips);
    orgBox.appendChild(selBox);

    var warn = el('div', 'kbd-warn');
    var note = el('div', 'kbd-note',
      '① 大模型仅解析文档中的文本内容（公式、图表等非文本内容无法解析）；<br>' +
      '② 图片（jpg/png）中文字需清晰，方可识别和解析；<br>' +
      '③ 单个文件大小上限 100MB；不含音视频。');
    var loc = el('div', 'kbd-filename', '上传位置：' + (curPath.length ? curPath.join(' / ') : '全部文件（根目录）'));

    openDialog('新建文件（上传）', [
      el('div', 'kbd-label', '本地文件<i>*</i>'), fileBox,
      el('div', 'kbd-label', '文件类型（必选）<i>*</i>'), typeBox,
      el('div', 'kbd-label', '文件分类标签（可选，可多个）'), tagWrap,
      el('div', 'kbd-label', '开放范围（不选默认仅上传者与管理员可见）'), orgBox,
      loc, note, warn
    ], function () {
      if (!picked.file) { warn.textContent = '请从本地选择文件'; return false; }
      if (!picked.ftype) { warn.textContent = '请选择文件类型（参考文档 / 提示词文档）'; return false; }
      var node = findFolder(curPath);
      var perms = allOpen ? [] : picked.people.map(personPath);   /* 全部公开 = 不按人员限定 */
      node.files.unshift({
        name: picked.file.name,
        size: picked.file.size,
        ftype: picked.ftype,
        tags: picked.tags.slice(),
        perms: perms,
        perm: perms.length ? perms.join('；') : (allOpen ? '所有用户可检索/引用' : '仅上传者与管理员可见'),
        vis: { all: allOpen, people: allOpen ? [] : picked.people.slice() },
        permLogs: [{
          time: now(),
          by: { no: curUser.no, name: curUser.name },
          lines: [allOpen ? '初始开放范围：全部可见'
            : (picked.people.length
              ? '初始开放范围：指定人员可见（' + picked.people.length + ' 人）：' + personNames(picked.people)
              : '初始开放范围：默认')]
        }],
        time: now(),
        owner: { no: curUser.no, name: curUser.name },   /* 上传者 = 当前登录用户 */
        logs: []
      });
      save();
      renderFiles(); buildMenu();
    });
  };

  /* 列表 / 卡片 视图切换 */
  var vt = document.getElementById('kbf-vt');
  vt.querySelectorAll('.kbf-vbtn').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-v') === viewMode);
    b.onclick = function () {
      viewMode = b.getAttribute('data-v');
      try { localStorage.setItem('kb-viewmode-v1', viewMode); } catch (e) { /* 忽略 */ }
      vt.querySelectorAll('.kbf-vbtn').forEach(function (x) { x.classList.toggle('on', x === b); });
      renderFiles();
    };
  });

  /* 当前身份切换（原型模拟登录身份，演示日志/删除权限） */
  document.getElementById('kbf-user').onclick = function () {
    var tip = el('div', 'kbd-tip',
      '原型模拟登录身份（真实环境为当前登录账号）：「日志」仅文件上传者本人与肖东（主管）可查看，' +
      '文件【删除】【权限修改】仅上传者本人可见；切换身份后重新浏览列表可见入口变化。');
    var box = el('div');
    IDENTITIES.forEach(function (u) {
      var row = el('div', 'kbd-irow' + (u === curUser ? ' on' : ''));
      row.innerHTML =
        '<span class="kbd-inm">' + esc(u.name) + '</span>' +
        '<span class="kbd-ino">' + esc(u.no) + '</span>' +
        '<span class="kbd-irole">' + esc(u.role) + (u === curUser ? ' · ✓ 当前' : '') + '</span>';
      row.onclick = function () { setUser(u); closeDialog(); };
      box.appendChild(row);
    });
    openDialog('切换当前身份（原型模拟）', [tip, box], function () {}, '关闭');
  };

  /* 初始化 */
  buildMenu();
})();
