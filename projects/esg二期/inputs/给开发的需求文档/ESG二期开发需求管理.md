
4. # AI需求功能说明文档

### 全局规则（所有 AI 功能共用）

1. **AI 标注**：凡 AI 生成/提取的内容（对话中的卡片、下载的 Word 文件），一律带"⚠ AI生成/提取，请人工核实"角标或末尾提示；每个对话输入区底部固定显示"内容由 AI 生成/提取，请人工核实"。

2. **准确率目标**：数值类结果（附件提取、采集表填充、报告中的指标值）以 100% 准确率为目标值；AI 幻觉从原理上无法保证绝对准确，须以"注明出处 + 人工核实提示"兜底。

3. **数值来源**：报告中出现的 ESG 指标值，100% 来自平台指标库中已收集的数据（含 MSCI CSA 评级指标、上交所披露指标等），不由 AI 凭空生成。

4. **进度类提示**：AI 执行多步任务时，在对话中显示"进度卡片"（步骤逐条从转圈变为 ✓，可附明细小字），让用户看到当前执行到哪一步。

5. **文件可见范围由上传者设定**：用户上传文件至知识库时，可自定义该文件对谁可见（输入姓名或工号搜索选择人员，可多选）；**不选择任何人员 = 默认对所有用户可见**（所有人可检索、引用、预览，AI 亦然）。该可见范围即第 6条 AI 权限可见性的判定依据。

6. **AI 权限可见性（全局硬性规则）**：平台内**所有 AI 助手**——全局智能助手、进度分析 AI 助手（监控看板详情页）、附件总结 AI 助手（编辑指标对话框）——在任何场景（检索、引用、【知识库】选择弹窗、报告取数）只能获取**当前用户权限范围内**的知识库文件与指标数据；无权文件不出现在选择弹窗、检索结果和回答内容中。

7. **Agent 功能按角色开放**：全局助手中的【报告生成】与【指标信息采集表】两个 Agent 按钮**仅对管理员显示**；普通用户打开助手时看不到这两个按钮（无对应模式与提示），只能使用智能问答——可通过【📎】上传本地附件提问，也可引用知识库中**对自己可见**的文件。

8. **聊回答出处强制溯源（全局硬性规则）：** 平台内所有 AI 助手——全局智能助手、进度分析 AI 助手（监控看板详情页）、附件总结 AI 助手（编辑指标对话框）——在任何回答中引用的数据、文件及内容片段，均须明确标注来源。若引用自知识库文件，须具体到文件名、页码（search page），并提供对应文件的可访问链接；若引用自其他来源，亦须以可验证方式标注出处，确保用户可追溯原始信息。

1. ## 【可以验证】**知识库管理**

### 6.1.1 菜单与文件夹浏览

功能说明：所有用户可经顶部导航【知识库】进入知识库页面；左侧边栏共三个菜单——「最佳案例」（二级：指标最佳高分/评级回应案例、案例管理）、「知识库文件」（二级及以下为文件夹树，支持无限层级）、「信息采集指标映射表」；点击菜单切换右侧内容区，文件夹树与列表联动。

1. 切换菜单：点击左侧菜单项，右侧切换至对应视图，当前菜单高亮；「最佳案例」「知识库文件」标题行可点击展开/收起其二级菜单。

2. 进入文件夹：在「知识库文件」视图点击文件夹名称或操作列【进入】，列表切换为该文件夹内容，顶部面包屑同步显示路径（全部文件 / ×× / ××），点击面包屑任一级可返回该层级；左侧菜单树同步展开并高亮当前文件夹。

3. 浏览列表：默认列表视图以表格展示，列为：名称、标签、开放范围、大小、时间、操作；文件夹行显示文件夹图标+名称（操作为【进入】【删除】），文件行显示类型图标+名称+标签+开放范围+大小+时间（操作为【预览】【删除】）；列表下方显示"共 × 个文件夹、× 个文件"。

4. 空文件夹：当前文件夹无任何内容时，显示提示"当前文件夹为空，点击右上角「新建文件夹 / 新建文件」开始"。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/NFXENBZJABQBY?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6Ik5GWEVOQlpKQUJRQlkiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/34GUNBZJACAD6?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjM0R1VOQlpKQUNBRDYiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

【新增】
知识库页面入口对所有注册用户开放，但页面内各模块及具体内容的数据可见性，依据用户角色权限进行差异化控制。
1、 最佳案例权限规则：
    ◦ 二级菜单指标最佳高分/评级回应案例对所有用户开放。
    ◦ 二级菜单案例管理只对管理员开放，管理员可编辑。
2、 知识库文件权限规则：
    ◦ 上传：所有成员均可上传文件。
    ◦ 使用：文件上传成功后，即刻可供AI功能调用。
    ◦ 删除：仅上传者本人可进行权限设置或删除操作，其他成员无权处理他人文件。
3、 信息采集指标映射表只对管理员开放。

   
【新增】
知识库页面入口对所有注册用户开放，但页面内各模块及具体内容的数据可见性，依据用户角色权限进行差异化控制。
1、 最佳案例权限规则：
    ◦ 二级菜单指标最佳高分/评级回应案例对所有用户开放。
    ◦ 二级菜单案例管理只对管理员开放，管理员可编辑。
2、 知识库文件权限规则：
    ◦ 上传：所有成员均可上传文件。
    ◦ 使用：文件上传成功后，即刻可供AI功能调用。
    ◦ 删除：仅上传者本人可进行权限设置或删除操作，其他成员无权处理他人文件。
3、 信息采集指标映射表只对管理员开放。

【需求待确定】文件阅读日志（浏览列表新增「日志」列）：
1、新增列：「知识库文件」的文件夹浏览列表（列表视图）在“操作”列之后新增“日志”列；文件夹行该列固定显示"—"（文件夹无阅读日志）；文件行的“日志”列，仅当当前用户为该文件的上传者本人或 Coco 处长时显示可点击的【日志】，否则显示"—"（不可点击、不可查看）；卡片视图（6.1.4）的文件卡片底部同样提供【日志】入口（显示规则与权限判定和列表视图一致）。文件夹卡片不提供。
2、 查看日志：点击文件行【日志】，弹出“日志”浮窗（悬浮于列表上方，不跳转页面）；浮窗顶部显示所查文件的图标、文件名与上传者（姓名＋工号），中部以表格展示该文件的全部阅读记录，列为：工号、姓名、时间，按时间由近到远排序；底部为【关闭】按钮，点击【关闭】或右上角【✕】关闭浮窗。
3、记录规则（自动）：任何用户（含上传者本人）点击该文件【预览】即计为一次阅读，该用户在AI助手提问时引用该文件，或者AI助手自动查询、引用了该文件，也计为一次阅读，系统自动追加一条阅读记录（阅读人的工号、姓名、阅读时间，记录到分钟）；同一用户多次阅读产生多条记录；。
4、查看权限（硬性规则）：阅读日志仅以下两类用户可查看，满足其一即可——其一，该文件的上传者本人（按文件上传人账号判定，只能查看自己上传文件的日志）；其二，肖东 F1340620（可查看全部文件的阅读日志，为固定账号）；无权限用户“日志”列不显示【日志】入口，亦无法通过其他途径查看该日志。
5、空态：文件尚无任何阅读记录时，浮窗表格区显示”暂无阅读记录：用户点击该文件【预览】后将自动记录”。

【新增】文件开放范围修改（文件行新增【权限修改】）：

1、入口与操作权限：列表视图文件行“操作”列在【预览】之后新增【权限修改】（卡片视图文件卡片底部同步提供）；仅该文件的上传者本人可见并可点击，其他用户不显示该按钮；点击弹出“权限修改”浮窗（悬浮于列表上方，不跳转页面），浮窗顶部显示文件图标、文件名与上传者（姓名＋工号），下方为“开放范围（仅上传者本人可修改）”设置区。

2、设置区交互（沿用 6.1.3 开放范围交互）：已指定人员以小块展示（内容为“公司/事业群/部门/姓名（工号）”），可逐个点【✕】移除或点【✕ 清除全部】；点击【＋ 添加人员】弹出“选择用户”窗口（查询结果点工号添加、历史记录多选，规则同 6.1.3）新增可见人员；点击【全部公开】切换为对所有用户开放，选中后【＋ 添加人员】置灰、已添加人员清空，再次点击取消选中；状态行实时显示当前状态（全部公开 / 指定人员可见 N 人 / 仅上传者与管理员可见）。

