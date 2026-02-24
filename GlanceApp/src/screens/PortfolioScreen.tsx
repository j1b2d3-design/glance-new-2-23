import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';

interface PortfolioScreenProps {
  navigation: any;
}

interface Holding {
  symbol: string;
  shortSymbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  priceChange: number;
  logoUrl?: string;
  chartData?: number[]; // 用于存储走势数据
}

export default function PortfolioScreen({ navigation }: PortfolioScreenProps) {
  const [holdingsWithLogos, setHoldingsWithLogos] = useState<Holding[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 硬编码的持仓数据（只包含shares和avgCost）
  const baseHoldings: Omit<Holding, 'currentPrice' | 'priceChange'>[] = [
    { symbol: 'AAPL', shortSymbol: 'AA', name: 'Apple Inc.', shares: 100, avgCost: 150 },
    { symbol: 'NVDA', shortSymbol: 'NV', name: 'NVIDIA Corp.', shares: 50, avgCost: 380 },
    { symbol: 'AMD', shortSymbol: 'AM', name: 'Advanced Micro Devices', shares: 150, avgCost: 95 },
    { symbol: 'SPY', shortSymbol: 'SP', name: 'S&P 500 ETF', shares: 30, avgCost: 420 },
    { symbol: 'MSFT', shortSymbol: 'MS', name: 'Microsoft Corp.', shares: 25, avgCost: 340 },
    { symbol: 'TSLA', shortSymbol: 'TS', name: 'Tesla Inc.', shares: 40, avgCost: 220 },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const apiKey = Constants.expoConfig?.extra?.finnhubApiKey || process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
    
    const holdingsWithDataPromises = baseHoldings.map(async (holding) => {
      try {
        // 并行获取 logo、实时价格和走势数据
        const now = Math.floor(Date.now() / 1000);
        const from = now - 24 * 60 * 60; // 1 天前
        
        const [logoRes, priceRes, chartRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${holding.symbol}&token=${apiKey}`)
            .then(r => r.json())
            .catch(() => null),
          fetch(`https://finnhub.io/api/v1/quote?symbol=${holding.symbol}&token=${apiKey}`)
            .then(r => r.json())
            .catch(() => null),
          fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${holding.symbol}&resolution=15&from=${from}&to=${now}&token=${apiKey}`)
            .then(r => r.json())
            .catch(() => null),
        ]);

        // 使用实时价格，如果获取失败则使用默认值
        const currentPrice = priceRes?.c || 0;
        const priceChange = priceRes?.dp || 0;

        return {
          ...holding,
          currentPrice,
          priceChange,
          logoUrl: logoRes?.logo || null,
          chartData: chartRes?.s === 'ok' && chartRes?.c ? chartRes.c : null,
        };
      } catch (error) {
        console.error(`Error fetching data for ${holding.symbol}:`, error);
        return {
          ...holding,
          currentPrice: 0,
          priceChange: 0,
        };
      }
    });

    const results = await Promise.all(holdingsWithDataPromises);
    setHoldingsWithLogos(results);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const portfolioData = useMemo(() => {
    // 如果还没有加载实时数据，显示加载中状态
    if (holdingsWithLogos.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPct: 0,
        todayChange: 0,
        todayChangePct: 0,
        holdings: [],
      };
    }
    
    let totalCurrentValue = 0;
    let totalCost = 0;
    let todayChange = 0;

    const enrichedHoldings = holdingsWithLogos.map(holding => {
      const currentValue = holding.shares * holding.currentPrice;
      const totalCostCalc = holding.shares * holding.avgCost;
      const totalGainLoss = currentValue - totalCostCalc;
      const totalGainLossPct = totalCostCalc > 0 ? (totalGainLoss / totalCostCalc) * 100 : 0;
      
      const yesterdayPrice = holding.currentPrice / (1 + holding.priceChange / 100);
      const todayGainLoss = holding.shares * (holding.currentPrice - yesterdayPrice);

      return {
        ...holding,
        currentValue,
        totalCost: totalCostCalc,
        totalGainLoss,
        totalGainLossPct,
        todayGainLoss,
      };
    });

    enrichedHoldings.forEach(h => {
      totalCurrentValue += h.currentValue;
      totalCost += h.totalCost;
      todayChange += h.todayGainLoss;
    });

    const totalGainLoss = totalCurrentValue - totalCost;
    const totalGainLossPct = (totalGainLoss / totalCost) * 100;
    const todayChangePct = (todayChange / (totalCurrentValue - todayChange)) * 100;

    const holdingsWithPercentage = enrichedHoldings.map(h => ({
      ...h,
      portfolioPercentage: (h.currentValue / totalCurrentValue) * 100,
    }));

    return {
      totalCurrentValue,
      totalCost,
      totalGainLoss,
      totalGainLossPct,
      todayChange,
      todayChangePct,
      holdings: holdingsWithPercentage,
      holdingsCount: holdingsWithLogos.length,
    };
  }, [holdingsWithLogos]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
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
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Portfolio Value</Text>
          <Text style={styles.totalValue}>
            ${(portfolioData.totalCurrentValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          
          <View style={styles.totalChange}>
            <Text style={[
              styles.changeAmount,
              { color: portfolioData.todayChange >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              {portfolioData.todayChange >= 0 ? '+' : ''}${Math.abs(portfolioData.todayChange).toFixed(0)}
            </Text>
            <Text style={[
              styles.changePercentage,
              { color: portfolioData.todayChange >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              ({portfolioData.todayChange >= 0 ? '+' : ''}{portfolioData.todayChangePct.toFixed(2)}%)
            </Text>
          </View>

          <View style={styles.allTimeChange}>
            <Text style={styles.allTimeLabel}>All-time:</Text>
            <Text style={[
              styles.allTimeValue,
              { color: portfolioData.totalGainLoss >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              {portfolioData.totalGainLoss >= 0 ? '+' : ''}${Math.abs(portfolioData.totalGainLoss).toFixed(0)}
            </Text>
            <Text style={[
              styles.allTimePct,
              { color: portfolioData.totalGainLoss >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              ({portfolioData.totalGainLoss >= 0 ? '+' : ''}{portfolioData.totalGainLossPct.toFixed(1)}%)
            </Text>
          </View>
        </View>

        <View style={styles.holdingsHeader}>
          <Text style={styles.sectionTitle}>Holdings ({portfolioData.holdingsCount})</Text>
        </View>

        {portfolioData.holdings.map((holding, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.holdingCard} 
            activeOpacity={0.8}
            onPress={() => {
              const parentNav = navigation.getParent();
              if (parentNav) {
                parentNav.navigate('StockDetail', { 
                  holding: {
                    symbol: holding.symbol,
                    name: holding.name,
                    shares: holding.shares,
                    avgCost: holding.avgCost,
                    currentPrice: holding.currentPrice,
                    priceChange: holding.priceChange,
                    portfolioPercentage: holding.portfolioPercentage,
                  }
                });
              }
            }}
          >
            {/* Left side: Logo + Symbol + Shares */}
            <View style={styles.holdingLeft}>
              {holding.logoUrl ? (
                <Image 
                  source={{ uri: holding.logoUrl }} 
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolText}>{holding.shortSymbol}</Text>
                </View>
              )}
              <View style={styles.holdingInfo}>
                <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
                <Text style={styles.sharesText}>
                  {holding.shares} shares
                </Text>
              </View>
            </View>
            
            {/* Center: Chart Placeholder - Reserved Space */}
            <View style={styles.chartReservedSpace}>
              {/* 预留空间给未来的走势图 */}
            </View>
            
            {/* Right side: Price + Change + Portfolio % */}
            <View style={styles.holdingRight}>
              {holding.currentPrice > 0 ? (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.holdingPrice}>
                      ${holding.currentPrice.toFixed(2)}
                    </Text>
                    <Text style={[
                      styles.holdingChange,
                      holding.priceChange >= 0 ? styles.changePositive : styles.changeNegative
                    ]}>
                      {holding.priceChange >= 0 ? '+' : ''}{holding.priceChange.toFixed(2)}%
                    </Text>
                  </View>
                  <Text style={styles.portfolioPercentage}>
                    {holding.portfolioPercentage.toFixed(1)}% of portfolio
                  </Text>
                </>
              ) : (
                <ActivityIndicator size="small" color="#9CA3AF" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[
              styles.statValue,
              { color: portfolioData.todayChange >= 0 ? '#22C55E' : '#EF4444' }
            ]}>
              {portfolioData.todayChange >= 0 ? '+' : ''}${Math.abs(portfolioData.todayChange).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Today's change</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              ${portfolioData.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.statLabel}>Total cost basis</Text>
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 12,
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

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // ── Total Portfolio Card ──
  totalCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  totalChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  changePercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  allTimeChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    justifyContent: 'center',
  },
  allTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  allTimeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  allTimePct: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Holdings Section ──
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  // ── Holding Card ──
  holdingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 95,
    maxWidth: 125,
  },
  symbolBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  symbolText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  sharesText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },

  // ── Chart Reserved Space ──
  chartReservedSpace: {
    flex: 1,
    height: 40,
    minWidth: 50,
    maxWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Holding Right (Price + Change) ──
  holdingRight: {
    alignItems: 'flex-end',
    minWidth: 100,
    maxWidth: 130,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginBottom: 3,
  },
  holdingPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  holdingChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  portfolioPercentage: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },

  // ── Legacy chart styles (unused but kept for safety) ──
  chartContainer: {
    flex: 1,
    height: 50,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 18,
    color: '#6B7280',
  },
  chart: {
    height: 50,
    flex: 1,
  },

  // ── Colors ──
  changePositive: {
    color: '#22C55E',
  },
  changeNegative: {
    color: '#EF4444',
  },

  // ── Bottom Stats ──
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomPad: {
    height: 24,
  },
});
