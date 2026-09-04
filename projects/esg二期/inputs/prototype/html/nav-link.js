/*!
 * ESG 原型 · 页面跳转导航
 * ============================================================
 * 将原型页面互相链接起来（快照页原本是静态的，点击菜单无响应）：
 *   · 顶部导航栏：「工作台」「监控看板」「知识库」三个入口
 *   · 左侧边栏：「指标收集进度」「我的待办」
 *   · 监控看板列表页：点击任务卡片 → 指标收集进度详情页
 *   · 监控看板详情页：顶部标签「指标收集进度」→ 返回列表页
 *   · 工作台-我的待办：点击任务名称 → 具体工单
 *   · 具体工单：点击「编辑」→ 编辑指标页
 *   · 编辑指标页：点击「确定 / 取消」→ 返回具体工单
 *   （信息收集 / 配置中心 / 指标数据汇总 等暂无对应原型页，不做跳转）
 *
 * 引入方式（data-page 标识当前页，避免自跳转）：
 *   <script src="./nav-link.js" data-page="kb|dash|detail|todo|ticket|edit"></script>
 */
(function () {
  'use strict';
  if (window.__ESG_NAV_LINK__) return;
  window.__ESG_NAV_LINK__ = true;

  var PAGES = {
    kb: './esg-data-center知识库页面.html',
    dash: './esg-data-center监控看板_指标收集进度.html',
    detail: './esg-data-center-监控看板_指标收集进度详情.html',
    todo: './工作台-我的待办.html',
    ticket: './工作台-我的待办-具体工单.html',
    edit: './工作台-我的待办-编辑指标.html'
  };

  var tag = document.querySelector('script[src*="nav-link"][data-page]');
  var page = tag ? tag.getAttribute('data-page') : '';

  /* 可跳转元素打标记（data-nav-target）+ 绑定跳转 */
  function link(node, target) {
    if (!node || !PAGES[target] || page === target) return;   /* 无目标页 / 当前页则不跳转 */
    node.setAttribute('data-nav-target', target);
    node.addEventListener('click', function () {
      window.location.href = PAGES[target];
    });
  }
  function textOf(node) { return (node.textContent || '').trim(); }

  /* 悬停可点击样式 */
  var style = document.createElement('style');
  style.textContent =
    '[data-nav-target]{cursor:pointer}' +
    '.el-table__body tr[data-nav-target]:hover td{background:#f0f5ff !important}' +
    '#Sidebar .el-menu-item[data-nav-target]:hover{background:#ecf1fb}';
  document.head.appendChild(style);

  /* ---- 顶部导航栏 ---- */
  Array.prototype.forEach.call(
    document.querySelectorAll('#navbar .el-menu-item'),
    function (li) {
      var t = textOf(li);
      if (t === '知识库') link(li, 'kb');
      else if (t === '监控看板') link(li, 'dash');
      else if (t === '工作台') link(li, 'todo');
    }
  );

  /* ---- 左侧边栏 ---- */
  Array.prototype.forEach.call(
    document.querySelectorAll('#Sidebar .el-menu-item'),
    function (li) {
      var t = (li.getAttribute('title') || li.textContent || '').trim();
      if (t === '指标收集进度') link(li, 'dash');
      else if (t === '我的待办') link(li, 'todo');
    }
  );

  /* ---- 监控看板列表页：点击任务卡片 → 详情页（原型：整卡可点） ---- */
  if (page === 'dash') {
    Array.prototype.forEach.call(
      document.querySelectorAll('.el-card'),
      function (card) {
        if (/申请单号[\s\S]*20\d{6}-\d{3}/.test(card.textContent || '')) link(card, 'detail');
      }
    );
  }

  /* ---- 监控看板详情页：顶部标签「指标收集进度」→ 返回列表页 ---- */
  if (page === 'detail') {
    Array.prototype.forEach.call(
      document.querySelectorAll('.el-tag'),
      function (tg) {
        if (textOf(tg) === '指标收集进度') link(tg, 'dash');
      }
    );
  }

  /* ---- 我的待办列表页：点击任务名称 → 具体工单 ---- */
  if (page === 'todo') {
    Array.prototype.forEach.call(
      document.querySelectorAll('.el-table__row span.underline, .el-table__row span.cursor-pointer'),
      function (sp) {
        var t = textOf(sp);
        if (t && t !== '-' && /\d{4}/.test(t)) link(sp, 'ticket');
      }
    );
  }

  /* ---- 具体工单页：点击「编辑」→ 编辑指标页 ---- */
  if (page === 'ticket') {
    Array.prototype.forEach.call(
      document.querySelectorAll('button.el-button'),
      function (b) {
        if (textOf(b) === '编辑') link(b, 'edit');
      }
    );
  }

  /* ---- 编辑指标页：点击「确定 / 取消」→ 返回具体工单 ---- */
  if (page === 'edit') {
    Array.prototype.forEach.call(
      document.querySelectorAll('button.el-button'),
      function (b) {
        var t = textOf(b);
        if (t === '确定' || t === '取消') link(b, 'ticket');
      }
    );
  }
})();