3、保存与校验：点击【确定】保存新的开放范围，文件列表“开放范围”列立即刷新为新状态，并自动生成一条权限修改记录（格式见 4）；若本次未做任何修改，点击【确定】提示“未修改任何内容”，不保存、不生成记录；点击【取消】或右上角【✕】关闭浮窗，不保存任何改动。

4、修改记录（浮窗内【日志】按钮）：浮窗设置区提供【日志】按钮，点击弹出“权限修改记录”浮窗（悬浮于权限修改浮窗之上），以表格按时间由近到远展示历次修改，列为：时间（记录到分钟）、修改人（姓名＋工号）、变更内容；变更内容一行一条、仅允许以下两类固定句式（格式化输出，不含其他描述文字）：

   ◦ 增删人员行（指定人员名单发生变化时，可与范围切换行出现在同一条记录中）：

   + 姓名（工号）、姓名（工号）…

   - 姓名（工号）、姓名（工号）…

   ◦ 范围切换行（开放范围形态变化时，格式为“旧状态 → 新状态”）；状态共三种——默认（＝仅上传者与管理员可见）、指定人员可见（N 人）、全部可见（＝所有用户可检索/引用），任意两态组合共六种：

   默认 → 指定人员可见（N 人）

   默认 → 全部可见

   指定人员可见（N 人）→ 默认

   指定人员可见（N 人）→ 全部可见

   全部可见 → 默认

   全部可见 → 指定人员可见（N 人）

   文件上传时自动生成一条“初始开放范围：默认 / 指定人员可见（N 人） / 全部可见”（按上传时实际状态）记录；同一次保存多条变更行按“切换行 → + 行 → - 行”顺序排列；暂无任何记录时显示“暂无修改记录”。

5、记录生成规则（自动比对）：保存时自动比对前后开放范围——形态（默认 / 指定人员 / 全部可见）变化时生成一行“旧状态 → 新状态”；同时按工号比对前后指定人员名单，新指定的可见人员生成“+ 姓名（工号）…”一行（含默认/全部可见切换为指定人员的场景），失去可见资格的指定人员生成“- 姓名（工号）…”一行（含指定人员切换为默认、指定人员内部增删的场景），但切换为全部可见时不生成“-”行（原有人员仍可见、无人失去资格）；形态与名单均无差异则不生成记录。示例：全部可见改为仅陈志强可见，生成两行——“全部可见 → 指定人员可见（1 人）”“+ 陈志强（X2008152）”。

### 6.1.2 新建文件夹

功能说明：用户可在当前文件夹下新建子文件夹；文件夹名称支持中英文、数字及下划线等特殊符号；同一层级不允许重名。

1. 新建：点击列表右上方【新建文件夹】，弹出"新建文件夹"对话框，显示创建位置（当前路径），输入名称后点击【确定】，在当前层级新增该文件夹并直接进入，左侧菜单树同步更新，若名称为空提示"请输入文件夹名称"，若与同级重名提示"同名文件夹已存在"。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/57WUNBZJADQEI?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjU3V1VOQlpKQURRRUkiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

### 6.1.3 新建文件（上传）

功能说明：用户将本地文件上传至当前文件夹，上传时填写文件分类标签（自由填写、可多个）并设置开放范围（不设置则默认对所有人开放）；上传后的文件进入知识库列表，供 AI 检索与引用；上传**无须**强制关联任何 ESG 指标（用户后续仍可将知识库文件与指标建立关联，与一期指标附件功能并存不冲突）。

1. 打开对话框：点击列表右上方【新建文件（上传）】，弹出"新建文件（上传）"对话框，依次包含：本地文件（必填）、文件分类标签、开放范围、上传位置、注意事项提示。

2. 选择文件：点击【从本地选择文件】选择本地文件（可多选场景下逐个选择），下方显示文件图标、名称与大小；未选文件时显示"未选择文件"。

3. 填写标签：在"文件分类标签"输入框输入标签后回车或点击【添加】，标签以小块形式展示、可逐个点【✕】移除（可选、可多个）。

4. 设置开放范围：在"开放范围"区上方的搜索框输入工号或姓名，下方实时列出匹配人员（每条显示姓名/工号及所属公司、事业群、部门），点击某条结果即添加该人员为一条开放范围，可继续搜索添加多个人员（重复点击同一人不重复添加）；已添加的人员以小块展示、可逐条移除或点【✕ 清除全部】；未添加任何人员时显示"未选择 → 默认：所有用户可检索/引用"。

5. 注意事项：对话框底部固定显示提示——"① 大模型仅解析文档中的文本内容（公式、图表等非文本内容无法解析）；② 图片（jpg/png）中文字需清晰，方可识别和解析；③ 不含音视频。"

6. 确认上传：点击【确定】，文件出现在当前文件夹列表最上方（含标签、开放范围、上传时间），左侧菜单树计数同步更新；若未选择文件则提示"请从本地选择文件"，点击【取消】关闭对话框不做任何保存。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/2BWELBZJADAAC?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjJCV0VMQlpKQURBQUMiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/NHEEPBZJACAEG?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6Ik5IRUVQQlpKQUNBRUciLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

   【已完成】【新增】文件类型（必选）：在“新建文件（上传）”对话框的"文件分类标签"上方新增"文件类型"字段，含“参考文档”与“提示词文档”两个选项，单选、必选，选中项高亮；未选择时点击【确定】提示"请选择文件类型（参考文档 / 提示词文档）"，无法上传。上传成功后，文件类型随文件保存，并在文件列表（6.1.1）与卡片视图（6.1.4）中以文件类型标识（参考文档/提示词文档）展示于标签之前。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/4ODDXGZJADQHQ?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjRPRERYR1pKQURRSFEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

   【新增】开放范围 · 选择用户窗口（替代 6.1.3 步骤 4 的原内联搜索，新增查询结果点工号添加 + 历史记录多选）：

   ① 入口：「新建文件（上传）」对话框"开放范围"区提供【＋ 添加人员】按钮，点击弹出"选择用户"窗口（悬浮于上传对话框之上，上传对话框保持打开不关闭）。

   ② 窗口结构：含"查询结果""历史记录"两个页签，默认选中「查询结果」；顶部为查询区（"账号""姓名"两个输入框 +【搜索】【重置】），查询区下方固定显示橙色提示"请输入工号 或 姓名 进行人员查找，查询结果最多显示前 20 条记录。"。

   ③ 查询交互：输入框内按回车等同点击【搜索】；未搜索（两个输入框均为空）时「查询结果」页签为空，仅显示提示"请输入工号或姓名，点击【搜索】后显示查询结果"；搜索后按条件显示结果（最多 20 条），无匹配时显示"无匹配人员"；【重置】清空两个输入框并回到空提示状态。

   ④ 查询结果页签 · 点工号添加：以表格显示，列为 \#、账号、姓名、邮件、事业群、部门；账号即工号，以可点击链接样式显示；点击某行的账号，添加该人员为一条开放范围；添加后该行账号处变为"✓ 已添加"不可再点；同一人不会重复计入。

   ⑤ 历史记录页签 · 自动记录：通过查询结果添加过的人员自动记入历史（同一人只保留一条；从历史再次添加同样置顶为最近使用），按最近使用由近到远排序，与用户账号关联、跨次上传共用；历史为空时显示"暂无历史记录：在「查询结果」中点击工号添加过的人员会自动记录在此"。

   ⑥ 历史记录页签 · 勾选交互：每行首列为勾选框，点击整行即切换勾选/取消（☐/✓）；已添加的人员整行置灰、勾选框显示"✓"不可再勾选；【全选】仅勾选未添加项；【✕ 清空历史】点击后弹确认，确认后清空全部历史。

   ⑦ 添加所选：勾选 × 人后点击【＋ 添加所选（×）】一次全部加入开放范围；未勾选时该按钮置灰不可点；添加成功后勾选自动清空、相应行变为已添加状态。

   ⑧ 底部与关闭：窗口底部实时显示"已选开放范围：× 人（姓名1、姓名2…）"；点击【完成】或右上【✕】关闭窗口、回到上传对话框，已添加人员保留。

   ⑨ 回到上传对话框后的展示：已添加人员以小块展示于"开放范围"区，小块内容为该人员的完整路径"公司 / 事业群 / 部门 / 姓名（工号）"，可逐条点【✕】移除或点【✕ 清除全部】；未添加任何人员且未选"全部公开"时，状态行显示"未选择 → 默认：所有用户可检索/引用"。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/7NANRIBJADQFE?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjdOQU5SSUJKQURRRkUiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/XYI5VIBJAAQH6?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlhZSTVWSUJKQUFRSDYiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/6TC5VIBJABAHM?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjZUQzVWSUJKQUJBSE0iLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   【新增】开放范围 · 全部公开开关：

   按钮位置与默认态："开放范围"区在【＋ 添加人员】旁提供【全部公开】按钮，默认未选中。

   ② 点击选中：按钮蓝色高亮；【＋ 添加人员】立即置灰不可点击；已添加人员立即清空；状态行显示"已选：全部公开 → 所有用户可检索/引用"；历史记录不受影响。

   ③ 再次点击：取消选中，【＋ 添加人员】恢复可点击，状态行回到"未选择 → 默认：所有用户可检索/引用"。

   ④ 清除联动：点【✕ 清除全部】清空已添加人员的同时，将"全部公开"重置为未选中。

   ⑤ 上传结果：选中"全部公开"时上传，文件的开放范围为"所有用户可检索/引用"。

