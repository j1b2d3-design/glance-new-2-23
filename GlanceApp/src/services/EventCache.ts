import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyzedEvent } from './EventAnalyzer';

/**
 * 本地缓存管理器
 * 功能：
 * 1. 存储历史事件
 * 2. 检测新事件（与历史对比）
 * 3. 避免重复通知
 */
export class EventCache {
  private CACHE_KEY = '@glance_events_cache';
  private LAST_SYNC_KEY = '@glance_last_sync';
  
  // ==================== 核心功能 ====================
  
  /**
   * 保存事件到缓存
   */
  async saveEvents(events: AnalyzedEvent[]): Promise<void> {
    try {
      const cached = await this.loadCache();
      
      // 合并新事件（去重）
      const merged = [...cached];
      
      for (const newEvent of events) {
        const exists = cached.some(e => e.id === newEvent.id);
        if (!exists) {
          merged.push(newEvent);
        }
      }
      
      // 只保留最近 30 天的事件
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filtered = merged.filter(e => e.timestamp > thirtyDaysAgo);
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(filtered));
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());
      
    } catch (error) {
      console.error('Error saving events to cache:', error);
    }
  }
  
  /**
   * 加载所有缓存的事件
   */
  async loadCache(): Promise<AnalyzedEvent[]> {
    try {
      const cache = await AsyncStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    } catch (error) {
      console.error('Error loading cache:', error);
      return [];
    }
  }
  
  /**
   * 检测新事件（对比缓存）
   */
  async detectNewEvents(freshEvents: AnalyzedEvent[]): Promise<{
    new: AnalyzedEvent[];
    existing: AnalyzedEvent[];
  }> {
    const cached = await this.loadCache();
    
    const newEvents = freshEvents.filter(fresh => 
      !cached.some(cached => this.isSameEvent(cached, fresh))
    );
    
    const existingEvents = freshEvents.filter(fresh => 
      cached.some(cached => this.isSameEvent(cached, fresh))
    );
    
    return {
      new: newEvents,
      existing: existingEvents,
    };
  }
  
  /**
   * 判断是否为同一个事件
   */
  private isSameEvent(event1: AnalyzedEvent, event2: AnalyzedEvent): boolean {
    // 相同 ticker + 相同类型 + 时间接近（1小时内）= 同一个事件
    if (event1.ticker !== event2.ticker) return false;
    if (event1.eventType !== event2.eventType) return false;
    
    const timeDiff = Math.abs(event1.timestamp - event2.timestamp);
    const oneHour = 60 * 60 * 1000;
    
    return timeDiff < oneHour;
  }
  
  /**
   * 获取特定股票的历史事件
   */
  async getEventsForTicker(ticker: string): Promise<AnalyzedEvent[]> {
    const cached = await this.loadCache();
    return cached.filter(e => e.ticker === ticker);
  }
  
  /**
   * 清空缓存
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(this.CACHE_KEY);
    await AsyncStorage.removeItem(this.LAST_SYNC_KEY);
  }
  
  /**
   * 获取上次同步时间
   */
  async getLastSyncTime(): Promise<number | null> {
    const time = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
    return time ? parseInt(time) : null;
  }
}

// ==================== 使用示例 ====================

/*
import { EventAnalyzer } from './EventAnalyzer';
import { EventCache } from './EventCache';

const analyzer = new EventAnalyzer();
const cache = new EventCache();

// 1. 分析股票
const freshEvents = await analyzer.analyzeStock('AAPL', 100);

// 2. 检测是否有新事件
const { new: newEvents, existing } = await cache.detectNewEvents(freshEvents);

if (newEvents.length > 0) {
  console.log(`检测到 ${newEvents.length} 个新事件！`);
  
  // 发送推送通知
  newEvents.forEach(event => {
    sendNotification({
      title: event.headline,
      body: event.reasoning,
    });
  });
}

// 3. 保存到缓存
await cache.saveEvents(freshEvents);
*/
