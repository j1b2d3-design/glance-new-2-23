import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

interface YouScreenProps {
  navigation: any;
}

export default function YouScreen({ navigation }: YouScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>GLANCE</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Your investing routine</Text>
          <Text style={styles.headerSubtitle}>
            Short windows, clearer decisions. Glance adapts to your feedback.
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statColumn}>
              <Text style={styles.statColumnLabel}>This week</Text>
              <Text style={styles.statColumnValue}>12 items safely ignored</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statColumnLabel}>Plans saved</Text>
              <Text style={styles.statColumnValue}>3</Text>
            </View>
          </View>
          
          <View style={styles.trustTrend}>
            <Text style={styles.trustLabel}>Trust trend (7 days)</Text>
            <View style={styles.trendBlocks}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <View key={day} style={styles.trendBlock} />
              ))}
            </View>
          </View>
        </View>

        {/* Settings Info */}
        <View style={styles.settingsInfo}>
          <View style={styles.settingBadge}>
            <Text style={styles.settingBadgeText}>Risk: Calm</Text>
          </View>
          <View style={styles.settingBadge}>
            <Text style={styles.settingBadgeText}>Windows: 12:30, 7:30</Text>
          </View>
        </View>

        {/* Action Cards */}
        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('DailyCheckIn');
            }
          }}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>📝</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Daily check-in (2 min)</Text>
            <Text style={styles.actionDescription}>
              Tell us how today felt. Improve timing & relevance.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('WeeklyRecap');
            }
          }}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>📊</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Weekly recap</Text>
            <Text style={styles.actionDescription}>
              What mattered, what you ignored, what to adjust.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>❓</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>3 quick questions</Text>
            <Text style={styles.actionDescription}>
              Train impact intuition in under 60 seconds.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('SafeIgnore');
            }
          }}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>🎯</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Safe-ignore training</Text>
            <Text style={styles.actionDescription}>
              Review ignored items and calibrate filters.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          activeOpacity={0.8}
          onPress={() => {
            const parentNav = navigation.getParent();
            if (parentNav) {
              parentNav.navigate('Settings');
            }
          }}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>⚙️</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDescription}>
              Profile, sources, privacy, boundaries.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Glance does not execute trades. You stay in control.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  statsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 40,
  },
  statColumn: {
    flex: 1,
  },
  statColumnLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    marginBottom: 8,
  },
  statColumnValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 22,
  },
  trustTrend: {
    gap: 12,
  },
  trustLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  trendBlocks: {
    flexDirection: 'row',
    gap: 8,
  },
  trendBlock: {
    flex: 1,
    height: 32,
    backgroundColor: '#22C55E',
    borderRadius: 6,
  },
  settingsInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  settingBadge: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  settingBadgeText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  actionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    gap: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  disclaimer: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});
