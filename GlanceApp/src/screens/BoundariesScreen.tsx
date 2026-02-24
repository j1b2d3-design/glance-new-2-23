import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

interface BoundariesScreenProps {
  navigation: any;
}

export default function BoundariesScreen({ navigation }: BoundariesScreenProps) {
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
        <Text style={styles.headerTitle}>Boundaries</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* What Glance Does */}
        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.iconGreen}>✓</Text>
            <Text style={styles.sectionTitle}>What Glance does</Text>
          </View>
          <View style={[styles.bulletList, styles.bulletListGreen]}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Filters events through your holdings.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Explains impact with causal links and receipts.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Offers a few realistic options with protections.
              </Text>
            </View>
          </View>
        </View>

        {/* What Glance Does NOT Do */}
        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.iconRed}>✕</Text>
            <Text style={styles.sectionTitle}>What Glance does NOT do</Text>
          </View>
          <View style={[styles.bulletList, styles.bulletListRed]}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Does not execute trades or access your broker to place orders.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Does not guarantee outcomes or accuracy.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Is not a registered investment advisor.
              </Text>
            </View>
          </View>
        </View>

        {/* How to Use It Safely */}
        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.iconBlue}>🛡️</Text>
            <Text style={styles.sectionTitle}>How to use it safely</Text>
          </View>
          <View style={[styles.bulletList, styles.bulletListBlue]}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Verify receipts before acting.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Start with practice or starter size.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                Use protections when uncertain.
              </Text>
            </View>
          </View>
        </View>

        {/* Failure Modes */}
        <View style={styles.section}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.iconYellow}>⚠️</Text>
            <Text style={styles.sectionTitle}>
              Failure modes (so you're not surprised)
            </Text>
          </View>
          <View style={styles.failureGrid}>
            <View style={styles.failureCard}>
              <Text style={styles.failureTitle}>Data delay</Text>
              <Text style={styles.failureText}>sources may lag.</Text>
            </View>
            <View style={styles.failureCard}>
              <Text style={styles.failureTitle}>Ambiguity</Text>
              <Text style={styles.failureText}>conflicting reports.</Text>
            </View>
            <View style={styles.failureCard}>
              <Text style={styles.failureTitle}>Low relevance</Text>
              <Text style={styles.failureText}>weak causal links.</Text>
            </View>
            <View style={styles.failureCard}>
              <Text style={styles.failureTitle}>Noise spikes</Text>
              <Text style={styles.failureText}>macro days.</Text>
            </View>
          </View>
        </View>

        {/* Got It Button */}
        <TouchableOpacity 
          style={styles.gotItButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.gotItButtonText}>Got it</Text>
        </TouchableOpacity>

        {/* Footer Message */}
        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            You stay in control of every order.
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
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconGreen: {
    fontSize: 24,
    color: '#22C55E',
  },
  iconRed: {
    fontSize: 24,
    color: '#EF4444',
  },
  iconBlue: {
    fontSize: 22,
  },
  iconYellow: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 26,
    flex: 1,
  },
  bulletList: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 14,
  },
  bulletListGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  bulletListRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  bulletListBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginRight: 12,
    marginTop: 8,
  },
  bulletText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  failureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  failureCard: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  failureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  failureText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
  gotItButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  gotItButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
