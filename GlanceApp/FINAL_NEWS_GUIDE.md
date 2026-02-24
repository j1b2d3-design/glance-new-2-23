# 📰 添加新闻到 Supabase alerts 表 - 最终版

## ✅ 根据你现有的代码结构

### 📊 你的 alerts 表结构
```
alerts
├─ id (uuid)
├─ user_id (uuid)
├─ ticker (text) - 股票代码
├─ headline (text) - 事件标题
├─ insight (text)
├─ urgency_score (number) - 紧急度分数
├─ user_value_score (number)
├─ market_reaction_score (number)
├─ overall_score (number)
├─ confidence (number)
├─ reasoning (text)
├─ created_at (timestamp)
└─ news_articles (JSONB) ← 新增字段
```

---

## 🚀 操作步骤

### Step 1: 在 Supabase SQL Editor 执行

复制 `supabase_add_news_FINAL.sql` 全部内容，或者直接复制下面的：

```sql
-- 1. 添加字段
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS news_articles JSONB DEFAULT '[]'::jsonb;

-- 2. 为 AAPL 添加示例新闻
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Apple Unveils Revolutionary AI Model",
    "source": "Reuters",
    "summary": "Apple announced a breakthrough in AI...",
    "url": "https://www.reuters.com/technology/apple-ai"
  },
  {
    "headline": "Apple Stock Surges 8%",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8%...",
    "url": "https://www.bloomberg.com/news/apple-stock"
  }
]'::jsonb
WHERE id IN (
  SELECT id FROM alerts
  WHERE ticker = 'AAPL'
  ORDER BY created_at DESC
  LIMIT 1
);

-- 3. 验证
SELECT 
  ticker,
  headline,
  jsonb_array_length(news_articles) as news_count
FROM alerts
WHERE ticker = 'AAPL'
  AND jsonb_array_length(news_articles) > 0;
```

---

### Step 2: 验证数据

应该看到类似输出：

| ticker | headline | news_count |
|--------|----------|------------|
| AAPL   | Earnings Report | 2 |

---

### Step 3: 代码已自动更新

已修改的文件：
1. ✅ `HomeScreen.tsx` - 添加了 `news_articles` 字段到接口
2. ✅ `EventAnalysisScreen.tsx` - 优先从 `event.news_articles` 读取

---

## 📱 在 App 中测试

1. 在 Expo 应用中下拉刷新
2. 点击一个 AAPL 事件
3. 点击 "Full Analysis"
4. 滚动到 "Source Articles"
5. 应该看到 2 条新闻

---

## 🎨 UI 效果

```
SOURCE ARTICLES

┌─────────────────────────────────────┐
│ Apple Unveils Revolutionary AI... ▶│
│ Reuters • 2h ago                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Apple Stock Surges 8%             ▶│
│ Bloomberg • 5h ago                  │
└─────────────────────────────────────┘
```

点击展开后：

```
┌─────────────────────────────────────┐
│ Apple Unveils Revolutionary AI... ▼│
│ Reuters • 2h ago                    │
│                                     │
│ Apple announced a breakthrough     │
│ in AI...                            │
│                                     │
│ [Read full article →]              │
└─────────────────────────────────────┘
```

---

## ⚠️ 如果看不到新闻

### 检查清单

1. **Supabase 中有数据吗？**
   ```sql
   SELECT ticker, jsonb_array_length(news_articles) 
   FROM alerts 
   WHERE ticker = 'AAPL';
   ```

2. **App 读取到数据了吗？**
   - 查看控制台日志
   - 应该看到：`✅ Using news from Supabase: X articles`

3. **事件传递正确吗？**
   - 确认 HomeScreen 传递了完整的 event 对象给 EventAnalysisScreen

---

## 🔧 调试代码

在 EventAnalysisScreen.tsx 中添加调试日志：

```typescript
useEffect(() => {
  console.log('=== EVENT DATA ===');
  console.log('Ticker:', event.ticker);
  console.log('Has news_articles:', !!event.news_articles);
  console.log('News count:', event.news_articles?.length || 0);
  
  if (event.news_articles) {
    console.log('First article:', event.news_articles[0]);
  }
}, [event]);
```

---

## ✅ 完成！

现在你的 Source Articles 应该显示来自 Supabase 的真实新闻数据了！

如果还有问题，把控制台的日志发给我。
