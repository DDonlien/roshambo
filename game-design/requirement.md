# Roshambo Requirement (实现同步版)

本文档以仓库当前实现为准，描述玩法规则、数据定义、流程状态与可扩展点。若实现发生变化，需同步更新本文档，并在 `PROGRESS.md`/`agent/ROADMAP.md` 记录变更（如相关）。

## 1. 技术与结构
- 前端：原生 TypeScript + DOM 渲染（无 React/Vue/Svelte）
- 动画：GSAP
- 构建：Vite（位于 `ts/`）
- 配置：单一真源在 `game-design/definition/`；TS 运行时通过 fetch 从 `ts/public/definition/` 加载（由同步脚本生成）

## 2. 配置与定义（Definition）
所有可配置内容单一真源集中在 `game-design/definition/`，TS 运行时读取 `ts/public/definition/`（由同步脚本从真源复制）：
- `levels.csv`：关卡配置（`level,goal,reward`），共 27 行（9 大关 x 3 小关）
- `content_status.csv`：全局内容状态总表（`deck/sleeve/giftcard/playmat/card` 的实装、启用、商店启用）
- `deck_catalog.csv`：卡组目录（名称、解锁引用、初始资源）
- `deck_cards.csv`：卡组初始牌表（`deck_id,card_code,count`）
- `deck_effects.json`：卡组特殊效果定义（当前均为空数组，预留扩展）
- `card_catalog.csv`：额外卡牌目录（当前商店卡池 code、分组、资源渲染模式）
- `shopdefinition.json`：商店生成规则（直购/奖励包权重、类型权重、价格规则）
- `sleeve_definition.csv`：卡套定义（仅 `validation/r = 1` 的行进入游戏；`ratio` 控制商店基础出现权重；`tag` 控制同组权重加成）
- `giftcard_definition.csv`：礼品卡定义
- `playmat_definition.csv`：Playmat 定义
- `blockasset.csv` / `cardasset.csv`：资源映射表

### 2.1 Card Code 规则
`deck_cards.csv` / `card_catalog.csv` 中的 `code` 由 3 位字符组成（对应 1x3 卡牌的 3 个元素），映射如下：
- `0` -> BLANK
- `1` -> PAPER
- `3` -> SCISSORS
- `4` -> ROCK
- `7` -> TRICOLOR（三色）
- `O` -> TRICOLOR（运行时目录表写法，仅用于 `card_catalog.csv` / 商店卡池）

示例：
- `300` 表示 [剪,空,空]
- `444` 表示 [石,石,石]
- `341` 表示 [剪,石,布]（杂色 3 图案）
- `777` 表示 [三色,三色,三色]

## 3. 核心元素与权重
### 3.1 RPS 元素
- ROCK / SCISSORS / PAPER / BLANK / TRICOLOR
- 克制：ROCK > SCISSORS > PAPER > ROCK
- 分值权重：ROCK=4，SCISSORS=3，PAPER=1，BLANK=0，TRICOLOR=2（作为显示/占位权重）

### 3.2 TRICOLOR（“三色格”）规则
- 三色格在对战时会选择“优势图案”参与结算：
  - 面对非空对手时，会选择能克制对手的图案结算
  - 面对空格（BLANK）时不需要选择优势，保持三色不固定
- 一旦参与过一次对战结算（对手非空），三色格会在棋盘上固定为对应的单色图案
- 若三色牌本身用于推进轨道，在首次遇到非空对手后也会固定成单色继续推进

## 4. 关卡结构与流程
### 4.1 关卡结构
- 9 个 Stage，每个 Stage 3 个 Tier，总计 27 关
- 主题按 Pocket -> Rubik -> Master 循环
  - Pocket：2x2
  - Rubik：3x3
  - Master：4x4

### 4.2 通关/失败/胜利
- 通关条件：在手牌耗尽前达到 `goal`
- 失败条件：手牌耗尽且未达标 -> GAME_OVER
- 全通关：完成 27 关 -> WIN

