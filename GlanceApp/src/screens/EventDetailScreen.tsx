import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Constants from 'expo-constants';
import { useStockPrice } from '../hooks/useStockPrice';

interface EventDetailScreenProps {
  navigation: any;
  route: any;
}

interface EventData {
  id: string;
  ticker: string;
  headline: string;
  insight: string;
  reasoning: string;
  urgency_score: number;
  overall_score: number;
  confidence: number;
  created_at: string;
  sources_used?: string[];
  quick_take?: {
    what_happened?: string;
    why_it_matters?: string;
    what_to_expect?: string;
    sentiment?: string;
    expected_move?: string;
    risk_level?: string;
  };
}

export default function EventDetailScreen({ navigation, route }: EventDetailScreenProps) {
  const rawEvent = route?.params?.event || {
    id: '',
    ticker: 'UNKNOWN',
    headline: 'No event data',
    insight: '',
    reasoning: '',
    urgency_score: 5,
    overall_score: 5,
    confidence: 0.5,
    created_at: new Date().toISOString(),
  };

  // Supabase JSONB fields can come back as strings - parse them if needed
  const event: EventData = {
    ...rawEvent,
    quick_take: typeof rawEvent.quick_take === 'string'
      ? (() => { try { return JSON.parse(rawEvent.quick_take); } catch { return undefined; } })()
      : rawEvent.quick_take,
  };

  const { currentPrice: stockPrice, priceChange, priceChangePercent, loading: loadingPrice } = useStockPrice(event.ticker);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyLogo();
  }, [event.ticker]);

  const fetchCompanyLogo = async () => {
    try {
      const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
      
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${event.ticker}&token=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data && data.logo) {
        setCompanyLogo(data.logo);
      }
    } catch (error) {
      console.error('Error fetching company logo:', error);
    }
  };

  const getSentiment = () => {
    if (event.quick_take?.sentiment) return event.quick_take.sentiment;
    if (event.overall_score >= 7) return 'Bullish';
    if (event.overall_score <= 4) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'Bullish') return '#22C55E';
    if (sentiment === 'Bearish') return '#EF4444';
    return '#FBBF24';
  };

  const getConfidenceColor = (confidence: number) => {
    const pct = Math.round((typeof confidence === 'number' ? confidence : 0.5) * 100);
    if (pct >= 80) return '#22C55E';
    if (pct >= 50) return '#FBBF24';
    return '#EF4444';
  };

  const getConfidenceDescription = (confidence: number, sourcesUsed?: string[]) => {
    const conf = typeof confidence === 'number' ? confidence : 0.5;
    const pct = Math.round(conf * 100);
    const sourceLabels: Record<string, string> = {
      recent_news: 'recent news',
      real_time_quote: 'real-time price',
      company_profile: 'company profile',
      historical_earnings: 'historical earnings',
    };
    const sources = (sourcesUsed || []).map(s => sourceLabels[s] || s).filter(Boolean);
    const sourceText = sources.length > 0 ? sources.join(', ') : 'available data';

    if (conf >= 0.8) {
      return <>Our AI is <Text style={styles.confidenceBold}>{pct}% confident</Text> in this analysis based on {sourceText}.</>;
    }
    if (conf >= 0.5) {
      return <>Our AI is <Text style={styles.confidenceBold}>{pct}% confident</Text>. Analysis draws from {sourceText}. Consider monitoring for updates.</>;
    }
    return <>Our AI is <Text style={styles.confidenceBold}>{pct}% confident</Text>. Limited data ({sourceText}). Use with caution and verify with additional sources.</>;
  };

  const sentiment = getSentiment();
  const impactLabel = sentiment === 'Bullish' ? 'Positive' : sentiment === 'Bearish' ? 'Negative' : 'Neutral';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Brief</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgency Badge + Time */}
        <View style={styles.badgeRow}>
          {event.urgency_score >= 7 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
          <Text style={styles.timeText}>⏱ Just now</Text>
        </View>

        {/* Title with Background Logo */}
        <View style={styles.titleContainer}>
          {companyLogo ? (
            <Image 
              source={{ uri: companyLogo }} 
              style={styles.logoBackgroundImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoBackground}>
              <Text style={styles.logoBackgroundText}>{event.ticker}</Text>
            </View>
          )}
          <Text style={styles.eventTitle}>{event.insight || event.headline}</Text>
        </View>

        {/* Stock Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>{event.ticker}</Text>
          <Text style={styles.priceDivider}>|</Text>
          {loadingPrice ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : stockPrice !== null ? (
            <>
              <Text style={styles.priceValue}>${stockPrice.toFixed(2)}</Text>
              {priceChange !== null && priceChangePercent !== null && (
                <Text style={[
                  styles.priceChange,
                  { color: priceChangePercent >= 0 ? '#22C55E' : '#EF4444' }
                ]}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.priceUnavailable}>Price unavailable</Text>
          )}
        </View>

        {/* The Story Card */}
        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <View style={styles.storyIconBadge}>
              <Text style={styles.storyIcon}>📖</Text>
            </View>
            <Text style={styles.storyTitle}>The Story</Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storySectionTitle}>WHAT HAPPENED</Text>
            <Text style={styles.storySectionText}>
              {event.quick_take?.what_happened || event.insight || event.headline}
            </Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storySectionTitle}>WHY IT MATTERS</Text>
            <Text style={styles.storySectionText}>
              {event.quick_take?.why_it_matters || event.reasoning || 'Impact analysis pending.'}
            </Text>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.storySectionTitle}>WHAT TO EXPECT</Text>
            <Text style={styles.storySectionText}>
              {event.quick_take?.what_to_expect || 'Monitor for further developments.'}
            </Text>
          </View>
        </View>

        {/* Impact & Magnitude */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Text style={styles.metricIconText}>🎯</Text>
            </View>
            <Text style={styles.metricLabel}>IMPACT</Text>
            <Text style={[styles.metricValue, { color: getSentimentColor(sentiment) }]}>
              {impactLabel}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Text style={styles.metricIconText}>⚡</Text>
            </View>
            <Text style={styles.metricLabel}>MAGNITUDE</Text>
            <Text style={styles.metricValue}>
              {event.quick_take?.expected_move || `${event.overall_score >= 7 ? 'High' : event.overall_score >= 5 ? 'Medium' : 'Low'}`}
            </Text>
          </View>
        </View>

        {/* AI Confidence */}
        <View style={styles.confidenceCard}>
          <View style={styles.confidenceHeader}>
            <View style={styles.confidenceIcon}>
              <Text style={styles.confidenceIconText}>🤖</Text>
            </View>
            <Text style={styles.confidenceTitle}>AI CONFIDENCE</Text>
            <Text style={[styles.confidencePercentage, { color: getConfidenceColor(event.confidence ?? 0.5) }]}>{Math.round((event.confidence ?? 0.5) * 100)}%</Text>
          </View>
          
          <View style={styles.confidenceBar}>
            <View style={[styles.confidenceBarFill, { width: `${Math.min(100, (event.confidence ?? 0.5) * 100)}%`, backgroundColor: getConfidenceColor(event.confidence ?? 0.5) }]} />
          </View>
          
          <Text style={styles.confidenceDescription}>
            {getConfidenceDescription(event.confidence, event.sources_used)}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('EventOptions', { event })}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>See options →</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.dismissButtonText}>Dismiss for now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('EventAnalysis', { event })}
          activeOpacity={0.8}
        >
          <Text style={styles.linkButtonText}>Open full analysis</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  urgentBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 20,
    minHeight: 120,
    overflow: 'hidden',
  },
  logoBackgroundImage: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 200,
    height: 200,
    opacity: 0.15,
    zIndex: 0,
  },
  logoBackground: {
    position: 'absolute',
    top: -40,
    right: -40,
    opacity: 0.08,
    zIndex: 0,
  },
  logoBackgroundText: {
    fontSize: 160,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -5,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
    zIndex: 1,
    paddingRight: 60,
  },
  priceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priceDivider: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 10,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceUnavailable: {
    fontSize: 14,
    color: '#6B7280',
  },
  holdingsSection: {
    marginBottom: 20,
  },
  holdingBadgeWithPrice: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holdingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceLoaderInline: {
    marginLeft: 4,
  },
  priceDivider: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceTextInline: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  priceChangeTextInline: {
    fontSize: 13,
    fontWeight: '600',
  },
  storyCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  storyIconBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyIcon: {
    fontSize: 18,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storySection: {
    marginBottom: 20,
  },
  storySectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  storySectionText: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
    fontWeight: '400',
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricIconText: {
    fontSize: 20,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confidenceCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  confidenceIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceIconText: {
    fontSize: 18,
  },
  confidenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    flex: 1,
  },
  confidencePercentage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#22C55E',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 4,
  },
  confidenceDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  confidenceBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dismissButton: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
