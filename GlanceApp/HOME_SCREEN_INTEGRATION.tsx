// 在 HomeScreen.tsx 顶部添加的代码片段

import React, { useState, useEffect, useCallback } from 'react';
import { SupabaseEventService } from '../services/SupabaseEventService';
import { BackgroundAnalyzer } from '../services/BackgroundAnalyzer';

// ... 其他 imports ...

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // ... 现有的 state ...
  
  // 新增：后台分析器
  const [backgroundAnalyzer, setBackgroundAnalyzer] = useState<BackgroundAnalyzer | null>(null);
  const [dbService, setDbService] = useState<SupabaseEventService | null>(null);
  
  // 初始化服务
  useEffect(() => {
    const currentUserId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624'; // TODO: 从登录状态获取
    
    const analyzer = new BackgroundAnalyzer(currentUserId);
    const db = new SupabaseEventService(currentUserId);
    
    setBackgroundAnalyzer(analyzer);
    setDbService(db);
    
    // 启动后台分析（每 15 分钟）
    analyzer.start(15);
    
    // 立即加载事件
    loadEventsFromDb(db);
    
    // 清理
    return () => {
      analyzer.stop();
    };
  }, []);
  
  // 从数据库加载事件
  const loadEventsFromDb = async (db: SupabaseEventService) => {
    try {
      setLoading(true);
      
      // 获取所有未归档的事件
      const events = await db.getEvents({ isArchived: false });
      
      // 分类：urgent (urgency >= 0.7), window (urgency < 0.7)
      const urgent = events.filter(e => e.urgency >= 0.7);
      const window = events.filter(e => e.urgency < 0.7);
      
      // 转换为旧的格式（兼容现有 UI）
      setUrgentEvents(urgent.map(convertToOldFormat));
      setWindowEvents(window.map(convertToOldFormat));
      
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  // 转换新格式到旧格式（兼容现有 UI）
  const convertToOldFormat = (event: any): AnalyzedEvent => {
    return {
      id: event.id,
      user_id: '46d0a240-dc45-4ef2-8b61-21bfe24b7624',
      ticker: event.ticker,
      headline: event.headline,
      insight: event.reasoning,
      scheduled_for: new Date(event.timestamp).toISOString(),
      created_at: new Date(event.timestamp).toISOString(),
      urgency_score: event.urgency * 10, // 0-1 → 0-10
      user_value_score: event.importance * 10,
      market_reaction_score: (event.sentiment + 1) * 5, // -1到1 → 0-10
      overall_score: ((event.urgency + event.importance) / 2) * 10,
      confidence: event.confidence,
      reasoning: event.reasoning,
    };
  };
  
  // 下拉刷新：触发新一轮分析
  const onRefresh = useCallback(async () => {
    if (!backgroundAnalyzer || !dbService) return;
    
    setRefreshing(true);
    
    try {
      // 触发分析
      await backgroundAnalyzer.runAnalysis();
      
      // 重新加载事件
      await loadEventsFromDb(dbService);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [backgroundAnalyzer, dbService]);
  
  // 标记事件为已读
  const markEventAsRead = async (eventId: string) => {
    if (!dbService) return;
    await dbService.markAsRead(eventId);
  };
  
  // 归档事件
  const archiveEvent = async (eventId: string) => {
    if (!dbService) return;
    await dbService.archiveEvent(eventId);
    
    // 从 UI 移除
    setUrgentEvents(prev => prev.filter(e => e.id !== eventId));
    setWindowEvents(prev => prev.filter(e => e.id !== eventId));
  };
  
  // ... 现有的其他函数 ...
  
  // 渲染事件卡片时，点击后标记为已读
  const handleEventPress = (event: AnalyzedEvent) => {
    markEventAsRead(event.id);
    navigation.navigate('EventDetail', { event });
  };
  
  // ... 现有的 render 代码 ...
}
