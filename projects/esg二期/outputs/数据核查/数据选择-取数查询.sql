-- ============================================================
-- ESG 二期 · REQ-01 全局AI助手·数据选择（v6）—— 取数查询验证版
-- ============================================================
-- 目的：验证 chat-widget.js 原型「数据选择」各环节所需数据，
--       均可从 test_csr_ai_db_config 库用只读 SELECT 拉到。
-- 用法：Navicat 连接 localhost:13306（账号 usr-esg-readonly，只读），
--       逐段执行查看结果。全部为 SELECT，无任何写操作。
-- 环境：test_csr_ai_db_config（测试库，2026-09-07 数据快照）
--
-- 表→原型概念 对应关系：
--   第1层 指标库       tb_flow_index_library (+ _lang 中文名)
--   第2层 维度         tb_flow_index_category level=1
--   第3层 主题         tb_flow_index_category level=2
--   第4层 议题         tb_flow_index_category level=3
--   第5层 指标         tb_flow_index (+ _lang 名称/单位)
--   维度对象·分会      csr_bg_group（13 行）
--   维度对象·法人      csr_legal_entity（48 行）
--   维度对象·策进组    csr_esg_group（11 行）+ tb_esg_grp_cent_org（二级组织 46 行）
--   年份+数值          tb_sur(调研,collect_time=收集时间)
--                     → tb_sur_bg_grp_fm(分会单据)
--                     → tb_sur_bg_grp_fm_idx_item(指标值 index_value，
--                        collect_type: ENTITY法人/BG分会/CENT中央/DEPT职能部门)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 一、第 1 层 · 指标库列表（仅「有效」库）
--     对应原型：打开数据选择弹窗首屏的指标库列表
-- ════════════════════════════════════════════════════════════
-- 注意：当前测试库 valid=1 的库有 6 个（比原型 mock 的 5 个多一个
--「可持续发展报告项目指标库（1103旧）」），上线口径需与开发确认是否排除旧库。
SELECT
    l.id                    AS 库id,
    l.flow_index_library_code AS 库代码,
    ll.flow_index_library_name AS 库名称,
    (SELECT COUNT(*) FROM tb_flow_index i
      WHERE i.flow_index_library_id = l.id AND i.valid = 1) AS 有效指标数
FROM tb_flow_index_library l
LEFT JOIN tb_flow_index_library_lang ll
       ON ll.flow_index_library_id = l.id AND ll.lang_code = 'zh_CN'
WHERE l.valid = 1
ORDER BY l.id;


-- ════════════════════════════════════════════════════════════
-- 二、第 2~4 层 · 维度→主题→议题 下钻（以 E 维度指标库为例）
--     对应原型：点进某指标库后的三层单选下钻
-- ════════════════════════════════════════════════════════════
-- 2.1 维度（level=1）——E 库当前只有「环境」1 个维度
SELECT c.id, cl.flow_index_category_name AS 维度名
FROM tb_flow_index_category c
JOIN tb_flow_index_category_lang cl
  ON cl.flow_index_category_id = c.id AND cl.lang_code = 'zh_CN'
WHERE c.flow_index_library_id = (SELECT id FROM tb_flow_index_library WHERE flow_index_library_code='E')
  AND c.flow_index_category_level = 1;

-- 2.2 主题（level=2，父级=环境）——共 15 个，含原型 mock 的「能源」「环境政策与管理体系」
SELECT c.id, cl.flow_index_category_name AS 主题名,
       (SELECT COUNT(*) FROM tb_flow_index_category x
         WHERE x.parent_id = c.id) AS 下级议题数
FROM tb_flow_index_category c
JOIN tb_flow_index_category_lang cl
  ON cl.flow_index_category_id = c.id AND cl.lang_code = 'zh_CN'
WHERE c.parent_id = (SELECT id FROM tb_flow_index_category
                      WHERE flow_index_library_id = (SELECT id FROM tb_flow_index_library WHERE flow_index_library_code='E')
                        AND flow_index_category_level = 1)
