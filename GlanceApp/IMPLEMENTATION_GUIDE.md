# 🎯 Expo SDK 54 + React Native 项目成功实现指南

## 📋 项目信息

**项目名称**: Glance App  
**框架**: React Native + Expo SDK 54  
**目标**: 从 PDF 设计稿转换为可在手机上运行的应用  

---

## ✅ 成功的关键步骤

### 1. 版本匹配是核心

**问题**: Expo Go SDK 版本必须与项目 SDK 版本匹配

**解决方案**:
- 手机上的 Expo Go: SDK 54
- 项目配置: Expo SDK 54
- React: 19.1.0
- React Native: 0.81.5

### 2. 正确的 package.json 配置

```json
{
  "name": "glance-app",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "expo-constants": "~18.0.13",
    "expo-status-bar": "~2.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "react-native-gesture-handler": "~2.22.0",
    "react-native-screens": "~4.5.0",
    "react-native-safe-area-context": "~5.3.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.1.0",
    "typescript": "~5.7.0"
  },
  "private": true
}
```

### 3. 简化的 babel.config.js

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

**注意**: 
- 不要添加 `react-native-reanimated/plugin`，它需要额外的 worklets 配置
- 如果不需要复杂动画，移除 reanimated 依赖

### 4. 安装步骤

```bash
# 1. 清理旧的依赖
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force

# 2. 安装依赖（使用 --legacy-peer-deps 绕过版本冲突）
npm install --legacy-peer-deps

# 3. 启动应用
npx expo start -c
```

---

## 🎨 从 PDF 到 React Native 的设计转换原则

### 设计分析步骤

1. **阅读 PDF 内容**
   - 提取所有文本内容
   - 识别 UI 元素（按钮、文本、图标等）
   - 确定颜色方案

2. **识别布局结构**
   - 标题区域
   - 按钮区域
   - Footer 区域
   - 导航栏（如果有）

3. **颜色方案确定**
   - 背景色
   - 文字颜色
   - 按钮颜色
   - 边框颜色

### 屏幕组件结构模板

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

export default function ScreenName() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header 区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>主标题</Text>
          <Text style={styles.subtitle}>副标题文字</Text>
        </View>

        {/* 主要内容区域 */}
        <View style={styles.mainContent}>
          {/* 按钮、卡片等内容 */}
        </View>

        {/* Footer 区域 */}
        <View style={styles.footer}>
          {/* Footer 内容 */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // 根据设计调整
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  // ... 其他样式
});
```

---

## 🎯 登录页面实现的关键点

### 1. 背景色
- 使用纯黑色 `#000000`
- StatusBar 设置为 `light-content`

### 2. 文字对齐
- 标题靠左: `textAlign: 'left'`, `alignItems: 'flex-start'`
- 如需居中: `textAlign: 'center'`, `alignItems: 'center'`

### 3. 按钮样式
```typescript
// 深色按钮（Apple/Google）
appleButton: {
  backgroundColor: '#1C1C1E',
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: '#2C2C2E',
}
```

### 4. 带图标的按钮
```typescript
<TouchableOpacity style={styles.appleButton}>
  <Text style={styles.appleIcon}>􀣺</Text>
  <Text style={styles.appleButtonText}>Continue with Apple</Text>
</TouchableOpacity>
```

### 5. 分隔线样式
```typescript
<View style={styles.orDivider}>
  <View style={styles.dividerLine} />
  <Text style={styles.orText}>or</Text>
  <View style={styles.dividerLine} />
</View>

// 样式
orDivider: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 16,
},
dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: '#2C2C2E',
},
```

### 6. Footer 卡片样式
```typescript
<View style={styles.footerCard}>
  <Text style={styles.shieldIcon}>🛡️</Text>
  <Text style={styles.footerText}>
    We use your holdings only to rank relevance. You can edit privacy anytime.
  </Text>
</View>

// 样式
footerCard: {
  backgroundColor: '#1F2937',
  borderRadius: 12,
  padding: 16,
  flexDirection: 'row',
  alignItems: 'flex-start',
},
```

---

## 📐 布局常见问题和解决方案

### 问题 1: 元素距离太远
**原因**: 使用了 `marginTop: 'auto'`  
**解决**: 改为具体的数值，如 `marginTop: 20`

### 问题 2: 文字换行位置不对
**原因**: 使用了手动换行符 `{'\n'}`  
**解决**: 移除换行符，让文字自然换行

