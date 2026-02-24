import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>G L A N C E</Text>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Glance</Text>
          <Text style={styles.subtitle}>
            Right-time insight cards for positions{'\n'}that matter.
          </Text>
        </View>

        {/* Card Illustration */}
        <View style={styles.cardIllustration}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {/* Bar chart */}
              <View style={styles.chartContainer}>
                <View style={[styles.bar, styles.bar1]} />
                <View style={[styles.bar, styles.bar2]} />
                <View style={[styles.bar, styles.bar3]} />
              </View>
              
              {/* Clock icon circle */}
              <View style={styles.clockIconContainer}>
                <View style={styles.clockIcon}>
                  <Text style={styles.clockSymbol}>🕐</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>◎</Text>
            </View>
            <Text style={styles.featureText}>
              Portfolio lens — only what hits your{'\n'}holdings.
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📄</Text>
            </View>
            <Text style={styles.featureText}>
              Receipts-first — sources before{'\n'}suggestions.
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🕐</Text>
            </View>
            <Text style={styles.featureText}>
              Reachable windows — less noise,{'\n'}better timing.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.demoButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.demoButtonText}>Try demo mode</Text>
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
    letterSpacing: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '400',
  },
  cardIllustration: {
    alignItems: 'center',
    marginBottom: 60,
  },
  card: {
    width: 220,
    height: 150,
    backgroundColor: '#1A1F2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#2C3E50',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    height: 70,
  },
  bar: {
    width: 24,
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  bar1: {
    height: 35,
    opacity: 0.6,
  },
  bar2: {
    height: 55,
  },
  bar3: {
    height: 45,
    opacity: 0.8,
  },
  clockIconContainer: {
    alignSelf: 'flex-end',
  },
  clockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockSymbol: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  featuresList: {
    marginBottom: 60,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
    maxWidth: 360,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 0,
  },
  iconText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#E5E7EB',
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  continueButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  demoButtonText: {
    color: '#E5E7EB',
    fontSize: 17,
    fontWeight: '600',
  },
});
