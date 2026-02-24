# Glance App 分析逻辑架构

## 📊 数据流程图

```
用户打开 App
    ↓
[1] 从 Supabase 获取用户持仓（AAPL, MSFT...）
    ↓
[2] 对每个股票调用 EventAnalyzer.analyzeStock()
    ↓
    ├─→ 并行调用 4 个 Finnhub API（免费）:
    │   ├─ /quote (实时报价)
    │   ├─ /company-news (7天新闻)
    │   ├─ /stock/recommendation (分析师评级)
    │   └─ /calendar/earnings (财报日历)
    ↓
[3] AI 分析逻辑（本地计算）
    ├─ 价格波动检测: |涨跌幅| > 3% ?
    ├─ 新闻簇检测: 24小时内 >= 3条新闻 ?
    ├─ 评级检测: Buy比例 > 70% ?
    └─ 财报检测: 未来7天内有财报 ?
    ↓
[4] 生成 AnalyzedEvent[] 事件列表
    ↓
[5] 与本地缓存对比（EventCache）
    ├─ 新事件 → 发送通知 ✉️
    └─ 已存在 → 忽略
    ↓
[6] 保存到本地缓存
    ↓
[7] 在 HomeScreen 显示
```

---

## 🔍 分析逻辑详解

### 1. 价格异常波动检测

**触发条件:**
- 涨跌幅绝对值 > 3%

**输出指标:**
- **紧急度 (urgency):**
  - >10%: 1.0（极度紧急）
  - >5%: 0.8（很紧急）
  - >3%: 0.6（需要关注）
  
- **情绪 (sentiment):**
  - 涨 → 正值（0.7）
  - 跌 → 负值（-0.7）

- **建议行动:**
  - 有持仓 + 暴涨>10% → `reduce`（减仓止盈）
  - 有持仓 + 暴跌<-10% → `close`（止损）
  - 无持仓 + 大跌<-5% → `add`（抄底机会）
  - 其他 → `wait`（观望）

**示例:**
```
AAPL 大涨 8.5%
  urgency: 0.8
  importance: 0.9（有持仓）
  sentiment: 0.7
  action: reduce
  reasoning: "股价快速上涨，建议关注"
```

---

### 2. 新闻簇检测

**触发条件:**
- 过去 24 小时内有 ≥3 条新闻

**意义:**
- 频繁出现在新闻 = 有重要事件发生
- 需要用户手动查看新闻内容判断

**输出指标:**
- urgency: 0.6
- importance: 0.7
- sentiment: 0（中性，需要看标题）
- action: `wait`

**示例:**
```
TSLA 近期频繁出现在新闻中
  过去 24 小时有 5 条新闻
  → 建议查看具体内容
```

---

### 3. 分析师评级检测

**触发条件:**
- (Strong Buy + Buy) / 总评级数 > 70%

**意义:**
- 多数分析师看好 = 长期利好信号

**输出指标:**
- urgency: 0.4（不紧急）
- importance: 0.6
- sentiment: 0.6（看多）
- confidence: 0.7

**示例:**
```
NVDA 分析师普遍看好
  15 家机构建议买入
  → 长期持有可能有收益
```

---

### 4. 财报日历检测

**触发条件:**
- 未来 7 天内有财报

**意义:**
- 财报前波动加大
- 持仓用户需要提前准备策略

**输出指标:**
- urgency: 
  - ≤2天 → 0.9（很急）
  - 3-7天 → 0.6（提前准备）
- importance: 0.9（有持仓）/ 0.5（无持仓）
- sentiment: 0（中性）
- action: `wait`

**示例:**
```
AAPL 将在 2 天后公布财报
  财报日期：2026-02-08
  → 建议提前设置止损/止盈
```

---

## 💾 本地缓存策略

### 为什么需要缓存？
1. **避免重复通知** - 同一个事件不要通知两次
2. **节省 API 调用** - 免费版限制 60 calls/min
3. **离线查看** - 缓存历史事件

