# About Page Versioning Summary

本文记录 2026-05-31 对 About 页面的版本化与 2026 版本视觉改造。

## 目标

About 页面保留旧版内容，同时新增一个可继续演进的最新版本。

页面结构分为两层：

- 顶部横向版本时间轴，默认进入 `2026`。
- 下方版本内容面板，点击时间节点后切换到对应版本。

当前版本节点：

- `2026`
- `2025-08-22`

## 内容入口

四个语言的 About 页面都改为使用同一套版本化 shortcodes：

```text
content/zh-cn/page/about/index.md
content/zh-tw/page/about/index.md
content/en-us/page/about/index.md
content/ja-jp/page/about/index.md
```

`2026` 版本由主题 shortcode 渲染，旧版 `2025-08-22` 内容继续保留在页面文件中。

## Shortcodes

新增三个 shortcode：

```text
themes/hugo-theme-stack/layouts/shortcodes/about_versions.html
themes/hugo-theme-stack/layouts/shortcodes/about_version.html
themes/hugo-theme-stack/layouts/shortcodes/about-2026.html
```

职责分工：

- `about_versions.html`：版本时间轴和版本面板容器。
- `about_version.html`：单个版本面板。
- `about-2026.html`：2026 About 页面的卡片化内容。

`2026` 内容使用 HTML 结构输出，以便实现更复杂的卡片、站点宇宙和 Git 历史图；旧版本仍按 Markdown 内容渲染。

## 2026 版本设计

最新版本页面由以下区块组成：

- 身份卡：使用头像、姓名、英文名、读音和描述展示博客身份。
- Current focus：保留当前关注方向。
- Mind map：参考 `sample/CardSlider/` 的三卡切换动效，改为玻璃背板上的卡片滑动器。
- Site universe：保留站点宇宙图，展示主站、博客、GitHub、VRChat、Music 和 Github-VRChat。
- Projects：列出留下痕迹的项目。
- Blog history：以类似 Git 历史的曲线展示博客演进。

身份卡中的描述文案为：

```text
这里是 yexca 的个人博客：写代码、整理知识、折腾系统，也把生活里的感受、选择与不确定性，拆成可以理解的结构。
```

多语言姓名和读音：

- 简体中文：叶卡 / `yè kǎ`，英文名 `yexca`
- 繁体中文：葉卡 / `yè kǎ`，英文名 `yexca`
- English：`yexca` / `/jɛkɑ/`
- 日本語：いえか / `ieka`，英文名 `yexca`

## Site Universe

站点宇宙保留了原来的宇宙图关系，并改为动态椭圆轨道：

- 旋转位置由 `main.ts` 按 `about-universe` 当前容器尺寸、卡片尺寸和安全边距实时计算。
- 每一帧都会将卡片坐标限制在容器边框内，适配宽长方形、正方形和高长方形容器。
- 鼠标进入宇宙区域后，旋转暂停，卡片平滑回到初始散开站位：
  - `Blog`：左上。
  - `GitHub`：右上。
  - `VRChat`：左下。
  - `Music`：右下。
  - `Github-VRChat`：下方中间。
- 鼠标离开后继续沿安全椭圆轨道旋转。

本次移除了 `Lit Link`，替换为：

```text
Github-VRChat -> https://github.com/yexca-VRChat
```

## Blog History

Blog history 区块重新调整了主线、分支线和节点位置，使节点尽量贴合曲线。后续又放大了主线节点与分支节点，提高可点击性和可读性。

当前节点：

- `Start`：2021-11-04，使用 Wordpress 建立博客
- `Sakurairo`：2021-11-22，从 Astra 到 Sakurairo
- `Argon`：2022-01-30，主题换为 Argon
- `Docker`：2023-04-04，全面 Docker 化
- `Jekyll`：迁移至 Jekyll
- `Hugo`：迁移至 Hugo
- `Count`：2025-02-28，可爱计数器
- `Refactor`：2026-05-31，修改 stack 主题

详情卡 `about-commit-card` 会根据选中节点左右半区自动切换位置：

- 选中左侧 50% 的节点时，详情卡显示在右下角。
- 选中右侧 50% 的节点时，详情卡显示在左上角。

底部新增年份时间轴，按 `2021` 到 `2026` 分割。

## 2026 追加调整

2026-05-31 继续调整 About 页：

- `about-id-card` 背板改为与 `about-status-card` 一致的玻璃透明卡片。
- `about-hero-copy` 移除原本单个大字背景，改成铺满区域的 `yexca` 水印，并用柔和径向光晕与水印结合。
- `Mind Map` 改成卡片切换器：中央卡片放大，左右卡片半透明预览，支持前后按钮、圆点、键盘方向键和点击两侧卡片切换。
- `Mind Map` 移除局部滚轮切换，避免影响页面正常向下滚动；同时降低卡片舞台高度。
- `Site Universe` 改为安全边界内的动态椭圆旋转；鼠标进入后回到初始散开站位。
- `Blog History` 文案改为最新节点内容，节点尺寸放大，详情卡按选中节点左右半区切换角落。
- `Blog History` 底部新增按年份分割的时间轴。

## 样式与脚本

主要样式位于：

```text
themes/hugo-theme-stack/assets/scss/custom.scss
```

主要脚本位于：

```text
themes/hugo-theme-stack/assets/ts/main.ts
```

脚本能力：

- 初始化版本时间轴。
- 根据 URL hash 打开对应版本。
- 点击版本节点时切换内容并更新 hash。
- 初始化 2026 页面中的 Git history 交互。
- 初始化 2026 页面中的 Mind Map 卡片切换器。
- 根据容器尺寸计算 Site Universe 的安全椭圆轨道。
- 鼠标进入 Site Universe 时让卡片回到初始散开站位。
- 初始化卡片 hover tilt 效果。

## 兼容性处理

移动端样式已做单列适配：

- 身份卡改为头像和信息上下排列。
- 站点宇宙从旋转轨道改为纵向卡片列表。
- Git history 隐藏 SVG 曲线，改为竖向节点排列。
- 新增第 8 个 `Refactor` 节点的移动端位置。

## 验证

已执行：

```powershell
.\env\hugo\hugo.exe --gc --minify
```

验证结果：

- Hugo 构建通过。
- About 页面可正常打开。
- 默认显示 `2026`。
- 旧版 `2025-08-22` 可通过时间轴切换。
- 2026 首屏已移除旧标题和三个按钮。
- 身份卡头像正常加载。
- `Lit Link` 已移除。
- `Github-VRChat` 链接存在。
- Git history 共有 8 个节点。
- `Refactor` 节点存在，日期为 `2026-05-31`。
- Mind Map 局部滚轮切换已移除，页面滚动不再被拦截。
- Site Universe 旋转卡片在当前浏览器预览中不会出边框。
- Site Universe 鼠标进入后会回到初始散开站位。
- Blog History 详情卡按左右半区切换到右下角或左上角。
- Blog History 底部年份时间轴存在。

## 后续维护建议

添加新的 About 版本时，优先在各语言 About 页面中新增一个 `about_version` 面板，并把当前 `2026` 内容保留为一个日期版本。

如果继续扩展 2026 视觉内容，优先修改 `about-2026.html` 与 `custom.scss`，避免把复杂 HTML 分散到四个语言页面中。

旧的 `#about-latest` hash 会被脚本兼容解析到 `2026`，避免已有链接直接失效。
