# REQ-02 信息采集表 · 变更对照单（2026-09-11）

> 基准：测试环境 esg-ai 仓库现状。需求依据：ESG二期开发需求管理.md §6.4.5–6.4.9 新版。每条＝目标 / 测试环境现状（代码位置）/ 改动类型 / 验收标准。

## 改-01 删除首次映射强制门槛

- **目标**：映射表可选、空库可用（6.4.5）。
- **测试环境现状（代码位置）**：`esg-agent-service/src/services/collection-form-mapping-library.ts` 的 lockCollectionMappingBootstrap/requireCollectionMappingBootstrap 在库未初始化且未传映射表时抛 422；前端 `csr-esg-web/src/components/ai-assistant/index.vue` 约 621–631 行有对应引导文案。
- **改动类型**：删除。
- **验收标准**：全新空库环境仅上传模板即可跑通全流程。

## 改-02 删除两期数值必填校验

- **目标**：数值可空、确认不因缺值报错（6.4.8-3）。
- **测试环境现状（代码位置）**：`esg-agent-service/src/services/agent-workflows.ts` confirmCollectionWorkflow 中 missingValues 校验（缺本期或上期即 422"缺少本期或上期数据"）。
- **改动类型**：修改。
- **验收标准**：构造上期无数据指标行→确认通过→产物该单元格留空。

## 改-03 允许无映射手工行

- **目标**：采纳行允许平台名/编码为空（6.4.8-3）。
- **测试环境现状（代码位置）**：confirmCollectionWorkflow 中 unresolved 校验（采纳行必须有名称+编码，否则 422）。
- **改动类型**：修改。
- **验收标准**：无映射行可采纳并手填数值正常填充。

## 改-04 重匹配保留人工数值

- **目标**：人工值任何重匹配不覆盖（6.4.8-2）。
- **测试环境现状（代码位置）**：`esg-agent-service/src/services/collection-form-platform.ts` resolveCollectionIndicatorReview 的 rematched 分支取平台新值并把 overridden 标志重置 false。
- **改动类型**：修改。
- **验收标准**：改指标名行重匹配后，此前手填的数值保持不变。

## 改-05 映射入库过滤＋失效停用

- **目标**：只收"采纳且有编码"行、失效条目停用（6.4.9-3）。
- **测试环境现状（代码位置）**：`agent-workflows.ts` upsertAdoptedCollectionMappings 按采纳行全量入库、无失效停用逻辑。
- **改动类型**：修改。
- **验收标准**：无映射行不出现在映射库；指向已删平台指标的旧条目确认后 active=false。

## 改-06 接线平台映射入库

- **目标**：确认时调平台 /mapping/save 写 6.1.7 列表（6.4.9-3）。
- **测试环境现状（代码位置）**：平台端点已实现（`csr-esg-system/.../flow/controller/FlowKnowledgeMappingController.java` POST /save，DTO：templateName/mappingCount/confirmState/mappingDetail），Agent 侧无任何调用。
- **改动类型**：新增。
- **验收标准**：完成一次确认后知识库映射列表出现新记录（关联模板/已确认/映射数正确）。

## 改-07 知识库 xlsx 进映射槽

- **目标**：🗂 引用知识库任意 xlsx 可作映射表（6.4.5）。
- **测试环境现状（代码位置）**：`index.vue` 约 1228–1236 行知识库引用仅 mapping 分区记录进映射槽、普通文件只进模板槽。
- **改动类型**：修改。
- **验收标准**：从知识库选一个三列 xlsx 文件可成功作为映射表发起任务。

## 改-08 确认表组件重构

- **目标**：7 列＋top3 下拉（候选带置信度、默认最高分、可手输）＋上期列可编辑＋匹配来源列＋采纳开关＋"已修改/已刷新"行标记＋手输未命中保留显示（6.4.7）。
- **测试环境现状（代码位置）**：`csr-esg-web/src/components/ai-assistant/collection-table-card.vue` 仅 5 列、平台指标为自由文本输入、无上期/来源/采纳/标记（后端 matches 数组已存 top3 候选、mapping_source 字段已有，可直接取用）。
- **改动类型**：修改。
- **验收标准**：按 6.4.7 逐列对照通过。

## 改-09 附件类型收窄

- **目标**：采集表模式 📎 仅 .docx/.xlsx、错型当场报错（6.4.5）。
- **测试环境现状（代码位置）**：`chat-input.vue` 用全局 11 个扩展名白名单（pdf/doc/docx/txt/ppt/pptx/xls/xlsx/jpg/jpeg/png），错型文件在 `index.vue` 分流时被静默当普通附件（模板永不就绪、用户困惑）。
- **改动类型**：修改。
- **验收标准**：采集表模式选 pdf 提示"仅支持 Word 模板（.docx）与映射表（.xlsx）"。

## 改-10 保留勿动清单

