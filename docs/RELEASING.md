# 持续开发与发布

独立仓库： https://github.com/hindingonhome/qiwu-zhijian 。开发者 CHAMBER，邮箱 97101yy@gmail.com。

## 换电脑继续

克隆完整仓库，保留源码、assets、vendor、android 和 release-assets，不是只复制 Markdown。运行 `npm ci`，用 Codex 打开整个目录，先阅读 AGENTS.md。不要只编辑生成的 HTML。

## 更新版本

1. 修改源码、资源或固定缩略图，运行 `npm test`、`npm run build` 和浏览器检查。
2. 更新 package.json 三段版本号，例如 1.0.1，并在 docs/releases/V1.0.1.md 写变更说明。
3. 提交并推送 main。GitHub Actions 检查版本是否已发布；不存在时构建网页、安卓 APK、USDZ 附件及校验表，并发布对应 V 标签。
4. 检查 Actions 成功以及 Releases 附件。已发布版本不会自动覆盖，通常应递增版本号。

## 安卓签名

应用标识为 `cn.chamber.qiwuzhijian`。后续更新须保留同一签名密钥。仓库不保存密钥或密码，发布使用 GitHub 仓库秘密配置：ANDROID_KEYSTORE_BASE64、ANDROID_KEYSTORE_PASSWORD、ANDROID_KEY_ALIAS。

本机签名备份在项目目录之外，换电脑时单独安全备份，不提交到公开仓库。

本地先执行 `npm run mobile:sync`，设置 ANDROID_HOME 指向 SDK，再设置 ANDROID_KEYSTORE_PATH、ANDROID_KEYSTORE_PASSWORD、ANDROID_KEY_ALIAS；进入 android 目录，运行 `./gradlew assembleRelease`（Windows 用 `./gradlew.bat assembleRelease`）。

更新版本号时同时运行 `npm install --package-lock-only` 同步锁文件。版本号的三个数字每段应小于 1000，安卓版本代码由三段数字计算。

## 项目维护

桌面和手机网页内嵌资源。APK 使用包内拆分资源，避免解析巨大的内嵌网页。release-assets/native-usdz 为 iPhone 原生查看资源，不含网页交互。

固定缩略图放在 assets/thumbs，不恢复实时重绘。水果着色程序共用 uniform 调色板，避免不同水果反复编译。新增系列仍检查 UV、露铜遮罩、完整缩略图和居中图标，遵循 AGENTS.md。

本项目不包含金属工坊、其他算法网页、旧交付历史、个人申请表或聊天附件。此前“实用软件”中的交付保留为历史，后续以本目录为独立开发位置。