### 6.1.4 搜索、重置与视图切换

1. 搜索：在"请输入文件名关键词"输入框输入关键词，点击【搜索】，列表仅显示名称或标签含关键词的文件夹与文件；点击【重置】清空关键词并恢复全部内容。

2. 视图切换：点击右上【☰ 列表】/【▦ 卡片】切换展示方式（选择被记住，下次进入保持）；卡片视图中文件夹卡片显示名称、子文件夹/文件数量、"点击进入 →"，文件卡片显示图标、名称、标签、开放范围、大小、时间、【预览】，鼠标悬停时右上角出现删除【✕】。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/XUKERBZJAAQDK?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlhVS0VSQlpKQUFRREsiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNDkwfQ)

### 6.1.5 预览与删除

1. 预览：点击文件行【预览】打开文件预览，仅开放范围内用户可预览。

2. 删除文件：点击文件行【删除】，弹出确认"确认删除文件「××」？"，确认后从列表移除。

3. 删除文件夹：点击文件夹行【删除】，弹出确认"确认删除文件夹「××」及其全部内容？"，确认后该文件夹及其全部内容一并删除。

### 6.1.6 开放范围与 AI 可见性

功能说明：开放范围与文件绑定生效，仅范围内用户可在知识库列表、搜索结果、AI 的知识库选择弹窗与 AI 检索结果中看到该文件；涉密文件（如 ESG 评级报告）仅对选定用户可见；敏感信息脱敏（如薪资数据）由上传用户自行处理，平台仅负责文件的访客权限管理。

1. 范围展示：文件列表"开放范围"列逐行显示该文件的每条开放范围（如"工业富联（FII）/ 智能制造事业群 / 制造总部 / 周振軍（F3430832）"）。

   【需求变更】

   调整【文件知识库】的可见范围权限逻辑。具体规则如下：

- **可见范围主体**：仅限以下三类人员可见（满足其一即可）：

  1. **文件上传者**（本人）；

  2. **上传者指定的用户**（通过授权接口/人员选择器指定的具体人）；

  3. **可持续发展中心特定角色**（详见下方硬编码名单）。

- **特殊固化逻辑（硬编码）**：

  针对“可持续发展中心”角色，不依赖后台动态权限配置，**直接基于固定名单进行鉴权**。该名单包含：可持续发展中心各维度负责人、各评级负责人及主管人员。

  1.E-王珏 F1396297

  2.S-张欣恬 F1396263

  3.G-周叶丹 F1338153

  4.G-张家源X2007887 &amp;李和谦 F1396128

  5.O-郑伟婷  F1396163

  6.主管：肖东 F1340620

  7副总：廖长青 813893

- **备注**：上述固化名单由业务方提供，开发侧**直接写入数据库常量表或配置文件中**，本期不做可视化管理后台。

  1. **全部公开（所有用户）【新增】**

### 6.1.7 信息采集指标映射表

功能说明：知识库左侧【信息采集指标映射表】菜单以列表展示历次确认的映射表文件，与"指标信息采集表"对话流程联动——对话中确认的映射关系自动存入本列表，供后续年份或报告复用。

1. 查看列表：点击左侧【信息采集指标映射表】，右侧以表格展示：映射表文件、关联模板、指标映射数、确认状态（已确认/待确认）、更新时间、操作。

2. 下载/查看：点击行内【下载】下载该映射表文件；点击【查看】查看映射内容。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/ET4ETBZJACQG2?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkVUNEVUQlpKQUNRRzIiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNDkyfQ)

## **6.2 全局 AI 智能助手（悬浮对话窗口**）【开发中】

### 6.2**.1 打开与收起助手**

功能说明：所有登录用户（可持续发展中心、策进组、事业群/分会、法人填报人）可在平台任一页面右下角打开 AI 智能助手对话窗口，窗口悬浮于页面上方、不离开当前页面；对话记录与用户账号关联，跨页面共享保留。

1. 打开助手：在任意页面右下角点击【AI 助手】悬浮按钮（蓝色圆形，带红点提醒），向上弹出对话窗口（左侧为"对话历史"栏、右侧为会话区），首次打开时会话顶部显示系统提示，助手名称显示"ESG 智能助手"、状态显示"在线 · 已连接知识库与指标库"，随后发送欢迎语与快捷指令按钮。

2. 收起助手：点击会话区右上角【✕】或再次点击悬浮按钮，窗口收起；对话内容保留，再次打开时原样恢复。

3. 收起/展开历史栏：点击会话区左上角【☰】，可收起或展开左侧"对话历史"栏。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/BGEFPBZJACQAC?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkJHRUZQQlpKQUNRQUMiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

### 6.2.2 三种模式切换

功能说明：助手提供三种模式：智能问答（默认）、报告生成、指标信息采集表；模式决定助手名称、头像、提示语与处理流程，切换即时生效并中止当前进行中的回答。

1. 切换：点击输入框上方的【报告生成】或【指标信息采集表】按钮，按钮高亮，助手名称/头像/输入框提示语随之切换，顶部出现模式提示条（如"当前 Agent：指标信息采集表 · 本期仅支持上交所《2026年FII可持续发展报告》模板"），会话内显示系统提示"已切换至「××」"，并按新模式重新发送欢迎语。

2. 切回：再次点击已高亮的模式按钮，切回默认"智能问答"模式。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/KSBFRBZJAAQH6?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IktTQkZSQlpKQUFRSDYiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/4DMFPBZJABAAE?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjRETUZQQlpKQUJBQUUiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/RBDVRBZJABAFO?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlJCRFZSQlpKQUJBRk8iLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk4fQ)

### 6.2.3 历史对话管理

功能说明：用户可查看、切换、删除自己的历史对话，列表与账号关联。

1. 新建对话：在左侧"对话历史"栏点击【＋ 新对话】，当前会话自动保存，会话区清空并显示"已开启新对话"提示，助手重新发送欢迎语与快捷指令。

2. 自动命名：用户在该会话首次发送消息后，以消息前 12 个字作为对话标题，列表项显示标题、所属模式与时间。

3. 切换历史：点击历史列表中任一对话，会话区恢复该对话全部内容，恢复的旧消息置为只读（其中的按钮、选项、快捷指令不可再点击），但可继续发送新消息；切换时当前会话自动保存。

4. 删除历史：鼠标悬停在历史条目上显示【✕】，点击后该对话从列表移除；若删除的是当前对话，则自动开启新对话。

### 6.2.4 发送消息、上传附件与引用知识库

功能说明：用户可输入自然语言指令、上传本地附件或引用知识库文件与 AI 对话；附件与知识库引用均支持多选，AI 处理期间不可重复发送。

1. 发送文字：在输入框输入内容，点击【发送】或按回车键，消息以用户气泡显示在会话区；AI 处理期间先显示"正在思考…"动效，完成后逐条返回消息，期间【发送】置灰。

2. 上传附件：点击输入框左下【📎】按钮，弹出本地文件选择框，可一次选择一个或多个文件（支持 PDF、docx、doc、txt、PPT、xlsx、jpg、png；单个文件大小上限为100MB；不含音视频、gif），确认后以"📎 《文件名》（大小）"逐条显示在会话区。

3. 引用知识库文件：点击输入框左下【🗂】按钮，弹出"从知识库选择文件"窗口，窗口分两个分区——"知识库文件"（以文件夹树展示，层级与「知识库」页面完全一致，点文件夹展开/收起，点文件勾选，可多选）与"信息采集指标映射表"（列出映射表文件）；底部提示已选数量，点击【确认引用】后以"🗂 已引用知识库文件：《文件名》…"显示在会话区。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/OAHVTBZJAAAAK?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6Ik9BSFZUQlpKQUFBQUsiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTkyfQ)

