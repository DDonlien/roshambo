# Roshambo (TS Web) Agent

本文档适用于 `ts/` 子工程的开发协作，约束 Agent 在 TypeScript + DOM + GSAP + Vite 的最佳实践下工作。

## 首次对话前置
- 若尚未阅读过仓库根目录 `agent.md`，开始任何修改前先阅读它，继承其中的通用身份/纪律/文档规则。

## 技术栈与边界
- UI：原生 DOM（不引入 React/Vue/Svelte，除非用户明确要求）
- 动画：GSAP（优先使用 transform/opacity 类属性，避免强制布局）
- 构建：Vite（开发/构建脚本以 `ts/package.json` 为准）
- 配置：`public/definition/` 为单一真源（CSV/JSON 运行时 fetch 加载）

## 代码结构（约定）
- `src/logic.ts`：对冲/计分等核心规则
- `src/state.ts`：状态机、关卡流程、商店与资源
- `src/ui.ts`：DOM 渲染、交互绑定、动画编排
- `src/special-cards/`：模块化特殊牌（单文件定义 + registry）
- `src/definitions/`：definition 文件加载与基础类型

## GSAP 最佳实践
- 默认用 `gsap.to/from/fromTo`；涉及顺序编排优先 `gsap.timeline()`
- 避免布局抖动：优先 `x/y/scale/rotate/autoAlpha`，少用 `top/left/width/height`
- 所有临时元素（飞字/公式条/粒子）要确保动画结束后清理 DOM
- 需要连续触发的效果先 `gsap.killTweensOf(target)` 防止叠加失控

## 变更纪律
- 开始前确认当前改动只涉及 `ts/`（除非用户明确要求跨子工程）
- 每次“明确可验证的修改”完成后：
  - 运行 `npm run build`
  - 在仓库根目录 `.agent/progress.md` 的“最近完成”追加一条并附 ISO 8601 时间戳
