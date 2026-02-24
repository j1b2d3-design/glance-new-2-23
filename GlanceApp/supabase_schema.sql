-- ============================================
-- Glance App - Supabase Database Schema
-- ============================================

-- 1. 扩展现有的 alerts 表（如果已存在）
-- 或创建新表 analyzed_events
-- ============================================

CREATE TABLE IF NOT EXISTS analyzed_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 基础信息
  ticker TEXT NOT NULL,
  headline TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('earnings', 'price_spike', 'news_cluster', 'rating_change')),
  
  -- 核心指标 (0-1)
  urgency DECIMAL(3,2) NOT NULL CHECK (urgency >= 0 AND urgency <= 1),
  importance DECIMAL(3,2) NOT NULL CHECK (importance >= 0 AND importance <= 1),
  sentiment DECIMAL(3,2) NOT NULL CHECK (sentiment >= -1 AND sentiment <= 1),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- 分析结果
  reasoning TEXT,
  action_suggestion TEXT CHECK (action_suggestion IN ('wait', 'add', 'reduce', 'close')),
  
  -- 原始数据 (JSON)
  raw_data JSONB,
  
  -- 状态管理
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_notified BOOLEAN DEFAULT FALSE,  -- 是否已发送通知
  
  -- 时间戳
  event_timestamp TIMESTAMPTZ NOT NULL,  -- 事件发生时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT unique_event UNIQUE (ticker, event_type, event_timestamp)
);

-- 索引优化
CREATE INDEX idx_analyzed_events_user_id ON analyzed_events(user_id);
CREATE INDEX idx_analyzed_events_ticker ON analyzed_events(ticker);
CREATE INDEX idx_analyzed_events_urgency ON analyzed_events(urgency DESC);
CREATE INDEX idx_analyzed_events_timestamp ON analyzed_events(event_timestamp DESC);
CREATE INDEX idx_analyzed_events_unread ON analyzed_events(user_id, is_read) WHERE is_read = FALSE;

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_analyzed_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analyzed_events_updated_at
  BEFORE UPDATE ON analyzed_events
  FOR EACH ROW
  EXECUTE FUNCTION update_analyzed_events_updated_at();

-- ============================================
-- 2. 用户持仓表 (如果还没有)
-- ============================================

CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  shares DECIMAL(10,2) NOT NULL,
  cost_basis DECIMAL(10,2),  -- 成本价
  purchase_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_ticker UNIQUE (user_id, ticker)
);

CREATE INDEX idx_user_portfolio_user_id ON user_portfolio(user_id);

-- ============================================
-- 3. 事件缓存表（去重用）
-- ============================================

CREATE TABLE IF NOT EXISTS event_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_hash TEXT NOT NULL,  -- 事件指纹（用于去重）
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_event_hash UNIQUE (event_hash)
);

CREATE INDEX idx_event_cache_ticker ON event_cache(ticker);
CREATE INDEX idx_event_cache_last_seen ON event_cache(last_seen);

-- 自动清理 30 天前的缓存
CREATE OR REPLACE FUNCTION cleanup_old_event_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM event_cache WHERE last_seen < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

ALTER TABLE analyzed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

-- 用户只能看到自己的事件
CREATE POLICY "Users can view their own events"
  ON analyzed_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON analyzed_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON analyzed_events FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能看到自己的持仓
CREATE POLICY "Users can view their own portfolio"
  ON user_portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio"
  ON user_portfolio FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 5. 实用函数
-- ============================================

-- 获取用户未读事件数量
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM analyzed_events
    WHERE user_id = p_user_id
      AND is_read = FALSE
      AND is_archived = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- 标记事件为已读
CREATE OR REPLACE FUNCTION mark_event_read(p_event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE analyzed_events
  SET is_read = TRUE
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 示例数据（测试用）
-- ============================================

-- 插入测试持仓
-- INSERT INTO user_portfolio (user_id, ticker, shares, cost_basis)
-- VALUES 
--   ('46d0a240-dc45-4ef2-8b61-21bfe24b7624', 'AAPL', 100, 150.00),
--   ('46d0a240-dc45-4ef2-8b61-21bfe24b7624', 'MSFT', 50, 300.00);

-- 插入测试事件
-- INSERT INTO analyzed_events (user_id, ticker, headline, event_type, urgency, importance, sentiment, confidence, reasoning, action_suggestion, event_timestamp)
-- VALUES 
--   ('46d0a240-dc45-4ef2-8b61-21bfe24b7624', 'AAPL', 'Apple Unveils Revolutionary AI Model', 'news_cluster', 0.9, 0.9, 1.0, 0.8, '重大利好: revolutionary, breakthrough', 'wait', NOW());