### 6.2.5 敏感信息回应

功能说明：用户提问涉及业务方预先设定的敏感字段（如薪资数据）时，AI 统一以固定话术回应；**敏感词清单由业务方提供，业务方暂未提供**。

1. 敏感提问：用户发送涉及敏感字段的问题，AI 仅回应"该信息受权限保护，无法提供"，不展示任何相关内容。

### 6.2.6 数据选择（指标下钻、搜索、批量提交·年份与逐指标跨维度配置、结果表格全屏）【新增】

> 【新增内容内部说明】本小节为 2026-09-04 增量新增，历经 v2 → v6 共五轮更新（9/4 同日三轮：v2 建立指标下钻、搜索与批量提交框架，v3 追加年份选择与维度选择并作全局查询条件，v4 经用户纠正改为已选指标条目内**逐指标配置**年份与维度——"维度和时间都放在具体的指标里选，不是全局的"；9/7 两轮——第五轮（REQ-01 v5）：维度升级为**跨维度多选**并新增**结果表格全屏**；第六轮（现依据 REQ-01 v6）：结果表格**删除「数据来源」列**（列集定稿 6 列）、维度弹窗新增**选中可视化**；第六轮内 9/7 第三次拍板（补记）：FII 与其他维度**不互斥**——四维度含 FII 可任意组合勾选、全部可共存（推翻原「互斥」默认口径，原待确认第 ③ 项移出））；各轮更新均只限本小节内部扩展改写，不改动本章节既有小节（6.2.1～6.2.5）与全局规则原文。与既有条目的衔接：① 可见性——【数据选择】按钮仅对管理员可见，处理方式对照全局规则 7 中【报告生成】【指标信息采集表】仅管理员显示的先例（无对应模式与提示），该约定仅在本小节内生效，全局规则 7 原文维持不变；② AI 标注——AI 返回的查询结果表格属 AI 生成内容，直接按全局规则 1 执行（"⚠ AI生成/提取，请人工核实"），不另立标注规则；③ 助手既有功能（三种模式、📎 上传、🗂 知识库引用、历史对话管理）维持现状，不因本小节调整。

功能说明：管理员可通过【数据选择】按指标层级逐层下钻（或搜索）选定指标；**年份与维度不是全局查询条件，而是在已选指标区内逐指标配置**——每个已选指标条目各自携带年份（可选，不选默认当年，当前＝2026）与维度对象（可不选，全部不选时默认 FII），不同指标可互不相同；**维度支持跨维度多选**（v5；四维度含 FII 全部可共存、不互斥，9/7 拍板）：同一指标可同时按 FII/分会/法人/策进组 圈定多个对象，以「指标名 + 所处层级 + 该指标自己的年份 + 该指标自己的跨维度对象」确定具体数据；指标层级共 5 层——指标库 → 维度 → 主题 → 议题 → 指标；指标可多选，一次提交全部已选指标（每个指标携带各自年份与跨维度对象，不做任何配置＝全部按 当年＋FII），提交后 AI 对话框对本次提交的全部指标**一次性**返回查询结果，以**一个表格**承载（**每个所选维度对象对应一条数据、对象与行一一对应**：同一指标选 N 个对象即 N 行，不做数值加总、不生成合并/汇总行），查询结果表格支持**全屏**查看；维度选择弹窗提供**选中可视化**（页签内着色选中态＋按维度着色的已选总览 chips，v6）。

1. 按钮位置与可见性：管理员在平台任一页面打开全局 AI 智能助手（沿用 6.2.1 既有交互）后，输入区上方的模式/功能按钮区（现有【报告生成】【指标信息采集表】等）中，【指标信息采集表】之后显示【数据选择】按钮；普通用户打开助手时，按钮区不出现【数据选择】按钮（无对应模式与提示，参照全局规则 7 先例）。

2. 进入数据选择：管理员点击【数据选择】，弹出数据选择弹窗（悬浮于会话上方、不离开当前页面）；界面形态默认口径＝弹窗（原型按【🗂】知识库选择的弹窗模式实现，可调整），维度选择为叠在其上的二级弹窗（见下方「维度选择二级弹窗」步骤块）。

3. 第 1 层选择指标库：界面展示"指标库"列表，仅显示 5 个「有效」状态的指标库——E维度指标库、S维度指标库、G维度指标库、SC指标库、O维度指标库（「无效」状态的 2 个旧库不显示）。

4. 选择顺序约束：未选择指标库时，不能选择下层内容（必须先选指标库）。

5. 第 2 层选择维度（指标层级，非查询条件中的维度选择）：选定某个指标库后，显示该库的维度列表。原型 mock：无论选择哪个指标库，下钻内容均复用同一棵 环境→主题→议题→指标 树（环境维度下含 环境政策与管理体系、能源 等主题）。

6. 逐层下钻至指标：选择某维度后，显示其下主题列表（第 3 层）；选择某主题后，显示其下议题列表（第 4 层）；选择某议题后，显示其下指标列表（第 5 层）。

7. 指标层列表项：仅显示 指标代码 + 指标名称 两项信息（如 E-E-14-1-0001 能源消耗总量），不显示指标描述、维度/主题/议题归属等其他字段。

8. 勾选多选：用户勾选指标，可勾选多个（多选）；每个勾选的指标进入弹窗内**已选指标区**，成为一条**可配置条目**。

9. 已选指标条目结构：每条已选指标条目＝指标代码＋指标名称，以及该指标自己的 ① 年份选择 ② 【维度选择】入口 ③ 移除操作；**年份与维度不在全局条件行，而在条目内逐指标配置**，条目间配置互相独立。

10. 条目内年份配置（可选）：在条目内各自设定年份（默认口径：年份下拉，mock 取近年若干年）；可不选，**不选默认当年（当前＝2026）**；各条目年份可互不相同。

11. 条目内维度配置（可选，跨维度多选）：点击条目内【维度选择】，弹出维度选择二级弹窗，**可跨维度累计勾选**多个对象（见下方「维度选择二级弹窗」步骤块）；**确认结果只落到当前条目**并回显跨维度汇总（如「分会×2、法人×1、策进组×1」）；可不配置，全部不选时默认 FII。

12. 条目移除：条目可移除；移除时该指标的年份/维度配置随之丢弃（不可恢复）。

13. 提交：用户一次提交全部已选指标，每个指标携带各自的年份与跨维度对象；不做任何配置直接提交＝全部指标按 当年＋FII 查询（提交按钮的命名与位置以原型为准）。

14. 结果一次性返回：AI 对话框**一次性**返回查询结果，以**一个表格**承载本次提交的全部指标结果，显示在会话区，表格按全局规则 1 带"⚠ AI生成/提取，请人工核实"标注；表格行**一一对应**（行构成已定稿，不再是待确认项）：**每个所选维度对象对应一条数据**——同一指标选 N 个对象（无论同维度内多选还是跨维度多选）即返回 N 行，每行为该对象口径的一条数据（用户口述例证：某指标选 分会·CESBG、法人·富联科技(晋城)、策进组·E策进组 共 3 个对象 → 该指标 3 行）；**不做数值加总、不生成合并/汇总行**；选策进组一级＝该策进组口径 1 行，不展开二级组织、不求和；维度未选的指标按 1 个默认对象 FII 计 1 行；年份列、维度对象列逐行取该指标各自的配置，维度对象列需可区分所属维度（默认口径：单元格显示「维度名 · 对象名」，如「分会层级 · CESBG」，单列还是拆两列**待确认**），**列集已定稿（9/7 拍板「数据来源这一列删除」）＝指标代码、指标名称、年份、维度对象、数值、单位（无数据来源列），仅列序待确认**（如需数据溯源，按全局规则 8 回答出处溯源在回答文字层面处理，不进表格），提交的某指标无查询结果时在表格中如何表现**待确认**（建议口径：保留该指标行，数值等列以"—"占位）；结果表格提供【全屏】按钮（见下方「结果表格全屏」步骤块）。

子树搜索（与上述下钻流程并用，作用于当前停留层级）：

① 输入关键词：用户下钻至任一层级（如主题层）时，在搜索框输入关键词。

② 子树检索：系统在**当前停留层级节点的子树内**检索所有指标（跨下级直达）——停在主题层即可搜到该主题下的所有指标；停留层级越深，检索范围越窄。

③ 仅匹配指标名称：搜索不匹配指标代码；无匹配结果时的空态表现**待确认**（原型 mock 文案："暂无匹配指标"）。

④ 搜索结果勾选：用户在搜索结果中勾选目标指标，效果与逐层勾选相同（同样进入已选指标区成为可配置条目），可多选、可一并提交。

