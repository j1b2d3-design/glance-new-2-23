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

interface ProfileRiskScreenProps {
  navigation: any;
}

export default function ProfileRiskScreen({ navigation }: ProfileRiskScreenProps) {
  // Windows
  const [middayTime, setMiddayTime] = useState('12:30 PM');
  const [eveningTime, setEveningTime] = useState('7:30 PM');
  
  // Daily noise budget
  const [dailyCap, setDailyCap] = useState(6);
  
  // Focus - Sectors
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['Tech', 'Macro']);
  
  // Focus - Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Earnings', 'Rates']);
  
  // Risk comfort
  const [riskComfort, setRiskComfort] = useState<'Calm' | 'Balanced' | 'Assertive'>('Calm');
  
  // Urgent breakthrough settings
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(true);
  const [topHoldingsOnly, setTopHoldingsOnly] = useState(true);

  const sectors = ['Tech', 'Macro', 'Consumer', 'Healthcare', 'Energy', 'Industrials'];
  const topics = ['Earnings', 'Rates', 'Regulation', 'Credit', 'Supply chain'];
  const riskLevels: ('Calm' | 'Balanced' | 'Assertive')[] = ['Calm', 'Balanced', 'Assertive'];

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
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
        <Text style={styles.headerTitle}>Profile & Risk</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Reachable Windows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reachable windows</Text>
          
          <View style={styles.windowsRow}>
            <View style={styles.windowItem}>
              <Text style={styles.windowLabel}>Midday</Text>
              <Text style={styles.windowTime}>{middayTime}</Text>
            </View>
            <View style={styles.windowItem}>
              <Text style={styles.windowLabel}>Evening</Text>
              <Text style={styles.windowTime}>{eveningTime}</Text>
            </View>
          </View>
          
          <Text style={styles.sectionNote}>
            Non-urgent items are held for your windows.
          </Text>
        </View>

        {/* Daily Noise Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily noise budget</Text>
          
          <View style={styles.budgetCard}>
            <Text style={styles.budgetNumber}>{dailyCap}</Text>
          </View>
          
          <Text style={styles.sectionNote}>
            After the cap, items go to Digest.
          </Text>
        </View>

        {/* Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus</Text>
          
          {/* Sectors */}
          <Text style={styles.subsectionTitle}>Sectors</Text>
          <View style={styles.chipsGrid}>
            {sectors.map((sector) => (
              <TouchableOpacity
                key={sector}
                style={[
                  styles.chip,
                  selectedSectors.includes(sector) && styles.chipActive
                ]}
                onPress={() => toggleSector(sector)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.chipText,
                  selectedSectors.includes(sector) && styles.chipTextActive
                ]}>
                  {sector}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Topics */}
          <Text style={styles.subsectionTitle}>Topics</Text>
          <View style={styles.chipsGrid}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.chip,
                  selectedTopics.includes(topic) && styles.chipActive
                ]}
                onPress={() => toggleTopic(topic)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.chipText,
                  selectedTopics.includes(topic) && styles.chipTextActive
                ]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionNote}>
            Start broad; refine if you see too much noise.
          </Text>
        </View>

        {/* Risk Comfort */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk comfort</Text>
          
          <View style={styles.riskRow}>
            {riskLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.riskButton,
                  riskComfort === level && styles.riskButtonActive
                ]}
                onPress={() => setRiskComfort(level)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.riskText,
                  riskComfort === level && styles.riskTextActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.riskFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>Smaller starter size suggestions</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>Stronger protections surfaced</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.featureText}>Higher bar for urgent break-through</Text>
            </View>
          </View>
        </View>

        {/* Urgent Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgent events can break through</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Only high confidence</Text>
            <Switch
              value={highConfidenceOnly}
              onValueChange={setHighConfidenceOnly}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Only top holdings</Text>
            <Switch
              value={topHoldingsOnly}
              onValueChange={setTopHoldingsOnly}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <Text style={styles.sectionNote}>
            Interruptions stay rare and meaningful.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionNote: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
    marginTop: 12,
  },
  windowsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  windowItem: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  windowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  windowTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  budgetCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  budgetNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  chipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  riskRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  riskButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  riskButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  riskText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  riskTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  riskFeatures: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
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
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
