import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { 
  Line as SvgLine, 
  Circle as SvgCircle, 
  Polygon as SvgPolygon, 
  Defs, 
  LinearGradient, 
  Stop 
} from 'react-native-svg';

interface ProfitLossDiagramProps {
  currentPrice: number;
  stopLoss: number;      // -3%
  takeProfit: number;    // +8%
  investAmount: number;  // $500
  option?: 'wait' | 'reduce' | 'add';
  width?: number;
  height?: number;
}

export default function ProfitLossDiagram({
  currentPrice,
  stopLoss,
  takeProfit,
  investAmount,
  option = 'add',
  width = 340,
  height = 220,
}: ProfitLossDiagramProps) {
  
  if (option === 'wait') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hold & Monitor</Text>
        <View style={styles.altIllustration}>
          <Text style={styles.altIcon}>⏸</Text>
          <Text style={styles.altLabel}>No trade</Text>
          <Text style={styles.altDesc}>Watch for clearer signal before acting.</Text>
        </View>
      </View>
    );
  }

  if (option === 'reduce') {
    // Reduce: inverted - red above (trim target), green below (stop)
    const trimTargetPrice = currentPrice * (1 + takeProfit / 100);
    const stopPrice = currentPrice * (1 - stopLoss / 100);
    const maxLoss = investAmount * stopLoss / 100;
    const maxGain = investAmount * takeProfit / 100;

    const padding = { left: 50, right: 30, top: 30, bottom: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const priceMin = stopPrice * 0.95;
    const priceMax = trimTargetPrice * 1.05;
    const priceRange = priceMax - priceMin;

    const mapPriceToX = (price: number) =>
      padding.left + ((price - priceMin) / priceRange) * chartWidth;

    const profitMax = maxGain * 1.2;
    const lossMax = maxLoss * 1.2;
    const profitRange = profitMax + lossMax;

    const mapProfitToY = (profit: number) =>
      padding.top + ((profitMax - profit) / profitRange) * chartHeight;

    const stopX = mapPriceToX(stopPrice);
    const stopY = mapProfitToY(-maxLoss);

    const breakEvenX = mapPriceToX(currentPrice);
    const breakEvenY = mapProfitToY(0);

    const trimTargetX = mapPriceToX(trimTargetPrice);
    const trimTargetY = mapProfitToY(maxGain);

    const zeroY = mapProfitToY(0);
    const rrRatio = (takeProfit / stopLoss).toFixed(1);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profit / Loss Profile</Text>

        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="reduceGainGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22C55E" stopOpacity="0.05" />
              <Stop offset="1" stopColor="#22C55E" stopOpacity="0.3" />
            </LinearGradient>
            <LinearGradient id="reduceLossGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#EF4444" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#EF4444" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          <SvgLine x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#2C2C2E" strokeWidth="2" />
          <SvgLine x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} stroke="#2C2C2E" strokeWidth="2" />

          {/* Red zone: above current (trim target / risk zone) */}
          <SvgPolygon
            points={`${breakEvenX},${zeroY} ${trimTargetX},${trimTargetY} ${trimTargetX},${zeroY}`}
            fill="url(#reduceLossGradient)"
          />

          {/* Green zone: below current (stop / protection) */}
          <SvgPolygon
            points={`${stopX},${zeroY} ${stopX},${stopY} ${breakEvenX},${zeroY}`}
            fill="url(#reduceGainGradient)"
          />

          {/* Red line: current → trim target */}
          <SvgLine x1={breakEvenX} y1={breakEvenY} x2={trimTargetX} y2={trimTargetY} stroke="#EF4444" strokeWidth="3" />

          {/* Green line: stop → current */}
          <SvgLine x1={stopX} y1={stopY} x2={breakEvenX} y2={breakEvenY} stroke="#22C55E" strokeWidth="3" />

          <SvgCircle cx={stopX} cy={stopY} r="6" fill="#22C55E" stroke="#000000" strokeWidth="2" />
          <SvgCircle cx={breakEvenX} cy={breakEvenY} r="7" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          <SvgCircle cx={trimTargetX} cy={trimTargetY} r="6" fill="#EF4444" stroke="#000000" strokeWidth="2" />

          <SvgLine x1={breakEvenX} y1={breakEvenY} x2={breakEvenX} y2={height - padding.bottom} stroke="#6B7280" strokeWidth="1" strokeDasharray="4,4" />
        </Svg>

        <View style={styles.labelsContainer}>
          <View style={styles.labelItem}>
            <View style={[styles.labelDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.labelText}>Stop: ${stopPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.labelDot, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#6B7280' }]} />
            <Text style={styles.labelText}>Current: ${currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.labelItem}>
            <View style={[styles.labelDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.labelText}>Trim: ${trimTargetPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.amountsRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Max Loss</Text>
            <Text style={[styles.amountValue, { color: '#EF4444' }]}>-${maxLoss.toFixed(0)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Position</Text>
            <Text style={styles.amountValue}>${investAmount.toFixed(0)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Max Gain</Text>
            <Text style={[styles.amountValue, { color: '#22C55E' }]}>+${maxGain.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>Risk/Reward: 1:{rrRatio}</Text>
        </View>
      </View>
    );
  }
  
  // Add: full P/L diagram
  const stopPrice = currentPrice * (1 - stopLoss / 100);
  const targetPrice = currentPrice * (1 + takeProfit / 100);
  const maxLoss = investAmount * stopLoss / 100;
  const maxGain = investAmount * takeProfit / 100;
  
  // SVG 坐标映射
  const padding = { left: 50, right: 30, top: 30, bottom: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // X 轴：价格范围
  const priceMin = stopPrice * 0.95;
  const priceMax = targetPrice * 1.05;
  const priceRange = priceMax - priceMin;
  
  const mapPriceToX = (price: number) => {
    return padding.left + ((price - priceMin) / priceRange) * chartWidth;
  };
  
  // Y 轴：盈亏
  const profitMax = maxGain * 1.2;
  const lossMax = maxLoss * 1.2;
  const profitRange = profitMax + lossMax;
  
  const mapProfitToY = (profit: number) => {
    return padding.top + ((profitMax - profit) / profitRange) * chartHeight;
  };
  
  // 关键点坐标
  const stopX = mapPriceToX(stopPrice);
  const stopY = mapProfitToY(-maxLoss);
  
  const breakEvenX = mapPriceToX(currentPrice);
  const breakEvenY = mapProfitToY(0);
  
  const targetX = mapPriceToX(targetPrice);
  const targetY = mapProfitToY(maxGain);
  
  const zeroY = mapProfitToY(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profit / Loss Profile</Text>
      
      <Svg width={width} height={height}>
        <Defs>
          {/* 绿色渐变 */}
          <LinearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#22C55E" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#22C55E" stopOpacity="0.05" />
          </LinearGradient>
          
          {/* 红色渐变 */}
          <LinearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#EF4444" stopOpacity="0.05" />
            <Stop offset="1" stopColor="#EF4444" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        
        {/* Y 轴（盈亏轴） */}
        <SvgLine
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#2C2C2E"
          strokeWidth="2"
        />
        
        {/* X 轴（价格轴） */}
        <SvgLine
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke="#2C2C2E"
          strokeWidth="2"
        />
        
        {/* 盈利区域填充 */}
        <SvgPolygon
          points={`${breakEvenX},${zeroY} ${targetX},${targetY} ${targetX},${zeroY}`}
          fill="url(#gainGradient)"
        />
        
        {/* 亏损区域填充 */}
        <SvgPolygon
          points={`${stopX},${zeroY} ${stopX},${stopY} ${breakEvenX},${zeroY}`}
          fill="url(#lossGradient)"
        />
        
        {/* 亏损线段（红色） */}
        <SvgLine
          x1={stopX}
          y1={stopY}
          x2={breakEvenX}
          y2={breakEvenY}
          stroke="#EF4444"
          strokeWidth="3"
        />
        
        {/* 盈利线段（绿色） */}
        <SvgLine
          x1={breakEvenX}
          y1={breakEvenY}
          x2={targetX}
          y2={targetY}
          stroke="#22C55E"
          strokeWidth="3"
        />
        
        {/* Stop loss 点 */}
        <SvgCircle
          cx={stopX}
          cy={stopY}
          r="6"
          fill="#EF4444"
          stroke="#000000"
          strokeWidth="2"
        />
        
        {/* Breakeven 点 */}
        <SvgCircle
          cx={breakEvenX}
          cy={breakEvenY}
          r="7"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        
        {/* Target 点 */}
        <SvgCircle
          cx={targetX}
          cy={targetY}
          r="6"
          fill="#22C55E"
          stroke="#000000"
          strokeWidth="2"
        />
        
        {/* Breakeven 垂直虚线 */}
        <SvgLine
          x1={breakEvenX}
          y1={breakEvenY}
          x2={breakEvenX}
          y2={height - padding.bottom}
          stroke="#6B7280"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      </Svg>
      
      {/* 标签 */}
      <View style={styles.labelsContainer}>
        <View style={styles.labelItem}>
          <View style={[styles.labelDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.labelText}>Loss: ${stopPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.labelItem}>
          <View style={[styles.labelDot, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#6B7280' }]} />
          <Text style={styles.labelText}>Current: ${currentPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.labelItem}>
          <View style={[styles.labelDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.labelText}>Target: ${targetPrice.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* 盈亏金额标注 */}
      <View style={styles.amountsRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Max Loss</Text>
          <Text style={[styles.amountValue, { color: '#EF4444' }]}>-${maxLoss.toFixed(0)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Invest</Text>
          <Text style={styles.amountValue}>${investAmount.toFixed(0)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Max Gain</Text>
          <Text style={[styles.amountValue, { color: '#22C55E' }]}>+${maxGain.toFixed(0)}</Text>
        </View>
      </View>
      
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          Risk/Reward: 1:{(takeProfit / stopLoss).toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 16,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  amountItem: {
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerNote: {
    marginTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  altIllustration: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  altIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  altLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  altDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  reduceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reduceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  reduceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reduceArrow: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