⑤ 搜索范围边界：搜索仅作用于指标选择，不覆盖年份与维度选项（默认口径；维度二级弹窗是否需要提供搜索**待确认**）。

维度选择二级弹窗（从已选指标条目内的【维度选择】入口打开，见主流程步骤 11；叠于数据选择弹窗之上·**跨维度累计勾选＋选中可视化**）：

① 打开二级弹窗：用户在**某条已选指标条目内**点击【维度选择】，弹出维度选择二级弹窗（数据选择弹窗保持打开不关闭；风格对齐现有弹窗，如【🗂】知识库选择弹窗）。

② 跨维度累计勾选：二级弹窗提供四个维度的页签/选项区（1、FII　2、分会层级　3、法人层级　4、策进组层级），**页签带数量角标**（显示该维度已选对象数）；**切换维度不丢已勾选项**——同一指标上可同时勾选 FII＋分会层级若干＋法人层级若干＋策进组层级若干（四维度含 FII 全部可共存、不互斥，9/7 拍板；每个维度内仍多选）。

③ 选 分会层级：单层（扁平）列表，选项为各分会（13 项，清单见下方维度选项规格），**可多选**。

④ 选 法人层级：单层（扁平）列表，选项为各法人（10 项），每项显示 法人代码＋法人名称，**可多选**。

⑤ 选 策进组层级：两级结构——可直接勾选一级策进组（E策进组 / S策进组 / G策进组，勾选＝覆盖该组、不限定二级组织），也可勾选其下二级组织（如 E1气候行动…）；组内**可多选**；允许只选一级、不选二级。

⑥ FII（整体口径）：仅 1 个选项「FII」；**FII＝整体口径选项，可与其他维度对象同时勾选、同时生效（不互斥，9/7 拍板，推翻原「互斥」默认口径）**——例：同时勾 FII＋分会·CESBG＋法人·某法人＝3 行（FII 整体 1 行＋CESBG 1 行＋该法人 1 行），仍一一对应、无累加；唯一保留的默认＝**全部不选**时按 FII 整体口径查询（该指标 1 行整体数据）。

⑦ 页签内选中态（v6 增强）：已勾选对象的行显示明显着色选中态——高亮底色＋勾选标记，与主选择弹窗选中行样式一致；切换到其他页签再切回，选中态保持可见。

⑧ 跨维度已选总览区（v6 增强）：弹窗内提供「已选对象」总览区——每个已选对象一枚彩色 chip，**按所属维度着色**（FII/分会/法人/策进组各一色），chip 文字含维度与对象名（如「分会 · CESBG」「法人 · 富联科技(晋城)」）；随勾选**实时刷新**、**跨页签可见**（当前页签看不到的已选对象也在此呈现——解决「切走页签看不到选了什么」）。

⑨ chip 移除（v6 增强）：点某枚 chip 上的【✕】单独移除该对象——对应页签内该行取消选中、角标数字减一，总览区同步刷新；其他已选对象不受影响。

⑩ 可不选与确认回显：该指标不勾选任何维度对象时，默认 FII（结果中该指标按 1 个默认维度对象「FII」展开）；确认后关闭二级弹窗，**选择结果只落到当前配置的这个指标条目**——条目内回显**跨维度汇总**（如「分会×2、法人×1、策进组×1」），可清除，清除后该指标回到默认 FII；**其他指标条目不受影响**。

维度选项规格与数据来源（各指标条目共用同一套维度选项；**跨维度累计勾选**、选择结果只作用于当前配置的指标条目）：

- **FII**：仅 1 个选项「FII」（无截图，用户口述；整体口径，可与其他维度对象同时勾选、同时生效——不互斥，9/7 拍板，见二级弹窗 ⑥）。
- **分会层级**：扁平单层 13 项——Angel-test、beck-分会、CESBG、CNSBG、iPEBG-iPEG、iPEBG-PMEG、SEG、TARG、TEST、TEST2、WTT-test、Xuyu-Test、zhushen。
- **法人层级**：扁平单层 10 项，每项＝法人代码＋法人名称——Xuyu-test2 法人2；67890 MZ测试；A086440 富联科技(晋城)有限公司；12345 JY测试；A086582 富联科技（山西）有限公司；A084031 富联精密科技公司；A886022-1 鸿佰科技股份有限公司；A886022-2 鸿佰科技股份有限公司-新竹；A886022-3 鸿佰科技股份有限公司-大园；A086996 富联裕康医疗科技(深圳)有限公司。
- **策进组层级**：两级——一级 3 个策进组，各自二级组织：E策进组（E1气候行动、E2能源效率、E3环境保护、E4循环经济、E5绿色产品）；S策进组（S1劳动人权、S2公共发展、S3健康安全、S4化学品安全）；G策进组（G1商业道德-审计处、G2公司治理、G3经济与税务、G4法务合规、G5风险与机遇、G6资讯安全、G7数智化、G8价值链、G9信披治理，及末项「G1商业道德-弊弊防治处」——该名称在截图中被截断，疑为「G1商业道德-弊端防治处」，**待核实**）。
- **数据来源**：分会、法人、策进组三组选项取自系统管理页截图（分会管理/法人管理/策进组管理），其中含系统测试数据条目（如 Angel-test、TEST、TEST2、MZ测试、Xuyu-test2 等），**正式上线前建议数据侧清洗**，正式环境以各管理页实际数据为准。

结果表格全屏（会话区·查询结果卡片，从主流程步骤 14 的结果表格进入）：

① 全屏入口：查询结果卡片内的表格提供【全屏】按钮。

② 进入全屏：用户点击【全屏】，该表格全屏展示（默认口径：覆盖层全屏；实现方式**待确认**——覆盖层还是浏览器原生 Fullscreen API、是否需要移动端适配）。

③ 全屏内容：全屏内容＝该卡片内的表格本身——表头＋全部行（列集同步骤 14：指标代码、指标名称、年份、维度对象、数值、单位，无数据来源列），保留「⚠ AI生成/提取，请人工核实」标注（全局规则 1）与表脚待确认注记。

④ 退出全屏：点击【✕】或按 ESC 退出，回到会话区原位（表格内容与状态不变）。

权限过滤口径**待确认**：本功能可选的指标、维度对象与返回的数据是否按用户权限过滤（建议口径：遵循全局规则 6 AI 权限可见性，仅当前用户权限范围内的指标数据与维度对象可被选取与返回）；本版原型未实现权限过滤。

边界口径：① 同一次提交中，不同指标的年份/维度可互不相同，结果各行按各自配置返回；② 条目未配置的逐条目取默认值——年份未选＝当年（当前＝2026），维度未选/已清除＝FII（该指标按 1 个默认对象展开）；③ 移除指标条目即丢弃该条目的年份/维度（含全部跨维度对象）配置（不可恢复）；④ 同一指标跨维度对象可共存于一次提交（含 FII 在内四维度可任意组合勾选，所有选择都不互斥，9/7 拍板），各对象各出一行；⑤ 策进组只勾选一级＝该策进组整体口径 1 个对象、返回 1 行（不展开二级组织、不求和）；⑥ 全屏中点击【✕】或按 ESC 退出，回到会话区原位，表格内容与状态不变；⑦ 维度弹窗页签切换已选状态保持——切走再切回，行选中态、页签角标、已选总览 chips 均不丢失；⑧ 移除已选对象 chip 仅移除该对象——对应页签行取消选中、角标减一，其他已选对象与总览区不受影响。

本小节待确认事项汇总：① 结果表格列序（列集已定稿＝指标代码/指标名称/年份/维度对象/数值/单位，数据来源列已删除）、某指标无查询结果时的表现（见步骤 14；行构成已定稿＝每个所选维度对象一行、对象与行一一对应，无加总/汇总行）；② 维度对象列形态——单列显示「维度名 · 对象名」还是拆成「维度」＋「对象」两列（见步骤 14，当前默认＝单列）；③ 维度二级弹窗是否需要提供搜索（见子树搜索 ⑤，当前默认＝不提供，搜索仅作用于指标选择）；④ 权限过滤口径（见上方说明）；⑤ 搜索无匹配结果时的空态表现（见子树搜索 ③）；⑥ 全屏实现方式——覆盖层全屏还是浏览器原生 Fullscreen API、是否需要移动端适配（见「结果表格全屏」②，当前默认＝覆盖层）。（原第 ③ 项「FII 可否与其他维度混选」已于 9/7 拍板——四维度含 FII 可任意组合、所有选择不互斥——移出待确认，后续编号前移。）

