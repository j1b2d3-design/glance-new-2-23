import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

interface StockDetailScreenProps {
  navigation: any;
  route: any;
}

interface HoldingData {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  priceChange: number;
  portfolioPercentage: number;
}

export default function StockDetailScreen({ navigation, route }: StockDetailScreenProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  
  const holding: HoldingData = route?.params?.holding || {
    symbol: 'UNKNOWN',
    name: 'Unknown Company',
    shares: 0,
    avgCost: 0,
    currentPrice: 0,
    priceChange: 0,
    portfolioPercentage: 0,
  };

  const positionValue = holding.shares * holding.currentPrice;
  const totalCost = holding.shares * holding.avgCost;
  const totalReturn = totalCost > 0 ? ((positionValue - totalCost) / totalCost) * 100 : 0;

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
        <Text style={styles.headerTitle}>{holding.symbol}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Name */}
        <View style={styles.titleSection}>
          <Text style={styles.companyName}>{holding.name}</Text>
          <Text style={styles.tickerSymbol}>{holding.symbol}</Text>
        </View>

        {/* Large Price Chart (Robinhood style) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartPrice}>${holding.currentPrice.toFixed(2)}</Text>
              <Text style={[
                styles.chartChange,
                { color: holding.priceChange >= 0 ? '#22C55E' : '#EF4444' }
              ]}>
                {holding.priceChange >= 0 ? '+' : ''}{holding.priceChange.toFixed(2)}% Today
              </Text>
            </View>
          </View>
          
          {/* Large Stock Chart - Temporarily Disabled */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart coming soon</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              {timeRange} view for {holding.symbol}
            </Text>
          </View>
          
          {/* Time Range Selector */}
          <View style={styles.timeRangeSelector}>
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => setTimeRange(range)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive
                ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Position Value & Change */}
        <View style={styles.valueSection}>
          <View style={styles.valueCard}>
            <Text style={styles.valueLabel}>Position value</Text>
            <Text style={styles.valueAmount}>${positionValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
          </View>
          
          <View style={styles.changeCard}>
            <Text style={styles.changeLabel}>Today's{'\n'}change</Text>
            <Text style={[
              styles.changeValue,
              { color: holding.priceChange >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              {holding.priceChange >= 0 ? '+' : ''}{holding.priceChange.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Portfolio weight</Text>
              <Text style={styles.statValue}>{holding.portfolioPercentage.toFixed(1)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Shares</Text>
              <Text style={styles.statValue}>{holding.shares}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg. cost</Text>
              <Text style={styles.statValue}>${holding.avgCost.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current price</Text>
              <Text style={styles.statValue}>${holding.currentPrice.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total return</Text>
              <Text style={[
                totalReturn >= 0 ? styles.statValuePositive : styles.statValueNegative
              ]}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Recent events</Text>

          {/* Event 1 - URGENT */}
          <TouchableOpacity 
            style={[styles.eventCard, styles.eventCardUrgent]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventDetail')}
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventBadgeUrgent}>
                <Text style={styles.eventBadgeText}>URGENT</Text>
              </View>
              <Text style={styles.eventDate}>Jan 12, 2026</Text>
            </View>
            <Text style={styles.eventTitle}>
              {holding.symbol} earnings beat; guidance raised
            </Text>
            <Text style={styles.eventSignal}>High upside signal</Text>
          </TouchableOpacity>

          {/* Event 2 - WINDOWED */}
          <TouchableOpacity 
            style={styles.eventCard}
            activeOpacity={0.8}
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventBadgeWindowed}>
                <Text style={styles.eventBadgeText}>WINDOWED</Text>
              </View>
              <Text style={styles.eventDate}>Jan 10, 2026</Text>
            </View>
            <Text style={styles.eventTitle}>
              Analyst upgrade: Price target raised
            </Text>
            <Text style={styles.eventSignalNeutral}>Neutral signal</Text>
          </TouchableOpacity>

          {/* Event 3 - WINDOWED */}
          <TouchableOpacity 
            style={styles.eventCard}
            activeOpacity={0.8}
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventBadgeWindowed}>
                <Text style={styles.eventBadgeText}>WINDOWED</Text>
              </View>
              <Text style={styles.eventDate}>Jan 8, 2026</Text>
            </View>
            <Text style={styles.eventTitle}>
              Industry news affects {holding.symbol}
            </Text>
            <Text style={styles.eventSignal}>Modest upside signal</Text>
          </TouchableOpacity>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Events shown are filtered to those touching {holding.symbol}. View full timeline in Today.
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 12,
  },
  companyName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tickerSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  chartChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainChart: {
    height: 180,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginVertical: 8,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeRangeButtonActive: {
    backgroundColor: '#2C2C2E',
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  valueSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  valueCard: {
    flex: 2,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  changeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 16,
  },
  changeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
  },
  statsGrid: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 24,
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 6,
    lineHeight: 17,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statValuePositive: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
  },
  statValueNegative: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  eventsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  eventCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventBadgeUrgent: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventBadgeWindowed: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 22,
  },
  eventSignal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22C55E',
  },
  eventSignalNeutral: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  footerNote: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 8,
  },
});
