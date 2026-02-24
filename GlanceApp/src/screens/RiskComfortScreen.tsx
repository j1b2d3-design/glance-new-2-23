import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface RiskComfortScreenProps {
  navigation: any;
}

type RiskLevel = 'calm' | 'balanced' | 'assertive';

export default function RiskComfortScreen({ navigation }: RiskComfortScreenProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('balanced');

  const riskOptions = [
    {
      id: 'calm' as RiskLevel,
      label: 'Calm',
      title: 'Calm',
      bullets: [
        'Smaller starter size by default',
        'Stronger protection suggestions',
        'Higher bar to interrupt your day',
      ],
    },
    {
      id: 'balanced' as RiskLevel,
      label: 'Balanced',
      title: 'Balanced',
      bullets: [
        'Standard sizing with moderate protections',
        'Standard urgency threshold',
      ],
    },
    {
      id: 'assertive' as RiskLevel,
      label: 'Assertive',
      title: 'Assertive',
      bullets: [
        'Larger sizing',
        'Lighter protections',
        'Lower bar for urgent alerts',
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Risk comfort</Text>
          <Text style={styles.subtitle}>
            This changes suggestion sizing, protections, and what counts as urgent.
          </Text>
        </View>

        {/* Risk Level Tabs */}
        <View style={styles.tabsContainer}>
          {riskOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.tab,
                selectedRisk === option.id && styles.tabSelected
              ]}
              onPress={() => setSelectedRisk(option.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                selectedRisk === option.id && styles.tabTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Risk Details Cards */}
        <View style={styles.detailsContainer}>
          {riskOptions.map((option) => (
            <View
              key={option.id}
              style={[
                styles.detailCard,
                selectedRisk === option.id && styles.detailCardSelected
              ]}
            >
              <Text style={styles.detailTitle}>{option.title}</Text>
              
              {option.bullets ? (
                <View style={styles.bulletList}>
                  {option.bullets.map((bullet, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailDescription}>{option.description}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change this anytime.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  detailCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    opacity: 1,
    transform: [{ scale: 1 }],
    padding: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