### 4.3 初始卡套与关卡选择
- 首页按下 Start 后，会以当前首页轮播选中的卡组进入初始卡套选择页（CHOOSE_SLEEVE）
- 玩家从随机 3 个卡套中选择 1 个作为开局卡套
- 选择初始卡套后进入关卡选择页（LEVEL_SELECTION），而不是直接进入第一关
- 关卡选择页展示当前可进入关卡与后续预览；点击 Enter Stage 后才构筑本关手牌并进入 PLAYING

### 4.4 关卡结算、商店与下一关
当分数达到 `goal`：
- 立即结算关卡奖励、剩余手牌奖励与利息，增加筹码：
  - `totalReward = levelReward + handReward + projectedInterest`
- 进入奖励查看页（ROUND_REWARD / Claim），展示 Stage Bonus、Remaining Hands、Perfect Clear、Interest 与 Total Earned
- 进入商店（SHOP）：
  - 当前固定为高像素商店分区布局
  - 第一行为 6 个额外卡牌 offer
  - 第二行左侧为 3 个卡套 offer
  - 第二行右侧为 3 个礼品卡或 Playmat offer
  - 当前商店主界面 offer 为 `direct`：购买后立即入库/入牌库
  - 卡套购买后加入卡套槽，当前上限为 5（由 `sleeve_definition.csv` loader 默认 slotLimit 控制）
  - 礼品卡购买后进入礼品卡库存，当前上限由 `giftcard_definition.csv` loader 默认 inventoryLimit 控制
  - Playmat 购买后进入 Playmat 库存，当前上限由 `playmat_definition.csv` loader 默认 inventoryLimit 控制
  - 额外卡牌购买后加入本局的永久牌库模板，在后续关卡重新洗入 deck
  - 商店点击 Continue 后进入下一关的 LEVEL_SELECTION；若已是最后一关则进入 WIN

## 5. 回合（一次放置）与经济
### 5.1 回合定义
“回合”定义为一次将选中手牌从矩阵边缘放置并完成对冲结算（一次 clash）。

### 5.2 回合收入
- 当前回合结束不再立即按剩余手牌发钱
- 达成关卡目标时，根据“剩余手牌数量”结算 `handReward`：每张 +1 筹码

### 5.3 资源
- chips：货币
- interestRate：利息率（`projectedInterest = floor(chips * interestRate)`，可被特殊牌修饰）
- dealsLeft：替换手牌次数
- shufflesLeft：洗牌次数
- 特殊牌可能提供每关额外 deals/shuffles

## 6. 轨道对冲（Lane Clash）与计分
### 6.1 放置与轨道
玩家从矩阵 TOP/BOTTOM/LEFT/RIGHT 某一边缘，选择一个 offset，把 1x3 卡牌推入。卡牌上的 3 个元素分别对应一条轨道（行/列），逐格推进结算。

### 6.2 单格结算
对每一步：
- 胜利：攻击方克制防守方或防守方为空格（BLANK）
  - 获得分数：等于被吃掉的防守方格子的权重
  - 攻击方占据该格并继续前进
- 平局：双方相同，停止推进
- 失败：攻击方被克制
  - 倒扣分数：等于攻击方自身权重
  - 触发 Lane Shift：该条轨道整体向“推入方向的反方向”平移一格

### 6.3 击穿翻倍（Pierce Multiplier）
一次放置中，如果某条轨道“击穿整条行/列”（在该次放置中该轨道被替换的格子数达到矩阵 size），则记为一次 pierce。

一次放置的得分分两段：
- baseScore：按正常规则累计的防守格分值总和，并扣除失败倒扣
- pierceMultiplier：`2 ^ pierceCount`
- 最终加分：`scoreDelta = baseScore * pierceMultiplier`