验收清单（对应需求理解 REQ-01 v6 功能点 FP-1～FP-8 与交互步骤，逐条可验证）：

- [ ] FP-1：管理员打开助手，输入区上方按钮区在【指标信息采集表】之后可见【数据选择】按钮，点击可进入数据选择弹窗
- [ ] FP-1：普通用户打开助手，按钮区不出现【数据选择】按钮（无对应模式与提示）
- [ ] FP-2：第 1 层仅显示 5 个「有效」指标库（E维度/S维度/G维度/SC/O维度指标库），「无效」旧库不显示
- [ ] FP-2：未选择指标库时不能选择下层内容
- [ ] FP-2：可按 指标库→维度→主题→议题→指标 五层逐级下钻
- [ ] FP-2：指标层列表项仅显示 指标代码 + 指标名称，不显示其他字段
- [ ] FP-3：在当前停留层级输入关键词，可搜索到该层级节点子树内的所有指标（跨下级直达）
- [ ] FP-3：停留层级越深，搜索范围越窄
- [ ] FP-3：搜索仅匹配指标名称，不匹配指标代码
- [ ] FP-3：搜索结果中的指标可勾选，效果与逐层勾选相同
- [ ] FP-3：搜索仅作用于指标选择，不覆盖年份与维度选项
- [ ] FP-4：指标可多选，一次提交可包含多个指标
- [ ] FP-4：提交口径（指标级）＝每个指标携带各自的年份与跨维度对象一次性提交，未做任何配置的指标按默认（当年＋FII）提交
- [ ] FP-4：移除已选指标条目后，该条目的年份/维度配置随之丢弃，不参与本次提交
- [ ] FP-5：提交后 AI 一次性以一个表格返回本次全部提交指标的结果
- [ ] FP-5：结果表格行与所选维度对象一一对应——同一指标选 N 个对象（同维度内多选或跨维度多选）即返回 N 行，每行为该对象口径的一条数据；维度未选的指标按默认 FII 计 1 行；年份列、维度对象列逐行取该指标各自的配置
- [ ] FP-5：多选（同维度或跨维度）返回行数与所选对象数一一相等，无数值加总或汇总行
- [ ] FP-5：维度对象列可区分所属维度（默认口径：显示「维度名 · 对象名」，如「分会层级 · CESBG」）
- [ ] FP-5：结果表格列集＝指标代码/指标名称/年份/维度对象/数值/单位（无数据来源列，9/7 拍板）
- [ ] FP-5：结果表格带"⚠ AI生成/提取，请人工核实"标注（全局规则 1）
- [ ] FP-6：每个已选指标条目内各自提供年份选择（默认口径：年份下拉），可不选；不选时该指标按当年（当前＝2026）处理，年份按指标各自生效
- [ ] FP-7：每个已选指标条目内各自提供【维度选择】入口，点击弹出二级弹窗（叠在数据选择弹窗之上），四个维度的选项跨维度累计勾选——切换维度不丢已勾选项、各维度显示已选数量、跨维度同时勾选且维度内多选
- [ ] FP-7：FII 维度仅 1 个选项「FII」；FII 可与其他维度对象同时勾选、同时生效，各自成行（例：FII＋分会·CESBG＋法人·某法人＝3 行，一一对应、无累加；全部不选时默认按 FII 整体口径 1 行）
- [ ] FP-7：分会层级为扁平列表（13 项），可多选
- [ ] FP-7：法人层级选项显示法人代码＋法人名称（10 项），可多选
- [ ] FP-7：策进组层级两级结构——只勾一级策进组＝覆盖该组整组，也可勾选二级组织，组内可多选
- [ ] FP-7：维度可不选或清除，全部未选/清除后该指标默认按 FII 处理
- [ ] FP-7：维度确认后回显在当前指标条目内（跨维度汇总，如「分会×2、法人×1、策进组×1」），可清除；其他指标条目不受影响
- [ ] FP-7：同一指标同时勾选 FII、分会、法人、策进组 各若干对象时，跨维度对象共存、各对象各出一行（所有选择不互斥）
- [ ] FP-7：维度弹窗页签内已勾选对象行着色选中态可见（高亮底色＋勾选标记），切换页签再切回不丢失
- [ ] FP-7：已选对象总览区 chips 按所属维度着色（FII/分会/法人/策进组各一色），随勾选实时更新，跨页签可见
- [ ] FP-7：已选对象 chip 可单独【✕】移除，且联动页签行取消选中与角标减一
- [ ] FP-6/FP-7：同一次提交中两个指标配置不同年份/维度时各自生效，结果各行按各自配置返回
- [ ] FP-8：查询结果卡片内的表格提供【全屏】按钮，点击后该表格全屏展示
- [ ] FP-8：全屏内容＝卡片内表格本身（表头＋全部行），保留「⚠ AI生成/提取，请人工核实」标注与表脚待确认注记
- [ ] FP-8：点击【✕】或按 ESC 退出全屏，回到会话区原位，表格内容与状态不变
- [ ] 待确认项拍板后复核：结果表格列序及无数据表现（列集已定稿，无数据来源列）、维度对象列单列/拆两列、维度弹窗是否需要搜索、权限过滤口径、搜索空态表现、全屏实现方式

## 6.3 报告生成 Agent（分章节 AI 报告生成）

### 6.3.1 进入与生成依据

功能说明：用户切换至「报告生成」模式后，可提供**完全可选**的生成依据：通过 📎 上传本地文档、直接粘贴已有章节内容或素材、用自然语言描述要求、通过 🗂 引用知识库文件（含提示词文档、参考文档、平台指标已关联附件）；目标章节的标题在知识库文件名或生成内容中约定，不在界面选择。

1. 进入：点击【报告生成】，顶部显示模式提示条"当前 Agent：报告生成"，助手发送欢迎语说明各种提供依据的方式。

2. 开始生成：以任一方式（📎 上传 / 🗂 引用 / 粘贴或输入文字）发出第一条内容后，进入固定流程：解析素材 → 指标匹配确认 → 生成报告（见 6.3.2、6.3.3）。

### 6.3.2 指标匹配确认

功能说明：AI 解析素材后列出提取到的指标，并为每一项在平台指标库中给出候选匹配（含匹配分数与该指标当前值），默认采用最高分项；用户逐项确认/调整/跳过后才进入生成，确认结果决定报告中采用的指标与数值。

1. 查看解析结果：素材解析完成后，助手回复"解析完成：提取到 × 个指标"并列出指标名称清单。

2. 逐项确认：助手弹出"请确认指标匹配（× 项）"确认卡片，每项显示序号与素材中的信息点名（如「供应商总数」），其下为候选指标选项列表，每个候选一行、可点选，显示：指标代码、指标名称、匹配分数、该指标当前值预览，默认选中最高分项；用户可改选其他候选。

3. 跳过某项：点选该项的「不采用（跳过该指标，原文保留）」选项，该信息点在报告中保留原文、不替换数值。

4. 自定义指标：点选该项的「其他（手动输入指标名称）」选项，展开输入框，输入名称后点击【确定】，选项标题变为"自定义：××"。

5. 校验与锁定：点击卡片底部【确认匹配】，若某项选了「其他」但未输入名称，则提示"第 × 项选择了「其他」，请输入指标名称后确定"并定位到该输入框、不关闭；校验通过后卡片锁定（所有选项不可再改），按钮变为"✓ 已确认"。

6. 确认汇总：助手回复汇总，如"已确认：×/× 个指标采用，人工调整 × 个，跳过 × 个"。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/M44G5BZJACABY?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6Ik00NEc1QlpKQUNBQlkiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/RWCG5BZJABQFA?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlJXQ0c1QlpKQUJRRkEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

### 6.3.3 报告草稿生成与下载

功能说明：匹配确认后 AI 生成分章节报告草稿（可编辑纯文本，图表与排版由用户后期处理），草稿中必须包含依据平台指标库获取的已收集指标值；不支持全文一次性生成。

1. 生成：确认后助手显示"正在生成报告…"，完成后回复"报告生成完成"，并说明数值替换策略："原文逐字保留，仅将指标数值替换为接口最新值"。

2. 查看与编辑：显示"报告生成结果"文档卡片，标题旁带"⚠ AI生成/提取，请人工核实"角标，正文为可编辑纯文本（点击正文即可直接修改），底部注明"可编辑纯文本 · 指标数值已按接口数据替换"。

3. 复制与下载：点击【复制全文】将正文复制到剪贴板（按钮短暂变为"✓ 已复制"）；点击【下载 .docx】下载 Word 草稿文件（文件名如"报告生成结果（AI草稿）"，含同样的 AI 生成标注）。