ORDER BY cl.flow_index_category_name;

-- 2.3 议题（level=3，父级=「能源」主题）——指标挂在这一层
SELECT c.id, cl.flow_index_category_name AS 议题名,
       (SELECT COUNT(*) FROM tb_flow_index i
         WHERE i.flow_index_category_id = c.id AND i.valid = 1) AS 直挂指标数
FROM tb_flow_index_category c
JOIN tb_flow_index_category_lang cl
  ON cl.flow_index_category_id = c.id AND cl.lang_code = 'zh_CN'
WHERE c.parent_id = (SELECT id FROM tb_flow_index_category
                      WHERE flow_index_library_id = (SELECT id FROM tb_flow_index_library WHERE flow_index_library_code='E')
                        AND flow_index_category_level = 2
                        AND EXISTS (SELECT 1 FROM tb_flow_index_category_lang l2
                                     WHERE l2.flow_index_category_id = (SELECT id FROM tb_flow_index_category LIMIT 0)
                                       AND l2.flow_index_category_name = '能源'))
ORDER BY cl.flow_index_category_name;

-- （上面 2.3 的嵌套写法仅为免写死 id 的示意；实际使用可直接按 id 查：）
-- SELECT c.id, cl.flow_index_category_name AS 议题名
-- FROM tb_flow_index_category c
-- JOIN tb_flow_index_category_lang cl ON cl.flow_index_category_id=c.id AND cl.lang_code='zh_CN'
-- WHERE c.parent_id = 1985589427960205314;  -- 「能源」主题 id（E 库）


-- ════════════════════════════════════════════════════════════
-- 三、第 5 层 · 指标列表（代码 + 名称，多选勾选行）
--     对应原型：议题层的指标勾选列表（仅显示指标代码与指标名称）
--     示例：「能源」主题下「直接能源消耗量」议题的指标
-- ════════════════════════════════════════════════════════════
SELECT i.index_code  AS 指标代码,
       il.index_name AS 指标名称,
       il.index_unit AS 单位,
       i.index_type  AS 定性定量,   -- N定量 / W定性（决定「数值」列是数字还是文本）
       i.valid       AS 有效
FROM tb_flow_index i
JOIN tb_flow_index_lang il ON il.index_id = i.id AND il.lang_code = 'zh_CN'
WHERE i.flow_index_category_id = 1985589427960205342   -- 「直接能源消耗量」议题 id
ORDER BY i.index_code;


-- ════════════════════════════════════════════════════════════
-- 四、子树搜索（按指标名称，跨下级直达）
--     对应原型：搜索框——当前停留层级子树内、仅匹配指标名称
--     示例：在「能源」主题子树搜名称含「消耗」的指标
-- ════════════════════════════════════════════════════════════
WITH RECURSIVE sub AS (
    SELECT id FROM tb_flow_index_category WHERE id = 1985589427960205314  -- 「能源」主题
    UNION ALL
    SELECT c.id FROM tb_flow_index_category c JOIN sub ON c.parent_id = sub.id
)
SELECT i.index_code AS 指标代码, il.index_name AS 指标名称, il.index_unit AS 单位
FROM tb_flow_index i
JOIN tb_flow_index_lang il ON il.index_id = i.id AND il.lang_code = 'zh_CN'
JOIN tb_flow_index_category c ON c.id = i.flow_index_category_id
WHERE c.id IN (SELECT id FROM sub)
  AND il.index_name LIKE '%消耗%'
ORDER BY i.index_code;


-- ════════════════════════════════════════════════════════════
-- 五、指标级配置 · 年份下拉（近六年）
--     对应原型：每个已选指标条目内的年份下拉
--     年份来自调研的收集时间（当前测试库分布：2025/2026/2027）
-- ════════════════════════════════════════════════════════════
SELECT DISTINCT YEAR(s.collect_time) AS 可选年份
FROM tb_sur s
ORDER BY 1 DESC;


