import { EventAnalyzer } from './EventAnalyzer';
import { SupabaseEventService } from './SupabaseEventService';
import { EventCache } from './EventCache';
import * as Notifications from 'expo-notifications';

/**
 * 后台分析任务管理器
 * 定期分析用户持仓，检测新事件，发送通知
 */
export class BackgroundAnalyzer {
  private analyzer: EventAnalyzer;
  private dbService: SupabaseEventService;
  private cache: EventCache;
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(userId: string) {
    this.analyzer = new EventAnalyzer();
    this.dbService = new SupabaseEventService(userId);
    this.cache = new EventCache();
  }
  
  /**
   * 启动后台分析（每 15 分钟一次）
   */
  start(intervalMinutes: number = 15): void {
    console.log(`🚀 Starting background analyzer (every ${intervalMinutes} min)`);
    
    // 立即执行一次
    this.runAnalysis();
    
    // 设置定时任务
    this.intervalId = setInterval(
      () => this.runAnalysis(),
      intervalMinutes * 60 * 1000
    );
  }
  
  /**
   * 停止后台分析
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Background analyzer stopped');
    }
  }
  
  /**
   * 手动触发一次分析
   */
  async runAnalysis(): Promise<void> {
    try {
      console.log('📊 Running portfolio analysis...');
      
      // 1. 获取用户持仓
      const portfolio = await this.dbService.getPortfolio();
      
      if (portfolio.length === 0) {
        console.log('ℹ️  No portfolio found, skipping analysis');
        return;
      }
      
      console.log(`📈 Analyzing ${portfolio.length} stocks:`, portfolio.map(p => p.ticker).join(', '));
      
      // 2. 并行分析所有股票
      const allEvents = await Promise.all(
        portfolio.map(({ ticker, shares }) => 
          this.analyzer.analyzeStock(ticker, shares)
        )
      );
      
      const flatEvents = allEvents.flat();
      
      console.log(`🔍 Found ${flatEvents.length} total events`);
      
      if (flatEvents.length === 0) {
        return;
      }
      
      // 3. 检测新事件（与本地缓存对比）
      const { new: newEvents } = await this.cache.detectNewEvents(flatEvents);
      
      console.log(`🆕 Detected ${newEvents.length} new events`);
      
      // 4. 保存所有事件到 Supabase（包括旧事件，用于历史记录）
      await this.dbService.saveEvents(flatEvents);
      
      // 5. 只对新事件发送通知
      if (newEvents.length > 0) {
        await this.sendNotifications(newEvents);
        
        // 标记为已通知
        const eventIds = newEvents
          .filter(e => (e as any).id) // 确保有 id
          .map(e => (e as any).id);
        
        if (eventIds.length > 0) {
          await this.dbService.markAsNotified(eventIds);
        }
      }
      
      // 6. 更新本地缓存
      await this.cache.saveEvents(flatEvents);
      
      console.log('✅ Analysis complete');
      
    } catch (error) {
      console.error('❌ Error in background analysis:', error);
    }
  }
  
  /**
   * 发送通知
   */
  private async sendNotifications(events: any[]): Promise<void> {
    // 只通知高优先级事件（urgency > 0.7 或 importance > 0.8）
    const importantEvents = events.filter(
      e => e.urgency > 0.7 || e.importance > 0.8
    );
    
    if (importantEvents.length === 0) {
      return;
    }
    
    console.log(`📬 Sending ${importantEvents.length} notifications`);
    
    for (const event of importantEvents) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: this.getNotificationTitle(event),
            body: event.headline,
            data: {
              eventId: event.id,
              ticker: event.ticker,
              screen: 'EventDetail',
            },
            sound: event.urgency > 0.8 ? 'default' : undefined,
          },
          trigger: null, // 立即发送
        });
      } catch (error) {
        console.error(`Error sending notification for ${event.ticker}:`, error);
      }
    }
  }
  
  /**
   * 生成通知标题
   */
  private getNotificationTitle(event: any): string {
    const emoji = this.getEmoji(event);
    
    if (event.urgency > 0.8) {
      return `${emoji} ${event.ticker} 紧急事件！`;
    }
    
    if (event.sentiment > 0.5) {
      return `${emoji} ${event.ticker} 利好消息`;
    }
    
    if (event.sentiment < -0.5) {
      return `${emoji} ${event.ticker} 利空消息`;
    }
    
    return `${emoji} ${event.ticker} 新事件`;
  }
  
  /**
   * 根据事件类型选择 emoji
   */
  private getEmoji(event: any): string {
    if (event.urgency > 0.8) return '🔥';
    if (event.sentiment > 0.7) return '📈';
    if (event.sentiment < -0.7) return '📉';
    if (event.eventType === 'earnings') return '📊';
    if (event.eventType === 'news_cluster') return '📰';
    if (event.eventType === 'rating_change') return '⭐';
    return 'ℹ️';
  }
}

// ==================== 使用示例 ====================

/*
// 在 App.tsx 中初始化

import { BackgroundAnalyzer } from './services/BackgroundAnalyzer';

const userId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624';
const backgroundAnalyzer = new BackgroundAnalyzer(userId);

useEffect(() => {
  // 启动后台分析（每 15 分钟）
  backgroundAnalyzer.start(15);
  
  // 清理
  return () => {
    backgroundAnalyzer.stop();
  };
}, []);

// 手动触发分析（下拉刷新时）
const handleRefresh = async () => {
  await backgroundAnalyzer.runAnalysis();
};
*/