4. 长度限制：若单次提问内容超过模型处理范围，提示"当前提问内容过长，请拆分后重试。"；若生成内容超过上下文限制导致无法续写，当前会话中断，提示用户需重新开启对话窗口重新发起，**已生成内容不会自动保留至新对话窗口**，须用户自行复制保存。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/LXBW5BZJAAABQ?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkxYQlc1QlpKQUFBQlEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk4fQ)

## 6.4 指标信息采集表 Agent（上交所采集表自动填充）

### 6.4.1 进入与提供模板

功能说明：整个功能在聊天助手对话界面中完成，**不设独立功能页面**；上交所定量指标采集表模板自动或手动上传至知识库「上交所定量指标信息采集表」文件夹；用户上传或引用模板文档，及输入提示词等其他文件（可选），AI 才开始提取。

1. 进入：点击【指标信息采集表】，顶部模式提示条显示"本期仅支持上交所《2026年FII可持续发展报告》模板"，助手欢迎语按四步说明流程——提供模板文档 → 输入提示词（可选）→ 表格核对与直接修改 → 确认生成；首次使用须提示"后续模板指标变更时，需重新确认并建立映射关系"。

2. 上传/引用：点击【📎】上传模板文档，或点击【🗂】从知识库中引用模板文件；确认后在会话区显示文件卡片，助手提示"可输入提示词（可选），发送后开始提取"，并提供快捷指令【直接开始提取】。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/VN73ZCZJABAHY?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlZONzNaQ1pKQUJBSFkiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk4fQ)

### 6.4.2 提取指标与匹配结果展示（Excel 样式表格）

功能说明：AI 解析模板，提取其中**所有需填写的定量指标**，自动到平台指标库匹配对应指标并读取数值；匹配结果以 Excel 样式表格展示在聊天窗口，行数过多时仅预览前几行，点击可放大查看/编辑完整表格。

1. 开始提取：在对话框输入提示词（可选）后发送，步骤依次为：解析模板文档提取所有需填写的定量指标（共 × 项）→（有提示词时）结合提示词要求 → 从平台指标库匹配对应指标并读取数值（"置信度 ≥ 0.85：× 项 · &lt; 0.85：× 项（建议人工确认）"），**具体置信度数值待算法确认**。

2. 查看预览表格：完成后会话中出现"指标匹配结果（共 × 项 · 表格可编辑）"卡片，表格列为：\#、模板要求字段（提取自模板）、平台指标（匹配）、用户指定年份数值、置信度；置信度**直接显示数值**（≥ 0.85 绿色、&lt; 0.85 橙色提示人工确认，人工修改过的行显示"已修正"），**具体置信度数值待开算法确认**；**超过 6 行时仅显示前 6 行**，表格下方显示提示行"仅预览前 6 行 / 共 × 项 · 点击查看/编辑完整表格 "（该行可点击），卡片底部提供【查看/编辑完整表格】按钮。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/ET2LZCZJADAHQ?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkVUMkxaQ1pKQURBSFEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTkyfQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/HZX35CZJAAQGA?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkhaWDM1Q1pKQUFRR0EiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

### 6.4.3 表格内直接修改与确认

功能说明：用户可在表格中**直接修改**"平台指标"与"数值"单元格；有修改时点击确认，AI 按修改返回更新后的结果（可多轮修改，直至完全准确）；未做任何修改时点击确认，直接进入填充流程。

1. 打开完整表格：点击【查看/编辑完整表格】（或预览卡上的提示行），弹出大窗口"指标匹配结果 · 完整表格（共 × 项）"，窗口顶部显示操作提示；"平台指标""数值"单元格点击即可直接编辑（悬停高亮提示可编辑）。

2. 修改后确认：编辑后点击【确认】，弹窗关闭，助手显示进度卡片（逐条列出修改处，如"第×行 平台指标 → ××"）并重新校验数值，随后返回**更新后的匹配表**——被修改行状态显示"已修正"、其余行不变，可继续修改再确认，循环直至无误。

3. 修改生效规则如下：若仅调整平台指标项，则需重新触发大模型进行匹配运算；若修改内容为具体数值，则直接采纳用户输入作为最终结果。

4. 无修改确认：未做任何修改时点击【确认】，直接进入填充流程（见 6.4.4）。

5. 取消：点击【取消】或右上【✕】关闭弹窗，本次修改不生效。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/MK335CZJABAA4?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6Ik1LMzM1Q1pKQUJBQTQiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/S4SL7CZJABQFA?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlM0U0w3Q1pKQUJRRkEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

### 6.4.4 自动填充与报告下载

功能说明：确认（无修改）后，AI 从平台指标库抓取数值、按模板原格式实时填充到采集表模板，生成 Word 报告文件返回聊天窗口供下载；AI 只填充所有定量指标数据，不对其他内容做处理。

1. 填充：助手显示进度卡片"自动填充并生成报告"，步骤依次为：锁定确认后的映射关系（× 项，含人工修正 × 项）→ 从平台指标库抓取年度数值（"×/× 项获取成功"）→ 按模板原格式填充并生成 Word 文件。

2. 下载：完成后会话中出现文件下载卡片（文件名如"工业富联\_ESG信息采集表\_定量指标（已填充2025年数据）.docx"、说明"Word 格式 · 与原模板格式一致 · 定量指标已全部填充"、按钮【下载文件】），卡片下方注明"填充数值与平台录入数据一致（目标100%准确率，请人工复核）"。

3. 复用与后续：下载后助手提示"本次确认的指标映射关系已自动存入知识库「上交所定量指标信息采集表」文件夹，后续可直接复用，无需重新匹配"；并提供快捷指令【重新匹配模板】。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/QWB37CZJACQGE?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IlFXQjM3Q1pKQUNRR0UiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

## 6.5 全局AI 智能助手检索与附件内容提取（智能问答模式）

### 6.5.1 知识库检索

功能说明：用户在助手对话框中提问知识库内容，AI 在**本人权限范围内**检索，并以目录卡片返回结果。

1. 检索：发送如"知识库里有哪些文件？"，助手显示"正在检索知识库…"，随后显示进度卡片（步骤：按用户权限过滤文件树），完成后以卡片列出知识库各文件夹（名称、文件数、分类标签），卡片底部附"以上为你权限范围内可见的知识库目录"，并追问是否需要继续检索、总结或引用。

### 6.5.2 附件内容定向提取

功能说明：用户以自然语言指令（可指定指标、知识库中的指标文件或提示词文档）、或本地上传文档、知识库引用等方式，让 AI 自动在各单位提交的平台附件，或者数据中检索并提取对应内容；提取结果按指令要求分门别类呈现（指令有序号则输出按序号对应），并**注明信息出处**（指标名、附件文件名、页码/Sheet、段落/行列位置）。

1. 提取：发送如"帮我提取附件中的员工数据"，助手依次显示进度卡片：定位指标附件 → 解析附件文本内容（附明细，如"Sheet1 · 表头1行 · 数据7行（非文本内容不解析）"）→ 按指令分门别类提取并标注出处。

2. 查看结果：完成后以表格返回提取结果（列：项目、数值、出处；出处精确到"文件名 · Sheet · 第×行"），表尾显示"若附件中仅有一处对应内容，AI 将精准抓取（准确率目标100%，请人工核实）"。

3. 继续追问：提取完成后助手询问是否继续提取其他附件或生成报告，用户点击快捷指令或继续输入指令。

## **6.6 进度管理报告 AI 分析（监控看板 · 指标收集进度详情页**）

> 模块状态：本需求具体细节尚未锁定（业务方未提供进度报告所需展示的具体指标内容、AI 分析框架及输出规范），以下按原型交互先行描述，待业务方补充后确认。

### 6.6.1 页面下载入口

功能说明：各级管理者（可持续发展中心、策进组、事业群/分会、法人）在"监控看板-指标收集进度详情"页面页头，可将本页数据导出为 Word，或发起本页面专属的 AI 分析；页面专属助手与全局 AI 助手相互独立，但界面风格统一（同一配色、同一输入框样式）。

1. 打开浮框：点击页头右侧【下载】按钮，按钮正下方弹出"请选择操作"浮框，含两个选项：【下载页面数据（Word）】与【 AI 分析（生成报告）】；点击页面其他位置浮框关闭。

2. 下载页面数据：点击【下载页面数据（Word）】，直接下载本页数据的 Word 文件（含申请单信息与指标进度表，文件名如"指标收集进度详情\_单号（页面数据）.doc"）。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/HKXWTBZJAAQAQ?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkhLWFdUQlpKQUFRQVEiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk2fQ)

