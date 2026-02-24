# Glance App - React Native (Expo)

这是基于 Onboarding Screens Design-1.pdf 设计的 Glance 登录界面的 React Native 实现。

## 功能特点

- ✅ 使用 TypeScript 开发
- ✅ Expo 框架，易于部署
- ✅ React Navigation 导航系统
- ✅ 完整的登录界面设计
- ✅ 支持 Apple、Google 登录和演示模式

## 安装步骤

1. 安装依赖：
```bash
cd GlanceApp
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 在手机上运行：
   - 下载 Expo Go app（iOS 或 Android）
   - 扫描终端中显示的二维码

## 可用命令

- `npm start` - 启动 Expo 开发服务器
- `npm run android` - 在 Android 模拟器/设备上运行
- `npm run ios` - 在 iOS 模拟器/设备上运行（仅限 Mac）
- `npm run web` - 在浏览器中运行

## 项目结构

```
GlanceApp/
├── App.tsx                 # 主应用入口
├── src/
│   └── screens/
│       └── SignInScreen.tsx  # 登录屏幕
├── assets/                 # 图片和资源文件
├── package.json
└── app.json               # Expo 配置
```

## 设计说明

此应用实现了 PDF 设计文件中的登录屏幕，包括：

- **标题区域**："Sign in to personalize" 和说明文字
- **登录选项**：
  - Continue with Apple（黑色按钮）
  - Continue with Google（白色边框按钮）
  - Use demo without sign-in（文本按钮）
- **隐私说明**：底部的隐私提示文字
- **导航指示**：底部的 "Sign in" 导航提示

## 技术栈

- React Native 0.76.5
- Expo ~52.0.0
- TypeScript 5.3.3
- React Navigation 6.x
- React Native Gesture Handler
- React Native Reanimated

## 部署到 Expo

1. 创建 Expo 账户（如果还没有）：https://expo.dev/signup

2. 登录 Expo CLI：
```bash
npx expo login
```

3. 发布应用：
```bash
npx expo publish
```

4. 构建独立应用（可选）：
```bash
# Android
npx eas build --platform android

# iOS
npx eas build --platform ios
```

## 自定义

你可以在 `src/screens/SignInScreen.tsx` 中修改：
- 颜色方案（在 `styles` 对象中）
- 按钮文本
- 布局间距
- 字体大小

## 注意事项

- 首次运行需要安装所有依赖，可能需要几分钟
- 确保你的电脑和手机在同一个 WiFi 网络下
- 如果遇到问题，尝试清除缓存：`npx expo start -c`

## 许可证

MIT
