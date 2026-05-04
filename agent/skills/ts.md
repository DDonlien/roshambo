# Roshambo (TS Web) Agent

本文档适用于 `ts/` 子工程的开发协作，约束 Agent 在 TypeScript + DOM + GSAP + Vite 的最佳实践下工作。

## 首次对话前置
- 若尚未阅读过仓库根目录 `AGENTS.md`，开始任何修改前先阅读它，继承其中的通用身份/纪律/文档规则。

## 技术栈与边界
- UI：原生 DOM（不引入 React/Vue/Svelte，除非用户明确要求）
- 动画：GSAP（优先使用 transform/opacity 类属性，避免强制布局）
- 构建：Vite（开发/构建脚本以 `ts/package.json` 为准）
- 配置：`game-design/definition/` 为单一真源；`public/definition/` 为运行时加载镜像（从真源同步生成）

## 代码结构（约定）
- `src/logic.ts`：对冲/计分等核心规则
- `src/state.ts`：状态机、关卡流程、商店与资源
- `src/ui.ts`：DOM 渲染、交互绑定、动画编排
- `src/special-cards/`：模块化特殊牌（单文件定义 + registry）
- `src/definitions/`：definition 文件加载与基础类型

## 卡套定义同步流程（强制）
- 当前卡套定义优先在 `public/definition/` 下确认真实 CSV 文件与表头；用户说 `sleeve.csv` 时，通常指卡套定义 CSV。
- 用户会手动修改卡套 CSV 的 `d` 与 `n` 列，并用 `r`/`validation` 列控制是否实装。
- 为方便用户编辑，`d`/`n`/`r` 或等价的 `description_zh`/`name_zh`/`validation` 可能位于 A/B/C 列；TS 端必须按表头读取，不依赖列位置。
- 只有 `r` 值为 `1` 的卡套行需要进入游戏；`r` 为空、`0` 或其他值的行不要求运行时实现。
- `ratio` 是商店卡套基础权重；`tag` 是组合分组，支持单元格内用逗号分隔多个 tag。商店刷新时，候选卡套权重按 `ratio + 已拥有同 tag 卡套数` 计算，多 tag 累计。
- 每次任务开始处理 TS 端前，检查 `r = 1` 的卡套行里 `d` 与 `n` 是否与当前派生列或实际实现不一致。
- 若 `d` 或 `n` 有更新，同步更新同行其他列（例如英文/中文/繁中/日文翻译、短名、描述、效果 JSON 等），然后检查 `src/definitions/sleeveDefinition.ts`、`src/state.ts` 及相关效果逻辑，确保实际游戏效果与 CSV 更新一致。
- 完成后用 CSV parser 或构建检查确认：仅 `r = 1` 的行被加载/实装，中文仍可正确显示。

## GSAP 最佳实践
- 默认用 `gsap.to/from/fromTo`；涉及顺序编排优先 `gsap.timeline()`
- 避免布局抖动：优先 `x/y/scale/rotate/autoAlpha`，少用 `top/left/width/height`
- 所有临时元素（飞字/公式条/粒子）要确保动画结束后清理 DOM
- 需要连续触发的效果先 `gsap.killTweensOf(target)` 防止叠加失控

## 变更纪律
- 开始前确认当前改动只涉及 `ts/`（除非用户明确要求跨子工程）
- 每次“明确可验证的修改”完成后：
  - 运行 `npm run build`
  - 在仓库根目录 `PROGRESS.md` 的“最近完成”追加一条并附 ISO 8601 时间戳
