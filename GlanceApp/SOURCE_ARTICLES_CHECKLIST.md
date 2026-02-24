# ✅ Source Articles 功能验证清单

## 📊 当前状态

### ✅ 代码已完成
- **EventAnalysisScreen.tsx** (第 312-326 行)
  - ✅ 显示 `article.summary` (第 315 行)
  - ✅ 显示 `article.url` 按钮 (第 317-324 行)
  - ✅ 点击按钮打开链接 `Linking.openURL(article.url)`

### ✅ 数据结构正确
```typescript
newsArticles = [
  {
    headline: string,    // ✅ 显示在标题
    source: string,      // ✅ 显示在来源
    summary: string,     // ✅ 显示在展开内容
    url: string,        // ✅ "Read full article" 按钮链接
    datetime: number    // ✅ "2h ago" 格式
  }
]
```

---

## 🧪 测试步骤

### 1. 验证 Supabase 数据

在 Supabase SQL Editor 执行：

```sql
SELECT 
  ticker,
  headline,
  news_articles->0->>'headline' as first_news,
  news_articles->0->>'source' as source,
  news_articles->0->>'summary' as summary,
  news_articles->0->>'url' as url
FROM alerts
WHERE ticker = 'AAPL'
  AND jsonb_array_length(news_articles) > 0;
```

**期望输出：**
| ticker | headline | first_news | source | summary | url |
|--------|----------|------------|--------|---------|-----|
| AAPL   | ... | Apple Unveils... | Reuters | Apple announced... | https://... |

---

### 2. 在 App 中测试

#### Step 1: 打开事件
1. 在 Expo 应用中下拉刷新
2. 点击一个 AAPL 事件
3. 点击 "Full Analysis"

#### Step 2: 查看新闻列表
滚动到 **SOURCE ARTICLES** 部分，应该看到：

```
┌───────────────────────────────────────┐
│ Apple Unveils Revolutionary AI... ▶  │
│ Reuters • 2h ago                      │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ Apple Stock Surges 8%              ▶  │
│ Bloomberg • 5h ago                    │
└───────────────────────────────────────┘
```

#### Step 3: 展开第一条新闻
点击第一个卡片，应该看到：

```
┌───────────────────────────────────────┐
│ Apple Unveils Revolutionary AI... ▼  │
│ Reuters • 2h ago                      │
│                                       │
│ Apple Inc. announced today a         │
│ breakthrough in artificial           │
│ intelligence with their new model    │
│ designed to compete directly with... │
│                                       │
│ ┌─────────────────────────────┐     │
│ │ Read full article →         │     │
│ └─────────────────────────────┘     │
└───────────────────────────────────────┘
```

✅ **Summary 显示正确**

#### Step 4: 点击 "Read full article" 按钮
- 应该在浏览器中打开 URL
- 例如：`https://www.reuters.com/technology/apple-ai-2026-02-06`

✅ **URL 链接正常工作**

---

## 🎨 UI 元素检查

### ✅ 未展开状态
- [ ] 显示新闻标题（最多 2 行）
- [ ] 显示来源（蓝色文字）
- [ ] 显示时间（灰色，"2h ago" 格式）
- [ ] 右侧有 ▶ 图标

### ✅ 展开状态
- [ ] 标题完整显示
- [ ] Summary 文字清晰可读（灰色，行高 22）
- [ ] "Read full article →" 按钮可见（蓝色带边框）
- [ ] 右侧图标变成 ▼

### ✅ 点击按钮
- [ ] 打开外部浏览器
- [ ] URL 正确跳转
- [ ] 没有报错

---

## 🔍 控制台日志验证

在 App 中应该看到以下日志之一：

```
✅ Using news from Supabase: 2 articles
```

或者（如果 Supabase 没数据）：

```
📡 Fetching news from Finnhub...
✅ Found 15 articles from Finnhub
```

---

## 📝 数据示例

### Supabase 中应有的数据格式

```json
[
  {
    "headline": "Apple Unveils Revolutionary AI Model",
    "source": "Reuters",
    "summary": "Apple Inc. announced today a breakthrough in artificial intelligence with their new model designed to compete directly with Google's Gemini.",
    "url": "https://www.reuters.com/technology/apple-ai-2026-02-06",
    "datetime": 1707264000
  },
  {
    "headline": "Apple Stock Surges 8%",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8% in after-hours trading following the company's announcement of a new AI initiative.",
    "url": "https://www.bloomberg.com/news/apple-stock-surge-2026",
    "datetime": 1707250000
  }
]
```

---

## ⚠️ 常见问题

### Q1: Summary 不显示？
**检查：**
1. 展开了新闻卡片吗？（点击卡片展开）
2. Supabase 数据中有 `summary` 字段吗？
3. Summary 不是空字符串吗？

### Q2: "Read full article" 按钮没反应？
**检查：**
1. URL 格式正确吗？（必须以 `http://` 或 `https://` 开头）
2. 控制台有错误吗？
3. 设备有网络连接吗？

### Q3: 时间显示 "NaN ago"？
**检查：**
1. `datetime` 是 Unix 时间戳（秒）吗？
2. 不是毫秒吗？（如果是毫秒，需要除以 1000）

---

## ✅ 完成！

如果以上所有检查都通过，说明 Source Articles 功能完全正常！

Summary 和 URL 都已经正确应用到界面上了。🎉
