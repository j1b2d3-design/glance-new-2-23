# 📰 在 Supabase 添加新闻数据 - 完整指南

## 🎯 目标
让 EventAnalysisScreen 的 "Source Articles" 部分显示来自 Supabase 的新闻数据，包括：
- 新闻标题
- 新闻来源（Source）
- 新闻摘要（Summary）
- 原文链接（URL）按钮

---

## 📋 Step 1: 在 Supabase 执行 SQL

### 1.1 打开 Supabase Dashboard
1. 登录 https://app.supabase.com
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**

### 1.2 复制粘贴这段 SQL

```sql
-- ============================================
-- 为 alerts 表添加新闻字段
-- ============================================

-- 1. 添加新闻相关字段
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS news_articles JSONB DEFAULT '[]'::jsonb;

-- 2. 添加评论
COMMENT ON COLUMN alerts.news_articles IS '新闻文章数组';

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_alerts_news_articles ON alerts USING gin(news_articles);
```

点击 **Run** 执行。

---

## 📝 Step 2: 添加示例新闻数据

### 2.1 方式 1：直接在 SQL Editor 执行

```sql
-- 为 AAPL 的事件添加新闻
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Apple Unveils Revolutionary AI Model to Compete with Google Gemini",
    "source": "Reuters",
    "summary": "Apple Inc. announced today a breakthrough in artificial intelligence with their new model designed to compete directly with Google''s Gemini. The announcement came during a surprise press event at Apple Park.",
    "url": "https://www.reuters.com/technology/apple-ai-2026-02-06",
    "datetime": 1707264000
  },
  {
    "headline": "Apple Stock Surges 8% Following AI Announcement",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8% in after-hours trading following the company''s announcement of a new AI initiative. Analysts say this could be a game-changer for the company.",
    "url": "https://www.bloomberg.com/news/apple-stock-surge",
    "datetime": 1707250000
  },
  {
    "headline": "Tim Cook: Apple AI Will Redefine Personal Computing",
    "source": "CNBC",
    "summary": "In an exclusive interview, Apple CEO Tim Cook stated that the company''s new AI technology will fundamentally change how people interact with their devices.",
    "url": "https://www.cnbc.com/2026/02/06/tim-cook-apple-ai.html",
    "datetime": 1707236000
  }
]'::jsonb
WHERE ticker = 'AAPL'
  AND created_at >= NOW() - INTERVAL '7 days'
LIMIT 1;

-- 验证
SELECT 
  id,
  ticker,
  headline,
  jsonb_array_length(news_articles) as news_count
FROM alerts
WHERE ticker = 'AAPL'
ORDER BY created_at DESC
LIMIT 1;
```

### 2.2 方式 2：在 Table Editor 手动添加

1. 点击左侧 **Table Editor**
2. 选择 `alerts` 表
3. 找到一个 AAPL 的事件
4. 点击 `news_articles` 列
5. 粘贴以下 JSON：

```json
[
  {
    "headline": "Apple Unveils Revolutionary AI Model",
    "source": "Reuters",
    "summary": "Apple Inc. announced today a breakthrough in artificial intelligence...",
    "url": "https://www.reuters.com/technology/apple-ai",
    "datetime": 1707264000
  },
  {
    "headline": "Apple Stock Surges 8%",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8% in after-hours trading...",
    "url": "https://www.bloomberg.com/news/apple-stock",
    "datetime": 1707250000
  }
]
```

6. 点击 **Save**

---

## 🔧 Step 3: 代码已自动更新

代码已经修改为：
1. **优先从 Supabase 读取** `event.news_articles`
2. **如果没有**，再去 Finnhub API 获取

你不需要改任何代码！

---

## 🎨 UI 效果预览

现在 Source Articles 会显示：

```
┌─────────────────────────────────────────────┐
│ SOURCE ARTICLES                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Apple Unveils Revolutionary AI Model      ▶ │
│ Reuters • 2h ago                            │
└─────────────────────────────────────────────┘

点击展开后：

┌─────────────────────────────────────────────┐
│ Apple Unveils Revolutionary AI Model      ▼ │
│ Reuters • 2h ago                            │
│                                             │
│ Apple Inc. announced today a breakthrough  │
│ in artificial intelligence with their new  │
│ model designed to compete directly...      │
│                                             │
│ ┌─────────────────────────────────┐        │
│ │ Read full article →             │        │
│ └─────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

---

## ✅ 验证步骤

### 1. 在 Supabase 验证数据

```sql
-- 查看有新闻的事件
SELECT 
  ticker,
  headline,
  jsonb_array_length(news_articles) as news_count,
  news_articles->0->>'headline' as first_news_headline,
  news_articles->0->>'source' as first_news_source
FROM alerts
WHERE news_articles IS NOT NULL 
  AND jsonb_array_length(news_articles) > 0
