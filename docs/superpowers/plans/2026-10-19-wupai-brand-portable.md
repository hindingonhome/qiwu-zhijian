# 物派品牌与免安装桌面版实施计划

**Goal:** 将用户已确认的名称“物派”和 C1 源泉圆体字标应用到各平台，将字形由 150 放大到 174 / 256，提供 Windows 免安装 EXE、Linux AppImage、安卓签名 APK，以及 iPhone 原网页和模型包。

**Architecture:** 可复用矢量轮廓作为唯一图标源，生成网页 SVG/PNG/ICO、Android VectorDrawable。Electron 使用包内拆分资源与隔离的本地协议加载，保留本地导入和系统保存；桌面 ZIP 同时携带备用单文件 HTML。CI 在 Windows/Linux 分别构建，最后统一六个发布附件。

**Tech Stack:** Node.js 24、Electron、electron-builder、Capacitor 8.5.2、现有 Three.js 与 yazl。

## 约束与已确认规格

- 名称“物派”；墨黑 #252527、浅金 #e8d5b6，字标视觉居中，圆角方形。
- 仅安卓要求可安装应用；iPhone 不新增 IPA，保持原网页、25 个 USDZ。
- Android 应用标识、签名保持原值，以保证已装用户能够升级；可见名称全部更新。
- 桌面使用真正的独立免安装应用，HTML 仅备用；不把浏览器启动脚本当作桌面应用。
- 内置资源离线使用，不引入网络请求；保留缩略图、密度、材质、旋转和导出既有行为。
- 字体授权文件附带于所有包中；历史版本更新日志保留旧名称用于追溯。
- 发布保持四个平台 ZIP、直接 APK、SHA256SUMS.txt，共六项。

## Task 1: 字标与可见品牌

**Files:** assets/branding/*、scripts/build-branding.py、index.html、build-offline.cjs、build-safari.cjs、android/app/src/main/res/*、文档。

- [ ] 从已确认 C1 SVG 的真实轮廓生成 174 / 256 居中字标、PNG 多尺寸、ICO、安卓矢量；保留 OFL 授权和来源 SHA。
- [ ] 字标资源由构建器内嵌到 HTML，原生包复制随应用分发，不能依赖系统字体。
- [ ] 更新展示名称、导出文件名前缀、可见文案和构建输出为 Wupai；保留内部 Android ID。
- [ ] 测试字标边界和视口居中、SVG 无 text/font 依赖、离线 HTML 图标存在。

## Task 2: 独立桌面运行时

**Files:** desktop/main.cjs、desktop/security.cjs、desktop/electron-builder.cjs、scripts/prepare-desktop.mjs、tests/desktop-*.cjs。

- [ ] 自定义 wupai:// 协议只允许包内文件，阻断 traversal/外部跳转/新窗口，不开启 Node renderer；默认 contextIsolation/sandbox/webSecurity。
- [ ] 系统文件导入与下载保存需工作，取消保存不误报成功；窗口标题和任务栏使用同款物字图标。
- [ ] Windows portable 与 Linux AppImage 输出到 desktop-output，应用载入 desktop-web/index.html；导出 Wupai-${version}-Windows.exe / Linux.AppImage。
- [ ] Electron + Playwright 检查离线启动、切换、文件导入、PNG/GLB 导出、图标与标题；打包后 Windows 再跑一次。

## Task 3: 平台归档与发布

**Files:** scripts/platform-files.mjs、scripts/package-platforms.mjs、scripts/verify-platforms.py、.github/workflows/release.yml、package.json。

- [ ] 版本 1.1.0，Wupai 输出前缀，平台包主入口是应用，备用 HTML 放在 Backup-HTML 子目录。
- [ ] Windows/Linux 构建使用矩阵与独立 artifacts，Linux 主发布 job 等两端产物齐全再归档；安卓继续签名升级。
- [ ] 验证归档逐文件哈希、可执行权限与六附件；发布前核对服务器摘要。
- [ ] 审查、修复后推送，更新日志与 README 提供清楚的平台入口和限制。

## 验证与完成记录

- [ ] 单元测试、浏览器回归、品牌视觉截图。
- [ ] Windows 免安装包实际启动检查、Linux CI 运行时检查。
- [ ] Android 版本与签名检查。
- [ ] 公开发布附件、校验值、source tag 对应。

Ruling: 暂在干净的独立仓库功能分支工作，避免错误地在原“实用软件”上下文创建别的工作树；完成后再统一修改仓库和本地目录的可见名称。

Progress: branding, secure desktop implementation, development and packaged Windows smoke, browser/offline regressions, signed Android build and certificate verification passed. Linux CI, exact final archives and public release still pending. iPhone confirmed HTML+USDZ only. GitHub repository renamed wupai.