### 6.6.2 AI 页面分析助手

功能说明：AI 分析仅基于**当前页面数据**与用户提供的提示词/知识库附件生成，输出结构化分析文本（进度总结、存在问题、改善建议与预警提醒），可编辑并可连同页面数据合并导出为 Word（仅支持 .docx，不支持 PDF）；分析数据与页面显示一致（准确率目标 100%）。

1. 打开抽屉：点击【AI 分析（生成报告）】，右侧滑出"AI 页面分析助手"抽屉（本页面专属），顶部标注"仅分析当前页面数据"；首次打开时欢迎语说明已读取的当前页面数据（申请单号、任务名、总进度、指标数），**该页面的具体展示内容待业务方确认**。

2. 选择依据（可选）：点击输入框内左侧的【🗂】小按钮，会话中出现"从知识库选择附件（可多选）"卡片，逐个勾选附件（显示文件名与分类标签）后点击【确认引用】，或者点击【📎】本地上传附件，引用记录显示在会话区，助手提示可输入分析要求或直接开始分析。

3. 发起分析：在输入框输入提示词（如"分析本单进度并给出跟催建议"）后发送，或点击快捷指令；助手显示进度卡片"生成页面分析"，步骤依次为：读取当前页面数据（附单号/进度/指标数明细）→ 结合提示词与知识库附件（列出引用的附件名；未引用时注明"仅按提示词与页面数据生成"）→ 生成分析（进度总结 / 问题 / 建议与预警）。

4. 查看与编辑：完成后显示"页面进度分析（AI 草稿 · 可编辑）"卡片，带"⚠ AI生成/提取，请人工核实"角标，正文可直接编辑修改；底部注明"下载 = 页面数据 + 本分析文本（含你的修改）"。

5. 导出：点击【复制分析】复制分析文本；点击【下载完整报告（Word）】将"页面数据 + AI 分析（含用户修改）"合并为一个 Word 文件下载（与页头浮框中仅导出页面数据的下载区分）。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/Z2TGVBZJAAQGA?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IloyVEdWQlpKQUFRR0EiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk4fQ)

### 6.6.3 权限隔离（硬性要求）

功能说明：AI 分析仅能基于当前用户所属单位/角色的可见数据生成；不同人登录后，分析内容不得包含其他数据。

1. 验证方式：需以不同角色模拟登录进行验证，确认各自报告中只含自己可见的数据。

## 6.7 指标附件 AI 总结（编辑指标对话框）

> 模块状态：业务方尚未确定是否采纳本方案，待确认后实施；以下按原型交互先行描述。

### 6.7.1 上传附件与触发总结

功能说明：填报人在「工作台-我的待办-具体工单- 指标列表-编辑指标的按钮的【编辑】」对话框的"补充附件"处上传附件（单个或多个）后，由用户**主动选择**是否点击AI总结按钮触发 AI 总结；AI 以\*\*该指标的描述文本（统计口径），作为提示词核心依据，对附件内容做聚焦性总结与提取，结果为结构化、可编辑的纯文本，与该指标绑定存储。

1. 上传附件：在"补充附件"处点击【上传】选择本地文件（可连续添加多个），已传文件以列表显示（文件名、大小、每行【✕】移除）；**无文件时不显示 AI 总结按钮**。

2. 触发总结：点击随后出现的【AI 总结】按钮（悬停提示"基于该指标的描述自动总结附件内容"），右侧滑出"AI 附件总结助手"抽屉（本附件专属，界面风格与全局助手统一：同一配色与输入框样式），抽屉顶部显示当前附件名与指标名称、带"本附件专属"标识。

3. 无关确认：若指标无附件、或附件内容与指标描述无关，系统提示用户确认是否仍需生成总结；用户不触发时，附件仅作为普通文件存储，不生成 AI 总结。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/ASGORCZJABABU?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IkFTR09SQ1pKQUJBQlUiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

### 6.7.2 自动总结与应用到表单

1. 自动总结：抽屉打开后自动执行，进度卡片步骤依次为：读取附件 → 以指标「××」的描述（统计口径）作为提示词 → 生成结构化总结文本；完成后显示"附件总结（v1）· 可编辑"卡片（带 AI 核实角标），正文可直接编辑。

2. 应用到表单：点击卡片底部【应用到「指标值(文本)」】，总结文本填入编辑指标表单的"指标值(文本)"输入框（输入框闪烁提示已更新），会话中显示"已应用到「指标值(文本)」，可在页面表单中继续人工修改"；应用后仍可回到助手继续修改并再次应用。

3. 关闭抽屉：点击抽屉右上【✕】或遮罩关闭，可随时重新打开。

   ![图片](http://www.kdocs.cn/api/v3/office/copy/NWVkMjFIT1ZBRTV1NGdiOGtGZG5kZDgyUTltMHh0WngvTUI0ZFV4ZGFVSFJpeWU4MDRneldsdlFIeWR6VlhDMHVBMGRSMW91ZkhNa25nY2FEQ3lnZFV0RGVQRzhubFlSNWp2bE5YUXRsWUtIMHBJbUh2QVVhLzRZbWNhYVdRYm1UQlVuckl0c2JtT3Era09VL0VqemZ4SVh4MkpSY3Eza2N2N09iWjBlTzFOc3gvTVU5S011Yy9VKzJjQkRseEF2T0NUMnptcHdSeE0wSzBZNzhqR09ZSVkzZ3NlaUQwTHVsZGpEKzBRNjVHWWFWTmcyakVaRVNKemliaFBNSHF4YzU0cVNFekd4UlA0PQ==/attach/object/6DUORCZJAAACS?&kso_type=image&kso_extra=eyJ0eXBlIjoiaW1hZ2UiLCJpZCI6IjZEVU9SQ1pKQUFBQ1MiLCJvd25lciI6IjU0NTQ2MDE0OTU0MyIsInJvdGF0ZSI6MCwic3RvcmFnZSI6ImJhc2UiLCJ3aWR0aCI6Mjk0MCwiaGVpZ2h0IjoxNTk0fQ)

### 6.7.3 多轮修改与版本管理

功能说明：总结文本与指标绑定存储为该指标的文本化内容资产；系统保留修改历史（AI 各版生成 + 各次人工修改），支持回溯查看。

1. 提出修改：在抽屉输入框输入修改要求（如"补充2024年对比""精简一点""按年份拆分"）发送，AI 按反馈迭代输出新版本卡片（v2、v3…），并回复已按要求调整的说明。

2. 版本回看：历史版本卡片保留在会话上方可回看，每个版本均可编辑；每次修改后的版本均可被确认并应用为最终版本（点击该版卡片的【应用最新版到「指标值(文本)」】）。

3. 引用文件参考：点击输入区【🗂】按钮，弹出"从知识库选择参考文件"窗口（文件夹树多选，与全局助手一致），或从本地上传附件，点击【确认引用】后 AI 将所选文件纳入参考依据、结合附件内容重新整理总结，输出新版本。

### 6.7.4 报告生成时的引用规则（须在界面说明）

1. 默认规则：后续使用 AI 生成报告涉及该指标时，AI **默认仅读取该指标的总结文本内容**（已确认版本），不再重新访问或解析原始附件。

2. 显式指定：仅当用户在对话框中单独明确指定（如勾选"引用原始附件"或明确文字指令）时，AI 才重新读取和解析附件原文。

3. 界面说明：上述规则须在 AI 报告生成相关界面中向用户明示，避免误解。

## 8 待业务方确认事项

|**事项**|**现状**|**说明**|
|---|---|---|
|知识库权限管理|已明确|上传时按人员设定可见范围（不选默认对所有人可见），所有 AI 助手仅能触达用户权限内文件（全局规则 3、6）|
|Agent 功能角色开放|已明确|报告生成/采集表按钮、【弹窗映射表分区】与「信息采集指标映射表」菜单仅管理员可见；管理员由平台后端指定（全局规则 7）|
|独立访问日志|不开发|经业务方确认，文件可见性已由系统权限体系控制，本次不开发独立 AI 访问日志功能|
|敏感词清单|待业务方提供|敏感字段（如薪资）由业务方提供后，AI 按 1.5 固定话术回应|
|文件分类标签是否必选|以确认|原型按"可选、可多个"实现；|
|需求四（进度报告）细节|待业务方补充|展示指标内容、AI 分析框架及输出规范未锁定|
|需求五（指标附件总结）方案|待业务方确认|是否采纳待确认后实施|


