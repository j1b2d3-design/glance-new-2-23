# Glance App - 项目总结

## 📦 项目信息

**项目名称**: Glance App  
**框架**: React Native + Expo  
**语言**: TypeScript  
**设计来源**: Onboarding Screens Design-1.pdf

## 📁 项目结构

```
GlanceApp/
├── App.tsx                      # 应用入口，配置导航
├── src/
│   └── screens/
│       └── SignInScreen.tsx     # 登录屏幕（主界面）
├── assets/                      # 图片和图标资源
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── package.json                 # 项目依赖配置
├── app.json                     # Expo 配置
├── tsconfig.json               # TypeScript 配置
├── babel.config.js             # Babel 配置
├── install.bat                 # Windows 安装脚本
├── start.bat                   # Windows 启动脚本
├── README.md                   # 英文文档
├── SETUP.md                    # 详细安装指南
└── 开始使用.txt                 # 中文快速指南
```

## 🎨 已实现的界面

### 登录屏幕 (SignInScreen)

基于 PDF 设计文件实现的完整登录界面：

**UI 元素**:
- ✅ 页面标题："Sign in to personalize"
- ✅ 说明文字：关于如何使用 Glance 的描述
- ✅ Apple 登录按钮（黑色背景，白色文字）
- ✅ Google 登录按钮（白色背景，黑色边框，带 Google 图标）
- ✅ "or" 分隔文字
- ✅ 演示模式按钮："Use demo without sign-in"（蓝色文字）
- ✅ 隐私说明：底部的隐私提示文字
- ✅ 底部导航指示："Sign in"

**样式特点**:
- 现代化的圆角按钮设计（12px 圆角）
- 合理的间距和内边距
- 清晰的视觉层次
- 响应式布局
- 安全区域适配（SafeAreaView）

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.76.5 | 移动应用框架 |
| Expo | ~52.0.0 | 开发和部署平台 |
| TypeScript | ~5.3.3 | 类型安全 |
| React Navigation | ^6.1.9 | 页面导航 |
| React Native Gesture Handler | ~2.20.2 | 手势处理 |
| React Native Reanimated | ~3.16.1 | 动画效果 |

## 🚀 快速开始

### 方法 1: 使用批处理文件（Windows）

```bash
# 1. 双击 install.bat 安装依赖
# 2. 双击 start.bat 启动应用
```

### 方法 2: 使用命令行

```bash
# 1. 进入项目目录
cd "c:\Users\25684\Downloads\figma design\GlanceApp"

# 2. 安装依赖
npm install

# 3. 启动应用
npm start
```

### 在手机上查看

1. 下载 **Expo Go** app
   - iOS: App Store
   - Android: Google Play

2. 扫描终端中的二维码

3. 应用会自动加载！

## 📱 支持的平台

- ✅ iOS (iPhone & iPad)
- ✅ Android
- ✅ Web (浏览器)

## 🎯 核心功能

### 当前实现
- [x] 登录界面 UI
- [x] 响应式布局
- [x] TypeScript 类型安全
- [x] 导航系统基础架构

### 可扩展功能
- [ ] Apple 登录集成
- [ ] Google 登录集成
- [ ] 演示模式功能
- [ ] 更多 onboarding 屏幕
- [ ] 用户数据持久化
- [ ] API 集成

## 🎨 设计系统

### 颜色方案

```typescript
主色调:
- 黑色: #000000 (Apple 按钮)
- 白色: #FFFFFF (背景)
- 蓝色: #0066FF (链接和强调)

文字颜色:
- 主文字: #000000
- 次要文字: #666666
- 提示文字: #999999

边框:
- 浅灰色: #E0E0E0
- 分隔线: #F0F0F0
```

### 字体大小

```typescript
- 标题: 28px (fontWeight: 700)
- 正文: 16px (fontWeight: 400-600)
- 小字: 13-14px (fontWeight: 400)
```

### 间距系统

```typescript
- 页面边距: 24px
- 按钮内边距: 16px (垂直) × 24px (水平)
- 元素间距: 12px
- 圆角: 12px
```

## 📝 代码说明

### App.tsx
主应用入口，配置 React Navigation 导航容器和路由。

### SignInScreen.tsx
登录界面组件，包含：
- SafeAreaView 确保内容不被刘海屏遮挡
- StatusBar 配置状态栏样式
- TouchableOpacity 实现可点击按钮
- StyleSheet 定义所有样式

## 🔧 自定义指南

### 修改颜色

在 `src/screens/SignInScreen.tsx` 的 `styles` 对象中修改：

```typescript
appleButton: {
  backgroundColor: '#000000', // 改成你想要的颜色
  // ...
}
```

### 修改文字

直接在 JSX 中修改 `<Text>` 组件的内容：

```typescript
<Text style={styles.title}>你的标题</Text>
```

### 添加新屏幕

1. 在 `src/screens/` 创建新文件
2. 在 `App.tsx` 中添加路由
3. 使用 `navigation.navigate()` 导航

## 📚 学习资源

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript 手册](https://www.typescriptlang.org/)

## 🐛 故障排除

### 问题: npm install 失败

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题: 无法连接手机

- 确保手机和电脑在同一 WiFi
- 尝试使用 tunnel 模式: `npx expo start --tunnel`
- 关闭防火墙或允许 Node.js

### 问题: 应用崩溃或显示错误

```bash
npx expo start -c  # 清除缓存
```

## 📄 许可证

MIT License

## 👨‍💻 开发者笔记

此项目是根据 Figma/PDF 设计文件创建的 React Native 实现。所有的尺寸、颜色和布局都尽可能地还原了原始设计。

代码结构清晰，易于扩展。你可以：
- 添加更多屏幕
- 集成真实的登录 API
- 添加状态管理（Redux, MobX, Zustand 等）
- 添加更多动画效果
- 连接后端服务

祝你开发愉快！🚀
