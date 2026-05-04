# Roshambo

Roshambo 是一款基于“石头剪刀布”克制关系的 Roguelike 策略卡牌原型。玩家通过从矩阵边缘推入 1x3 卡牌触发“轨道对冲”，以在手牌耗尽前达到关卡目标分数，并在关卡间进入结算与商店获取成长。

## 当前玩法要点（实现为准）
- 关卡：9 大关，每关 Pocket/Rubik/Master 循环，总计 27 关
- 矩阵：Pocket 2x2，Rubik 3x3，Master 4x4
- 计分：吃掉的防守方格子按权重加分（石头4/剪刀3/布1/空0）
- 击穿翻倍：一次放置中若击穿整条行/列，则本次加分整体按 `2^i` 翻倍（i 为击穿条数）
- 三色格：三色格/三色牌会在对战时选择优势图案结算，并在结算后固定成单色
- 回合收入：每次放置结算后，按“剩余手牌数”发钱（每张 +1）
- 通关流程：达标后进入奖励结算页，再进入商店购买特殊牌，然后进入下一关

## 文档
- 规则与规格（随实现同步）：[requirement.md](file:///Users/taobe/Documents/GitHub/Roshambo/game-design/requirement.md)
- 参考图与资料：`game-design/reference/`
