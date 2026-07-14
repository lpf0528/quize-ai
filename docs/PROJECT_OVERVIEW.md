# quize-ai 项目概览

> 供后续开发与 AI 对话复用。UI 基于 [ColorUI GA](https://xiaokanglei.github.io/ColorUI-GA-Docs/#/README)。

## 1. 项目定位

微信小程序，面向「书籍学习 + 笔记 + 测验」场景。当前以 RAG 技术书籍（《基于大模型的 RAG 应用开发与优化》）为示例内容，产品形态接近「读书笔记 / 章节学习 / 测验」助手。

| 项 | 说明 |
| --- | --- |
| 类型 | 微信原生小程序（非 uni-app / 非 Taro） |
| AppID | `wxef0e8fd0a2f6d20e` |
| 组件框架 | `glass-easel` |
| 懒加载 | `lazyCodeLoading: requiredComponents` |
| 包管理 | 无 `package.json`，依赖以源码目录形式引入 |

## 2. 目录结构

```
quize-ai/
├── app.js / app.json / app.wxss     # 全局入口与样式
├── project.config.json             # 微信开发者工具配置
├── colorui/                        # ColorUI GA 样式与组件
├── towxml/                         # Markdown/HTML → 小程序节点渲染
├── pages/                          # 业务页面
│   ├── book/                       # 书籍主流程（核心）
│   ├── index/                      # 首页（模板向，资讯/书单风格）
│   └── logs/                       # 启动日志（脚手架残留）
├── utils/util.js                   # 时间格式化
└── images/                         # 静态资源
```

## 3. 页面与导航

### 3.1 路由（`app.json`）

| 路径 | 角色 | 状态 |
| --- | --- | --- |
| `pages/book/book` | 书籍详情：封面、简介、笔记列表；抽屉打开目录 | **核心，Tab** |
| `pages/book/article/article` | 笔记/文章详情（towxml 渲染 Markdown） | 可用（硬编码示例文） |
| `pages/book/quize/quize` | 测验页 | **占位**，仅默认模板 |
| `pages/book/toc/toc` | 目录组件（非独立页，被 book 抽屉引用） | 组件 |
| `pages/book/chapter/chapter` | 章节页（当前像音乐播放模板残留） | 半成品 |
| `pages/index/index` | 首页：搜索 + Tab + 轮播 + 书单列表 | Tab，偏演示 |
| `pages/logs/logs` | 本地启动时间日志 | Tab，脚手架 |

### 3.2 TabBar

- `pages/book/book` — book  
- `pages/index/index` — 首页  
- `pages/logs/logs` — 日志  

### 3.3 核心用户路径（已实现雏形）

```
book（书籍详情）
  ├─ 笔记列表 → article（Markdown 笔记）
  ├─ 「打开抽屉」→ toc（章节目录组件）
  │                 └─ 章节项 → chapter（章节，待重做）
  └─ （规划）测验入口 → quize（待实现）
```

## 4. 技术栈与关键依赖

### 4.1 ColorUI GA（UI）

- 文档：https://xiaokanglei.github.io/ColorUI-GA-Docs/#/README  
- 仓库：https://github.com/XiaokangLei/ColorUI-GA  
- 性质：基于 ColorUI 2.0 的**小程序原生 CSS 组件库**（类名驱动，非 npm 组件体系为主）

**全局引入**（`app.wxss`）：

```css
@import "colorui/main.wxss";
@import "colorui/icon.wxss";
@import "colorui/icon-new.wxss";
@import "colorui/animation.wxss";
@import "colorui/dark.wxss";
```

**全局组件**（`app.json`）：

- `cu-custom` → `/colorui/components/cu-custom/cu-custom`（自定义导航栏）

**窗口配置**：`navigationStyle: "custom"`，必须配合 `cu-custom` + `app.js` 中的 `StatusBar` / `CustomBar` / `Custom`。

**本仓库还带有的 ColorUI 组件**（按需在页面 json 注册）：

- `cu-custom`（已全局）
- `calendar`、`skeleton`、`canvas2d-ring`

**常用类名约定（开发时优先复用）**：

- 布局：`flex`、`justify-*`、`align-*`、`margin-*`、`padding-*`
- 颜色：`bg-blue`、`bg-gradual-blue`、`text-grey`、`text-black` 等
- 组件壳：`cu-bar`、`cu-list`、`cu-item`、`cu-btn`、`cu-tag`、`cu-avatar`、`cu-progress`
- 图标：`cuIcon-*`（如 `cuIcon-titles`、`cuIcon-time`）
- 抽屉：`cu-drawer-page` / `cu-drawer-window` / `cu-drawer-close`

新 UI **不要**另起一套设计系统；对齐 ColorUI GA 文档与现有页面写法。

### 4.2 towxml（富文本）

- 挂载：`app.towxml = require('/towxml/index')`
- 用法：`app.towxml(markdownString, 'markdown', { theme, events })`
- 展示：`<towxml nodes="{{article}}" />`（页面 json 注册组件）
- 支持：Markdown / HTML，含代码高亮、LaTeX、表格、echarts 等子能力

当前仅 `article` 页使用；内容为页面内硬编码字符串，**无后端 API**。

### 4.3 全局逻辑（`app.js`）

- `onLaunch`：写本地 `logs`、调用 `wx.login`（未接后端）、计算自定义导航高度
- `globalData`：`userInfo`、`StatusBar`、`Custom`、`CustomBar`
- `towxml` 解析器实例

## 5. 业务内容现状

| 模块 | 数据来源 | 备注 |
| --- | --- | --- |
| 书籍元信息 | WXML 硬编码 | 书名、作者、封面图 URL |
| 简介 | WXML 硬编码 + 展开/收起 | `summary_show` |
| 笔记列表 | WXML 硬编码 | 点击进 article |
| 文章正文 | JS 内 Markdown 字符串 | RAG 主题示例 |
| 目录 | toc 组件硬编码章节名 | 部分链接指向不存在页面 |
| 测验 | 无 | quize 页空壳 |
| 首页 | 硬编码 Tab/轮播/书单 | ColorUI 模板痕迹重 |

当前阶段：**UI 原型 + 静态内容演示**，尚未形成真实数据层（无 API、无云开发、无本地书库抽象）。

## 6. 已知问题 / 技术债

1. **拼写**：目录/文件名为 `quize`，应为 `quiz`；产品名 `quize-ai` 与之对应，改名需统一。
2. **模板残留**：多处注释仍指向 ColorUI 模板路径（drawer、news、music、about）；`chapter` 页仍是音乐播放 UI。
3. **断链**：`toc` 中部分 `data-url` 指向 `/pages/about/...`，项目中无这些页面。
4. **toc 资源**：引用 `/images/bg.png`，仓库 `images/` 下未见该文件（仅有 `0004.svg`）。
5. **测验未实现**：`quize` 页无题目、交互、评分逻辑。
6. **无后端**：登录、内容、进度均未打通。
7. **首页与 book 定位重叠**：首页偏资讯商城模板，与「书籍学习」主线需产品层面收敛。

## 7. 开发约定（建议）

1. **UI**：一律优先 ColorUI GA 类名与 `cu-custom`；新样式写在页面 `wxss`，避免覆盖 `colorui/main.wxss`。
2. **导航**：新页面使用 `<cu-custom bgColor="..." isBack="{{true}}">`，从 `app.globalData` 取栏高度（页面已有则沿用）。
3. **长文/笔记**：Markdown 走 towxml，不要用 `rich-text` 硬解复杂 MD。
4. **目录**：`toc` 作为组件嵌入抽屉或独立页均可，改章节数据时集中改 `toc`。
5. **测验**：在 `pages/book/quize` 落地；题型、判分、与笔记/章节关联需新增数据结构。
6. **数据层**：后续应抽「书 / 章 / 笔记 / 题目」模型，替换硬编码；是否用云开发或自建 API 待定。

## 8. 建议的后续演进方向

1. 收敛信息架构：以 book → toc → chapter/article → quize 为主路径，弱化或改造 index/logs。
2. 实现 quize：选择题/判断题、交卷、解析、分数环（可复用 `canvas2d-ring`）。
3. chapter 页改为真实章节阅读（可复用 article + towxml），去掉音乐模板。
4. 引入内容配置（JSON/云端），去掉页面内大段硬编码。
5. 修复 toc 断链与缺失图片。

## 9. 参考链接

- ColorUI GA 文档：https://xiaokanglei.github.io/ColorUI-GA-Docs/#/README  
- ColorUI GA 源码：https://github.com/XiaokangLei/ColorUI-GA  
- ColorUI GA H5 预览：https://xiaokanglei.github.io/ColorUI-GA-Docs/h5/demo.html  
