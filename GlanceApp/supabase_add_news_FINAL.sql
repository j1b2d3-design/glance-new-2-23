-- ============================================
-- 为 alerts 表添加新闻字段 - 正确版本
-- ============================================

-- 1. 添加 news_articles 字段到现有的 alerts 表
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS news_articles JSONB DEFAULT '[]'::jsonb;

-- 2. 添加注释
COMMENT ON COLUMN alerts.news_articles IS '新闻文章数组，包含 headline, source, summary, url';

-- 3. 创建索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_alerts_news_articles ON alerts USING gin(news_articles);

-- ============================================
-- 查看现有的 alerts 数据
-- ============================================

-- 查看你的 alerts 表有哪些 ticker
SELECT 
  id,
  ticker,
  headline,
  urgency_score,
  created_at
FROM alerts
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 为 AAPL 事件添加示例新闻
-- ============================================

-- 更新 AAPL 的最新事件
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
    "url": "https://www.bloomberg.com/news/apple-stock-surge-2026",
    "datetime": 1707250000
  },
  {
    "headline": "Tim Cook: Apple AI Will Redefine Personal Computing",
    "source": "CNBC",
    "summary": "In an exclusive interview, Apple CEO Tim Cook stated that the company''s new AI technology will fundamentally change how people interact with their devices. The new model includes on-device processing and enhanced privacy features.",
    "url": "https://www.cnbc.com/2026/02/06/tim-cook-apple-ai-interview.html",
    "datetime": 1707236000
  }
]'::jsonb
WHERE id IN (
  SELECT id FROM alerts
  WHERE ticker = 'AAPL'
  ORDER BY created_at DESC
  LIMIT 1
);

-- ============================================
-- 验证更新是否成功
-- ============================================

SELECT 
  ticker,
  headline,
  urgency_score,
  jsonb_array_length(news_articles) as news_count,
  news_articles->0->>'headline' as first_news_title,
  news_articles->0->>'source' as first_news_source
FROM alerts
WHERE ticker = 'AAPL'
  AND news_articles IS NOT NULL
  AND jsonb_array_length(news_articles) > 0
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- 可选：为其他股票也添加新闻
-- ============================================

-- 为 MSFT 添加新闻
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Microsoft Announces Major Cloud Computing Expansion",
    "source": "The Wall Street Journal",
    "summary": "Microsoft Corp. unveiled plans to expand its cloud computing infrastructure with a $10 billion investment in new data centers across North America and Europe.",
    "url": "https://www.wsj.com/tech/microsoft-cloud-expansion-2026",
    "datetime": 1707260000
  },
  {
    "headline": "Microsoft Teams Gets AI-Powered Meeting Assistant",
    "source": "TechCrunch",
    "summary": "The tech giant is rolling out new AI-powered features to Teams that will help users schedule meetings, summarize conversations, and generate action items automatically.",
    "url": "https://techcrunch.com/2026/02/06/microsoft-teams-ai-assistant",
    "datetime": 1707246000
  }
]'::jsonb
WHERE id IN (
  SELECT id FROM alerts
  WHERE ticker = 'MSFT'
  ORDER BY created_at DESC
  LIMIT 1
);

-- 验证
SELECT ticker, headline, jsonb_array_length(news_articles) as news_count
FROM alerts
WHERE ticker IN ('AAPL', 'MSFT')
  AND news_articles IS NOT NULL
  AND jsonb_array_length(news_articles) > 0;
