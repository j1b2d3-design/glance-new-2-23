# 用 Finnhub API 替代 Webhook 运行程序

## 1. 配置 API Key

在 Supabase Dashboard → Edge Functions → 你的函数 → **Secrets** 里确认有：

- `FINNHUB_KEY` = 你的 Finnhub API Key（在 Finnhub Dashboard 复制）

## 2. 手动触发（测试）

部署更新后的 `super-handler` 后，用浏览器或 curl 访问：

```
https://你的supabase项目.supabase.co/functions/v1/super-handler?trigger=api
```

或指定股票：
```
https://你的supabase项目.supabase.co/functions/v1/super-handler?trigger=api&tickers=AAPL,TSLA,MSFT
```

## 3. 定时运行（Cron）

在 Supabase Dashboard → **Database** → **Extensions** 启用 `pg_cron`，然后执行：

```sql
SELECT cron.schedule(
  'finnhub-api-hourly',
  '0 * * * *',
  $$
  SELECT net.http_get(
    'https://你的项目ref.supabase.co/functions/v1/super-handler?trigger=api',
    '{}'::jsonb,
    '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
```

这样每小时会调用一次，用 Finnhub API 拉取新闻并分析。

## 4. 两种模式对比

| 方式 | 触发 | 数据来源 |
|------|------|----------|
| Webhook | Finnhub 推送 | Webhook payload + Finnhub API 补充 |
| API | 手动 / Cron | 纯 Finnhub API（quote, news, profile, earnings） |

两种方式可以并存：有 webhook 时照常处理，没有时用 API 定时拉取。
