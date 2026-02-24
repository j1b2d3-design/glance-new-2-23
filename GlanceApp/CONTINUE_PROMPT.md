# 🚀 Glance App 开发延续提示词

## 📋 项目背景

我正在将 Figma PDF 设计文件转换为 React Native Expo 应用。

**项目路径**: `c:\Users\25684\Downloads\figma design\GlanceApp`

## ✅ 已完成的页面（1-6页）

1. **WelcomeScreen** (Onboarding Screens Design.pdf) - 欢迎页，带卡片图示和特性列表
2. **SignInScreen** (Onboarding Screens Design-1.pdf) - 登录页，Apple/Google登录
3. **AddPortfolioScreen** (Onboarding Screens Design-2.pdf) - 添加投资组合
4. **ReachableWindowsScreen** (Onboarding Screens Design-3.pdf) - 设置时间窗口，带时间滚轮选择器
5. **FocusScreen** (Onboarding Screens Design-4.pdf) - 选择关注的行业和主题
6. **RiskComfortScreen** (Onboarding Screens Design-5.pdf) - 风险舒适度设置，带卡片放大效果

## 🎯 当前技术栈

### package.json 配置（SDK 54，非常重要）
```json
{
  "name": "glance-app",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
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
    "react-native-safe-area-context": "~5.3.0",
    "@react-native-community/datetimepicker": "8.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~19.1.0",
    "typescript": "~5.7.0"
  }
}
```

### babel.config.js（简化版本，重要）
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

## 🎨 设计系统和样式规范

### 颜色方案
```typescript
背景色: '#000000' (纯黑)
卡片背景: '#1C1C1E' (深灰)
卡片边框: '#2C2C2E' (中灰)
选中边框: '#3B82F6' (蓝色)
主文字: '#FFFFFF' (白色)
副文字: '#9CA3AF' (浅灰)
提示文字: '#6B7280' (中灰)
绿色按钮: '#22C55E'
蓝色强调: '#3B82F6'
```

### 布局规范
```typescript
container: {
  flex: 1,
  backgroundColor: '#000000',
}
content: {
  flex: 1,
  paddingHorizontal: 24,
  paddingTop: 80,  // 标准顶部间距
  paddingBottom: 40,
}
header: {
  marginBottom: 40,  // 标题和内容的间距
}
```

### 标题样式
```typescript
title: {
  fontSize: 28,
  fontWeight: '700',
  color: '#FFFFFF',
  marginBottom: 16,
  letterSpacing: -0.5,
}
subtitle: {
  fontSize: 16,
  lineHeight: 24,
  color: '#9CA3AF',
  fontWeight: '400',
}
```

### 按钮样式
```typescript
// 绿色主按钮
nextButton: {
  backgroundColor: '#22C55E',
  paddingVertical: 18,
  paddingHorizontal: 24,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
}

// 深色卡片按钮
optionCard: {
  backgroundColor: '#1C1C1E',
  borderRadius: 14,
  padding: 20,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#2C2C2E',
}
```

## 📱 导航结构

```typescript
// App.tsx 中的导航配置
<Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Welcome" component={WelcomeScreen} />
  <Stack.Screen name="SignIn" component={SignInScreen} />
  <Stack.Screen name="AddPortfolio" component={AddPortfolioScreen} />
  <Stack.Screen name="ReachableWindows" component={ReachableWindowsScreen} />
  <Stack.Screen name="Focus" component={FocusScreen} />
  <Stack.Screen name="RiskComfort" component={RiskComfortScreen} />
  {/* 在这里添加新页面 */}
</Stack.Navigator>
```

## 🎯 组件模板（复制使用）

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface ScreenNameProps {
  navigation: any;
}

export default function ScreenName({ navigation }: ScreenNameProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>页面标题</Text>
          <Text style={styles.subtitle}>
            副标题说明文字（会自动换行）
          </Text>
        </View>

        {/* 主要内容区域 */}
        <View style={styles.mainContent}>
          {/* 根据 PDF 添加内容 */}
        </View>

        {/* Next 按钮 */}
        <TouchableOpacity 
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('NextScreen')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
```

## 🔑 关键注意事项

### 1. 版本匹配（最重要！）
- Expo SDK: **54.0.0**
- React: **19.1.0**
- React Native: **0.81.5**
- 安装依赖使用: `npm install --legacy-peer-deps`

### 2. 文字换行规则
- **自动换行**: 直接写文字，不加 `{'\n'}`
- **固定换行**: 使用 `{'\n'}` 强制在指定位置换行

### 3. 常用组件
- 卡片: `backgroundColor: '#1C1C1E'`, `borderRadius: 14`, `padding: 20`
- 标签: 可选择的标签使用 state 控制选中状态
- 开关: 使用 React Native 的 `<Switch>` 组件
- 时间选择器: 使用 `@react-native-community/datetimepicker`

### 4. 布局技巧
- 标题靠左: `alignItems: 'flex-start'`, `textAlign: 'left'`
- 内容居中: `alignItems: 'center'`, `textAlign: 'center'`
- 按钮置底: `marginTop: 'auto'`

## 📝 下一步任务

**我需要实现第7页（Onboarding Screens Design-6.pdf）**

请帮我：
1. 读取 `Onboarding Screens Design-6.pdf` 的内容
2. 分析页面的布局、UI 元素、交互
3. 创建新的 Screen 组件（在 `src/screens/` 目录）
4. 更新 `App.tsx` 添加路由
5. 更新上一页的导航链接

## 🎯 新对话开始提示词

```
你好！我正在开发 Glance App，一个 React Native Expo 应用。

项目位置: c:\Users\25684\Downloads\figma design\GlanceApp

我已经完成了前 6 页的开发（Welcome → SignIn → AddPortfolio → ReachableWindows → Focus → RiskComfort）。

现在需要你帮我实现第 7 页：

请读取 "c:\Users\25684\Downloads\figma design\Onboarding Screens Design-6.pdf" 并：
1. 分析页面设计和布局
2. 创建对应的 React Native 组件
3. 遵循项目的设计系统（见 IMPLEMENTATION_GUIDE.md）
4. 更新导航配置

注意事项：
- 使用 Expo SDK 54
- 背景色: #000000
- 顶部间距: paddingTop: 80
- 文字自动换行（除非需要固定换行位置）
- 绿色 Next 按钮: #22C55E
- 卡片样式: #1C1C1E 背景，14px 圆角

当前导航链接：RiskComfortScreen 的 Next 按钮应该导航到第 7 页。
```

## 📄 重要文件位置

- 所有屏幕: `src/screens/`
- 导航配置: `App.tsx`
- 实现指南: `IMPLEMENTATION_GUIDE.md`
- 依赖配置: `package.json`

## 💡 快速开始命令

```bash
cd "c:\Users\25684\Downloads\figma design\GlanceApp"
npm start
```

---

**复制上面的"新对话开始提示词"部分，粘贴到新的对话中，AI 会理解你的项目并继续开发第7页！** 🚀
