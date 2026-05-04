# Roshambo Agent

本文档描述在本仓库协作开发时，Agent 应遵循的身份、原则与开发范式。

## 身份与目标
- 以“可验证”为第一优先级：每次改动都能跑通并可回归验证
- 以“可扩展”为第二优先级：新增系统优先做成可配置、可插拔、可演进
- 以“最小改动”为第三优先级：复用现有结构与风格，不引入重型框架
- 本仓库为 Godot + TS Web 混合项目：开始任何操作前先确认当前要处理的是哪个子工程（`godot/` 或 `ts/`）
- 除非用户明确要求，否则一次只修改一个子工程：不要在同一次变更里同时改 Godot 与 TS Web 两套代码

## 项目现状（事实约束）
- 前端为原生 TypeScript + DOM 渲染，无 React/Vue/Svelte
- 构建/开发由 Vite 提供；动画由 GSAP 提供
- 游戏核心规则集中在 `ts/src/logic.ts`；状态机与流程集中在 `ts/src/state.ts`；界面集中在 `ts/src/ui.ts`
- 配置与定义集中在 `ts/public/definition/`（levels/initial/assets/deck/sleeve/giftcard）

## 开发范式
- Definition-first：优先改定义文件与加载逻辑，再改 UI 表现
- 单一真源：不要维护多份重复定义（例如同一套 deck 配置不要同时存在 CSV 与 JSON）
- 模块化扩展：特殊牌等系统遵循“一个功能/一张牌 = 一个独立文件 + 注册表”
- 不引入新依赖：除非确认仓库已安装且确实需要

## Sleeve CSV 协作规则（强制）
- 用户会直接修改 sleeve CSV 的 `d` 与 `n` 列；Agent 不应把这两列视为自己生成后即可长期拥有的内容。
- 为方便编辑，`d`/`n`/`r`（或等价的 `description_zh`/`name_zh`/`validation`）可能被移动到 CSV 的 A/B/C 列；程序与 Agent 都必须按表头识别，不依赖固定列位置。
- sleeve CSV 新增 `r`/`validation` 列：游戏中只需要实装 `r` 值为 `1` 的行；`r` 非 `1` 的行可能为空或为 `0`，应视为未启用/无需实装。
- sleeve CSV 的 `ratio` 决定商店刷新时卡套基础出现权重；`tag` 决定组合分组，可用逗号写多个 tag。实装商店权重时，候选卡套权重 = `ratio + 已拥有同 tag 卡套数`，多 tag 累计。
- 每次执行任务时，先检查 `r = 1` 的行中 `d` 与 `n` 是否较当前实现有更新；若有更新，必须把同一行的其他派生列同步为合适内容（翻译、短名、描述、效果参数或任务相关字段），再检查对应卡套的实际实现，并将运行时代码/效果实现调整为更新后的内容。
- 用户口头提到 `sleeve.csv` 时，优先按当前实际卡套定义文件理解；若文件名或列名已迁移，先在 `ts/public/definition/` 中确认真实路径与表头再操作。

## 文档纪律（强制）
- 若为“刚开始的对话/新会话”，开始任何实现与修改前先阅读 `game-design/requirement.md`，确认当前规则、流程与定义文件约定。
- 每次有功能/规则/结构变更时，同步更新：
  - `PROGRESS.md`（当前状态、最近完成、阻塞、下一步）
  - `agent/ROADMAP.md`（近期/中期/长期规划，若相关）
- 对“明确的修改”（可验证的功能/规则/结构变更），必须在 `PROGRESS.md` 的“最近完成”里记录一条，并附时间戳（ISO 8601，例如 `2026-04-16T10:23:00+08:00`）
- `game-design/requirement.md` 作为“真实实现的规格说明书”，以代码为准持续同步
- 若对话中用户定义了新的“游戏设计层面的逻辑/规则/流程/数值体系”，需将其整理并更新到 `game-design/requirement.md`（以实现为准，标注规则语义与适用边界）。

## 目录约定
- `ts/`：Web 端实现（Vite + TS + GSAP）
- `game-design/definition/`：配置与定义文件（单一真源）
- `ts/public/definition/`：运行时加载用的配置镜像（从 `game-design/definition/` 同步生成）
- `agent/skills/`：子工程协作规范（按子工程拆分）
- `agent/`：协作相关脚本、路线图、工具配置等
- `game-design/specs/`：详细规格（功能拆分、验收标准）
- `game-design/reference/`：参考图与资料
