# V1.1.2桌面分辨率适配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task.

**Goal:** 2K大窗口中导航、控件和面板适度放大并向两侧布局，标题和模型中心下移，保留手机与普通窗口可用性。
**Architecture:** 独立responsive.css管理桌面尺寸变量；相机安全区根据标题和底部控制实际边界计算，不依赖parseFloat解析CSS表达式。窗口变化不重置模型姿态和缩放。
**Tech Stack:** 原有CSS、Three.js、Node与Playwright。
**Spec:** 用户2026-10-20要求，进入V1.1.2；V1.1.1文档许可发行继续独立完成。

- [x] 先加入多窗口浏览器测试与安全区单元测试，验证现有大窗口固定UI问题。
- [x] 实现桌面流体尺寸、全宽导航、下移标题与控制台、可伸展面板和说明窗口。
- [x] 实际测量相机安全区，按可用空间取景，不在resize时重置朝向或缩放。
- [x] 覆盖1280/1920/2048/2560/3840宽窗口、矮屏、手机，审查2K截图及菜单、导入导出、帮助。
- [ ] 更新V1.1.2日志、手册和发行包并验证发布。

Constraints: 所有图标和短文字居中；统一圆角磨砂；无箭头；固定缩略图；四ZIP+APK+SHA；原安卓标识与签名保留。常规清理不得影响原功能。

Verified: 26 unit tests and full browser regression passed, 2K light/dark and popup bounds verified, resize retains exact quaternion and camera position. Independent reviewer found no actionable issue. V1.1.1 released with six attachments and digests verified. Offline/native checks and V1.1.2 release pending.
