import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useStockPrice } from '../hooks/useStockPrice';

interface EventOptionsScreenProps {
  navigation: any;
  route: any;
}

export default function EventOptionsScreen({ navigation, route }: EventOptionsScreenProps) {
  const event = route?.params?.event || {
    ticker: 'AAPL',
    headline: 'Earnings Report',
    quick_take: { sentiment: 'Neutral', expected_move: 'Medium' },
  };

  const [trimAmount, setTrimAmount] = useState<'10%' | '15%' | '20%'>('10%');
  const { currentPrice: stockPrice, priceChangePercent, loading: loadingPrice } = useStockPrice(event.ticker);

  const calculatePrices = (option: 'wait' | 'reduce' | 'add') => {
    if (!stockPrice) return null;
    
    const configs = {
      wait: { stopLoss: 0.03, takeProfit: 0.08 },
      reduce: { stopLoss: 0.02, takeProfit: 0.05 },
      add: { stopLoss: 0.05, takeProfit: 0.12 },
    };
    
    const config = configs[option];
    const stopPrice = stockPrice * (1 - config.stopLoss);
    const targetPrice = stockPrice * (1 + config.takeProfit);
    const riskPercent = config.stopLoss * 100;
    const rewardPercent = config.takeProfit * 100;
    const rrRatio = (rewardPercent / riskPercent).toFixed(1);
    
    return {
      current: stockPrice,
      stop: stopPrice,
      target: targetPrice,
      riskPercent: riskPercent,
      rewardPercent: rewardPercent,
      rrRatio: rrRatio,
    };
  };

  const waitPrices = calculatePrices('wait');
  const reducePrices = calculatePrices('reduce');
  const addPrices = calculatePrices('add');

  // 根据 AI 分析结果动态生成推荐
  const getSentiment = () => {
    const sentiment = event?.quick_take?.sentiment || event?.sentiment || 'Neutral';
    return sentiment;
  };

  const getConfidence = () => {
    return event?.confidence || 0.5;
  };

  const getRecommendedAction = () => {
    const sentiment = getSentiment();
    const confidence = getConfidence();
    
    if (sentiment === 'Bullish' && confidence > 0.7) {
      return { primary: 'add', secondary: 'wait', tertiary: 'reduce' };
    } else if (sentiment === 'Bearish' && confidence > 0.7) {
      return { primary: 'reduce', secondary: 'wait', tertiary: 'add' };
    } else {
      return { primary: 'wait', secondary: 'reduce', tertiary: 'add' };
    }
  };

  const recommendedAction = getRecommendedAction();

  const PriceVisualization = ({ prices, option, accentColor }: { 
    prices: ReturnType<typeof calculatePrices>; 
    option: 'wait' | 'reduce' | 'add';
    accentColor: string;
  }) => {
    if (!prices) return null;

    if (option === 'reduce') {
      const totalRange = prices.target - prices.stop;
      const riskHeight = ((prices.target - prices.current) / totalRange) * 100;
      const gainHeight = ((prices.current - prices.stop) / totalRange) * 100;
      const trimPercent = ((prices.target - prices.current) / prices.current) * 100;
      const protectPercent = ((prices.current - prices.stop) / prices.current) * 100;
      const rrRatio = (prices.target - prices.current) / (prices.current - prices.stop);

      return (
        <View style={styles.priceVisualization}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Trim Target</Text>
            <Text style={[styles.priceValue, { color: '#EF4444' }]}>
              ${prices.target.toFixed(2)} (+{trimPercent.toFixed(0)}%)
            </Text>
          </View>
          <View style={[styles.zoneBar, { 
            height: Math.max(riskHeight * 0.8, 30), 
            backgroundColor: 'rgba(239, 68, 68, 0.15)' 
          }]}>
            <Text style={styles.zoneLabel}>Risk Zone</Text>
          </View>
          <View style={[styles.currentPriceLine, { borderColor: accentColor }]}>
            <View style={[styles.priceMarker, { backgroundColor: accentColor }]} />
            <Text style={styles.currentPriceLabel}>
              Current: ${prices.current.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.zoneBar, { 
            height: Math.max(gainHeight * 0.8, 30), 
            backgroundColor: 'rgba(34, 197, 94, 0.15)' 
          }]}>
            <Text style={styles.zoneLabel}>Protection</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Stop (tight)</Text>
            <Text style={[styles.priceValue, { color: '#22C55E' }]}>
              ${prices.stop.toFixed(2)} (-{protectPercent.toFixed(0)}%)
            </Text>
          </View>
          <View style={styles.rrRatioBox}>
            <Text style={styles.rrRatioLabel}>Risk/Reward</Text>
            <Text style={styles.rrRatioValue}>1:{rrRatio.toFixed(1)}</Text>
          </View>
        </View>
      );
    }

    if (option === 'wait') {
      return (
        <View style={styles.priceVisualization}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Current</Text>
            <Text style={[styles.priceValue, { color: accentColor }]}>
              ${prices.current.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.zoneBar, { height: 50, backgroundColor: 'rgba(156, 163, 175, 0.15)' }]}>
            <Text style={styles.zoneLabel}>Hold & Monitor</Text>
          </View>
          <Text style={styles.waitHint}>No trade. Watch for clearer signal.</Text>
        </View>
      );
    }

    const totalRange = prices.target - prices.stop;
    const gainHeight = ((prices.target - prices.current) / totalRange) * 100;
    const riskHeight = ((prices.current - prices.stop) / totalRange) * 100;

    return (
      <View style={styles.priceVisualization}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Target</Text>
          <Text style={[styles.priceValue, { color: '#22C55E' }]}>
            ${prices.target.toFixed(2)} (+{prices.rewardPercent.toFixed(0)}%)
          </Text>
        </View>
        <View style={[styles.zoneBar, { 
          height: Math.max(gainHeight * 0.8, 30), 
          backgroundColor: 'rgba(34, 197, 94, 0.15)' 
        }]}>
          <Text style={styles.zoneLabel}>Potential Gain</Text>
        </View>
        <View style={[styles.currentPriceLine, { borderColor: accentColor }]}>
          <View style={[styles.priceMarker, { backgroundColor: accentColor }]} />
          <Text style={styles.currentPriceLabel}>
            Current: ${prices.current.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.zoneBar, { 
          height: Math.max(riskHeight * 0.8, 30), 
          backgroundColor: 'rgba(239, 68, 68, 0.15)' 
        }]}>
          <Text style={styles.zoneLabel}>Risk Zone</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Stop Loss</Text>
          <Text style={[styles.priceValue, { color: '#EF4444' }]}>
            ${prices.stop.toFixed(2)} (-{prices.riskPercent.toFixed(0)}%)
          </Text>
        </View>
        <View style={styles.rrRatioBox}>
          <Text style={styles.rrRatioLabel}>Risk/Reward</Text>
          <Text style={styles.rrRatioValue}>1:{prices.rrRatio}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Options</Text>
          {!loadingPrice && stockPrice && (
            <View style={styles.headerPriceRow}>
              <Text style={styles.headerTicker}>{event.ticker}</Text>
              <Text style={styles.headerDivider}>|</Text>
              <Text style={styles.headerPrice}>${stockPrice.toFixed(2)}</Text>
              {priceChangePercent !== null && (
                <Text style={[
                  styles.headerChange,
                  { color: priceChangePercent >= 0 ? '#22C55E' : '#EF4444' }
                ]}>
                  {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Analysis Summary */}
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>AI Analysis</Text>
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Sentiment:</Text>
            <Text style={[
              styles.analysisSentiment,
              { color: getSentiment() === 'Bullish' ? '#22C55E' : getSentiment() === 'Bearish' ? '#EF4444' : '#FBBF24' }
            ]}>
              {getSentiment()}
            </Text>
          </View>
          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>Confidence:</Text>
            <Text style={styles.analysisValue}>{(getConfidence() * 100).toFixed(0)}%</Text>
          </View>
          {event?.reasoning && (
            <Text style={styles.analysisReasoning}>{event.reasoning}</Text>
          )}
        </View>

        {/* Disclaimer at Top */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            ⚠️ This app provides investment information only. All content is for educational purposes and does not constitute financial advice. Please make all investment decisions carefully and consult a financial advisor.
          </Text>
        </View>

        {/* Option Card 1: Primary Recommendation */}
        <View style={[styles.card, {
          borderColor: recommendedAction.primary === 'wait' ? 'rgba(59,130,246,0.3)' :
                       recommendedAction.primary === 'add' ? 'rgba(34,197,94,0.3)' :
                       'rgba(239,68,68,0.3)',
        }]}>
          <View style={[styles.cardAccent, 
            recommendedAction.primary === 'wait' ? styles.cardAccentBlue :
            recommendedAction.primary === 'add' ? styles.cardAccentGreen :
            styles.cardAccentRed
          ]} />
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>
                {recommendedAction.primary === 'wait' ? 'Wait & monitor (Recommended)' :
                 recommendedAction.primary === 'add' ? 'Add exposure (Recommended)' :
                 'Reduce / hedge (Recommended)'}
              </Text>
            </View>
            
            {/* Price Visualization */}
            {!loadingPrice && (
              recommendedAction.primary === 'wait' ? waitPrices :
              recommendedAction.primary === 'add' ? addPrices :
              reducePrices
            ) ? (
              <PriceVisualization 
                prices={
                  recommendedAction.primary === 'wait' ? waitPrices! :
                  recommendedAction.primary === 'add' ? addPrices! :
                  reducePrices!
                }
                option={recommendedAction.primary}
                accentColor={
                  recommendedAction.primary === 'wait' ? '#3B82F6' :
                  recommendedAction.primary === 'add' ? '#22C55E' :
                  '#EF4444'
                }
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#22C55E" />
              </View>
            )}
            
            <Text style={styles.glanceDecision}>Glance AI's Decision</Text>
            <Text style={styles.cardAction}>
              {recommendedAction.primary === 'wait' ? 'Action: No trade' :
               recommendedAction.primary === 'add' ? 'Action: Increase position' :
               'Action: Reduce exposure'}
            </Text>
            <Text style={styles.cardDesc}>
              {recommendedAction.primary === 'wait' ? 'Wait for IV to cool and price to stabilize' :
               recommendedAction.primary === 'add' ? event?.bull_case || 'Strong bullish signal detected' :
               event?.bear_case || 'Risk detected, consider reducing exposure'}
            </Text>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Starter size with protections</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={[styles.metricText, { color: '#EF4444' }]}>
                Stop: -{recommendedAction.primary === 'wait' ? 3 : recommendedAction.primary === 'add' ? 5 : 2}%
              </Text>
              <Text style={styles.metricDivider}>·</Text>
              <Text style={styles.metricText}>
                {recommendedAction.primary === 'add' ? 'Target: +12%' : recommendedAction.primary === 'reduce' ? 'Target: trim' : 'Time-out: 1d'}
              </Text>
            </View>
            <View style={styles.sizeRow}>
              <Text style={styles.sizeLabel}>Size</Text>
              <Text style={styles.sizeValue}>0.25x</Text>
            </View>
            <View style={styles.downsideRow}>
              <Text style={styles.downsideLabel}>Downside</Text>
              <View style={styles.badgeMed}>
                <Text style={styles.badgeText}>Med</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.buildButton,
                recommendedAction.primary === 'wait' && styles.buildButtonBlue,
                recommendedAction.primary === 'add' && styles.buildButtonGreen,
                recommendedAction.primary === 'reduce' && styles.buildButtonRed,
              ]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BuildPlan', { 
                event, 
                option: recommendedAction.primary,
                stockPrice,
              })}
            >
              <Text style={styles.buildButtonText}>Build this plan</Text>
            </TouchableOpacity>
            <Text style={styles.cautionText}>
              App provides investing info only. Make decisions carefully.
            </Text>
          </View>
        </View>

        {/* Option Card 2: Secondary Option */}
        <View style={styles.card}>
          <View style={[styles.cardAccent, 
            recommendedAction.secondary === 'wait' ? styles.cardAccentBlue :
            recommendedAction.secondary === 'reduce' ? styles.cardAccentRed :
            styles.cardAccentGreen
          ]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>
              {recommendedAction.secondary === 'wait' ? 'Wait & monitor' :
               recommendedAction.secondary === 'reduce' ? 'Reduce / hedge' :
               'Alternative approach'}
            </Text>
            
            {/* Price Visualization */}
            {!loadingPrice && (
              recommendedAction.secondary === 'wait' ? waitPrices :
              recommendedAction.secondary === 'reduce' ? reducePrices :
              addPrices
            ) ? (
              <PriceVisualization 
                prices={
                  recommendedAction.secondary === 'wait' ? waitPrices! :
                  recommendedAction.secondary === 'reduce' ? reducePrices! :
                  addPrices!
                }
                option={recommendedAction.secondary}
                accentColor={
                  recommendedAction.secondary === 'wait' ? '#3B82F6' :
                  recommendedAction.secondary === 'reduce' ? '#EF4444' :
                  '#22C55E'
                }
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}
            
            <Text style={styles.cardDesc}>
              {recommendedAction.secondary === 'reduce' ? 'Or hedge: SPY' : recommendedAction.secondary === 'add' ? 'Add on strength' : 'Monitor price action'}
            </Text>
            <Text style={styles.cardGoal}>
              {recommendedAction.secondary === 'reduce' ? 'Goal: lower exposure' : recommendedAction.secondary === 'add' ? 'Goal: capture upside' : 'Goal: minimize risk'}
            </Text>
            {(recommendedAction.secondary === 'reduce' || recommendedAction.secondary === 'add') && (
              <View style={styles.metricsRow}>
                <Text style={[styles.metricText, { color: '#EF4444' }]}>
                  Stop: -{recommendedAction.secondary === 'add' ? 5 : 2}%
                </Text>
                <Text style={styles.metricDivider}>·</Text>
                <Text style={styles.metricText}>
                  {recommendedAction.secondary === 'add' ? 'Target: +12%' : 'Trim exposure'}
                </Text>
              </View>
            )}
            {recommendedAction.secondary === 'reduce' && (
              <>
                <Text style={styles.trimLabel}>Trim amount</Text>
                <View style={styles.trimOptions}>
                  {(['10%', '15%', '20%'] as const).map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      style={[styles.trimChip, trimAmount === pct && styles.trimChipActive]}
                      onPress={() => setTrimAmount(pct)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.trimChipText, trimAmount === pct && styles.trimChipTextActive]}>
                        {pct}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <View style={styles.downsideRow}>
              <Text style={styles.downsideLabel}>Downside</Text>
              <View style={styles.badgeMed}>
                <Text style={styles.badgeText}>Med</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.buildButton,
                recommendedAction.secondary === 'wait' && styles.buildButtonBlue,
                recommendedAction.secondary === 'reduce' && styles.buildButtonRed,
                recommendedAction.secondary === 'add' && styles.buildButtonGreen,
              ]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BuildPlan', { 
                event, 
                option: recommendedAction.secondary,
                stockPrice,
              })}
            >
              <Text style={styles.buildButtonText}>Build this plan</Text>
            </TouchableOpacity>
            <Text style={styles.cautionText}>
              App provides investing info only. Make decisions carefully.
            </Text>
          </View>
        </View>

        {/* Option Card 3: Create my own option */}
        <View style={styles.card}>
          <View style={[styles.cardAccent, styles.cardAccentGray]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Create my own option</Text>
            <Text style={styles.cardDescOwn}>
              Set size + protections without a template.
            </Text>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
              <Text style={styles.createButtonText}>Create my own option</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Options Details link */}
        <TouchableOpacity style={styles.detailsRow} activeOpacity={0.8}>
          <Text style={styles.detailsText}>Options Details</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  headerTicker: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerDivider: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  // AI Analysis Card Styles
  analysisCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 12,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  analysisSentiment: {
    fontSize: 15,
    fontWeight: '700',
  },
  analysisValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  analysisReasoning: {
    fontSize: 13,
    lineHeight: 18,
    color: '#D1D5DB',
    marginTop: 8,
    fontStyle: 'italic',
  },

  warningSection: {
    marginBottom: 20,
    gap: 10,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningIcon: {
    fontSize: 16,
    color: '#EF4444',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    flex: 1,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#D1D5DB',
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sortLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  sortValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  showRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  showLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  showValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardAccent: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardAccentGreen: {
    backgroundColor: '#22C55E',
  },
  cardAccentBlue: {
    backgroundColor: '#3B82F6',
  },
  cardAccentRed: {
    backgroundColor: '#EF4444',
  },
  cardAccentYellow: {
    backgroundColor: '#FBBF24',
  },
  cardAccentGray: {
    backgroundColor: '#6B7280',
  },
  cardBody: {
    flex: 1,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  glanceDecision: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cautionText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
    marginTop: 8,
    lineHeight: 16,
    textAlign: 'center',
  },
  cardAction: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardGoal: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 10,
  },
  cardDescOwn: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
    marginBottom: 16,
  },
  downsideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  downsideLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  badgeLow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeLowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  badgeMed: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
  },
  planRow: {
    marginBottom: 8,
  },
  planLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metricText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  metricDivider: {
    fontSize: 13,
    color: '#6B7280',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sizeLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  sizeValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trimLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  trimOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  trimChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  trimChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  trimChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  trimChipTextActive: {
    color: '#000000',
  },
  buildButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buildButtonGreen: {
    backgroundColor: '#22C55E',
  },
  buildButtonBlue: {
    backgroundColor: '#3B82F6',
  },
  buildButtonRed: {
    backgroundColor: '#EF4444',
  },
  buildButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimerSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  createButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bottomPadding: {
    height: 24,
  },
  // Price Visualization Styles
  priceVisualization: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  zoneBar: {
    marginVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoneLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPriceLine: {
    borderTopWidth: 2,
    borderStyle: 'solid',
    marginVertical: 8,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  currentPriceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rrRatioBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rrRatioLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  rrRatioValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FBBF24',
  },
  reduceHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
    fontStyle: 'italic',
  },
  waitHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