ORDER BY created_at DESC;
```

### 2. 在 App 中测试

1. 打开 Expo 应用
2. 点击一个 AAPL 事件
3. 点击 "Full Analysis"
4. 滚动到 "Source Articles"
5. 应该看到 3 条新闻

### 3. 查看控制台日志

应该看到：
```
✅ Using news from Supabase: 3 articles
```

---

## 🔄 为其他股票添加新闻

### 为 MSFT 添加新闻

```sql
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Microsoft Announces Major Cloud Computing Expansion",
    "source": "The Wall Street Journal",
    "summary": "Microsoft Corp. unveiled plans to expand its cloud computing infrastructure with a $10 billion investment in new data centers.",
    "url": "https://www.wsj.com/tech/microsoft-cloud-expansion",
    "datetime": 1707260000
  },
  {
    "headline": "Microsoft Teams Integration Gets AI Boost",
    "source": "TechCrunch",
    "summary": "The tech giant is rolling out new AI-powered features to Teams that will help users schedule meetings and summarize conversations.",
    "url": "https://techcrunch.com/2026/02/06/microsoft-teams-ai",
    "datetime": 1707246000
  }
]'::jsonb
WHERE ticker = 'MSFT'
  AND created_at >= NOW() - INTERVAL '7 days'
LIMIT 1;
```

### 为 GOOGL 添加新闻

```sql
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Google Gemini AI Reaches 100 Million Users",
    "source": "Bloomberg",
    "summary": "Google''s Gemini AI assistant has surpassed 100 million users just three months after launch, making it the fastest-growing AI product in history.",
    "url": "https://www.bloomberg.com/news/google-gemini-milestone",
    "datetime": 1707257000
  },
  {
    "headline": "Alphabet Reports Record Quarterly Revenue",
    "source": "Reuters",
    "summary": "Alphabet Inc. reported quarterly revenue of $80 billion, beating analyst expectations by 12% due to strong advertising and cloud growth.",
    "url": "https://www.reuters.com/business/alphabet-earnings",
    "datetime": 1707243000
  }
]'::jsonb
WHERE ticker = 'GOOGL'
  AND created_at >= NOW() - INTERVAL '7 days'
LIMIT 1;
```

---

## 📊 数据结构说明

### news_articles 字段格式

```typescript
[
  {
    "headline": string,      // 必需：新闻标题
    "source": string,        // 必需：新闻来源（Reuters, Bloomberg, etc.）
    "summary": string,       // 必需：新闻摘要
    "url": string,          // 必需：原文链接
    "datetime": number,     // 可选：Unix 时间戳（秒）
    "image": string         // 可选：新闻配图
  }
]
```

### 最少字段要求

```json
[
  {
    "headline": "标题",
    "source": "来源",
    "summary": "摘要",
    "url": "https://..."
  }
]
```

---

## 🚀 批量添加新闻（高级）

### 使用函数批量更新

```sql
-- 创建函数：为所有 AAPL 事件添加相同的新闻
CREATE OR REPLACE FUNCTION add_news_to_ticker(
  p_ticker TEXT,
  p_news_data JSONB
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE alerts
  SET news_articles = p_news_data
  WHERE ticker = p_ticker
    AND created_at >= NOW() - INTERVAL '30 days'
    AND (news_articles IS NULL OR jsonb_array_length(news_articles) = 0);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 使用函数
SELECT add_news_to_ticker('AAPL', '[
  {
    "headline": "Apple Unveils Revolutionary AI Model",
    "source": "Reuters",
    "summary": "Apple Inc. announced...",
    "url": "https://www.reuters.com/..."
  }
]'::jsonb);
```

---

## ⚠️ 常见问题

### Q1: 我添加了新闻，但 App 中看不到？

**A**: 检查：
1. 在 Supabase Table Editor 确认 `news_articles` 有数据
2. 在 App 中下拉刷新
3. 查看控制台日志是否有 "Using news from Supabase"

### Q2: 新闻格式错误？

**A**: 确保 JSON 格式正确，特别注意：
- 使用双引号 `"` 不是单引号 `'`
- URL 中的引号要用 `''` 转义（SQL 中）

### Q3: 如何清空某个事件的新闻？

```sql
UPDATE alerts
SET news_articles = '[]'::jsonb
WHERE ticker = 'AAPL'
  AND id = 'your-event-id';
```

---

## ✅ 完成清单

- [ ] 在 Supabase 执行 ALTER TABLE SQL
- [ ] 为至少 1 个事件添加测试新闻
- [ ] 在 App 中刷新并查看效果
- [ ] 点击新闻卡片展开查看详情
- [ ] 点击 "Read full article" 测试链接

完成后，你的 Source Articles 就会显示来自 Supabase 的新闻数据了！🎉
