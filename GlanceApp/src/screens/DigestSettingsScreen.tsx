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
  PanResponder,
} from 'react-native';

interface DigestSettingsScreenProps {
  navigation: any;
}

export default function DigestSettingsScreen({ navigation }: DigestSettingsScreenProps) {
  // Windows
  const [middayEnabled, setMiddayEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [middayTime, setMiddayTime] = useState('12:30 PM');
  const [eveningTime, setEveningTime] = useState('7:30 PM');
  
  // Daily alert cap
  const [dailyCap, setDailyCap] = useState(6);
  const [sliderLayout, setSliderLayout] = useState({ x: 0, width: 0 });
  
  // Urgent override
  const [urgentBreakthrough, setUrgentBreakthrough] = useState(true);
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(true);
  const [topHoldingsOnly, setTopHoldingsOnly] = useState(true);

  // Create PanResponder for slider
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      updateCapValue(gestureState.x0);
    },
    onPanResponderMove: (evt, gestureState) => {
      updateCapValue(gestureState.moveX);
    },
  });

  const updateCapValue = (absoluteX: number) => {
    if (sliderLayout.width > 0) {
      const relativeX = absoluteX - sliderLayout.x;
      const percentage = Math.max(0, Math.min(100, (relativeX / sliderLayout.width) * 100));
      const value = Math.round((percentage / 100) * 10);
      setDailyCap(value);
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
        <Text style={styles.headerTitle}>Digest settings</Text>
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
          
          {/* Midday Window */}
          <View style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <View style={styles.windowInfo}>
                <Text style={styles.windowLabel}>Midday</Text>
                <Text style={styles.windowTime}>{middayTime}</Text>
              </View>
              <Switch
                value={middayEnabled}
                onValueChange={setMiddayEnabled}
                trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          {/* Evening Window */}
          <View style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <View style={styles.windowInfo}>
                <Text style={styles.windowLabel}>Evening</Text>
                <Text style={styles.windowTime}>{eveningTime}</Text>
              </View>
              <Switch
                value={eveningEnabled}
                onValueChange={setEveningEnabled}
                trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <Text style={styles.sectionNote}>
            At least one window is required.
          </Text>
        </View>

        {/* Daily Alert Cap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily alert cap</Text>
          
          <View style={styles.capCard}>
            <View style={styles.capHeader}>
              <Text style={styles.capLabel}>Cap</Text>
              <Text style={styles.capValue}>{dailyCap}</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0</Text>
              <View 
                style={styles.sliderTrackContainer}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  event.target.measure((x, y, width, height, pageX, pageY) => {
                    setSliderLayout({ x: pageX, width: width });
                  });
                }}
                {...panResponder.panHandlers}
              >
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${(dailyCap / 10) * 100}%` }]} />
                </View>
                <View style={[styles.sliderThumb, { left: `${(dailyCap / 10) * 100}%` }]} />
              </View>
              <Text style={styles.sliderLabel}>10</Text>
            </View>
          </View>
          
          <Text style={styles.sectionNote}>
            When the cap is reached, items go to Digest instead of alerts.
          </Text>
        </View>

        {/* Urgent Override */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgent override</Text>
          
          <View style={styles.switchCard}>
            <Text style={styles.switchLabel}>Urgent events can break through</Text>
            <Switch
              value={urgentBreakthrough}
              onValueChange={setUrgentBreakthrough}
              trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {urgentBreakthrough && (
            <>
              <View style={styles.switchCard}>
                <Text style={styles.switchLabel}>Only high confidence</Text>
                <Switch
                  value={highConfidenceOnly}
                  onValueChange={setHighConfidenceOnly}
                  trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <View style={styles.switchCard}>
                <Text style={styles.switchLabel}>Only top holdings</Text>
                <Switch
                  value={topHoldingsOnly}
                  onValueChange={setTopHoldingsOnly}
                  trackColor={{ false: '#2C2C2E', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </>
          )}
          
          <Text style={styles.sectionNote}>
            Keeps interruptions rare and meaningful.
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
    marginBottom: 16,
  },
  sectionNote: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
    marginTop: 12,
  },
  windowCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 10,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowInfo: {
    flex: 1,
  },
  windowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  windowTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  capCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  capHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  capLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  capValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderTrackContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
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
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    width: 20,
    textAlign: 'center',
  },
  switchCard: {
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
});
