import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { supabase } from '../lib/supabase';

interface AnalyzedEvent {
  id: string;
  user_id: string;
  ticker: string;
  headline: string;
  insight: string;
  scheduled_for: string;
  created_at: string;
  urgency_score: number;
  user_value_score: number;
  market_reaction_score: number;
  overall_score: number;
  confidence: number;
  reasoning: string;
  quick_take?: {
    what_happened?: string;
    why_it_matters?: string;
    what_to_expect?: string;
    sentiment?: string;
    expected_move?: string;
    risk_level?: string;
  };
  reasoning_chain?: Array<{ label: string; explanation: string }> | string;
  reasoning_chain_summary?: string;
  bull_case?: string;
  bear_case?: string;
  key_risk?: string;
  historical_context?: string;
  sources_used?: string[];
  news_articles?: Array<{
    headline: string;
    source: string;
    summary: string;
    url: string;
    datetime?: number;
    image?: string;
  }>;
}

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [archivedItems, setArchivedItems] = useState<string[]>([]);
  const [urgentEvents, setUrgentEvents] = useState<AnalyzedEvent[]>([]);
  const [windowEvents, setWindowEvents] = useState<AnalyzedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextWindowTime, setNextWindowTime] = useState<string>('--');
  const [userWindows, setUserWindows] = useState<string[]>([]);

  useEffect(() => {
    fetchUserSettings();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (userWindows.length === 0) return;

    // 初始计算
    updateNextWindowTime();

    // 每分钟更新一次倒计时
    const interval = setInterval(() => {
      updateNextWindowTime();
    }, 60000); // 60 秒

    return () => clearInterval(interval);
  }, [userWindows]);

  const fetchUserSettings = async () => {
    try {
      const currentUserId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624';

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('windows')
        .eq('id', currentUserId)
        .single();

      if (fetchError) throw fetchError;

      if (data && data.windows) {
        // windows 可能是 JSON 字符串或数组
        const windows = typeof data.windows === 'string' 
          ? JSON.parse(data.windows) 
          : data.windows;
        setUserWindows(windows);
      }
    } catch (err: any) {
      console.error('Error fetching user settings:', err);
    }
  };

  const updateNextWindowTime = () => {
    if (userWindows.length === 0) {
      setNextWindowTime('--');
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 把 window 时间转换成分钟数并排序
    const windowMinutes = userWindows
      .map(w => {
        const [h, m] = w.split(':').map(Number);
        return h * 60 + m;
      })
      .sort((a, b) => a - b);

    // 找到下一个 window
    let nextWindowMinutes = windowMinutes.find(mins => mins > currentMinutes);

    // 如果没有找到（所有 window 都过了），取明天的第一个
    if (!nextWindowMinutes) {
      nextWindowMinutes = windowMinutes[0] + 24 * 60; // 明天
    }

    // 计算时间差
    const diffMinutes = nextWindowMinutes - currentMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    setNextWindowTime(`${hours}h ${minutes}m`);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从 Supabase 读取当前用户的 alerts
      // TODO: 替换成真实的 user_id（从登录状态获取）
      const currentUserId = '46d0a240-dc45-4ef2-8b61-21bfe24b7624';

      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      if (data) {
        const urgent = data.filter(event => event.urgency_score >= 7);
        
        // In your window: urgency_score < 7 (非紧急的)
        const window = data.filter(event => event.urgency_score < 7);

        setUrgentEvents(urgent);
        setWindowEvents(window);
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const toggleSave = (itemId: string) => {
    if (savedItems.includes(itemId)) {
      setSavedItems(savedItems.filter(id => id !== itemId));
    } else {
      setSavedItems([...savedItems, itemId]);
    }
  };

  const archiveItem = (itemId: string) => {
    if (!archivedItems.includes(itemId)) {
      setArchivedItems([...archivedItems, itemId]);
    }
  };

  const renderRightActions = (itemId: string) => {
    return (
      <TouchableOpacity
        style={styles.archiveButton}
        onPress={() => archiveItem(itemId)}
        activeOpacity={0.8}
      >
        <Text style={styles.archiveButtonText}>Archive</Text>
      </TouchableOpacity>
    );
  };

  const getMagnitudeLabel = (score: number): string => {
    if (score >= 8) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const getSentiment = (score: number): string => {
    if (score >= 7) return 'Bullish';
    if (score <= 4) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: string): string => {
    if (sentiment === 'Bullish') return '#22C55E';
    if (sentiment === 'Bearish') return '#EF4444';
    return '#FBBF24';
  };

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

      {/* Content */}
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
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Data Loaded */}
        {!loading && !error && (
          <>
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>Next window</Text>
                  <Text style={styles.statusValue}>{nextWindowTime}</Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statText}>Urgent today: <Text style={styles.statBold}>{urgentEvents.length}</Text></Text>
                    <Text style={styles.statDivider}>•</Text>
                    <Text style={styles.statText}>Waiting: <Text style={styles.statBold}>{windowEvents.length}</Text></Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Daily cap 6</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Used {urgentEvents.length} / 6</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(urgentEvents.length / 6) * 100}%` }]} />
                </View>
              </View>
            </View>

            {/* Urgent Section */}
            {urgentEvents.filter(e => !archivedItems.includes(e.id)).length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Urgent</Text>
                
                {urgentEvents.filter(e => !archivedItems.includes(e.id)).map((event) => (
                  <Swipeable
                    key={event.id}
                    renderRightActions={() => renderRightActions(event.id)}
                    overshootRight={false}
                  >
                    <View style={styles.cardWrapper}>
                      <View style={[styles.cardBorder, styles.cardBorderGreen]} />
                      <TouchableOpacity 
                        style={styles.card} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('EventDetail', { event })}
                      >
                        <View style={styles.cardContent}>
                          <View style={styles.cardMain}>
                            <Text style={styles.cardTitle}>{event.headline}</Text>
                            <Text style={styles.cardMeta}>
                              Hits: <Text style={styles.cardMetaBold}>{event.ticker}</Text> • Magnitude: <Text style={styles.cardMetaBold}>{getMagnitudeLabel(event.overall_score)}</Text> • <Text style={[styles.cardMetaBold, { color: getSentimentColor(getSentiment(event.overall_score)) }]}>{getSentiment(event.overall_score)}</Text>
                            </Text>
                            <View style={styles.confidenceBadge}>
                              <Text style={styles.confidenceBadgeText}>{getConfidenceLabel(event.confidence)}</Text>
                            </View>
                          </View>
                          <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleSave(event.id);
                            }}
                          >
                            <Text style={[styles.bookmarkIcon, savedItems.includes(event.id) && styles.bookmarkIconSaved]}>
                              🔖
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Swipeable>
                ))}
              </>
            )}

            {/* In your window Section */}
            {windowEvents.filter(e => !archivedItems.includes(e.id)).length > 0 && (
              <>
                <Text style={styles.sectionLabel}>In your window</Text>
                
                {windowEvents.filter(e => !archivedItems.includes(e.id)).map((event) => (
                  <Swipeable
                    key={event.id}
                    renderRightActions={() => renderRightActions(event.id)}
                    overshootRight={false}
                  >
                    <View style={styles.cardWrapper}>
                      <View style={[styles.cardBorder, styles.cardBorderBlue]} />
                      <TouchableOpacity 
                        style={styles.card} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('EventDetail', { event })}
                      >
                        <View style={styles.cardContent}>
                          <View style={styles.cardMain}>
                            <Text style={styles.cardTitle}>{event.headline}</Text>
                            <Text style={styles.cardMeta}>
                              Hits: <Text style={styles.cardMetaBold}>{event.ticker}</Text> • Held for 7:30 PM
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleSave(event.id);
                            }}
                          >
                            <Text style={[styles.bookmarkIcon, savedItems.includes(event.id) && styles.bookmarkIconSaved]}>
                              🔖
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Swipeable>
                ))}
              </>
            )}

            {/* Saved Section */}
            {savedItems.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Saved</Text>
                
                {savedItems.map((itemId) => {
                  const event = [...urgentEvents, ...windowEvents].find(e => e.id === itemId);
                  if (!event || archivedItems.includes(event.id)) return null;
                  
                  return (
                    <View key={itemId} style={styles.cardWrapper}>
                      <View style={[styles.cardBorder, styles.cardBorderRed]} />
                      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={styles.cardContent}>
                          <View style={styles.cardMain}>
                            <Text style={styles.cardTitle}>{event.headline}</Text>
                            <Text style={styles.cardMeta}>Saved today</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleSave(itemId);
                            }}
                          >
                            <Text style={[styles.bookmarkIcon, styles.bookmarkIconSaved]}>
                              🔖
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            {/* Archived Section */}
            {archivedItems.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Archived</Text>
                
                {archivedItems.map((itemId) => {
                  const event = [...urgentEvents, ...windowEvents].find(e => e.id === itemId);
                  if (!event) return null;
                  
                  return (
                    <View key={itemId} style={styles.cardWrapper}>
                      <View style={[styles.cardBorder, styles.cardBorderGray]} />
                      <TouchableOpacity style={[styles.card, styles.cardArchived]} activeOpacity={0.8}>
                        <View style={styles.cardContent}>
                          <View style={styles.cardMain}>
                            <Text style={[styles.cardTitle, styles.cardTitleArchived]}>{event.headline}</Text>
                            <Text style={styles.cardMeta}>Archived</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            {/* No more items message */}
            {urgentEvents.length === 0 && windowEvents.length === 0 && (
              <View style={styles.noMoreContainer}>
                <Text style={styles.noMoreText}>No events yet. Send a test webhook!</Text>
                <Text style={styles.todayLabel}>Today</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  statusCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  statBold: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statDivider: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 16,
  },
  cardWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardBorder: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardBorderGreen: {
    backgroundColor: '#22C55E',
  },
  cardBorderBlue: {
    backgroundColor: '#3B82F6',
  },
  cardBorderRed: {
    backgroundColor: '#EF4444',
  },
  cardBorderGray: {
    backgroundColor: '#6B7280',
  },
  card: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardArchived: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cardMain: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  cardTitleArchived: {
    color: '#9CA3AF',
  },
  cardMeta: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  cardMetaBold: {
    fontWeight: '600',
    color: '#D1D5DB',
  },
  confidenceBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: 20,
    opacity: 0.3,
  },
  bookmarkIconSaved: {
    opacity: 1,
    color: '#EF4444',
  },
  noMoreContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  noMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  archiveButton: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 12,
  },
  archiveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