### 问题 3: 按钮在底部
**原因**: `justifyContent: 'space-between'` 或 `marginTop: 'auto'`  
**解决**: 使用 `justifyContent: 'flex-start'` 和固定的 margin 值

### 问题 4: 文字需要居中/靠左
**解决**:
```typescript
// 靠左
header: {
  alignItems: 'flex-start',
},
title: {
  textAlign: 'left',
}

// 居中
header: {
  alignItems: 'center',
},
title: {
  textAlign: 'center',
}
```

---

## 🎨 常用颜色方案

### 深色主题
```typescript
背景色: '#000000'
卡片背景: '#1C1C1E' 或 '#1F2937'
边框: '#2C2C2E' 或 '#374151'
主文字: '#FFFFFF'
次要文字: '#9CA3AF'
链接: '#3B82F6' 或 '#2563EB'
```

### 浅色主题
```typescript
背景色: '#FFFFFF'
卡片背景: '#F9FAFB'
边框: '#E5E7EB' 或 '#D1D5DB'
主文字: '#000000' 或 '#1F2937'
次要文字: '#6B7280'
链接: '#2563EB'
```

---

## 🚀 快速实现新页面的流程

### 步骤 1: 分析 PDF
1. 提取文字内容
2. 识别 UI 元素类型（按钮、输入框、卡片等）
3. 确定布局结构（从上到下）
4. 记录颜色、字体大小、间距

### 步骤 2: 创建组件文件
```bash
# 在 src/screens/ 目录下创建新文件
# 例如: SecondScreen.tsx
```

### 步骤 3: 使用模板
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

export default function SecondScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* 根据 PDF 添加内容 */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
});
```

### 步骤 4: 添加到导航
```typescript
// 在 App.tsx 中
<Stack.Screen name="SecondScreen" component={SecondScreen} />
```

---

## 🔧 常见错误和解决方案

### 错误 1: `@platformConstants` 错误
**原因**: SDK 54 和 React Native 0.76.5 的已知 bug  
**解决**: 降级到 SDK 51 或等待官方修复

### 错误 2: `babel-preset-expo` 找不到
**解决**: 
```bash
npm install --save-dev babel-preset-expo
```

### 错误 3: 版本冲突
**解决**: 使用 `--legacy-peer-deps`
```bash
npm install --legacy-peer-deps
```

### 错误 4: Metro 缓存问题
**解决**: 清除缓存
```bash
npx expo start -c
```

---

## 📱 测试策略

### 优先级
1. **浏览器测试** (按 `w` 键) - 最快，适合开发
2. **Expo Go** - 真机测试，需要版本匹配
3. **开发构建** - 最可靠，但需要时间构建

### 浏览器测试
```bash
npm start
# 按 w 键打开浏览器
# 可以调整窗口大小模拟手机屏幕
```

---

## 📊 性能优化建议

1. **避免过度嵌套** - 保持组件结构扁平
2. **使用 memo** - 对于不经常变化的组件
3. **图片优化** - 使用适当的分辨率
4. **移除未使用的依赖** - 减小包体积

---

## 🎯 成功案例: 登录页面

### 最终代码结构
```
GlanceApp/
├── App.tsx                      # 导航配置
├── src/
│   └── screens/
│       └── SignInScreen.tsx     # 登录屏幕
├── package.json                 # 依赖配置
├── babel.config.js              # Babel 配置
└── app.json                     # Expo 配置
```

### 关键配置文件已就绪
- ✅ package.json (SDK 54 + 所有依赖)
- ✅ babel.config.js (简化配置)
- ✅ app.json (Expo 基础配置)
- ✅ SignInScreen.tsx (完整实现)

---

## 🚀 下一页实现清单

实现新页面时，请提供：
1. **PDF 页面编号** (例如: Onboarding Screens Design-2.pdf)
2. **页面描述** (例如: 添加投资组合页面)
3. **特殊要求** (如果有)

我会根据这份指南快速为你生成代码！

---

## 💡 Pro Tips

1. **保持一致性** - 使用相同的颜色变量和间距
2. **组件化** - 相似的 UI 元素提取为可重用组件
3. **类型安全** - 充分利用 TypeScript
4. **测试先行** - 先在浏览器测试，再上真机
5. **渐进增强** - 先实现基础功能，再添加动画等

---

## 📚 资源链接

- Expo 文档: https://docs.expo.dev/
- React Native 文档: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- Expo SDK 54 版本说明: https://expo.dev/changelog/sdk-54

---

**准备好了吗？** 提供下一个 PDF 页面，我会立即为你生成完整代码！🚀
