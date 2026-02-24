# 快速开始指南

## 第一步：安装 Node.js

如果你还没有安装 Node.js，请访问 https://nodejs.org/ 下载并安装最新的 LTS 版本。

## 第二步：安装依赖

打开终端（PowerShell 或 CMD），进入项目目录：

```bash
cd "c:\Users\25684\Downloads\figma design\GlanceApp"
npm install
```

这个过程可能需要 5-10 分钟，请耐心等待。

## 第三步：启动应用

安装完成后，运行：

```bash
npm start
```

你会看到一个二维码和一些选项。

## 第四步：在手机上查看

### 方法 1：使用 Expo Go（推荐，最简单）

1. 在你的手机上下载 **Expo Go** app：
   - iOS: 在 App Store 搜索 "Expo Go"
   - Android: 在 Google Play 搜索 "Expo Go"

2. 打开 Expo Go app

3. 扫描终端中显示的二维码

4. 应用会自动加载到你的手机上！

### 方法 2：在电脑上查看（浏览器）

在终端中按 `w` 键，应用会在浏览器中打开。

### 方法 3：使用模拟器

**Android 模拟器：**
1. 安装 Android Studio
2. 设置 Android 模拟器
3. 在终端中按 `a` 键

**iOS 模拟器（仅限 Mac）：**
1. 安装 Xcode
2. 在终端中按 `i` 键

## 常见问题

### 问题：npm install 失败

**解决方案：**
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题：Expo Go 扫码后无法连接

**解决方案：**
- 确保手机和电脑在同一个 WiFi 网络
- 关闭电脑的防火墙或允许 Node.js 通过防火墙
- 尝试使用 Tunnel 模式：`npx expo start --tunnel`

### 问题：应用显示错误

**解决方案：**
```bash
# 清除缓存重新启动
npx expo start -c
```

## 修改代码

1. 打开 `src/screens/SignInScreen.tsx` 文件
2. 修改任何文本、颜色或样式
3. 保存文件
4. 应用会自动刷新！（热重载）

## 下一步

- 查看 `README.md` 了解更多功能
- 修改 `SignInScreen.tsx` 中的样式
- 添加更多屏幕到 `src/screens/` 目录
- 在 `App.tsx` 中配置导航

## 需要帮助？

- Expo 文档：https://docs.expo.dev/
- React Native 文档：https://reactnative.dev/
- React Navigation：https://reactnavigation.org/

祝你开发愉快！🚀
