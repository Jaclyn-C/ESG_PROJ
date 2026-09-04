# 项目目录模板

新建项目时把本目录复制为 `projects/<项目名>/`（或由主对话按此结构创建），然后填写 `status.md` 的项目名。

```
<项目名>/
├─ inputs/                 ← 用户放素材（agent 只读）
│  ├─ 01-原始需求文档.pdf     序号=agent 阅读优先级
│  ├─ screenshots/           页面快照 → 原型的内容基础
│  └─ style-refs/            风格参考 → 原型的视觉基准
├─ understanding/          ← 需求理解（每需求一份，只有最新版）
├─ outputs/
│  ├─ confirm/             功能确认说明 .tex/.pdf
│  ├─ dev-spec/            开发需求文档 .md
│  ├─ prototype/vN/        交互原型 index.html
│  ├─ ppt/vN/              汇报幻灯片
│  ├─ research/            调研报告
│  └─ overview/            需求总览快照（只读生成物）
├─ worklog/                ← YYYY-MM-DD.md + weekly/
├─ status.md               ← 当前状态快照（worklog-agent 收工时全量重写）
└─ archive/                ← 被替代的旧版本
```

规则速记（详见根目录 CLAUDE.md）：

- 同一需求反复修改 → 只升版本（v1→v2），不新建文件；旧版必须挪 `archive/`；
- 产物版本号 = 需求理解版本号；
- 「客户已确认」的状态只有用户点头后才能标记；
- status.md 是快照不是流水账：完成的移除，历史进 worklog。