-- ════════════════════════════════════════════════════════════
-- 六、维度选择二级弹窗 · 三类对象清单
--     对应原型：分会 / 法人 / 策进组(两级) 三个页签的选项列表
-- ════════════════════════════════════════════════════════════
-- 6.1 分会层级（13 行，与原型 DIM_BRANCHES 一致）
SELECT id, name AS 分会名称, code AS 分会代码
FROM csr_bg_group ORDER BY id;

-- 6.2 法人层级（测试库 48 行；原型 mock 只列了 10 项）
SELECT id, code AS 法人代码, name_cn AS 法人名称
FROM csr_legal_entity ORDER BY id;

-- 6.3 策进组层级（两级）
--     注意：测试库共 11 个一级策进组（E/S/G 之外还有 8 个测试组），
--     正式版若只出 E/S/G 需另加过滤口径（如按名称/代码前缀）。
SELECT g.id  AS 策进组id,
       g.name AS 一级策进组,
       o.cent_org AS 二级组织
FROM csr_esg_group g
LEFT JOIN tb_esg_grp_cent_org o ON o.esg_group_id = g.id
ORDER BY g.id, o.id;


-- ════════════════════════════════════════════════════════════
-- 七、结果表查询（核心）· 指标 × 年份 × 维度对象 → 数值
--     对应原型：提交查询后返回的 6 列结果表
--     （指标代码/指标名称/年份/维度对象/数值/单位；每个所选维度对象一行）
--     三种收集口径 UNION ALL 合一；示例指标 L-S-1-2-0005（全体员工中女性人数）
-- ════════════════════════════════════════════════════════════
-- 7.1 法人层级口径（collect_type='ENTITY'，值行挂法人 id）
SELECT i.index_code                          AS 指标代码,
       il.index_name                         AS 指标名称,
       YEAR(s.collect_time)                  AS 年份,
       CONCAT('法人层级 · ', le.code, ' ', le.name_cn) AS 维度对象,
       COALESCE(NULLIF(it.index_value,''), '—') AS 数值,      -- 无数据以 — 占位（原型定稿口径）
       il.index_unit                         AS 单位
FROM tb_sur_bg_grp_fm_idx_item it
JOIN tb_sur s               ON s.id  = it.sur_id
JOIN tb_sur_bg_grp_fm fm   ON fm.id = it.sur_bg_grp_fm_id
JOIN csr_legal_entity le   ON le.id = it.legal_entity_id
JOIN tb_flow_index i       ON i.id  = it.index_id
JOIN tb_flow_index_lang il ON il.index_id = i.id AND il.lang_code='zh_CN'
WHERE it.collect_type = 'ENTITY'
  AND i.index_code = 'L-S-1-2-0005'
  AND YEAR(s.collect_time) = 2025;

-- 7.2 分会层级口径（collect_type='BG'，值行挂分会单据的分会 id）
SELECT i.index_code                          AS 指标代码,
       il.index_name                         AS 指标名称,
       YEAR(s.collect_time)                  AS 年份,
       CONCAT('分会层级 · ', bg.name)         AS 维度对象,
       COALESCE(NULLIF(it.index_value,''), '—') AS 数值,
       il.index_unit                         AS 单位
FROM tb_sur_bg_grp_fm_idx_item it
JOIN tb_sur s               ON s.id  = it.sur_id
JOIN tb_sur_bg_grp_fm fm   ON fm.id = it.sur_bg_grp_fm_id
JOIN csr_bg_group bg       ON bg.id = fm.bg_group_id
JOIN tb_flow_index i       ON i.id  = it.index_id
JOIN tb_flow_index_lang il ON il.index_id = i.id AND il.lang_code='zh_CN'
WHERE it.collect_type = 'BG'
  AND i.index_code = 'L-S-1-2-0005'
  AND YEAR(s.collect_time) = 2025;

