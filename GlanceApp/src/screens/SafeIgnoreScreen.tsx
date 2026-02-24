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

interface SafeIgnoreScreenProps {
  navigation: any;
}

interface IgnoredItem {
  id: string;
  type: 'SAFE' | 'MISSED';
  title: string;
  outcome: string;
}

export default function SafeIgnoreScreen({ navigation }: SafeIgnoreScreenProps) {
  const [markedSafe, setMarkedSafe] = useState<string[]>([]);

  const ignoredItems: IgnoredItem[] = [
    {
      id: '1',
      type: 'SAFE',
      title: 'Fed signals higher-for-longer; yields spike',
      outcome: 'minimal effect on your holdings',
    },
    {
      id: '2',
      type: 'SAFE',
      title: 'AAPL supply chain update',
      outcome: 'no material move',
    },
    {
      id: '3',
      type: 'MISSED',
      title: 'TSLA delivery rumor',
      outcome: 'short-term spike (demo)',
    },
    {
      id: '4',
      type: 'SAFE',
      title: 'MSFT analyst note',
      outcome: 'flat',
    },
    {
      id: '5',
      type: 'MISSED',
      title: 'SPY CPI preview chatter',
      outcome: 'volatility expanded',
    },
  ];

  const toggleSafe = (id: string) => {
    if (markedSafe.includes(id)) {
      setMarkedSafe(markedSafe.filter(itemId => itemId !== id));
    } else {
      setMarkedSafe([...markedSafe, id]);
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
        <Text style={styles.headerTitle}>Safe-ignore training</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Calibrate your ignore instinct</Text>
          <Text style={styles.pageSubtitle}>
            We compare ignored items with what happened next.
          </Text>
        </View>

        {/* Ignored Items List */}
        <View style={styles.itemsList}>
          {ignoredItems.map((item) => (
            <View 
              key={item.id}
              style={[
                styles.itemCard,
                item.type === 'SAFE' && styles.itemCardSafe,
                item.type === 'MISSED' && styles.itemCardMissed,
              ]}
            >
              {/* Badge */}
              <View style={[
                styles.badge,
                item.type === 'SAFE' && styles.badgeSafe,
                item.type === 'MISSED' && styles.badgeMissed,
              ]}>
                <Text style={styles.badgeText}>{item.type}</Text>
              </View>

              {/* Title */}
              <Text style={styles.itemTitle}>{item.title}</Text>

              {/* Outcome */}
              <View style={styles.outcomeRow}>
                <Text style={styles.outcomeLabel}>Ignored • Outcome:</Text>
                <Text style={styles.outcomeText}>{item.outcome}</Text>
              </View>

              {/* Review Button */}
              <TouchableOpacity 
                style={styles.reviewButton}
                activeOpacity={0.8}
              >
                <Text style={styles.reviewButtonText}>Review why</Text>
              </TouchableOpacity>

              {/* Safe Checkbox (only for SAFE items) */}
              {item.type === 'SAFE' && (
                <TouchableOpacity
                  style={styles.safeCheckbox}
                  onPress={() => toggleSafe(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.checkbox,
                    markedSafe.includes(item.id) && styles.checkboxChecked
                  ]}>
                    {markedSafe.includes(item.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Mark as SAFE</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What changes</Text>
          <Text style={styles.infoText}>
            If you mark items as SAFE, Glance will lower similar alerts.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Adjust rules</Text>
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
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 34,
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 22,
  },
  itemsList: {
    marginBottom: 24,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  itemCardSafe: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  itemCardMissed: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeSafe: {
    backgroundColor: '#22C55E',
  },
  badgeMissed: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 22,
  },
  outcomeRow: {
    marginBottom: 12,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  reviewButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#2C2C2E',
    marginBottom: 12,
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  safeCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6B7280',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  infoSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
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
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
