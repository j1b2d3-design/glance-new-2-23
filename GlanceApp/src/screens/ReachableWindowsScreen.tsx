import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ReachableWindowsScreenProps {
  navigation: any;
}

export default function ReachableWindowsScreen({ navigation }: ReachableWindowsScreenProps) {
  const [middayEnabled, setMiddayEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  
  // Time states
  const [middayTime, setMiddayTime] = useState(new Date(2024, 0, 1, 12, 30));
  const [eveningTime, setEveningTime] = useState(new Date(2024, 0, 1, 19, 30));
  
  // Modal states
  const [showMiddayPicker, setShowMiddayPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const onMiddayTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowMiddayPicker(false);
    }
    if (selectedDate) {
      setMiddayTime(selectedDate);
    }
  };

  const onEveningTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEveningPicker(false);
    }
    if (selectedDate) {
      setEveningTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reachable windows</Text>
          <Text style={styles.subtitle}>
            We hold non-urgent items for your windows so you can decide with context.
          </Text>
        </View>

        {/* Windows Cards */}
        <View style={styles.windowsContainer}>
          {/* Midday Window */}
          <View style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <Text style={styles.windowTitle}>Midday window</Text>
              <Switch
                value={middayEnabled}
                onValueChange={setMiddayEnabled}
                trackColor={{ false: '#374151', true: '#22C55E' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#374151"
              />
            </View>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowMiddayPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.windowLabel}>Time</Text>
              <View style={styles.timeDisplay}>
                <Text style={styles.windowTime}>{formatTime(middayTime)}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.windowStatus}>
              {middayEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>

          {/* Evening Window */}
          <View style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <Text style={styles.windowTitle}>Evening window</Text>
              <Switch
                value={eveningEnabled}
                onValueChange={setEveningEnabled}
                trackColor={{ false: '#374151', true: '#22C55E' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#374151"
              />
            </View>
            <TouchableOpacity 
              style={styles.timeSelector}
              onPress={() => setShowEveningPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.windowLabel}>Time</Text>
              <View style={styles.timeDisplay}>
                <Text style={styles.windowTime}>{formatTime(eveningTime)}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.windowStatus}>
              {eveningEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Time Pickers */}
        {showMiddayPicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showMiddayPicker}
            onRequestClose={() => setShowMiddayPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowMiddayPicker(false)}>
                    <Text style={styles.pickerButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={middayTime}
                  mode="time"
                  display="spinner"
                  onChange={onMiddayTimeChange}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                  style={styles.picker}
                />
              </View>
            </View>
          </Modal>
        )}

        {showEveningPicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showEveningPicker}
            onRequestClose={() => setShowEveningPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowEveningPicker(false)}>
                    <Text style={styles.pickerButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={eveningTime}
                  mode="time"
                  display="spinner"
                  onChange={onEveningTimeChange}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                  style={styles.picker}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Urgent Events Card */}
        <View style={styles.urgentCard}>
          <Text style={styles.urgentTitle}>Urgent events can break through</Text>
          <Text style={styles.urgentDescription}>
            Only when an event is likely to materially change risk.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Focus')}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Focus')}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
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
  windowsContainer: {
    marginBottom: 24,
  },
  windowCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  windowTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  windowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  windowLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  windowTime: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  windowStatus: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  urgentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  urgentDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  nextButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  pickerButton: {
    color: '#22C55E',
    fontSize: 17,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});
