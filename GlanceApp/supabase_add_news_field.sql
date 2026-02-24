-- ============================================
-- 为 alerts 表添加新闻字段
-- ============================================

-- 1. 添加新闻相关字段
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS news_articles JSONB DEFAULT '[]'::jsonb;

-- news_articles 的结构示例：
-- [
--   {
--     "headline": "Apple Announces AI Initiative",
--     "source": "Reuters",
--     "summary": "Apple Inc. announced today...",
--     "url": "https://www.reuters.com/...",
--     "datetime": 1707264000,
--     "image": "https://..."
--   }
-- ]

-- 2. 添加评论（方便记住字段用途）
COMMENT ON COLUMN alerts.news_articles IS '新闻文章数组，包含 headline, source, summary, url, datetime, image';

-- 3. 创建索引（加快查询速度）
CREATE INDEX IF NOT EXISTS idx_alerts_news_articles ON alerts USING gin(news_articles);

-- ============================================
-- 测试数据：为现有事件添加示例新闻
-- ============================================

-- 更新某个事件，添加示例新闻数据
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Apple Unveils Revolutionary AI Model to Compete with Google Gemini",
    "source": "Reuters",
    "summary": "Apple Inc. announced today a breakthrough in artificial intelligence with their new model designed to compete directly with Google''s Gemini. The announcement came during a surprise press event at Apple Park.",
    "url": "https://www.reuters.com/technology/apple-ai-2026-02-06",
    "datetime": 1707264000,
    "image": "https://static.finnhub.io/news/aapl-ai-2026.jpg"
  },
  {
    "headline": "Apple Stock Surges 8% Following AI Announcement",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8% in after-hours trading following the company''s announcement of a new AI initiative. Analysts say this could be a game-changer for the company.",
    "url": "https://www.bloomberg.com/news/apple-stock-surge",
    "datetime": 1707250000,
    "image": "https://static.finnhub.io/news/aapl-stock-2026.jpg"
  },
  {
    "headline": "Tim Cook: Apple AI Will Redefine Personal Computing",
    "source": "CNBC",
    "summary": "In an exclusive interview, Apple CEO Tim Cook stated that the company''s new AI technology will fundamentally change how people interact with their devices.",
    "url": "https://www.cnbc.com/2026/02/06/tim-cook-apple-ai.html",
    "datetime": 1707236000,
    "image": "https://static.finnhub.io/news/tim-cook-interview.jpg"
  }
]'::jsonb
WHERE ticker = 'AAPL'
  AND created_at >= NOW() - INTERVAL '7 days'
LIMIT 1;

-- ============================================
-- 查询验证：查看更新后的数据
-- ============================================

SELECT 
  id,
  ticker,
  headline,
  jsonb_array_length(news_articles) as news_count,
  news_articles
FROM alerts
WHERE news_articles IS NOT NULL 
  AND jsonb_array_length(news_articles) > 0
ORDER BY created_at DESC
LIMIT 5;