模板结构认证与非认证模板人工兜底（template-review-card 链路）、年份判定链（消息→封面→当前年、冲突阻止、上期=本期-1）、原位回填引擎与结构指纹/写入位置自检、版本乐观锁与 409 刷新、admin 可见性与文档权限校验——均已符合新版需求。

- **改动类型**：保留。

## 改-11 映射表查看/删除/同模板更新

- **目标**：查看以三列表格渲染明细；删除记录（仅管理员、不联动全局库）；同模板重复确认更新同一记录不堆积（6.1.7 变更块 3–5）。
- **测试环境现状（代码位置）**：平台已有 /getDetail、/download、/delete 端点与前端 mapping-list 页操作列（`csr-esg-system/.../flow/controller/FlowKnowledgeMappingController.java`、`csr-esg-web/src/views/flow/pages/knowledge/mapping-list/index.vue`）；查看明细是否已为三列表格形式需开发核验；同模板去重更新逻辑在 Agent 调 /mapping/save 时按 DTO 的 id 机制实现（改-06 一并做）。
- **改动类型**：核验/修改。
- **验收标准**：admin 可查看三列表格明细、可下载、可删除；同模板确认两次列表仅一条记录且数据为最新。

## 改-12 全局映射总表

- **目标**：确认时随全局库变化重新生成全量合并三列总表，更新知识库同一条置顶记录（关联模板="全局"），可查看/下载、不可删除（6.1.7 变更块 6）。
- **测试环境现状（代码位置）**：Agent 侧已有全量导出能力（`esg-agent-service/src/services/collection-form-mapping-library.ts` 的 buildCollectionMappingExport/exportActiveCollectionMappings，生成三列 XLSX），但无自动刷新到知识库的链路。
- **改动类型**：新增（复用既有导出＋入库通道）。
- **验收标准**：连续两次确认后，列表中全局总表仅一条且内容为两次合并后的最新结果。

## 改-13 确认循环与终确填充

- **目标**：任务存在过任何修改（含改过又取消弹窗）时，弹窗【确认】一律返回全量结果表（本轮有修改→先重匹配；本轮无新修改→直接返回并提示"共 X 项，其中已修改 N 项"），不触发填充；结果卡提供【✅ 确认无误，开始填充】按钮，填充仅经该按钮触发；全程零修改的任务首次【确认】直接填充（6.4.8）。
- **测试环境现状（代码位置）**：`esg-agent-service/src/services/agent-workflows.ts` 的 reviewCollectionWorkflowIndicators——全部行 accepted 时内联自动调用 confirmCollectionWorkflow 完成填充（确认即提交），无"存在过修改→返回结果供核对"与显式终确步骤；前端 `csr-esg-web/src/components/ai-assistant/collection-table-card.vue` 同为确认即走 review。
- **改动类型**：修改。
- **验收标准**：改过任意行后，重开弹窗不做新修改直接点【确认】仍返回结果表而非填充；点【✅ 确认无误，开始填充】才生成产物；全新任务零修改点【确认】直接填充。

## 改-14 语义匹配候选阈值与低置信标记

- **目标**：大模型语义匹配候选按置信度阈值过滤——仅返回置信度 **> 0.5** 的候选，低于等于 0.5 的不进入候选列表（下拉不展示）；阈值为后端固定常量（暂定 0.5，不提供界面配置，后续按测试与算法校准结果由后端直接修改代码值）。某行经优先级匹配与阈值过滤后候选为空（搜索无结果或候选全部不高于阈值）→ 按"未匹配"处理（名/码空、可手填、不进映射表，6.4.6 第 4 条）。确认表行尾"状态"列新增"低置信"橙色标记：该行当前默认/选中候选置信度 < 0.85 时显示，仅提示、不阻断（6.4.7 第 3 条）。
- **测试环境现状（代码位置）**：`esg-agent-service/src/services/platform-indicators.ts` 的 searchPlatformIndicators——两条路径均无置信度阈值（仅 sort＋slice 截断）；且模拟路径将置信度硬编码下限 0.48（`Math.max(0.48, …)`，约第 79 行），属演示失真，**须一并去除**——否则所有候选分数被人为抬高，0.5 阈值无法真实评估；前端确认表无行级低置信标记。
- **改动类型**：新增（阈值常量与过滤）＋修改（模拟分数失真、前端状态列标记）。
- **验收标准**：① 置信度 ≤ 0.5 的候选不出现在下拉；② 构造全部候选 ≤ 0.5 的行 → 该行显示"未匹配"（名/码空、可手填）；③ 默认候选置信度 < 0.85 的行状态列显示"低置信"；④ 模拟模式下用无关指标名查询，返回分数如实（可低于 0.5 并被过滤）。

## 部署备注

esg-agent-service 上传上限环境变量（默认 50MB）须设为 100 与前端对齐。
