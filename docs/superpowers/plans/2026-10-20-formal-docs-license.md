# 物派正式文档与许可 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 提供应用内离线手册、专有非商业许可和规范 GitHub 文档，发布 V1.1.1。
**Architecture:** Markdown/TXT 为文档源；构建脚本安全渲染为本地帮助模块，网页与封装共用可访问 dialog。平台 ZIP 带完整说明与许可。
**Tech Stack:** 现有 JavaScript、HTML、CSS、Node、Playwright、Electron、Capacitor。
**Spec:** 用户2026-10-20确认，仅个人非商业使用；商业及内置素材商业用途需 CHAMBER 书面授权，联系97101yy@gmail.com。

## Global Constraints
- 不修改三维材质、缩略图与切换逻辑。
- 统一圆角磨砂、控件居中、无箭头，手机可用。
- 四个平台 ZIP、直接 APK、SHA256SUMS，共六附件。
- 保留原应用标识和签名，旧版本不覆盖。

## Tasks
- [x] 先编写帮助可访问性、离线内容及文档同步测试，验证失败。
- [x] 完善 PRODUCT_README.md、LICENSE、docs/COMMERCIAL-LICENSE.md、docs/PRIVACY.md、第三方声明；规范 README 与支持入口。参考资料记录出处，不照搬其他软件开源许可。
- [x] 实现 scripts/prepare-help.cjs、help-content.mjs、help.mjs；接入应用、CSS和构建。
- [ ] 更新平台包文档映射、版本与日志，运行单元、浏览器、离线、桌面与安卓验证。
- [ ] 审查，推送并检查正式发行文件、摘要与标签。

Verification: help test failed first on missing entry, then passed desktop/touch, Escape/focus, both offline HTMLs and Electron development.24 existing unit tests and browser regressions passed. Independent review found no blocking issue; archive-relative references corrected. Native CI and publishing pending.
