import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface DigestScreenProps {
  navigation: any;
}

interface DigestEvent {
  id: string;
  ticker: string;
  headline: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  magnitude: string;
  time: string;
}

export default function DigestScreen({ navigation }: DigestScreenProps) {
  const [userWindows, setUserWindows] = useState<string[]>([]);
  const [activeWindowIndex, setActiveWindowIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 从 Supabase 获取用户的 time windows
  useEffect(() => {
    fetchUserWindows();
  }, []);

  const fetchUserWindows = async () => {
    try {
      const currentUserId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624'; // 硬编码用户 ID
      
      const { data, error } = await supabase
        .from('users')
        .select('windows')
        .eq('id', currentUserId)
        .single();

      if (error) {
        console.error('Error fetching user windows:', error);
        setUserWindows(['09:00', '16:00']); // 默认值
      } else {
        setUserWindows(data?.windows || ['09:00', '16:00']);
      }
    } catch (err) {
      console.error('Error:', err);
      setUserWindows(['09:00', '16:00']);
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据
  const digestEvents: DigestEvent[] = [
    { id: '1', ticker: 'AAPL', headline: 'Apple Q4 guidance raised above estimates', sentiment: 'Bullish', confidence: 82, magnitude: 'Medium', time: '2h ago' },
    { id: '2', ticker: 'MSFT', headline: 'Microsoft Cloud revenue grows 12% YoY', sentiment: 'Bullish', confidence: 78, magnitude: 'Medium', time: '3h ago' },
    { id: '3', ticker: 'XOM', headline: 'Oil prices drop 3% on demand concerns', sentiment: 'Bearish', confidence: 65, magnitude: 'Low', time: '4h ago' },
    { id: '4', ticker: 'TSLA', headline: 'Tesla production delays in China reported', sentiment: 'Bearish', confidence: 58, magnitude: 'Low', time: '5h ago' },
  ];

  const aiSummary = "Today's morning window shows a mixed tech sector with AAPL and MSFT both reporting positive guidance, while energy stocks like XOM face pressure from falling oil prices. Tesla continues to face production challenges in China. Overall market sentiment: Cautiously optimistic with tech leading gains.";

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'Bullish') return '#22C55E';
    if (sentiment === 'Bearish') return '#EF4444';
    return '#FBBF24';
  };

  const toggleSave = (itemId: string) => {
    if (savedItems.includes(itemId)) {
      setSavedItems(savedItems.filter(id => id !== itemId));
    } else {
      setSavedItems([...savedItems, itemId]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserWindows();
    setRefreshing(false);
  };

  // 解析并加粗股票名称
  const renderSummaryWithBoldTickers = (text: string) => {
    const tickers = ['AAPL', 'MSFT', 'XOM', 'TSLA', 'SPY'];
    const parts: Array<{ text: string; bold: boolean }> = [];
    let remainingText = text;

    tickers.forEach(ticker => {
      const index = remainingText.indexOf(ticker);
      if (index !== -1) {
        if (index > 0) {
          parts.push({ text: remainingText.substring(0, index), bold: false });
        }
        parts.push({ text: ticker, bold: true });
        remainingText = remainingText.substring(index + ticker.length);
      }
    });

    if (remainingText) {
      parts.push({ text: remainingText, bold: false });
    }

    return (
      <Text style={styles.summaryText}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={part.bold ? styles.summaryTextBold : {}}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  // 格式化时间显示（如 "09:00 AM"）
  const formatWindowTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>GLANCE</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Time Window Tabs */}
      <View style={styles.tabsContainer}>
        {userWindows.map((window, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.tab, activeWindowIndex === index && styles.tabActive]}
            onPress={() => setActiveWindowIndex(index)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeWindowIndex === index && styles.tabTextActive]}>
              {formatWindowTime(window)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22C55E"
            colors={['#22C55E']}
          />
        }
      >
        {/* AI Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryIcon}>🤖</Text>
            <Text style={styles.summaryTitle}>AI Summary</Text>
          </View>
          {renderSummaryWithBoldTickers(aiSummary)}
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryMeta}>
              {digestEvents.length} events • {formatWindowTime(userWindows[activeWindowIndex])} window
            </Text>
          </View>
        </View>

        {/* Events Section */}
        <Text style={styles.sectionLabel}>ALL EVENTS IN THIS WINDOW</Text>

        {digestEvents.map((event) => (
          <View key={event.id} style={styles.cardWrapper}>
            <View style={[
              styles.cardBorder,
              { backgroundColor: getSentimentColor(event.sentiment) }
            ]} />
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EventDetail', { event })}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardMain}>
                  <View style={styles.cardHeader}>
                    <View style={styles.tickerBadge}>
                      <Text style={styles.tickerText}>{event.ticker}</Text>
                    </View>
                    <Text style={styles.cardTime}>{event.time}</Text>
                  </View>
                  
                  <Text style={styles.cardTitle}>{event.headline}</Text>
                  
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaItem}>
                      Magnitude: <Text style={styles.metaValue}>{event.magnitude}</Text>
                    </Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaItem}>
                      Sentiment: <Text style={[styles.metaValue, { color: getSentimentColor(event.sentiment) }]}>
                        {event.sentiment}
                      </Text>
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => toggleSave(event.id)}
                >
                  <Text style={[
                    styles.bookmarkIcon,
                    savedItems.includes(event.id) && styles.bookmarkIconSaved
                  ]}>
                    🔖
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Bottom AI Insight */}
        <View style={styles.bottomInsight}>
          <Text style={styles.bottomInsightTitle}>💡 Key Takeaway</Text>
          <Text style={styles.bottomInsightText}>
            Tech sector strength driven by <Text style={styles.bottomInsightBold}>AAPL</Text> and <Text style={styles.bottomInsightBold}>MSFT</Text> guidance. 
            Consider monitoring <Text style={styles.bottomInsightBold}>XOM</Text> for potential entry if oil stabilizes.
          </Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  topBarIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  // AI Summary Card
  summaryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderLeftWidth: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D1D5DB',
    marginBottom: 12,
  },
  summaryTextBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Section Label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  // Event Cards
  cardWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardBorder: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cardMain: {
    flex: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickerBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  metaValue: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaDivider: {
    fontSize: 13,
    color: '#6B7280',
  },
  saveButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: 20,
    opacity: 0.3,
  },
  bookmarkIconSaved: {
    opacity: 1,
  },
  // Bottom AI Insight
  bottomInsight: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderLeftWidth: 4,
  },
  bottomInsightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 8,
  },
  bottomInsightText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#D1D5DB',
  },
  bottomInsightBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPad: {
    height: 20,
  },
});
