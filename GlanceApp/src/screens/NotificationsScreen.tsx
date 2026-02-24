import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';

interface NotificationsScreenProps {
  navigation: any;
}

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const handleEnableNotifications = () => {
    // TODO: Request notification permissions
    navigation.navigate('MainTabs');
  };

  const handleNotNow = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Lock screen preview</Text>
            <Text style={styles.subtitle}>
              See how Glance shows what happened, why it matters, and what you can do — fast.
            </Text>
          </View>

          {/* Notification Preview Cards */}
          <View style={styles.previewContainer}>
            {/* Urgent Section */}
            <Text style={styles.categoryLabel}>URGENT</Text>
            
            {/* Urgent Notification */}
            <View style={styles.notificationCard}>
              <View style={styles.cardRow}>
                <View style={styles.glanceIconLarge}>
                  <Text style={styles.glanceIconTextLarge}>G</Text>
                </View>
                
                <View style={styles.cardRightContent}>
                  <View style={styles.titleRow}>
                    <View style={styles.urgentDot} />
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      NVDA earnings beat; guidance raised
                    </Text>
                    <Text style={styles.timestamp}>now</Text>
                  </View>
                  
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailText}>
                      Hits: <Text style={styles.detailBold}>NVDA (Confidence: High)</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Windowed Section */}
            <Text style={styles.categoryLabel}>WINDOWED</Text>
            
            {/* Windowed Notification */}
            <View style={[styles.notificationCard, styles.windowedCard]}>
              <View style={styles.cardRow}>
                <View style={styles.glanceIconLarge}>
                  <Text style={styles.glanceIconTextLarge}>G</Text>
                </View>
                
                <View style={styles.cardRightContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      Digest ready for your evening window
                    </Text>
                    <Text style={styles.timestamp}>6:58 PM</Text>
                  </View>
                  
                  <Text style={styles.itemsHeld}>3 items held for 7:30 PM</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Enable notifications to get urgent alerts and window reminders.
            </Text>
          </View>
        </ScrollView>

        {/* Buttons at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.enableButton}
            activeOpacity={0.8}
            onPress={handleEnableNotifications}
          >
            <Text style={styles.enableButtonText}>Enable notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.notNowButton}
            activeOpacity={0.7}
            onPress={handleNotNow}
          >
            <Text style={styles.notNowButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 20,
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
  previewContainer: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  windowedCard: {
    opacity: 0.85,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  glanceIconLarge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  glanceIconTextLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardRightContent: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentDot: {
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    flexShrink: 0,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
    flexShrink: 0,
    marginLeft: 8,
  },
  detailsSection: {
    gap: 4,
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '400',
    lineHeight: 14,
  },
  detailBold: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  itemsHeld: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '400',
    marginTop: 2,
  },
  descriptionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#9CA3AF',
    fontWeight: '400',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: '#000000',
  },
  enableButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  notNowButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  notNowButtonText: {
    color: '#9CA3AF',
    fontSize: 17,
    fontWeight: '600',
  },
});