-- 7.3 策进组/中央单位口径（collect_type='CENT'，值行挂中央单位）
--     注意：tb_sur_bg_grp_fm_cent.cent_name 是收集时录入的名称快照（自由文本），
--     与 csr_esg_group 的关联需经 tb_sur.esg_group_id / 策进组链表，正式版建议以 id 关联。
SELECT i.index_code                          AS 指标代码,
       il.index_name                         AS 指标名称,
       YEAR(s.collect_time)                  AS 年份,
       CONCAT('中央单位 · ', c.cent_name)     AS 维度对象,
       COALESCE(NULLIF(it.index_value,''), '—') AS 数值,
       il.index_unit                         AS 单位
FROM tb_sur_bg_grp_fm_idx_item it
JOIN tb_sur s                    ON s.id  = it.sur_id
JOIN tb_sur_bg_grp_fm_cent c     ON c.id  = it.sur_bg_grp_fm_cent_id
JOIN tb_flow_index i             ON i.id  = it.index_id
JOIN tb_flow_index_lang il       ON il.index_id = i.id AND il.lang_code='zh_CN'
WHERE it.collect_type = 'CENT'
  AND i.index_code = 'L-S-1-2-0005'
  AND YEAR(s.collect_time) = 2025;

-- 7.4 三口径合并（正式接口可按此形状实现：传入 指标代码列表+年份+维度对象列表，
--     每个所选维度对象各一行，无数值加总 —— 与原型「选择与返回一一对应」一致）
SELECT 指标代码, 指标名称, 年份, 维度对象, 数值, 单位
FROM (
    SELECT i.index_code AS 指标代码, il.index_name AS 指标名称,
           YEAR(s.collect_time) AS 年份,
           CONCAT('法人层级 · ', le.code, ' ', le.name_cn) AS 维度对象,
           COALESCE(NULLIF(it.index_value,''), '—') AS 数值,
           il.index_unit AS 单位,
           le.id AS 对象id
    FROM tb_sur_bg_grp_fm_idx_item it
    JOIN tb_sur s ON s.id=it.sur_id
    JOIN tb_sur_bg_grp_fm fm ON fm.id=it.sur_bg_grp_fm_id
    JOIN csr_legal_entity le ON le.id=it.legal_entity_id
    JOIN tb_flow_index i ON i.id=it.index_id
    JOIN tb_flow_index_lang il ON il.index_id=i.id AND il.lang_code='zh_CN'
    WHERE it.collect_type='ENTITY' AND i.index_code='L-S-1-2-0005'
      AND YEAR(s.collect_time)=2025
    UNION ALL
    SELECT i.index_code, il.index_name,
           YEAR(s.collect_time),
           CONCAT('分会层级 · ', bg.name),
           COALESCE(NULLIF(it.index_value,''), '—'),
           il.index_unit,
           bg.id
    FROM tb_sur_bg_grp_fm_idx_item it
    JOIN tb_sur s ON s.id=it.sur_id
    JOIN tb_sur_bg_grp_fm fm ON fm.id=it.sur_bg_grp_fm_id
    JOIN csr_bg_group bg ON bg.id=fm.bg_group_id
    JOIN tb_flow_index i ON i.id=it.index_id
    JOIN tb_flow_index_lang il ON il.index_id=i.id AND il.lang_code='zh_CN'
    WHERE it.collect_type='BG' AND i.index_code='L-S-1-2-0005'
      AND YEAR(s.collect_time)=2025
    UNION ALL
    SELECT i.index_code, il.index_name,
           YEAR(s.collect_time),
           CONCAT('中央单位 · ', c.cent_name),
           COALESCE(NULLIF(it.index_value,''), '—'),
           il.index_unit,
           c.id
    FROM tb_sur_bg_grp_fm_idx_item it
    JOIN tb_sur s ON s.id=it.sur_id
    JOIN tb_sur_bg_grp_fm_cent c ON c.id=it.sur_bg_grp_fm_cent_id
    JOIN tb_flow_index i ON i.id=it.index_id
    JOIN tb_flow_index_lang il ON il.index_id=i.id AND il.lang_code='zh_CN'
    WHERE it.collect_type='CENT' AND i.index_code='L-S-1-2-0005'
      AND YEAR(s.collect_time)=2025
) t
ORDER BY 维度对象;


