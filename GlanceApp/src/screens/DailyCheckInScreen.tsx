import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  PanResponder,
} from 'react-native';

interface DailyCheckInScreenProps {
  navigation: any;
}

export default function DailyCheckInScreen({ navigation }: DailyCheckInScreenProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [trustLevel, setTrustLevel] = useState(70);
  const [feedback, setFeedback] = useState('');
  const [sliderLayout, setSliderLayout] = useState({ x: 0, width: 0 });

  const feelings = [
    'Calm',
    'Rushed',
    'Uncertain',
    'Overwhelmed',
    'Confident',
    'Distracted',
  ];

  // Round to nearest 5
  const roundToNearestFive = (value: number) => {
    return Math.round(value / 5) * 5;
  };

  // Create PanResponder for slider
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      updateTrustLevel(gestureState.x0);
    },
    onPanResponderMove: (evt, gestureState) => {
      updateTrustLevel(gestureState.moveX);
    },
  });

  const updateTrustLevel = (absoluteX: number) => {
    if (sliderLayout.width > 0) {
      // Calculate relative position within the slider
      const relativeX = absoluteX - sliderLayout.x;
      const percentage = Math.max(0, Math.min(100, (relativeX / sliderLayout.width) * 100));
      const rounded = roundToNearestFive(percentage);
      setTrustLevel(rounded);
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
        <Text style={styles.headerTitle}>Daily check-in</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question 1: How did today feel? */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>How did today feel?</Text>
          <Text style={styles.questionSubtitle}>
            This helps Glance tune noise budget and timing.
          </Text>

          <View style={styles.feelingsGrid}>
            {feelings.map((feeling) => (
              <TouchableOpacity
                key={feeling}
                style={[
                  styles.feelingChip,
                  selectedFeeling === feeling && styles.feelingChipActive
                ]}
                onPress={() => setSelectedFeeling(feeling)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.feelingText,
                  selectedFeeling === feeling && styles.feelingTextActive
                ]}>
                  {feeling}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Question 2: Trust Level */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>
            How much did you trust today's alerts?
          </Text>

          <View style={styles.trustContainer}>
            <Text style={styles.trustValue}>{trustLevel}</Text>
            
            <View style={styles.trustLabels}>
              <Text style={styles.trustLabel}>Low</Text>
              <Text style={styles.trustLabel}>High</Text>
            </View>

            {/* Trust Slider Visual */}
            <View 
              style={styles.sliderContainer}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                // Get absolute position on screen
                event.target.measure((x, y, width, height, pageX, pageY) => {
                  setSliderLayout({ x: pageX, width: width });
                });
              }}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${trustLevel}%` }]} />
              </View>
              <View style={[styles.sliderThumb, { left: `${trustLevel}%` }]} />
            </View>
          </View>

          <Text style={styles.trustNote}>
            We'll show more receipts when trust is low.
          </Text>
        </View>

        {/* Question 3: Feedback */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>Anything felt off? (optional)</Text>
          
          <TextInput
            style={styles.feedbackInput}
            placeholder="e.g., Too many macro alerts… or timing was bad…"
            placeholderTextColor="#6B7280"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          
          <Text style={styles.characterCount}>{feedback.length}/200</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
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
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  questionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  feelingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  feelingChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  feelingChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  feelingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  feelingTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trustContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 12,
  },
  trustValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  trustLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trustLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  trustNote: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 18,
  },
  feedbackInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 120,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
