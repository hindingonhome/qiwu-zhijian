module.exports = {
  appId: 'cn.chamber.wupai.desktop', productName: '物派',
  electronDist: 'node_modules/electron/dist',
  directories: { output: 'desktop-output' },
  files: ['desktop/**', 'desktop-web/**', 'assets/branding/icon.png', 'assets/branding/icon.ico', 'licenses/**', 'LICENSE', 'THIRD_PARTY_LICENSE.txt'],
  asar: true,
  win: { target: ['portable'], icon: 'assets/branding/icon.ico', artifactName: 'Wupai-${version}-Windows.exe' },
  portable: { requestExecutionLevel: 'user' },
  linux: { syncDesktopName: true, target: ['AppImage'], icon: 'assets/branding/icon.png', category: 'Graphics', executableName: 'wupai', artifactName: 'Wupai-${version}-Linux.AppImage' },
};