### 缓存逻辑
```typescript
// 判断是否为"新事件"的标准：
1. 相同 ticker
2. 相同 eventType
3. 时间差 < 1 小时
→ 如果以上都满足 = 同一个事件（不通知）
→ 否则 = 新事件（发送通知）
```

### 数据保留策略
- 只保留最近 30 天的事件
- 超过 30 天自动清理

---

## 🎯 实际使用场景

### 场景 1: 持仓股票暴跌
```
用户持有 AAPL 100股
→ AAPL 今天跌 -8%
→ EventAnalyzer 检测到异常
→ 生成事件: urgency=0.8, action=close
→ 检查缓存: 1小时前没有相同事件
→ 发送推送: "AAPL 大跌 8%，建议考虑止损"
→ HomeScreen 显示红色预警卡片
```

### 场景 2: 财报日临近
```
用户持有 TSLA 200股
→ EventAnalyzer 检查财报日历
→ 发现 TSLA 后天公布财报
→ 生成事件: urgency=0.9, importance=0.9
→ 发送推送: "TSLA 将在 2 天后公布财报"
→ HomeScreen 显示 "即将发生" 卡片
```

### 场景 3: 新闻簇
```
用户关注 NVDA（无持仓）
→ NVDA 今天有 5 条新闻
→ EventAnalyzer 检测到新闻簇
→ 生成事件: urgency=0.6, importance=0.7
→ DigestScreen 显示: "NVDA 近期频繁出现"
→ 用户点击查看新闻列表
```

---

## ⚙️ 配置参数

可以调整的阈值：

```typescript
// EventAnalyzer.ts
const CONFIG = {
  PRICE_SPIKE_THRESHOLD: 3,        // 价格波动阈值 (%)
  NEWS_CLUSTER_COUNT: 3,           // 新闻簇阈值 (条)
  NEWS_CLUSTER_HOURS: 24,          // 新闻时间窗口 (小时)
  RATING_BUY_RATIO: 0.7,           // 分析师看多比例 (70%)
  EARNINGS_ALERT_DAYS: 7,          // 财报提前提醒 (天)
  CACHE_RETENTION_DAYS: 30,        // 缓存保留时间 (天)
  EVENT_DEDUP_HOURS: 1,            // 事件去重窗口 (小时)
};
```

---

## 📱 与现有代码集成

### 在 HomeScreen 中使用

```typescript
import { EventAnalyzer } from '../services/EventAnalyzer';
import { EventCache } from '../services/EventCache';

const analyzer = new EventAnalyzer();
const cache = new EventCache();

useEffect(() => {
  const analyzePortfolio = async () => {
    const portfolio = ['AAPL', 'MSFT', 'GOOGL'];
    
    for (const ticker of portfolio) {
      // 1. 分析
      const freshEvents = await analyzer.analyzeStock(ticker, 100);
      
      // 2. 检测新事件
      const { new: newEvents } = await cache.detectNewEvents(freshEvents);
      
      // 3. 通知用户
      if (newEvents.length > 0) {
        setUrgentEvents(prev => [...prev, ...newEvents]);
      }
      
      // 4. 保存缓存
      await cache.saveEvents(freshEvents);
    }
  };
  
  analyzePortfolio();
}, []);
```

---

## ✅ 总结

**免费 API 限制下的最佳实践:**
1. ✅ 使用 4 个免费端点（quote, news, recommendation, earnings）
2. ✅ 本地智能分析（不依赖 Premium 的情绪 API）
3. ✅ 缓存机制减少重复调用
4. ✅ 基于规则的逻辑（价格阈值、新闻数量、评级比例）
5. ✅ 清晰的紧急度/重要度分级

**核心指标含义:**
- `urgency`: 多快需要行动（时间敏感性）
- `importance`: 对用户有多重要（持仓 vs 关注）
- `sentiment`: 看多/看空倾向
- `confidence`: AI 判断的可信度
