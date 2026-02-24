-- ============================================
-- 升级 reasoning_chain 从 TEXT 到 JSONB
-- （支持结构化的推理链节点数组）
-- ============================================

-- 方案 1：清空旧数据再改类型（推荐）
-- analyzed_events 表
UPDATE analyzed_events SET reasoning_chain = NULL WHERE reasoning_chain IS NOT NULL;
ALTER TABLE analyzed_events ALTER COLUMN reasoning_chain TYPE JSONB USING NULL;

-- alerts 表
UPDATE alerts SET reasoning_chain = NULL WHERE reasoning_chain IS NOT NULL;
ALTER TABLE alerts ALTER COLUMN reasoning_chain TYPE JSONB USING NULL;

-- 添加 reasoning_chain_summary 列（存一行文字摘要）
ALTER TABLE analyzed_events ADD COLUMN IF NOT EXISTS reasoning_chain_summary TEXT;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS reasoning_chain_summary TEXT;

-- ============================================
-- 方案 2：如果你想保留旧数据（备用方案，不推荐）
-- ============================================
-- 先创建新列
-- ALTER TABLE analyzed_events ADD COLUMN IF NOT EXISTS reasoning_chain_new JSONB;
-- ALTER TABLE alerts ADD COLUMN IF NOT EXISTS reasoning_chain_new JSONB;

-- 把旧列重命名
-- ALTER TABLE analyzed_events RENAME COLUMN reasoning_chain TO reasoning_chain_old;
-- ALTER TABLE alerts RENAME COLUMN reasoning_chain TO reasoning_chain_old;

-- 把新列重命名回 reasoning_chain
-- ALTER TABLE analyzed_events RENAME COLUMN reasoning_chain_new TO reasoning_chain;
-- ALTER TABLE alerts RENAME COLUMN reasoning_chain_new TO reasoning_chain;

