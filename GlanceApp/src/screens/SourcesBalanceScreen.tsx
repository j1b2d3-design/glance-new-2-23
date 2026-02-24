import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';

interface SourcesBalanceScreenProps {
  navigation: any;
}

interface Source {
  name: string;
  enabled: boolean;
  note?: string;
}

export default function SourcesBalanceScreen({ navigation }: SourcesBalanceScreenProps) {
  const [sources, setSources] = useState<Source[]>([
    { name: 'Company IR / Press Release', enabled: true },
    { name: 'SEC Filings', enabled: true },
    { name: 'Reuters', enabled: true },
    { name: 'Wall Street Journal', enabled: true },
    { name: 'Bloomberg', enabled: true },
    { name: 'Reddit / Forums', enabled: false, note: 'lower signal' },
  ]);
  
  const [opposingViewFirst, setOpposingViewFirst] = useState(false);
  const [receiptsDensity, setReceiptsDensity] = useState<'Light' | 'Standard' | 'Deep'>('Standard');
  const [showSourceChips, setShowSourceChips] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const toggleSource = (index: number) => {
    const newSources = [...sources];
    newSources[index].enabled = !newSources[index].enabled;
    setSources(newSources);
  };

  const resetToDefaults = () => {
    setSources([
      { name: 'Company IR / Press Release', enabled: true },
      { name: 'SEC Filings', enabled: true },
      { name: 'Reuters', enabled: true },
      { name: 'Wall Street Journal', enabled: true },
      { name: 'Bloomberg', enabled: true },
      { name: 'Reddit / Forums', enabled: false, note: 'lower signal' },
    ]);
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
        <Text style={styles.headerTitle}>Sources & Balance</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferred Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred sources</Text>
          <Text style={styles.sectionSubtitle}>
            Receipts prioritize these sources when available.
          </Text>
          
          <View style={styles.sourcesList}>
            {sources.map((source, index) => (
              <View key={index} style={styles.sourceRow}>
                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceName}>{source.name}</Text>
                  {source.note && (
                    <Text style={styles.sourceNote}>{source.note}</Text>
                  )}
                </View>
                <Switch
                  value={source.enabled}
                  onValueChange={() => toggleSource(index)}
                  trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
          
          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
            <Text style={styles.addButtonText}>Add more sources</Text>
          </TouchableOpacity>
        </View>

        {/* Opposing-view First */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opposing-view first</Text>
          
          <View style={styles.switchCard}>
            <Switch
              value={opposingViewFirst}
              onValueChange={setOpposingViewFirst}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <Text style={styles.sectionNote}>
            When on, Glance surfaces counterpoints before suggestions.
          </Text>
        </View>

        {/* Receipts Density */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipts density</Text>
          
          <View style={styles.densityRow}>
            {(['Light', 'Standard', 'Deep'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.densityButton,
                  receiptsDensity === level && styles.densityButtonActive
                ]}
                onPress={() => setReceiptsDensity(level)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.densityText,
                  receiptsDensity === level && styles.densityTextActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.densityInfo}>
            <Text style={styles.densityInfoText}>Light: 1–2 sources</Text>
            <Text style={styles.densityInfoText}>Standard: 3–5 sources</Text>
            <Text style={styles.densityInfoText}>Deep: 5+ sources + counterpoint</Text>
          </View>
        </View>

        {/* Citations on Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Citations on cards</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show source chips on summary card</Text>
            <Switch
              value={showSourceChips}
              onValueChange={setShowSourceChips}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show timestamps on summary card</Text>
            <Switch
              value={showTimestamps}
              onValueChange={setShowTimestamps}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity 
          style={styles.resetButton}
          activeOpacity={0.8}
          onPress={resetToDefaults}
        >
          <Text style={styles.resetButtonText}>Reset sources to default</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            You can always open the full receipts drawer.
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionNote: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
    marginTop: 12,
  },
  sourcesList: {
    gap: 10,
    marginBottom: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  sourceInfo: {
    flex: 1,
    marginRight: 12,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  sourceNote: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  switchCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  densityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  densityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  densityButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  densityText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  densityTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  densityInfo: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 6,
  },
  densityInfoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  footerNote: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
    textAlign: 'center',
  },
});
