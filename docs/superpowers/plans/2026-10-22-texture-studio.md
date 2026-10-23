# 纹样生成与统一纹样库实施计划

> **For agentic workers:** 使用 executing-plans 在当前已隔离的 codex/surface-design-120-preview 分支顺序实施；用户授权本地开发与验收，禁止发布。

**Goal:** 将用户提供的固定矢量与金线识别工具融入纹样面板，生成、导出并直接应用纹理。

**Architecture:** 独立纯函数模块处理调色、金线识别和矢量序列化；生成面板按需初始化，图像运算使用可内嵌 Worker，旧浏览器分块让出主线程。复用当前贴图导入、作品保存与导出路径。统一预设目录，保留底栏更多收纳。

**Tech Stack:** 原生 ES modules、Canvas、SVG、Three.js、Node test、Playwright、现有离线打包器。

**Spec:** 本聊天 2026-10-22 用户需求及两份 HTML；既有 AGENTS.md 的界面与交付约定。

## Global Constraints

- 保留当前玻璃 UI、手动姿态、静态模型缩略图和固定金色部件；先验收不上传。
- 密度 1–5、步长 0.25；旧作品 1–10 继续可读取，重新调整时使用新范围。
- 自建栏目齿轮提供改名、锁定与删除；删除明确确认；恢复仅首选项。
- 固定矢量保留 4/5/6 色、独立金线、线宽、透明金线、PNG/SVG/色卡/设计图导出；图像模式保留 4–7 色、三档金线识别、参考取色、调色锁定与顺序交换、抗锯齿。
- 高分辨率导出显式执行；预览限尺寸，禁止每次调色重新初始化三维程序。

### 1. 密度与统一预设

Files: density-memory.mjs, surface-palette.mjs, surface-editor.mjs, vase-textures.mjs, app.mjs, index.html, tests/density-memory.test.mjs, tests/texture-studio.cjs。

- [x] 先增加小数持久化、边界和随机疏密测试，运行确认旧整数逻辑失败。
- [x] 使用 Math.round(value*4)/4，范围 1–5；所有滑条 step=.25；旧作品解码不修改。
- [x] 删除按器物隐藏的目录逻辑；应用 profile 时保持所选 profile，花瓶、盘子、水果可共用。
- [x] 浏览器比较三种器物的完整目录，应用同一纹样并验证姿态和盘底。

### 2. 栏目齿轮与删除确认

Files: collection-ui.mjs, surface-editor.mjs, responsive.css, tests/personal-library.cjs, tests/preferences-management.cjs。

- [x] 浏览器先覆盖齿轮改名、删除取消/确认、首选项恢复与派库内快捷键不恢复。
- [x] 复用玻璃 dialog；仅自建栏目添加齿轮，默认栏目不出现；保留添加新派和直接导入。
- [x] 首选项与齿轮共用删除确认，模型删除亦确认；锁仍保护删改。

### 3. 纹理生成引擎与界面

Files: texture-studio-core.mjs, texture-studio.mjs, assets/pattern-master.json.gz, build-offline.cjs, build-safari.cjs, app.mjs, responsive.css, tests/texture-studio.test.mjs, tests/texture-studio.cjs。

- [x] 先测试金线识别区分暗土黄、透明像素、固定矢量颜色映射、线宽与透明金线，PNG DPI 元数据。
- [x] 从附件仅提取固定矢量几何数据；不执行原页面，保留来源审查记录。离线打包嵌入此资源，展开才解压。
- [x] 实现独立图像分类与渲染运算，限制像素并离线程执行；渲染请求编号防止旧预览覆盖新结果。
- [x] 在纹样中增加折叠生成区域：模式、预览、导入、色卡、金线高级项与生成应用/导出操作；所有新文字提供简繁英。
- [x] 生成 PNG 调用现有 importTexture，经 editSurface 进入历史并切换器物验证；不会自动写磁盘或云端。
- [x] 实际测试 PNG/SVG/色卡导出、图像模式金线保护、切换器物、作品往返、离线 HTML 与移动窄屏。

### 4. 验收交付

- [x] 运行 node --test tests/*.test.mjs tests/desktop-*.test.cjs 与 scripts/test-browser.mjs。
- [x] 修订使用说明与变更日志，PDF 渲染逐页验证。
- [x] 完整构建 Desktop/Android/iPhone/Linux 备用 HTML，Windows EXE 和签名 APK；实际安装包冒烟测试。
- [x] 复制至独立本地验收目录，更新 SHA256SUMS；保持旧版本可用，汇报真实测试与平台限制，不上传。

验证记录：59 项单元、19 组浏览器回归通过；桌面/手机独立离线 HTML、Android 分离资源生成流程、实际交付 EXE、APK gzip 字节与资源路径、签名、四页 PDF 均已核验。未上传。Android 真机、iPhone 真机、Linux 原生未验证。