说明：
- 卡套/特殊效果文案中写“得分 +N / -N”的效果修正 baseScore；写“xN”的效果修正 baseScore 倍率。最终分数按“调整后 baseScore × pierceMultiplier”结算；若有特殊计算层级，会在具体效果规则中单独说明。
- 表现顺序：先完成出手 PK，并在左侧显示原始 baseScore 与 pierceMultiplier；随后触发卡套闪烁并把 baseScore/基础倍率修正到卡套后的值；最后再执行乘法合并并写入总分。
- pierceCount 是一次放置中击穿的行/列数量（可同时触发多条）
- penalty（失败倒扣）会进入 baseScore，并会被基础分倍率影响；不单独参与 pierceMultiplier 之外的额外翻倍

## 7. 卡套、礼品卡与额外卡牌
### 7.1 卡套（Sleeve）
- 配置文件：`ts/public/definition/sleeve_definition.csv`
- 运行时：`ts/src/definitions/sleeveDefinition.ts`
- 只有 `validation` / `r` 值为 `1` 的行会被 loader 加载；其他行可为空或为 `0`，视为未启用内容。
- CSV 按表头读取，不依赖列位置；`name_zh`/`description_zh`/`validation` 可放在 A/B/C 列，也兼容短列名 `n`/`d`/`r`。
- `ratio` 是商店卡套 offer 的基础权重；若当前可选卡套的基础权重为 `d`，基础概率约为 `d / sum(d)`。
- `tag` 是组合标签，可用逗号填写多个值（如 `1,2,3`）。当玩家已经拥有某个 tag 下的卡套 `N` 张时，所有其他拥有该 tag 的候选卡套商店权重会增加 `N`；多 tag 会累计加成。
- 当前已接入玩法主链：
  - 商店购买
  - 被动分数修正（flat / multiplier）
  - 每关资源修正（如额外 deal）
  - 通关奖励修正（如关底加钱）
  - 利息预测修正（如每 5 筹码额外利息）

### 7.2 礼品卡（Gift Card）
- 配置文件：`ts/public/definition/giftcarddefinition.json`
- 运行时：`ts/src/definitions/giftcarddefinition.ts`
- 当前已接入玩法主链：
  - 商店购买
  - 礼品卡库存显示
  - SHOP 状态下点击使用
  - 当前效果：复制上次礼品卡、生成随机 Gift Card、生成随机 Playmat、筹码翻倍（有上限）、获得随机 Sleeve

### 7.3 Playmat
- 配置文件：`ts/public/definition/playmatdefinition.json`
- 运行时：`ts/src/definitions/playmatdefinition.ts`
- 当前已接入玩法主链：
  - 商店购买
  - PLAYING 状态下点击使用
  - 对选中手牌进行转换、复制、销毁、加权等一次性效果

### 7.4 额外卡牌（Card）
- 商店可出售与手牌/牌库同性质的 1x3 卡牌
- 当前卡池来源：`ts/public/definition/card_catalog.csv`
- 当前目录内容：
  - 所有由 `0/1/3/4` 任意混搭组成的 3 位 code
  - 所有包含 `O`（运行时映射为 TRICOLOR）的 3 位 code
- 价格由 `shopdefinition.json.cardPricing` 按规则计算，便于后续直接调表
- 若卡牌没有现成整图资产，UI 自动回退到 3 格动态渲染

### 7.5 覆盖范围
- 已实装条目与未实装原因见：`game-design/specs/item-coverage.md`
- 原则：
  - 能直接映射到 Roshambo 现有规则的条目，优先实装
  - 依赖未建立系统（点数/人头牌/Boss/行星/塔罗/异象/edition/sell value 等）的条目，先列入未覆盖清单

## 8. UI 与交互约定
- 左侧：状态机控制与信息面板（分数、筹码、资源按钮等）
- 右侧：矩阵、手牌、拖拽/吸附预览、特殊牌展示
- 动画：尽量使用 GSAP，以便统一节奏与可维护性
