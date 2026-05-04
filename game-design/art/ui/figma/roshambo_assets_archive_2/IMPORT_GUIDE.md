# Roshambo 像素 UI → Figma 可编辑资产导入指南

> 说明：当前我这边无法直接控制浏览器进入 Figma Web 完成“自动上传/分层重建”（浏览器自动化不可用）。所以我先把两张图拆成 **可复用 PNG 素材包** + 两个 **可直接拖入 Figma 的分层 SVG（含文字图层占位）**，你导入到你给的文件即可继续编辑与组件化。

## 产物一览
- `home/`：Home 画面拆分 PNG（标题牌匾、中心面板、左右箭头、底部按钮等）
- `main/`：Main 画面拆分 PNG（左侧信息栏、顶部卡组栏、棋盘区域、底部手牌、两张功能按钮等）
- `roshambo_home_editable.svg`：Home 分层组装（图片层 + 文本层占位）
- `roshambo_main_editable.svg`：Main 分层组装（图片层 + 文本层占位）

## 导入到你的 Figma 文件
你给的文件：
https://www.figma.com/design/RhQIgOIH5hc8pPu5EZ3CRp/Roshambo?node-id=1-4

### 推荐导入方式（更“可编辑”）
1. 在 Figma 里新建一个 Page，例如：`UI Assets (from PNG)`
2. 直接把 `roshambo_home_editable.svg`、`roshambo_main_editable.svg` 拖进画布
   - SVG 里每个 PNG 会成为独立图层（便于拆组件）
   - SVG 里还包含了关键按钮文字的 **Text 图层占位**（可后续替换字体/调整位置）

### 只想要素材，不要组装
把 `home/` 和 `main/` 里的 PNG 拖进 Figma，然后按需要建立组件：
- Buttons：`home_btn_*`、`main_btn_*`
- Panels：`home_center_panel`、`main_left_sidebar` 等
- Board：`main_center_board`

## 像素风格保持建议（Figma 设置）
1. 选中任意导入的 PNG，在右侧面板找到 **Image rendering**（或类似字段）：
   - 设为 **Pixelated**
2. 缩放时尽量用整数倍率（1x / 2x / 3x / 4x），避免 1.5x 之类产生插值模糊

## Fusion Pixel Font（文字可编辑）
你提供的字体仓库：
https://github.com/TakWolf/fusion-pixel-font

Figma 使用本地字体一般需要：
1. 在系统安装字体
2. 安装/启用 Figma Font Helper（桌面端或字体服务）
3. 回到 Figma，把 SVG 里那些 Text 图层统一替换为 `Fusion Pixel`（或对应字体名）

## 下一步我可以继续做什么
如果你希望“按钮背景与文字彻底分离、按钮做成 9-slice 可拉伸组件”，我可以在你确认：
- 目标组件列表（哪些必须可拉伸，哪些保持固定像素）
- 需要支持的按钮尺寸范围（如：S/M/L）
之后，进一步把按钮边框拆成角/边/中心九宫格素材，并给出组件组装规范。

