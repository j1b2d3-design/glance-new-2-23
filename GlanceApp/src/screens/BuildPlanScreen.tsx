import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import ProfitLossDiagram from '../components/ProfitLossDiagram';

interface BuildPlanScreenProps {
  navigation: any;
  route: any;
}

export default function BuildPlanScreen({ navigation, route }: BuildPlanScreenProps) {
  const event = route?.params?.event || null;
  const option = route?.params?.option || null;
  const stockPrice = route?.params?.stockPrice ?? 100;
  
  const [mode, setMode] = useState<'Practice' | 'Live'>('Practice');
  
  const [investAmount, setInvestAmount] = useState(500);
  const [riskLevel, setRiskLevel] = useState(2);

  const getRiskConfig = () => {
    const configs = [
      { label: 'Very Safe',  stopLoss: 2,  target: 5,  winRate: 70  },
      { label: 'Safe',       stopLoss: 3,  target: 8,  winRate: 65  },
      { label: 'Balanced',   stopLoss: 5,  target: 12, winRate: 55  },
      { label: 'Aggressive', stopLoss: 8,  target: 20, winRate: 45  },
      { label: 'YOLO',       stopLoss: 15, target: 40, winRate: 30  },
    ];
    return configs[Math.round(riskLevel) - 1] || configs[1];
  };

  // 风险等级对应的颜色（只用于风险指示器）
  const getRiskColor = () => {
    if (riskLevel <= 2) return '#22C55E';
    if (riskLevel <= 4) return '#FBBF24';
    return '#EF4444';
  };

  const risk = getRiskConfig();
  const riskColor = getRiskColor();
  const maxLoss = investAmount * risk.stopLoss / 100;
  const potentialGain = investAmount * risk.target / 100;
  const rrRatio = maxLoss > 0 ? (potentialGain / maxLoss).toFixed(1) : '0';
  const gainBarWidth = Math.min(risk.target * 2.5, 100); // 按比例缩放
  const lossBarWidth = Math.min(risk.stopLoss * 2.5, 100);

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
          <Text style={styles.headerTitle}>Build Your Plan</Text>
          {event && (
            <Text style={styles.headerSubtitle}>{event.ticker || 'Event'}</Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeContainer}>
        <TouchableOpacity 
          style={[styles.modeTab, mode === 'Practice' && styles.modeTabActive]}
          onPress={() => setMode('Practice')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeText, mode === 'Practice' && styles.modeTextActive]}>
            Practice
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeTab, mode === 'Live' && styles.modeTabActive]}
          onPress={() => setMode('Live')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeText, mode === 'Live' && styles.modeTextActive]}>
            Live
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ========== Step 1: Investment Amount ========== */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>
                {option === 'reduce' ? 'Current position size?' : 'How much to invest?'}
              </Text>
              <Text style={styles.stepDesc}>
                {option === 'reduce' ? 'Drag to set your position size to trim' : 'Drag to set your investment amount'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.amountValue}>${investAmount.toFixed(0)}</Text>
          
          <Slider
            style={styles.mainSlider}
            minimumValue={100}
            maximumValue={5000}
            step={50}
            value={investAmount}
            onValueChange={setInvestAmount}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#2C2C2E"
            thumbTintColor="#FFFFFF"
          />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>$100</Text>
            <Text style={styles.sliderLabelText}>$5,000</Text>
          </View>
          
          <View style={styles.quickButtons}>
            {[250, 500, 1000, 2500].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.quickBtn, investAmount === amount && styles.quickBtnActive]}
                onPress={() => setInvestAmount(amount)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickBtnText, investAmount === amount && styles.quickBtnTextActive]}>
                  ${amount >= 1000 ? `${(amount/1000).toFixed(amount >= 1000 && amount % 1000 === 0 ? 0 : 1)}k` : amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========== Step 2: Risk Level ========== */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>
                {option === 'reduce' ? 'Trim target & stop level' : 'Choose your risk level'}
              </Text>
              <Text style={styles.stepDesc}>
                {option === 'reduce' 
                  ? 'Set where to trim (target) and where to stop (protection)' 
                  : 'Higher risk = higher potential gains & losses'}
              </Text>
            </View>
          </View>
          
          <View style={styles.riskDisplay}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskLevel, { color: riskColor }]}>{risk.label}</Text>
          </View>
          
          <Slider
            style={styles.mainSlider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={riskLevel}
            onValueChange={setRiskLevel}
            minimumTrackTintColor={riskColor}
            maximumTrackTintColor="#2C2C2E"
            thumbTintColor="#FFFFFF"
          />
          
          <View style={styles.riskLabelsRow}>
            <Text style={styles.riskLabelItem}>Safe</Text>
            <Text style={styles.riskLabelItem}>Balanced</Text>
            <Text style={styles.riskLabelItem}>YOLO</Text>
          </View>
          
          {/* Auto-calculated protection parameters */}
          <View style={styles.autoParams}>
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>{option === 'reduce' ? 'Stop (tight)' : 'Stop-loss'}</Text>
              <Text style={[styles.paramValue, { color: option === 'reduce' ? '#22C55E' : '#EF4444' }]}>-{risk.stopLoss}%</Text>
            </View>
            <View style={styles.paramDivider} />
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>{option === 'reduce' ? 'Trim target' : 'Target'}</Text>
              <Text style={[styles.paramValue, { color: option === 'reduce' ? '#EF4444' : '#22C55E' }]}>+{risk.target}%</Text>
            </View>
            <View style={styles.paramDivider} />
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Max loss</Text>
              <Text style={[styles.paramValue, { color: '#EF4444' }]}>-${maxLoss.toFixed(0)}</Text>
            </View>
            <View style={styles.paramDivider} />
            <View style={styles.paramItem}>
              <Text style={styles.paramLabel}>Win rate</Text>
              <Text style={styles.paramValue}>{risk.winRate}%</Text>
            </View>
          </View>
        </View>

        {/* ========== Profit/Loss Diagram ========== */}
        <ProfitLossDiagram
          currentPrice={stockPrice}
          stopLoss={risk.stopLoss}
          takeProfit={risk.target}
          investAmount={investAmount}
          option={option || 'add'}
        />

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Investment information only. Not financial advice. All decisions should be made carefully by the user.
        </Text>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.tradeButton} 
          activeOpacity={0.8}
        >
          <Text style={styles.tradeButtonText}>Trade this template in broker app</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PlanSaved')}
        >
          <Text style={styles.saveButtonText}>Save plan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

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

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },

  // ── Mode Tabs ──
  modeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeTextActive: {
    color: '#000000',
    fontWeight: '700',
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ── Step Card ──
  stepCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
  },

  // ── Amount Slider ──
  amountValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 4,
  },
  mainSlider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  quickBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickBtnTextActive: {
    color: '#000000',
  },

  // ── Risk Slider ──
  riskDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  riskLevel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  riskLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  riskLabelItem: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },

  // ── Auto Params ──
  autoParams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
  },
  paramItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  paramLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  paramValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paramDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },


  // ── Disclaimer & Buttons ──
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  tradeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  tradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  bottomPad: {
    height: 20,
  },
});
