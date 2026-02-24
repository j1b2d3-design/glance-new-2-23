-- ============================================
-- 修复版：为 alerts 表添加新闻字段
-- ============================================

-- 1. 添加新闻相关字段
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS news_articles JSONB DEFAULT '[]'::jsonb;

-- 2. 添加评论
COMMENT ON COLUMN alerts.news_articles IS '新闻文章数组';

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_alerts_news_articles ON alerts USING gin(news_articles);

-- ============================================
-- 添加示例新闻数据（修复版）
-- ============================================

-- 方法1：更新最新的一个 AAPL 事件
UPDATE alerts
SET news_articles = '[
  {
    "headline": "Apple Unveils Revolutionary AI Model to Compete with Google Gemini",
    "source": "Reuters",
    "summary": "Apple Inc. announced today a breakthrough in artificial intelligence with their new model designed to compete directly with Google''s Gemini. The announcement came during a surprise press event at Apple Park.",
    "url": "https://www.reuters.com/technology/apple-ai-2026-02-06"
  },
  {
    "headline": "Apple Stock Surges 8% Following AI Announcement",
    "source": "Bloomberg",
    "summary": "Apple shares jumped 8% in after-hours trading following the company''s announcement of a new AI initiative. Analysts say this could be a game-changer for the company.",
    "url": "https://www.bloomberg.com/news/apple-stock-surge"
  },
  {
    "headline": "Tim Cook: Apple AI Will Redefine Personal Computing",
    "source": "CNBC",
    "summary": "In an exclusive interview, Apple CEO Tim Cook stated that the company''s new AI technology will fundamentally change how people interact with their devices.",
    "url": "https://www.cnbc.com/2026/02/06/tim-cook-apple-ai.html"
  }
]'::jsonb
WHERE id = (
  SELECT id FROM alerts
  WHERE ticker = 'AAPL'
  ORDER BY created_at DESC
  LIMIT 1
);

-- ============================================
-- 验证数据
-- ============================================

SELECT 
  id,
  ticker,
  headline,
  jsonb_array_length(news_articles) as news_count,
  news_articles->0->>'headline' as first_news_headline,
  news_articles->0->>'source' as first_news_source
FROM alerts
WHERE ticker = 'AAPL'
  AND news_articles IS NOT NULL
  AND jsonb_array_length(news_articles) > 0
ORDER BY created_at DESC
LIMIT 1;
