# 📱 Glance App - 部署指南

## 🎯 部署到 Expo 平台

### 前提条件

1. ✅ 已完成项目安装（运行过 `npm install`）
2. ✅ 应用在本地可以正常运行
3. ⬜ 需要创建 Expo 账户

---

## 📋 步骤 1: 创建 Expo 账户

1. 访问 https://expo.dev/signup
2. 注册一个免费账户
3. 验证你的邮箱

---

## 📋 步骤 2: 登录 Expo CLI

在项目目录中打开终端，运行：

```bash
npx expo login
```

输入你的 Expo 账户用户名和密码。

---

## 📋 步骤 3: 发布到 Expo

### 方法 A: 快速发布（推荐新手）

```bash
npx expo publish
```

这会将你的应用发布到 Expo 的服务器。发布后，任何人都可以通过 Expo Go app 扫码访问你的应用！

**发布后你会得到：**
- 一个唯一的 URL（例如：exp://exp.host/@username/glance-app）
- 一个二维码，可以分享给其他人

---

## 📋 步骤 4: 构建独立应用（可选）

如果你想创建可以在 App Store 或 Google Play 发布的独立应用：

### 安装 EAS CLI

```bash
npm install -g eas-cli
```

### 登录 EAS

```bash
eas login
```

### 配置项目

```bash
eas build:configure
```

### 构建 Android APK

```bash
eas build --platform android --profile preview
```

### 构建 iOS 应用（需要 Apple 开发者账户）

```bash
eas build --platform ios --profile preview
```

构建完成后，你会收到一个下载链接。

---

## 🌐 部署到 Web

如果你想将应用部署为网站：

### 1. 构建 Web 版本

```bash
npx expo export:web
```

### 2. 部署到 Netlify（免费）

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy --dir=web-build --prod
```

### 3. 部署到 Vercel（免费）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

---

## 📱 分享你的应用

### 通过 Expo Go 分享

发布后，你可以：

1. **分享二维码**：让其他人用 Expo Go 扫描
2. **分享链接**：发送 `exp://` 链接
3. **嵌入网站**：使用 Expo 提供的嵌入代码

### 通过独立应用分享

1. **Android**：
   - 直接分享 APK 文件
   - 或上传到 Google Play Store

2. **iOS**：
   - 通过 TestFlight 分享测试版
   - 或上传到 App Store

---

## 🔄 更新应用

### 更新 Expo 发布版本

修改代码后，重新发布：

```bash
npx expo publish
```

所有用户会自动获得更新！（无需重新下载）

### 更新独立应用

需要重新构建：

```bash
eas build --platform android --profile preview
```

---

## 📊 监控和分析

### Expo Dashboard

访问 https://expo.dev/ 查看：
- 应用使用统计
- 崩溃报告
- 构建历史
- 更新记录

---

## 🎨 发布前检查清单

- [ ] 测试所有功能正常工作
- [ ] 检查在不同屏幕尺寸上的显示
- [ ] 更新 `app.json` 中的应用信息
- [ ] 添加合适的应用图标（`assets/icon.png`）
- [ ] 添加启动画面（`assets/splash.png`）
- [ ] 测试在真实设备上的性能
- [ ] 检查是否有控制台错误或警告

---

## 🖼️ 自定义应用图标和启动画面

### 应用图标

替换 `assets/icon.png`：
- 尺寸：1024x1024 像素
- 格式：PNG
- 背景：不透明

### 启动画面

替换 `assets/splash.png`：
- 尺寸：1242x2436 像素（或更大）
- 格式：PNG
- 设计：简洁明了

### Android 自适应图标

替换 `assets/adaptive-icon.png`：
- 尺寸：1024x1024 像素
- 格式：PNG
- 注意：中心 66% 区域是安全区

---

## 🚀 性能优化建议

### 1. 优化图片

```bash
# 压缩图片
npm install -g imagemin-cli
imagemin assets/*.png --out-dir=assets/optimized
```

### 2. 启用生产模式

在 `app.json` 中：

```json
{
  "expo": {
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ]
  }
}
```

### 3. 代码分割

对于大型应用，考虑使用动态导入：

```typescript
const Screen = React.lazy(() => import('./screens/Screen'));
```

---

## 🔒 安全建议

1. **不要提交敏感信息**：
   - API 密钥应该存储在环境变量中
   - 使用 `.gitignore` 排除敏感文件

2. **使用环境变量**：

```bash
# 创建 .env 文件
API_KEY=your_api_key_here
```

3. **启用 HTTPS**：
   - 所有 API 调用应使用 HTTPS
   - 验证 SSL 证书

---

## 📞 获取帮助

### Expo 社区

- [Expo 论坛](https://forums.expo.dev/)
- [Discord](https://chat.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### 官方文档

- [Expo 文档](https://docs.expo.dev/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [EAS Submit 文档](https://docs.expo.dev/submit/introduction/)

---

## 💰 费用说明

### Expo 免费版

- ✅ 无限制的 Expo Go 发布
- ✅ 每月 30 次构建
- ✅ 基础分析

### Expo 付费版（可选）

- 更多构建次数
- 优先构建队列
- 高级分析
- 团队协作功能

大多数个人项目使用免费版就足够了！

---

## 🎉 恭喜！

你现在知道如何将 Glance App 部署到各个平台了！

**快速回顾：**
1. `npx expo publish` - 发布到 Expo
2. `eas build` - 构建独立应用
3. `npx expo export:web` - 导出 Web 版本

祝你部署顺利！🚀

---

## 📝 常见问题

### Q: 发布后如何更新应用？

A: 只需修改代码后重新运行 `npx expo publish`，用户会自动获得更新。

### Q: 可以离线使用吗？

A: 独立应用（APK/IPA）可以离线使用，但 Expo Go 需要网络连接首次加载。

### Q: 如何上传到 App Store 和 Google Play？

A: 使用 `eas submit` 命令：

```bash
eas submit --platform ios
eas submit --platform android
```

### Q: 构建需要多长时间？

A: 通常 10-30 分钟，取决于队列情况。

### Q: 需要 Mac 才能构建 iOS 应用吗？

A: 不需要！EAS Build 在云端构建，支持 Windows/Linux/Mac。

---

**祝你的应用大获成功！** 🎊
