# 新闻分析案例：Apple AI 模型

## 📰 原始新闻
```json
{
  "headline": "Apple Unveils Revolutionary AI Model to Compete with Google Gemini",
  "summary": "Apple announced today a breakthrough in artificial intelligence with their new model...",
  "datetime": 1707264000,
  "source": "Reuters"
}
```

---

## 🔍 系统分析过程

### Step 1: 文本提取
```
完整文本 = "apple unveils revolutionary ai model to compete with google gemini 
            apple announced today a breakthrough in artificial intelligence..."
```

### Step 2: 关键词匹配

| 类型 | 关键词 | 匹配结果 | 情绪值 | 原因 |
|------|--------|----------|--------|------|
| 🟢 利好（强） | `revolutionary` | ✅ | +0.8 | 重大利好 |
| 🟢 利好（强） | `breakthrough` | ✅ | +0.8 | 重大利好 |
| 🟢 产品发布 | `unveils` | ✅ | +0.6 | 新产品发布 |
| 🟢 产品发布 | `ai model` | ✅ | +0.6 | 新产品发布 |
| 🔵 竞争 | `compete` | ✅ | +0.2 | 进入竞争市场（积极拓展）|

**总情绪值**: 0.8 + 0.8 + 0.6 + 0.6 + 0.2 = **3.0** → 限制为 **1.0**（最大值）

---

## 📊 生成的事件

```typescript
{
  id: "AAPL_news_1707264000",
  ticker: "AAPL",
  headline: "Apple Unveils Revolutionary AI Model to Compete with Google Gemini",
  eventType: "news_cluster",
  
  // 核心指标
  urgency: 0.7,          // 1.0 × 0.7 = 0.7（较紧急）
  importance: 0.9,       // 新产品 + 重大突破
  sentiment: 1.0,        // 极度利好
  confidence: 0.8,       // 高可信度（多个强关键词）
  
  // 原始数据
  rawData: {
    news: [{ ... }]
  },
  
  // 分析结果
  reasoning: "重大利好: revolutionary, 重大利好: breakthrough, 新产品发布: unveils, 新产品发布: ai model, 进入竞争市场（积极拓展）",
  actionSuggestion: "wait",  // 有持仓 → 继续持有
                              // 无持仓 → "add"（考虑买入）
  
  timestamp: 1707264000000
}
```

---

## 📱 用户界面显示

### HomeScreen - 紧急事件卡片
```
┌─────────────────────────────────────┐
│ 🔥 AAPL                             │
│                                     │
│ Apple Unveils Revolutionary AI      │
│ Model to Compete with Google Gemini │
│                                     │
│ 📈 极度利好  ⚡ 较紧急               │
│                                     │
│ 💡 重大利好: revolutionary,         │
│    breakthrough; 新产品发布: ai     │
│    model                            │
│                                     │
│ 建议: 继续持有 👍                   │
│                                     │
│ 2 分钟前                            │
└─────────────────────────────────────┘
```

---

## 🔔 推送通知

```
标题: AAPL 重大利好！
内容: Apple 发布革命性 AI 模型对抗 Gemini
      情绪: 📈 极度利好
      建议: 继续持有
```

---

## 🆚 对比：改进前 vs 改进后

| 维度 | 改进前 ❌ | 改进后 ✅ |
|------|----------|----------|
| **能否识别** | 只检测到 "1 条新闻"（不触发） | 识别为"重大利好新闻" |
| **情绪判断** | sentiment = 0（中性） | sentiment = 1.0（极度利好）|
| **重要度** | importance = 0.5（普通） | importance = 0.9（重要）|
| **推送** | ❌ 不推送（未达到 3 条阈值） | ✅ 立即推送（单条重要新闻）|
| **建议** | "观望" | "继续持有" 或 "考虑买入" |
| **解释** | "建议查看具体内容" | "重大利好：revolutionary, breakthrough..." |

---

## 🎯 关键词库设计思路

### 利好关键词（Bullish）
- **强利好** (sentiment +0.8): 
  - `breakthrough`, `revolutionary`, `record`, `beat expectations`, `surge`, `soar`
  
- **中等利好** (sentiment +0.5):
  - `partnership`, `innovation`, `launch`, `expand`, `growth`, `upgrade`
  
- **产品相关** (sentiment +0.6):
  - `new product`, `unveils`, `announces`, `ai model`, `new technology`

### 利空关键词（Bearish）
- **强利空** (sentiment -0.8):
  - `lawsuit`, `investigation`, `plunge`, `crash`, `bankruptcy`, `scandal`
  
- **中等利空** (sentiment -0.5):
  - `recall`, `delay`, `miss`, `downgrade`, `cut`, `decline`

### 竞争关键词（Neutral → Bullish）
- `compete`, `rival`, `challenge`, `vs`, `against`
- **逻辑**: 如果新闻整体是利好（sentiment > 0），竞争意味着"积极拓展市场" → +0.2

---

## 🔧 可调参数

```typescript
// 触发"重要新闻"的阈值
const SIGNIFICANT_THRESHOLD = {
  sentimentAbs: 0.4,    // |情绪值| > 0.4
  importance: 0.7,      // 或重要度 > 0.7
};

// 关键词权重
const KEYWORD_WEIGHTS = {
  strongBullish: 0.8,   // 强利好权重
  mediumBullish: 0.5,   // 中等利好
  productLaunch: 0.6,   // 产品发布
  competition: 0.2,     // 竞争加成
};
```

---

## ✅ 总结

**现在系统能做什么:**
1. ✅ 单条重要新闻也会触发（不需要等 3 条）
2. ✅ 理解新闻情绪（利好/利空/中性）
3. ✅ 给出合理建议（买入/持有/减仓）
4. ✅ 解释分析原因（"重大利好: revolutionary..."）

**局限性:**
- ⚠️ 基于关键词（不如 GPT 理解深）
- ⚠️ 无法理解讽刺/反转（"Apple's 'Revolutionary' AI Falls Short"）
- ⚠️ 需要持续更新关键词库

**改进方向（未来）:**
- 接入 OpenAI API 做深度语义分析
- 添加行业特定关键词（科技/金融/医药）
- 学习用户反馈（用户点击 👍/👎 调整权重）
