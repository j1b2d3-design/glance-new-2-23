import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { useStockPrice } from '../hooks/useStockPrice';

interface EventAnalysisScreenProps {
  navigation: any;
  route: any;
}

interface ChainNode {
  label: string;
  explanation: string;
}

export default function EventAnalysisScreen({ navigation, route }: EventAnalysisScreenProps) {
  const event = route?.params?.event || {
    ticker: 'AAPL',
    headline: 'Earnings Report',
    insight: '',
    reasoning: '',
    quick_take: {},
    reasoning_chain: '',
    bull_case: '',
    bear_case: '',
    key_risk: '',
    historical_context: '',
    confidence: 0.5,
    overall_score: 5,
    urgency_score: 5,
  };

  const [activeTab, setActiveTab] = useState<'Impact' | 'Risk'>('Impact');
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [newsExpanded, setNewsExpanded] = useState<{ [key: number]: boolean }>({});
  const { currentPrice: stockPrice, priceChange, priceChangePercent, loading: loadingPrice } = useStockPrice(event.ticker);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    // 优先从 event 中读取新闻（来自 Supabase）
    if (event.news_articles && Array.isArray(event.news_articles) && event.news_articles.length > 0) {
      console.log('✅ Using news from Supabase:', event.news_articles.length, 'articles');
      setNewsArticles(event.news_articles);
    } else {
      // 如果 Supabase 没有，再去 Finnhub 获取
      console.log('📡 Fetching news from Finnhub...');
      fetchNewsArticlesFromFinnhub();
    }
  }, [event.ticker, event.news_articles]);

  const fetchNewsArticlesFromFinnhub = async () => {
    try {
      setLoadingNews(true);
      const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = `https://finnhub.io/api/v1/company-news?symbol=${event.ticker}&from=${sevenDaysAgo}&to=${today}&token=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Found ${data.length} articles from Finnhub`);
        setNewsArticles(data.slice(0, 5));
      } else {
        console.log('⚠️ No articles from Finnhub');
      }
      
    } catch (error) {
      console.error('❌ Error fetching news from Finnhub:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const toggleNewsExpanded = (index: number) => {
    setNewsExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Parse reasoning chain into interactive nodes
  const parseReasoningChain = (): ChainNode[] => {
    const chain = event.reasoning_chain || event.reasoning || '';
    
    // Priority 1: Check if it's already an array (new structured format from Claude)
    if (Array.isArray(chain)) {
      return chain.map((node: any) => ({
        label: node.label || 'Step',
        explanation: node.explanation || 'No explanation provided.',
      }));
    }
    
    // Priority 2: Try to split by → (old string format)
    if (typeof chain === 'string' && chain.includes('→')) {
      const parts = chain.split('→').map((s: string) => s.trim()).filter((s: string) => s);
      return parts.map((label: string, index: number) => {
        // Generate contextual explanations based on position
        let explanation = '';
        if (index === 0) {
          explanation = event.quick_take?.what_happened || `${event.ticker} reported a significant event: ${label}. This is the primary catalyst driving current market attention.`;
        } else if (index === parts.length - 1) {
          explanation = event.quick_take?.what_to_expect || `The expected outcome is: ${label}. This represents the market's likely response based on the preceding chain of events.`;
        } else {
          explanation = event.quick_take?.why_it_matters || `${label} is a key intermediate factor. This connects the initial event to the expected market outcome.`;
        }
        return { label, explanation };
      });
    }
    
    // Priority 3: Fallback - create nodes from quick_take data
    const nodes: ChainNode[] = [];
    if (event.quick_take?.what_happened) {
      nodes.push({
        label: 'Event',
        explanation: event.quick_take.what_happened,
      });
    }
    if (event.quick_take?.why_it_matters) {
      nodes.push({
        label: 'Impact',
        explanation: event.quick_take.why_it_matters,
      });
    }
    if (event.quick_take?.what_to_expect) {
      nodes.push({
        label: 'Outlook',
        explanation: event.quick_take.what_to_expect,
      });
    }
    
    // Priority 4: If still empty, use defaults
    if (nodes.length === 0) {
      nodes.push(
        { label: 'Event', explanation: event.insight || 'Earnings reported.' },
        { label: 'Analysis', explanation: event.reasoning || 'AI analysis in progress.' },
        { label: 'Outlook', explanation: 'Monitor for further developments.' },
      );
    }
    
    return nodes;
  };

  const chainNodes = parseReasoningChain();

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getSentimentColor = () => {
    const sentiment = event.quick_take?.sentiment || 'Neutral';
    if (sentiment === 'Bullish') return '#22C55E';
    if (sentiment === 'Bearish') return '#EF4444';
    return '#FBBF24';
  };

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Full Analysis</Text>
          <View style={styles.headerPriceRow}>
            <Text style={styles.stockSymbol}>{event.ticker}</Text>
            {!loadingPrice && stockPrice !== null && (
              <>
                <Text style={styles.headerDivider}>|</Text>
                <Text style={styles.stockPrice}>${stockPrice.toFixed(2)}</Text>
                {priceChange !== null && priceChangePercent !== null && (
                  <Text style={[
                    styles.stockChange,
                    { color: priceChangePercent >= 0 ? '#22C55E' : '#EF4444' }
                  ]}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Impact' && styles.tabActive]}
          onPress={() => setActiveTab('Impact')}
        >
          <Text style={[styles.tabText, activeTab === 'Impact' && styles.tabTextActive]}>
            Impact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Risk' && styles.tabActive]}
          onPress={() => setActiveTab('Risk')}
        >
          <Text style={[styles.tabText, activeTab === 'Risk' && styles.tabTextActive]}>
            Risk
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'Impact' ? (
          <>
            {/* Dynamic Reasoning Chain */}
            <Text style={styles.sectionLabel}>REASONING CHAIN</Text>
            <View style={styles.stepsTimeline}>
              <View style={styles.timelineConnector} />
              
              {chainNodes.map((node, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.stepItem}
                  onPress={() => setActiveNodeIndex(index)}
                >
                  <View style={[
                    styles.stepCircle, 
                    activeNodeIndex === index && styles.stepCircleActive
                  ]}>
                    <Text style={[
                      styles.stepNumber, 
                      activeNodeIndex === index && styles.stepNumberActive
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel, 
                    activeNodeIndex === index && styles.stepLabelActive
                  ]} numberOfLines={1}>
                    {node.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Node Explanation */}
            <View style={[styles.explanationCard, { borderLeftColor: getSentimentColor() }]}>
              <View style={styles.explanationHeader}>
                <Text style={styles.explanationStep}>
                  Step {activeNodeIndex + 1} of {chainNodes.length}
                </Text>
                <Text style={[styles.explanationNodeLabel, { color: getSentimentColor() }]}>
                  {chainNodes[activeNodeIndex]?.label}
                </Text>
              </View>
              <Text style={styles.explanationText}>
                {chainNodes[activeNodeIndex]?.explanation}
              </Text>
            </View>

            {/* News Articles (Multiple from Finnhub) */}
            <Text style={styles.sectionLabel}>SOURCE ARTICLES</Text>
            
            {loadingNews ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading articles...</Text>
              </View>
            ) : newsArticles.length > 0 ? (
              newsArticles.map((article, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.newsCard}
                  onPress={() => toggleNewsExpanded(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.newsHeader}>
                    <Text style={styles.newsTitle} numberOfLines={newsExpanded[index] ? 0 : 2}>
                      {article.headline}
                    </Text>
                    <Text style={styles.expandIcon}>{newsExpanded[index] ? '▼' : '▶'}</Text>
                  </View>
                  
                  <View style={styles.newsMetaRow}>
                    <Text style={styles.newsSource}>{article.source}</Text>
                    <Text style={styles.newsDivider}>•</Text>
                    <Text style={styles.newsTime}>{formatTimeAgo(article.datetime)}</Text>
                  </View>
                  
                  {newsExpanded[index] && (
                    <>
                      <Text style={styles.newsContent}>
                        {article.summary || 'No summary available.'}
                      </Text>
                      {article.url && (
                        <TouchableOpacity 
                          style={styles.readMoreButton}
                          onPress={() => Linking.openURL(article.url)}
                        >
                          <Text style={styles.readMoreText}>Read full article →</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noNewsCard}>
                <Text style={styles.noNewsText}>No recent articles found for {event.ticker}</Text>
              </View>
            )}

            {/* Why AI Thinks This Matters */}
            <Text style={styles.sectionLabel}>AI ANALYSIS</Text>
            <View style={styles.aiAnalysisCard}>
              <Text style={styles.aiAnalysisTitle}>Why AI thinks this matters</Text>
              <Text style={styles.aiAnalysisText}>
                {event.reasoning || event.insight || 'AI analysis based on current data.'}
              </Text>
              
              {/* Historical Context */}
              {event.historical_context && (
                <View style={styles.aiSubSection}>
                  <Text style={styles.aiSubTitle}>📊 Historical Pattern</Text>
                  <Text style={styles.aiSubText}>{event.historical_context}</Text>
                </View>
              )}

              {/* Premium Upsell */}
              <View style={styles.premiumBanner}>
                <Text style={styles.premiumIcon}>🔒</Text>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>Deeper Analysis Available</Text>
                  <Text style={styles.premiumDescription}>
                    Analyst ratings, price targets, social sentiment, and earnings call transcripts with premium data sources.
                  </Text>
                </View>
              </View>
            </View>

            {/* Bull vs Bear */}
            {(event.bull_case || event.bear_case) && (
              <>
                <Text style={styles.sectionLabel}>BULL VS BEAR</Text>
                <View style={styles.bullBearContainer}>
                  {event.bull_case && (
                    <View style={styles.bullCard}>
                      <Text style={styles.bullBearIcon}>🐂</Text>
                      <Text style={styles.bullBearLabel}>Bull Case</Text>
                      <Text style={styles.bullBearText}>{event.bull_case}</Text>
                    </View>
                  )}
                  {event.bear_case && (
                    <View style={styles.bearCard}>
                      <Text style={styles.bullBearIcon}>🐻</Text>
                      <Text style={styles.bullBearLabel}>Bear Case</Text>
                      <Text style={styles.bullBearText}>{event.bear_case}</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Action Buttons */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('EventOptions', { event })}
            >
              <Text style={styles.primaryButtonText}>See options</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Back to event brief</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Risk Assessment */}
            <Text style={styles.sectionLabel}>RISK ASSESSMENT</Text>
            
            {/* Key Risk (from AI) */}
            {event.key_risk && (
              <View style={styles.keyRiskCard}>
                <View style={styles.keyRiskHeader}>
                  <Text style={styles.keyRiskIcon}>⚠️</Text>
                  <Text style={styles.keyRiskTitle}>Key Risk</Text>
                </View>
                <Text style={styles.keyRiskText}>{event.key_risk}</Text>
              </View>
            )}

            {/* Risk Sections */}
            <View style={styles.riskAnalysisCard}>
              <View style={styles.riskSection}>
                <View style={styles.riskSectionHeader}>
                  <Text style={styles.riskDot}>🔴</Text>
                  <Text style={styles.riskSectionTitle}>Volatility Risk</Text>
                </View>
                <Text style={styles.riskSectionText}>
                  {event.quick_take?.risk_level === 'High' 
                    ? `High volatility expected. ${event.ticker} may experience significant price swings in the short term. Consider position sizing carefully.`
                    : event.quick_take?.risk_level === 'Low'
                    ? `Low volatility expected. ${event.ticker} is likely to see modest price movements. Standard position sizing appropriate.`
                    : `Moderate volatility expected. ${event.ticker} may see some price fluctuation. Monitor closely and adjust if needed.`
                  }
                </Text>
              </View>

              <View style={styles.riskSection}>
                <View style={styles.riskSectionHeader}>
                  <Text style={styles.riskDot}>🟡</Text>
                  <Text style={styles.riskSectionTitle}>Timing Risk</Text>
                </View>
                <Text style={styles.riskSectionText}>
                  {event.quick_take?.what_to_expect || `Market reaction to ${event.ticker} event may take 1-3 trading days to fully materialize. Early moves can be misleading.`}
                </Text>
              </View>

              <View style={styles.riskSection}>
                <View style={styles.riskSectionHeader}>
                  <Text style={styles.riskDot}>🟢</Text>
                  <Text style={styles.riskSectionTitle}>Confidence Level</Text>
                </View>
                <Text style={styles.riskSectionText}>
                  AI confidence: {Math.round(event.confidence * 100)}%. {event.confidence >= 0.8 
                    ? 'High confidence analysis based on strong historical patterns and clear data signals.'
                    : event.confidence >= 0.6
                    ? 'Moderate confidence. Some uncertainty remains in the analysis due to mixed signals.'
                    : 'Lower confidence. Limited data or conflicting signals. Exercise extra caution.'
                  }
                </Text>
              </View>
            </View>

            {/* Bear Case Detail */}
            {event.bear_case && (
              <>
                <Text style={styles.sectionLabel}>WORST CASE SCENARIO</Text>
                <View style={styles.bearDetailCard}>
                  <Text style={styles.bearDetailText}>{event.bear_case}</Text>
                </View>
              </>
            )}

            {/* Action Buttons */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('EventOptions', { event })}
            >
              <Text style={styles.primaryButtonText}>See options</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Back to event brief</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  headerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDivider: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  stockPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stockChange: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerRight: {
    width: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  // Timeline / Reasoning Chain
  stepsTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#2C2C2E',
    top: 22,
  },
  stepItem: {
    alignItems: 'center',
    gap: 10,
    zIndex: 1,
    flex: 1,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    borderWidth: 2,
    borderColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Explanation Card
  explanationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderLeftWidth: 4,
  },
  explanationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  explanationStep: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  explanationNodeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  // News Card
  newsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  expandIcon: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 12,
    marginTop: 4,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsSource: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  newsDivider: {
    fontSize: 13,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  newsTime: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  newsContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D1D5DB',
    fontWeight: '400',
    marginBottom: 14,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  readMoreText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  noNewsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  noNewsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // AI Analysis Card
  aiAnalysisCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  aiAnalysisText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  aiSubSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  aiSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  aiSubText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9CA3AF',
  },
  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    gap: 12,
  },
  premiumIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FBBF24',
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  // Bull vs Bear
  bullBearContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  bullCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  bearCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  bullBearIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  bullBearLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bullBearText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#D1D5DB',
  },
  // Risk Tab
  keyRiskCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  keyRiskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  keyRiskIcon: {
    fontSize: 18,
  },
  keyRiskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  keyRiskText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D1D5DB',
  },
  riskAnalysisCard: {
    marginBottom: 20,
    gap: 12,
  },
  riskSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  riskSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  riskDot: {
    fontSize: 14,
  },
  riskSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  riskSectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  bearDetailCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  bearDetailText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#D1D5DB',
  },
  // Buttons
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
