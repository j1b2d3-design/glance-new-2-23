import Constants from 'expo-constants';

// ==================== 数据结构定义 ====================

/** Finnhub API 返回的原始数据 */
interface FinnhubQuote {
  c: number;  // 当前价
  d: number;  // 涨跌额
  dp: number; // 涨跌幅 %
  h: number;  // 日高
  l: number;  // 日低
  o: number;  // 开盘价
  pc: number; // 昨收价
}

interface FinnhubNews {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // Unix timestamp
}

interface FinnhubRecommendation {
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string; // "2026-02-01"
}

interface FinnhubEarnings {
  date: string;     // "2026-02-15"
  epsActual: number | null;
  epsEstimate: number | null;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
}

/** 综合分析后的事件 */
export interface AnalyzedEvent {
  id: string;
  ticker: string;
  headline: string;
  eventType: 'earnings' | 'price_spike' | 'news_cluster' | 'rating_change';
  
  // 核心指标
  urgency: number;      // 0-1，需要多快行动（越高越急）
  importance: number;   // 0-1，对用户的重要程度
  sentiment: number;    // -1到1，看多/看空
  confidence: number;   // 0-1，AI 分析的信心
  
  // 原始数据
  rawData: {
    quote?: FinnhubQuote;
    news?: FinnhubNews[];
    recommendations?: FinnhubRecommendation;
    earnings?: FinnhubEarnings;
  };
  
  // 解释
  reasoning: string;
  actionSuggestion: 'wait' | 'add' | 'reduce' | 'close';
  
  timestamp: number;
}

// ==================== 核心分析引擎 ====================

