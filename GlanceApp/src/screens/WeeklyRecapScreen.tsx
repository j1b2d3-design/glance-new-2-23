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

interface WeeklyRecapScreenProps {
  navigation: any;
}

export default function WeeklyRecapScreen({ navigation }: WeeklyRecapScreenProps) {
  const [selectedTweaks, setSelectedTweaks] = useState<string[]>([]);

  const tweaks = [
    'Raise macro urgency threshold',
    'Show opposing view by default',
    'Lower daily cap from 6 → 5',
  ];

  const toggleTweak = (tweak: string) => {
    if (selectedTweaks.includes(tweak)) {
      setSelectedTweaks(selectedTweaks.filter(t => t !== tweak));
    } else {
      setSelectedTweaks([...selectedTweaks, tweak]);
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
        <Text style={styles.headerTitle}>Weekly recap</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Your week at a glance</Text>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Opened</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Saved plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Safely ignored</Text>
          </View>
        </View>

        {/* Budget Message */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetText}>
            You stayed within your noise budget.
          </Text>
        </View>

        {/* 3 Moments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3 moments that mattered</Text>

          {/* Moment 1 - URGENT */}
          <View style={[styles.momentCard, styles.momentCardUrgent]}>
            <View style={styles.momentBadgeUrgent}>
              <Text style={styles.momentBadgeText}>URGENT</Text>
            </View>
            <Text style={styles.momentTitle}>
              NVDA earnings beat; guidance raised
            </Text>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>What you did:</Text>
              <Text style={styles.momentDetailValue}>Saved a plan</Text>
            </View>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>Outcome:</Text>
              <Text style={styles.momentDetailValue}>
                Volatility expanded as expected
              </Text>
            </View>
          </View>

          {/* Moment 2 - WINDOWED */}
          <View style={styles.momentCard}>
            <View style={styles.momentBadgeWindowed}>
              <Text style={styles.momentBadgeText}>WINDOWED</Text>
            </View>
            <Text style={styles.momentTitle}>
              AMD issues $1.5B bond to refinance debt
            </Text>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>What you did:</Text>
              <Text style={styles.momentDetailValue}>
                Reviewed in evening window
              </Text>
            </View>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>Outcome:</Text>
              <Text style={styles.momentDetailValue}>
                Minimal portfolio impact
              </Text>
            </View>
          </View>

          {/* Moment 3 - WINDOWED */}
          <View style={styles.momentCard}>
            <View style={styles.momentBadgeWindowed}>
              <Text style={styles.momentBadgeText}>WINDOWED</Text>
            </View>
            <Text style={styles.momentTitle}>
              Fed signals higher-for-longer; yields spike
            </Text>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>What you did:</Text>
              <Text style={styles.momentDetailValue}>Ignored safely</Text>
            </View>
            <View style={styles.momentDetail}>
              <Text style={styles.momentDetailLabel}>Outcome:</Text>
              <Text style={styles.momentDetailValue}>
                Limited exposure to macro shift
              </Text>
            </View>
          </View>
        </View>

        {/* What Worked Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What worked for you</Text>
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.insightText}>
                Evening window drove better follow-through.
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.insightText}>
                Receipts increased confidence on urgent items.
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.insightText}>
                Macro alerts were often low impact.
              </Text>
            </View>
          </View>
        </View>

        {/* Suggested Tweaks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested tweaks</Text>
          
          {tweaks.map((tweak) => (
            <TouchableOpacity
              key={tweak}
              style={[
                styles.tweakCard,
                selectedTweaks.includes(tweak) && styles.tweakCardSelected
              ]}
              onPress={() => toggleTweak(tweak)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.checkbox,
                selectedTweaks.includes(tweak) && styles.checkboxChecked
              ]}>
                {selectedTweaks.includes(tweak) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.tweakText}>{tweak}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Apply suggested tweaks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Adjust my profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tertiaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.tertiaryButtonText}>Keep as is</Text>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 36,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 17,
  },
  budgetCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 32,
    alignItems: 'center',
  },
  budgetText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
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
  momentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  momentCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  momentBadgeUrgent: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  momentBadgeWindowed: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  momentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  momentDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  momentDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginRight: 4,
  },
  momentDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  insightsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  tweakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 10,
  },
  tweakCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E293B',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tweakText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  tertiaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
