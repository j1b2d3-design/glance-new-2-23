// 在 generateInsight 函数的 prompt 里，找到这一段：

# 输出格式

请返回纯 JSON（不要有其他文字）：

{
  "urgency_score": <1-10>,
  "user_value_score": <1-10>,
  "market_reaction_score": <1-10>,
  "timing_risk_score": <1-10>,
  "user_fatigue_score": <1-10>,
  "should_push_immediately": <true/false>,
  "overall_score": <1-10>,
  "confidence": <0.5-1.0>,
  "insight": "一句话投资建议（max 20 words）",
  "reasoning": "为什么应该或不应该立即推送（2-3 句）",
  
  // 👇 新增：结构化的 Quick Take 数据
  "quick_take": {
    "driver": "简短描述驱动因素（例如：Guidance ↑）",
    "risk": "简短描述风险（例如：Gap + IV ↑）",
    "impact": "对用户的影响（例如：Likely positive for your ${ticker} position）",
    "market_reaction_expected": "预期市场反应（例如：5-10% upside）"
  }
}

// 说明：
// - driver: 3-5 个词，描述主要驱动因素
// - risk: 3-5 个词，描述主要风险
// - impact: 一句话，描述对用户持仓的影响
// - market_reaction_expected: 预期的股价变动范围或方向