export class EventAnalyzer {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';
  
  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY || '';
  }
  
  // ==================== 主函数：分析单个股票 ====================
  async analyzeStock(ticker: string, userHoldings?: number): Promise<AnalyzedEvent[]> {
    try {
      // 1. 并行获取所有免费数据
      const [quote, news, recommendations, earnings] = await Promise.all([
        this.fetchQuote(ticker),
        this.fetchNews(ticker),
        this.fetchRecommendations(ticker),
        this.fetchUpcomingEarnings(ticker),
      ]);
      
      const events: AnalyzedEvent[] = [];
      
      // 2. 检测异常价格波动
      if (quote && Math.abs(quote.dp) > 3) {
        events.push({
          id: `${ticker}_price_${Date.now()}`,
          ticker,
          headline: `${ticker} ${quote.dp > 0 ? '大涨' : '大跌'} ${Math.abs(quote.dp).toFixed(1)}%`,
          eventType: 'price_spike',
          urgency: this.calculatePriceUrgency(quote),
          importance: userHoldings ? 0.9 : 0.6, // 持仓的更重要
          sentiment: quote.dp > 0 ? 0.7 : -0.7,
          confidence: 0.8,
          rawData: { quote },
          reasoning: `股价 ${quote.dp > 0 ? '快速上涨' : '快速下跌'}，建议关注`,
          actionSuggestion: this.suggestAction(quote.dp, userHoldings),
          timestamp: Date.now(),
        });
      }
      
      // 3. 新闻分析（关键词检测 + 新闻簇）
      if (news && news.length > 0) {
        const recentNews = news.filter(n => 
          Date.now() - n.datetime * 1000 < 24 * 60 * 60 * 1000 // 24小时内
        );
        
        // 3.1 关键词情绪分析（单条重要新闻）
        for (const newsItem of recentNews) {
          const analysis = this.analyzeNewsSentiment(newsItem);
          
          if (analysis.isSignificant) {
            events.push({
              id: `${ticker}_news_${newsItem.datetime}`,
              ticker,
              headline: newsItem.headline,
              eventType: 'news_cluster',
              urgency: analysis.urgency,
              importance: analysis.importance,
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              rawData: { news: [newsItem] },
              reasoning: analysis.reasoning,
              actionSuggestion: this.suggestActionFromSentiment(analysis.sentiment, userHoldings),
              timestamp: newsItem.datetime * 1000,
            });
          }
        }
        
        // 3.2 新闻簇检测（多条新闻聚集）
        if (recentNews.length >= 3) {
          const clusterSentiment = this.calculateClusterSentiment(recentNews);
          
          events.push({
            id: `${ticker}_news_cluster_${Date.now()}`,
            ticker,
            headline: `${ticker} 近期频繁出现在新闻中`,
            eventType: 'news_cluster',
            urgency: 0.7,
            importance: 0.8,
            sentiment: clusterSentiment,
            confidence: 0.6,
            rawData: { news: recentNews },
            reasoning: `过去 24 小时有 ${recentNews.length} 条新闻，整体偏${clusterSentiment > 0 ? '正面' : clusterSentiment < 0 ? '负面' : '中性'}`,
            actionSuggestion: 'wait',
            timestamp: Date.now(),
          });
        }
      }
      
      // 4. 检测分析师评级变化
      if (recommendations && recommendations.length > 0) {
        const latest = recommendations[0];
        const buyRatio = (latest.strongBuy + latest.buy) / 
          (latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell);
        
        if (buyRatio > 0.7) {
          events.push({
            id: `${ticker}_rating_${Date.now()}`,
            ticker,
            headline: `${ticker} 分析师普遍看好`,
            eventType: 'rating_change',
            urgency: 0.4,
            importance: 0.6,
            sentiment: 0.6,
            confidence: 0.7,
            rawData: { recommendations: latest },
            reasoning: `${latest.strongBuy + latest.buy} 家机构建议买入`,
            actionSuggestion: 'wait',
            timestamp: Date.now(),
          });
        }
      }
      
      // 5. 检测即将到来的财报
      if (earnings) {
        const earningsDate = new Date(earnings.date);
        const daysUntil = Math.floor((earningsDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        
        if (daysUntil >= 0 && daysUntil <= 7) {
          events.push({
            id: `${ticker}_earnings_${Date.now()}`,
            ticker,
            headline: `${ticker} 将在 ${daysUntil} 天后公布财报`,
            eventType: 'earnings',
            urgency: daysUntil <= 2 ? 0.9 : 0.6,
            importance: userHoldings ? 0.9 : 0.5,
            sentiment: 0, // 财报前中性
            confidence: 1.0,
            rawData: { earnings },
            reasoning: `财报日期：${earnings.date}`,
            actionSuggestion: userHoldings ? 'wait' : 'wait',
            timestamp: Date.now(),
          });
        }
      }
      
      return events;
      
    } catch (error) {
      console.error(`Error analyzing ${ticker}:`, error);
      return [];
    }
  }
  
  // ==================== 辅助函数：计算指标 ====================
  
  /**
   * 分析单条新闻的情绪（基于关键词）
   */
  private analyzeNewsSentiment(news: FinnhubNews): {
    isSignificant: boolean;
    sentiment: number;
    urgency: number;
    importance: number;
    confidence: number;
    reasoning: string;
  } {
    const text = `${news.headline} ${news.summary}`.toLowerCase();
    
    // 定义关键词库
    const BULLISH_KEYWORDS = {
      strong: ['breakthrough', 'revolutionary', 'record', 'beat expectations', 'surge', 'soar', 'rally'],
      medium: ['partnership', 'innovation', 'launch', 'expand', 'growth', 'upgrade', 'positive'],
      product: ['new product', 'unveils', 'announces', 'releases', 'ai model', 'new technology'],
    };
    
    const BEARISH_KEYWORDS = {
      strong: ['lawsuit', 'investigation', 'plunge', 'crash', 'bankruptcy', 'scandal', 'fraud'],
      medium: ['recall', 'delay', 'miss', 'downgrade', 'cut', 'decline', 'loss'],
      regulatory: ['antitrust', 'fine', 'ban', 'restriction', 'regulation'],
    };
    
    const COMPETITION_KEYWORDS = ['compete', 'rival', 'challenge', 'vs', 'against'];
    
    let sentiment = 0;
    let importance = 0.5;
    let confidence = 0.5;
    let reasons: string[] = [];
    
    // 检测利好关键词
    for (const keyword of BULLISH_KEYWORDS.strong) {
      if (text.includes(keyword)) {
        sentiment += 0.8;
        importance = 0.9;
        confidence = 0.8;
        reasons.push(`重大利好: ${keyword}`);
      }
    }
    
    for (const keyword of BULLISH_KEYWORDS.medium) {
      if (text.includes(keyword)) {
        sentiment += 0.5;
        importance = Math.max(importance, 0.7);
        reasons.push(`利好: ${keyword}`);
      }
    }
    
    for (const keyword of BULLISH_KEYWORDS.product) {
      if (text.includes(keyword)) {
        sentiment += 0.6;
        importance = Math.max(importance, 0.8);
        confidence = 0.7;
        reasons.push(`新产品发布: ${keyword}`);
      }
    }
    
    // 检测利空关键词
    for (const keyword of BEARISH_KEYWORDS.strong) {
      if (text.includes(keyword)) {
        sentiment -= 0.8;
        importance = 0.9;
        confidence = 0.8;
        reasons.push(`重大利空: ${keyword}`);
      }
    }
    
    for (const keyword of BEARISH_KEYWORDS.medium) {
      if (text.includes(keyword)) {
        sentiment -= 0.5;
        importance = Math.max(importance, 0.7);
        reasons.push(`利空: ${keyword}`);
      }
    }
    
    // 检测竞争关键词（中性偏利好）
    const hasCompetition = COMPETITION_KEYWORDS.some(kw => text.includes(kw));
    if (hasCompetition && sentiment > 0) {
      reasons.push('进入竞争市场（积极拓展）');
      sentiment += 0.2; // 轻微加分
    }
    
    // 限制范围
    sentiment = Math.max(-1, Math.min(1, sentiment));
    
    // 是否足够重要到需要单独通知
    const isSignificant = Math.abs(sentiment) > 0.4 || importance > 0.7;
    
    return {
      isSignificant,
      sentiment,
      urgency: Math.abs(sentiment) * 0.7, // 情绪越强，越紧急
      importance,
      confidence,
      reasoning: reasons.length > 0 ? reasons.join(', ') : '常规新闻',
    };
  }
  
  /**
   * 计算新闻簇的整体情绪
   */
  private calculateClusterSentiment(newsArray: FinnhubNews[]): number {
    let totalSentiment = 0;
    
    for (const news of newsArray) {
      const analysis = this.analyzeNewsSentiment(news);
      totalSentiment += analysis.sentiment;
    }
    
    return totalSentiment / newsArray.length;
  }
  
  /**
   * 根据新闻情绪建议行动
   */
  private suggestActionFromSentiment(sentiment: number, hasHoldings?: number): 'wait' | 'add' | 'reduce' | 'close' {
    if (!hasHoldings) {
      // 无持仓
      if (sentiment > 0.7) return 'add';  // 强烈利好 → 考虑买入
      return 'wait';
    }
    
    // 有持仓
    if (sentiment < -0.7) return 'reduce'; // 强烈利空 → 考虑减仓
    if (sentiment > 0.7) return 'wait';    // 利好 → 继续持有
    return 'wait';
  }
  
  private calculatePriceUrgency(quote: FinnhubQuote): number {
    const absChange = Math.abs(quote.dp);
    
    if (absChange > 10) return 1.0;   // >10% 极度紧急
    if (absChange > 5)  return 0.8;   // >5% 很紧急
    if (absChange > 3)  return 0.6;   // >3% 需要关注
    return 0.3;
  }
  
  private suggestAction(priceChangePercent: number, hasHoldings?: number): 'wait' | 'add' | 'reduce' | 'close' {
    if (!hasHoldings) {
      // 没有持仓
      if (priceChangePercent < -5) return 'add';  // 大跌可能是机会
      return 'wait';
    }
    
    // 有持仓
    if (priceChangePercent > 10) return 'reduce'; // 暴涨考虑减仓
    if (priceChangePercent < -10) return 'close'; // 暴跌考虑止损
    return 'wait';
  }
  
  // ==================== API 调用函数 ====================
  
  private async fetchQuote(ticker: string): Promise<FinnhubQuote | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${ticker}&token=${this.apiKey}`
      );
      const data = await response.json();
      return data.c ? data : null;
    } catch (error) {
      console.error(`Error fetching quote for ${ticker}:`, error);
      return null;
    }
  }
  
  private async fetchNews(ticker: string): Promise<FinnhubNews[]> {
    try {
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${this.baseUrl}/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${this.apiKey}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, 5) : []; // 最多5条
    } catch (error) {
      console.error(`Error fetching news for ${ticker}:`, error);
      return [];
    }
  }
  
  private async fetchRecommendations(ticker: string): Promise<FinnhubRecommendation[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/stock/recommendation?symbol=${ticker}&token=${this.apiKey}`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching recommendations for ${ticker}:`, error);
      return [];
    }
  }
  
  private async fetchUpcomingEarnings(ticker: string): Promise<FinnhubEarnings | null> {
    try {
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `${this.baseUrl}/calendar/earnings?from=${from}&to=${to}&symbol=${ticker}&token=${this.apiKey}`
      );
      const data = await response.json();
      
      if (data.earningsCalendar && data.earningsCalendar.length > 0) {
        return data.earningsCalendar[0];
      }
      return null;
    } catch (error) {
      console.error(`Error fetching earnings for ${ticker}:`, error);
      return null;
    }
  }
}

// ==================== 使用示例 ====================

/*
const analyzer = new EventAnalyzer();

// 分析单个股票
const events = await analyzer.analyzeStock('AAPL', 100); // 持有100股

events.forEach(event => {
  console.log(`
    事件: ${event.headline}
    紧急度: ${event.urgency}
    重要度: ${event.importance}
    情绪: ${event.sentiment}
    建议: ${event.actionSuggestion}
    原因: ${event.reasoning}
  `);
});
*/