-- ════════════════════════════════════════════════════════════
-- 八、单指标单年份直查（最常用模板）
--     例子：SC-SC-1-1-0001 · 2025 年
--     用法：改两处——index_code 的指标代码、YEAR() 里的年份。
--     说明：库里没有单独的「FII 整体」一行，FII＝该指标该年所有
--     收集口径（法人/分会/中央单位/职能部门）交上来的值放在一起看，
--     所以结果会出多行（每行=一张问卷里某个对象的一次填报）。
-- ════════════════════════════════════════════════════════════
SELECT i.index_code  AS 指标代码,
       YEAR(s.collect_time)                     AS 年份,
       'FII'                                    AS 维度对象,
       COALESCE(NULLIF(it.index_value,''), '—') AS 数值,     -- 空=没人填过 → —
       it.collect_type                          AS 收集口径, -- ENTITY法人/BG分会/CENT中央/DEPT职能部门
       CASE it.collect_type
         WHEN 'ENTITY' THEN CONCAT('法人·', le.name_cn)
         WHEN 'BG'     THEN CONCAT('分会·', bg.name)
         ELSE '中央单位/职能部门'
       END                                      AS 谁填的,
       s.case_no                                AS 所属问卷,
       s.survey_state                           AS 问卷状态
FROM tb_sur_bg_grp_fm_idx_item it
JOIN tb_sur s                 ON s.id  = it.sur_id
JOIN tb_flow_index i          ON i.id  = it.index_id
LEFT JOIN csr_legal_entity le ON le.id = it.legal_entity_id
LEFT JOIN tb_sur_bg_grp_fm fm ON fm.id = it.sur_bg_grp_fm_id
LEFT JOIN csr_bg_group bg     ON bg.id = fm.bg_group_id
WHERE i.index_code = 'SC-SC-1-1-0001'      -- ① 改成要查的指标代码
  AND YEAR(s.collect_time) = 2025           -- ② 改成要查的年份
ORDER BY s.case_no, it.collect_type;


-- ════════════════════════════════════════════════════════════
-- 附：本次核查发现的口径问题（写进需求/开发文档前先与开发对齐）
-- ════════════════════════════════════════════════════════════
-- ① FII 整体口径：测试库 tb_sur.survey_type 目前全是 'ESG'，
--    「指标汇总定稿版本表」tb_sur_idx_summary 为 0 行 ——
--    原型「全部不选＝按 FII 整体查询 1 行」在当前库中无直接数据来源，
--    需开发定义（按 agg_method 跨法人加总，或走汇总定稿表）。
-- ② 年份语义：tb_sur.collect_time 是「收集时间」（如 2026-01-01 发起收集），
--    而指标名称带「- 2025」后缀 ——「年份」下拉若指数据年度而非收集年度，
--    映射规则（收集年 vs 数据年）需与开发确认。
-- ③ 有效指标库：valid=1 共 6 个（含旧库「1103旧」），原型 mock 为 5 个，
--    上线需确认是否排除旧库。
-- ④ 策进组：库中 11 个一级组（含 8 个测试组），原型只显示 E/S/G，
--    需确认过滤口径；G 组末项名称确认为「G1商业道德-弊端防治处」
--    （原型注释里的「弊弊防治处」为誊写笔误）。
-- ⑤ index_value 为 varchar：定量/定性混存，数值列展示需按 index_type 处理；
--    且同一指标-法人-年份可能存在多张问卷（多次收集/测试单），正式版需定去重口径
--    （如取最新完成的问卷：s.survey_state='COMPLETED' + it.wrote_time 最大）。
