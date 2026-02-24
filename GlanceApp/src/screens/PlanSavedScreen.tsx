import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

interface PlanSavedScreenProps {
  navigation: any;
}

export default function PlanSavedScreen({ navigation }: PlanSavedScreenProps) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Plan saved</Text>

        {/* Info Display - Single Card */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Saved</Text>
            <Text style={styles.infoText}>Mode: Practice</Text>
            <Text style={styles.infoText}>Next window: 7:30 PM</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Today' })}
          >
            <Text style={styles.primaryButtonText}>Back to Today</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Digest' })}
          >
            <Text style={styles.secondaryButtonText}>View Digest</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tertiaryButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.tertiaryButtonText}>Edit plan</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackQuestion}>Was this useful?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedback === 'yes' && styles.feedbackButtonActive
              ]}
              onPress={() => setFeedback('yes')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.feedbackButtonText,
                feedback === 'yes' && styles.feedbackButtonTextActive
              ]}>
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedback === 'no' && styles.feedbackButtonActiveNo
              ]}
              onPress={() => setFeedback('no')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.feedbackButtonText,
                feedback === 'no' && styles.feedbackButtonTextActive
              ]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Label */}
        <View style={styles.bottomLabel}>
          <Text style={styles.bottomLabelText}>Saved</Text>
        </View>
      </View>
    </SafeAreaView>
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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  infoSection: {
    width: '100%',
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  buttonSection: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  feedbackSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  feedbackQuestion: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  feedbackButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  feedbackButtonActiveNo: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  feedbackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  feedbackButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomLabel: {
    marginTop: 'auto',
  },
  bottomLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});
