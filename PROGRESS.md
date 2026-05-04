# Progress

## 当前状态
- Web 端（`ts/`）可运行：TypeScript + DOM + GSAP，Vite 构建
- 配置集中在 `ts/public/definition/`（*_definition.csv + deck_effects.json + shopdefinition.json）
- 已接入：27 关卡流程、初始卡套选择、关卡选择页、Claim 奖励查看页与分区商店页、特殊牌展示与购买、三色格与击穿翻倍等

## 最近完成
- 统一配置目录：CSV/JSON 迁移至 `ts/public/definition/`，并更新加载路径
- deckdefinition 接入：卡组选择由定义文件驱动，支持新增特殊卡组
- 新规则：三色格（TRICOLOR）与击穿翻倍计分；回合结束按剩余手牌发钱
- 新流程：初始卡套选择 -> LEVEL_SELECTION -> PLAYING；ROUND_REWARD -> SHOP -> LEVEL_SELECTION/通关
- 2026-04-16T00:00:00+08:00 添加子工程 agent 规范：`agent/skills/ts.md`（TS+GSAP）与 `agent/skills/godot.md`（Godot C#）
- 2026-04-16T00:10:00+08:00 优化滚轮翻转交互：持续同向滚动不重复翻转，需换向或停 0.5s 再触发
- 2026-04-17T00:55:00+08:00 `ts/` 接入卡套/礼品卡主链：商店可购买 Special/Sleeve/Gift Card，卡套被动生效，礼品卡进入库存并可在对局中使用；同步补充覆盖清单与 requirement
- 2026-04-17T01:25:00+08:00 `ts/` 商店重构：移除 Special 出售，改为 sleeve/gift card/card 三类；支持 direct 与 pack（2/3 选 1），新增 shopdefinition 与永久牌库模板
- 2026-04-19T12:00:00+08:00 `ts/` 资产结构整理：新增 `content_status.csv`、`deck_catalog.csv`、`deck_cards.csv`、`deck_effects.json`、`card_catalog.csv`；卡组初始资源改为按 `deck_id` 维护，三类定义改从统一状态总表过滤；移除旧的 `initial.csv` / `deckdefinition.json` / `effecttoggle.csv`
- 2026-04-20T10:00:00+08:00 `ts/` 新增多语言自动识别功能：读取系统/浏览器语言（`navigator.language`），自动匹配中文（简/繁）、日文或回退至英文，并将用户手动切换偏好存入 `localStorage`。
- 2026-04-20T10:15:00+08:00 `ts/` 新增初始卡套选择流程：在卡组选择后，随机抽取 3 个卡套供玩家 3 选 1，然后再进入第一关。
- 2026-04-25T23:36:06+08:00 `ts/` 固定 Vite dev server 端口为 `5739`，并启用 `strictPort` 以避免与其他项目自动抢占/漂移端口。
- 2026-04-27T00:35:53+08:00 `ts/` 根据新主页视觉稿重做游戏实机页面美术：左侧改为 Roshambo/关卡目标/总分与基础分倍率/金币信息板，右侧改为浅色像素桌面、顶部三奖励槽、中央矩阵桌布与底部居中扇形手牌；保留手牌、矩阵块与卡背原始图片资产及渲染比例。
- 2026-04-28T02:12:57+08:00 `ts/` 修正像素 UI 细节：接入 Fusion Pixel 字体，补齐中/繁/日 UI 文案，调整按钮 hover/居中/对齐、金币右对齐、桌垫宽度、pick 状态虚线与手牌下沉，并移除中央 PK 公式条。
- 2026-04-29T21:11:01+08:00 `ts/` 新增首页卡组选择界面：按设计稿加入 Roshambo 标题、卡组轮播、预览与底部主菜单按钮；Start 会使用当前卡组进入初始卡套选择。同步修复 pick 预览状态下手牌被隐藏的问题。
- 2026-04-29T21:50:30+08:00 `ts/` 调整首页比例策略：改为固定 16:9 设计画布等比缩放，避免浏览器缩放/小 viewport 下卡组卡片、圆点和底部按钮被挤出画面；移除首页卡组卡片内多余的小牌预览。
- 2026-05-01T00:24:43+08:00 `ts/` 收束 PK 动画调整：保留原逐 lane/逐格 PK 流程，仅将主要动画与间隔温和提速约 15%；连续胜利分数字号递增，lane clear 时新增更明显的 `x2` 倍率飞字再更新左侧 Multiplier。
- 2026-05-01T01:18:00+08:00 `ts/` 参考 `game-design/reference/high-pixel` 新增高像素初始卡套页、关卡选择页与分区商店页；流程改为 Start -> 初始卡套 -> LEVEL_SELECTION -> PLAYING，奖励后进商店，商店 Continue 后再进 LEVEL_SELECTION。
- 2026-05-01T01:32:00+08:00 `ts/` 参考 `game-design/reference/high-pixel/roshambo-high_pixel-claim.png` 将 ROUND_REWARD 改为高像素 Claim 奖励查看页，并保持 Claim -> Shop -> LEVEL_SELECTION 流程。
- 2026-05-01T00:41:59+08:00 `ts/` 完善 PK 结算表现：修复倍率数字动画后下移残留，PK 结束后在左侧积分区播放 Base × Multiplier 合并动画并用粒子飞入总分，随后下方恢复 `0 × 0`；手牌奖励改为每关结束按剩余手牌结算，并在奖励弹窗单独展示。
- 2026-05-01T00:55:07+08:00 `ts/` 调整过关弹窗时序：PK 合并与粒子飞入后，先等待左侧 Total Score 数字滚动到新总分并闪烁确认，再提交状态触发过关/奖励弹窗，避免后台已过关但前台总分仍未更新。
- 2026-05-01T13:37:33+08:00 `ts/` 精修 Main 以外的 high-pixel 覆盖层：参考 `game-design/reference/high-pixel/` 的初始卡套、关卡选择、商店与 Claim 图，统一 16:9 画布、纸板/金边/深绿货架质感、卡套叠牌厚度、标题宝石、按钮 hover、商店物件与 Claim 奖励图标；初始卡套按钮文案改为 Pick Sleeve/选择卡套。
- 2026-05-01T12:23:20+08:00 更新 Agent 协作规则：记录用户会修改 sleeve CSV 的 `d`/`n` 列，并以 `r`/`validation = 1` 作为卡套实装与同步检查条件。
- 2026-05-01T12:27:22+08:00 `ts/` 兼容 sleeve CSV 将中文名/描述/校验列移动到 A/B/C 列：按表头读取 `n`/`d`/`r` 或 `name_zh`/`description_zh`/`validation`，运行时仅加载校验值为 `1` 的卡套，并同步“赌徒”卡套为得失分翻倍效果。
- 2026-05-01T12:44:06+08:00 `ts/` 接入 sleeve CSV 的 `ratio` 与 `tag`：商店卡套 offer 改为按 `ratio + 已拥有同 tag 卡套数` 加权抽取；同步 20 张 `validation = 1` 卡套的派生翻译与效果 JSON，并新增卡套效果类型（赌徒、白卷、快活、鞋带、双重视野等）。
- 2026-05-01T13:26:34+08:00 `ts/` 修复获得卡套后主界面反馈不足与上限过低：卡套槽上限从 2 调整为 5，高像素关卡/商店侧栏显示已拥有卡套，主对局卡套槽支持横向滚动，确保购买卡套能继续显示并参与效果结算。
- 2026-05-02T12:40:08+08:00 `ts/` 修正卡套计分层级：所有“得分 +/-”效果改为修正基础分，所有 `x` 效果改为修正基础分倍率，再乘击穿倍率；赌徒现在翻倍基础得失分，并同步预览/结算的 Base Score。
- 2026-05-02T12:48:22+08:00 `ts/` 调整卡套表现结算点：出手 PK 结束后先显示原始基础分/击穿倍率，再闪烁卡套并修正基础分，最后执行乘法合并；同步神秘峰顶为“无剩余替换手牌时基础分 +15”。
- 2026-05-02T13:12:00+08:00 `ts/` 逐页精修关卡选择页左侧栏目：改为接近 Main/参考图的纸质像素面板、虚线内框、蓝红积分条、金币/积分圆章、紫蓝操作按钮和底部关卡信息块；修复当前构建中的 `??` 优先级错误。
- 2026-05-04T10:30:00+08:00 `ts/` definition 结构重构：新增 `deck_definition.csv`（合并 deck_catalog/deck_cards）、`card_definition.csv`（合并 card_catalog/cardasset 并补充 shop 权重）、`block_definition.csv`、`levels_definition.csv`；移除运行时对 `content_status.csv` 的依赖，并调整同步脚本仅同步 `*_definition.csv` 到运行时目录。

## 阻塞项
- 暂无

## 下一步
- 将 Deck Effect 从“资产已落地”接入实际玩法钩子与 UI 展示
- 建立 FX 预览/选择页面（GSAP 预制动效库 + 可调参数面板）
- 完善解锁条件（unlockRef）从占位升级为可组合条件/进度系统
