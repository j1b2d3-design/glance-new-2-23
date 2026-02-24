import { supabase } from '../lib/supabase';
import { AnalyzedEvent } from './EventAnalyzer';

/**
 * Supabase 数据库服务
 * 处理事件的存储、读取、去重
 */
export class SupabaseEventService {
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  // ==================== 事件管理 ====================
  
  /**
   * 保存事件到 Supabase（自动去重）
   */
  async saveEvents(events: AnalyzedEvent[]): Promise<void> {
    if (events.length === 0) return;
    
    try {
      // 1. 转换为 Supabase 格式
      const dbEvents = events.map(event => ({
        user_id: this.userId,
        ticker: event.ticker,
        headline: event.headline,
        event_type: event.eventType,
        urgency: event.urgency,
        importance: event.importance,
        sentiment: event.sentiment,
        confidence: event.confidence,
        reasoning: event.reasoning,
        action_suggestion: event.actionSuggestion,
        raw_data: event.rawData,
        event_timestamp: new Date(event.timestamp).toISOString(),
        is_notified: false,
      }));
      
      // 2. 批量插入（忽略重复）
      const { data, error } = await supabase
        .from('analyzed_events')
        .upsert(dbEvents, {
          onConflict: 'ticker,event_type,event_timestamp',
          ignoreDuplicates: true,
        });
      
      if (error) throw error;
      
      console.log(`✅ Saved ${dbEvents.length} events to Supabase`);
      
    } catch (error) {
      console.error('Error saving events to Supabase:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户的所有事件（按紧急度排序）
   */
  async getEvents(filters?: {
    isRead?: boolean;
    isArchived?: boolean;
    minUrgency?: number;
  }): Promise<AnalyzedEvent[]> {
    try {
      let query = supabase
        .from('analyzed_events')
        .select('*')
        .eq('user_id', this.userId)
        .order('urgency', { ascending: false })
        .order('event_timestamp', { ascending: false })
        .limit(50);
      
      // 应用过滤条件
      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      
      if (filters?.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }
      
      if (filters?.minUrgency !== undefined) {
        query = query.gte('urgency', filters.minUrgency);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // 转换为 AnalyzedEvent 格式
      return (data || []).map(this.dbEventToAnalyzedEvent);
      
    } catch (error) {
      console.error('Error fetching events from Supabase:', error);
      return [];
    }
  }
  
  /**
   * 获取特定股票的事件
   */
  async getEventsForTicker(ticker: string): Promise<AnalyzedEvent[]> {
    try {
      const { data, error } = await supabase
        .from('analyzed_events')
        .select('*')
        .eq('user_id', this.userId)
        .eq('ticker', ticker)
        .order('event_timestamp', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return (data || []).map(this.dbEventToAnalyzedEvent);
      
    } catch (error) {
      console.error(`Error fetching events for ${ticker}:`, error);
      return [];
    }
  }
  
  /**
   * 获取未读事件数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('analyzed_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('is_read', false)
        .eq('is_archived', false);
      
      if (error) throw error;
      
      return count || 0;
      
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
  
  /**
   * 标记事件为已读
   */
  async markAsRead(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analyzed_events')
        .update({ is_read: true })
        .eq('id', eventId)
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error marking event as read:', error);
    }
  }
  
  /**
   * 归档事件
   */
  async archiveEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('analyzed_events')
        .update({ is_archived: true })
        .eq('id', eventId)
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error archiving event:', error);
    }
  }
  
  /**
   * 标记事件为已通知
   */
  async markAsNotified(eventIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('analyzed_events')
        .update({ is_notified: true })
        .in('id', eventIds)
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error marking events as notified:', error);
    }
  }
  
  // ==================== 持仓管理 ====================
  
  /**
   * 获取用户持仓
   */
  async getPortfolio(): Promise<Array<{ ticker: string; shares: number }>> {
    try {
      const { data, error } = await supabase
        .from('user_portfolio')
        .select('ticker, shares')
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
      return data || [];
      
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return [];
    }
  }
  
  /**
   * 添加持仓
   */
  async addToPortfolio(ticker: string, shares: number, costBasis?: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_portfolio')
        .upsert({
          user_id: this.userId,
          ticker,
          shares,
          cost_basis: costBasis,
          purchase_date: new Date().toISOString(),
        }, {
          onConflict: 'user_id,ticker',
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      throw error;
    }
  }
  
  // ==================== 辅助函数 ====================
  
  /**
   * 数据库格式 → AnalyzedEvent 格式
   */
  private dbEventToAnalyzedEvent(dbEvent: any): AnalyzedEvent {
    return {
      id: dbEvent.id,
      ticker: dbEvent.ticker,
      headline: dbEvent.headline,
      eventType: dbEvent.event_type,
      urgency: dbEvent.urgency,
      importance: dbEvent.importance,
      sentiment: dbEvent.sentiment,
      confidence: dbEvent.confidence,
      rawData: dbEvent.raw_data || {},
      reasoning: dbEvent.reasoning || '',
      actionSuggestion: dbEvent.action_suggestion,
      timestamp: new Date(dbEvent.event_timestamp).getTime(),
    };
  }
}

// ==================== 使用示例 ====================

/*
import { EventAnalyzer } from './EventAnalyzer';
import { SupabaseEventService } from './SupabaseEventService';

const userId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624';
const analyzer = new EventAnalyzer();
const dbService = new SupabaseEventService(userId);

// 1. 获取用户持仓
const portfolio = await dbService.getPortfolio();

// 2. 分析每个股票
const allEvents = [];
for (const { ticker, shares } of portfolio) {
  const events = await analyzer.analyzeStock(ticker, shares);
  allEvents.push(...events);
}

// 3. 保存到 Supabase
await dbService.saveEvents(allEvents);

// 4. 获取未通知的事件
const unreadEvents = await dbService.getEvents({ isRead: false });

// 5. 发送通知...

// 6. 标记为已通知
await dbService.markAsNotified(unreadEvents.map(e => e.id));
*/
