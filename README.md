# 器物之间 · Surface Studio

离线查看器物模型、试验纹样与铜漆材质的三维工作室。包含花瓶及 11 个水果器型，支持本地图片和模型导入、材质切换、密度记忆、灯光调节及 PNG / GLB 导出。

**开发者：CHAMBER** · [97101yy@gmail.com](mailto:97101yy@gmail.com)

**版本：V1.0.1** · 保留所有权利，不授予开源许可。

## 下载与使用

在 [Releases 下载页](https://github.com/hindingonhome/qiwu-zhijian/releases)获取：

- `QiwuZhijian-*-Desktop.zip`：电脑离线网页、Windows 启动脚本及说明。
- `QiwuZhijian-*-Android.zip`：安卓 APK、离线网页及说明。
- `QiwuZhijian-*-iPhone.zip`：iPhone 离线网页、Models 文件夹内的 25 个 USDZ 及说明。
- `QiwuZhijian-*-Linux.zip`：Linux 离线网页、启动脚本及说明。
- `QiwuZhijian-*-Android.apk`：安卓安装版，资源随应用打包，安装后离线运行。
- `SHA256SUMS.txt`：下载文件校验值。

安卓首次安装可能需要允许当前下载来源安装应用，后续更新需保留相同应用标识和签名。iPhone 目前没有签名 IPA 或 App Store 上架版本。

## 基本操作

左键或单指旋转，右键调灯光，滚轮或双指缩放。菜单选择器物或水果，底部前两个圆球为纯铜、金色，之后是彩色纹样。`＋` 导入本地 PNG / JPG / WebP，也可导入自包含 GLB / GLTF 和 STL。

缩略图固定使用每件水果第三个材质对应的第一个彩色纹样，桃子使用唯一保留的落地色。换材质、改密度或导入图片都不改变缩略图。不同器物和纹样仍分别记忆密度。

“展示”可调亮度、补光、方向和高度，点击“恢复原版灯光”回退。“保存画面”悬停或点击展开 PNG 与 GLB 导出菜单。安卓安装版导出使用系统文件保存窗口。

## 独立继续开发

需要 Node.js 24+、npm；安卓构建另需 Java 21 和 Android SDK 36。

```sh
npm ci
npm test
npm start
```

访问 `http://127.0.0.1:8765`。这是本地开发服务，不是互联网部署。以当前项目目录为源码根目录，入口为 `app.mjs` / `viewer.mjs`。

```sh
npm run build -- --native
npm run mobile:sync
```

前者在 `.release-work` 生成桌面和手机 HTML，后者准备原生移动资源并同步安卓工程。编译的 APK 放入 `.release-work` 后执行 `npm run package:platforms` 生成平台包，再运行 `node scripts/checksums.mjs`。版本更新见 [维护与发布](docs/RELEASING.md)，新增系列见 [新增系列模板](docs/ADDING-SERIES.md)。

浏览器测试：先运行 `npx playwright install chromium`，再运行 `npm run test:browser`。也可设置 `PLAYWRIGHT_CHANNEL=msedge` 使用已安装的 Edge。

## 验证边界与版权

基础版已检查模型、UV、遮罩、旋转、固定缩略图、密度、灯光及离线导出。构建和签名检查不等于手机真机验收；未声称完成 Android 或 iPhone 真机测试。首次载入大型模型仍取决于设备性能。

仓库公开可见但不授予开源使用许可，详见 [LICENSE](LICENSE)。三方组件保留原许可证，见 [第三方声明](THIRD_PARTY_LICENSE.txt)。用户提供的模型与纹样不因此额外授权他人商用或再分发。
