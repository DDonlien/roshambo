# Progress

## 当前状态
- Web 端（`ts/`）可运行：TypeScript + DOM + GSAP，Vite 构建
- 配置集中在 `ts/public/definition/`（levels/content_status/deck_catalog/deck_cards/deck_effects/card_catalog/shop/assets/sleeve/giftcard/playmat）
- 已接入：27 关卡流程、奖励结算页与商店页、特殊牌展示与购买、三色格与击穿翻倍、回合收入等

## 最近完成
- 统一配置目录：CSV/JSON 迁移至 `ts/public/definition/`，并更新加载路径
- deckdefinition 接入：卡组选择由定义文件驱动，支持新增特殊卡组
- 新规则：三色格（TRICOLOR）与击穿翻倍计分；回合结束按剩余手牌发钱
- 新流程：ROUND_REWARD -> SHOP -> 下一关/通关
- 2026-04-16T00:00:00+08:00 添加子工程 agent 规范：`ts/agent.md`（TS+GSAP）与 `godot/agent.md`（Godot C#）
- 2026-04-16T00:10:00+08:00 优化滚轮翻转交互：持续同向滚动不重复翻转，需换向或停 0.5s 再触发
- 2026-04-17T00:55:00+08:00 `ts/` 接入卡套/礼品卡主链：商店可购买 Special/Sleeve/Gift Card，卡套被动生效，礼品卡进入库存并可在对局中使用；同步补充覆盖清单与 requirement
- 2026-04-17T01:25:00+08:00 `ts/` 商店重构：移除 Special 出售，改为 sleeve/gift card/card 三类；支持 direct 与 pack（2/3 选 1），新增 shopdefinition 与永久牌库模板
- 2026-04-19T12:00:00+08:00 `ts/` 资产结构整理：新增 `content_status.csv`、`deck_catalog.csv`、`deck_cards.csv`、`deck_effects.json`、`card_catalog.csv`；卡组初始资源改为按 `deck_id` 维护，三类定义改从统一状态总表过滤；移除旧的 `initial.csv` / `deckdefinition.json` / `effecttoggle.csv`
- 2026-04-20T10:00:00+08:00 `ts/` 新增多语言自动识别功能：读取系统/浏览器语言（`navigator.language`），自动匹配中文（简/繁）、日文或回退至英文，并将用户手动切换偏好存入 `localStorage`。
- 2026-04-20T10:15:00+08:00 `ts/` 新增初始卡套选择流程：在卡组选择后，随机抽取 3 个卡套供玩家 3 选 1，然后再进入第一关。
- 2026-04-25T23:36:06+08:00 `ts/` 固定 Vite dev server 端口为 `5739`，并启用 `strictPort` 以避免与其他项目自动抢占/漂移端口。
- 2026-04-27T00:35:53+08:00 `ts/` 根据新主页视觉稿重做游戏实机页面美术：左侧改为 Roshambo/关卡目标/总分与基础分倍率/金币信息板，右侧改为浅色像素桌面、顶部三奖励槽、中央矩阵桌布与底部居中扇形手牌；保留手牌、矩阵块与卡背原始图片资产及渲染比例。
- 2026-04-28T02:12:57+08:00 `ts/` 修正像素 UI 细节：接入 Fusion Pixel 字体，补齐中/繁/日 UI 文案，调整按钮 hover/居中/对齐、金币右对齐、桌垫宽度、pick 状态虚线与手牌下沉，并移除中央 PK 公式条。

## 阻塞项
- 暂无

## 下一步
- 将 Deck Effect 从“资产已落地”接入实际玩法钩子与 UI 展示
- 建立 FX 预览/选择页面（GSAP 预制动效库 + 可调参数面板）
- 完善解锁条件（unlockRef）从占位升级为可组合条件/进度系统
