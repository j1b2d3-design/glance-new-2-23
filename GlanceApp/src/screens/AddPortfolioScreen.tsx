import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface AddPortfolioScreenProps {
  navigation: any;
}

export default function AddPortfolioScreen({ navigation }: AddPortfolioScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add your portfolio</Text>
          <Text style={styles.subtitle}>
            Glance filters events through what you hold - not the whole market.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Connect a broker */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Connect a broker</Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            </View>
            <Text style={styles.optionDescription}>
              Fast sync. Auto updates.
            </Text>
          </TouchableOpacity>

          {/* Enter holdings manually */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Enter holdings manually</Text>
            </View>
            <Text style={styles.optionDescription}>
              Start in 60 seconds.
            </Text>
          </TouchableOpacity>

          {/* Demo portfolio */}
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.8}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Demo portfolio</Text>
            </View>
            <View style={styles.demoStocks}>
              <View style={styles.stockRow}>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>AAPL</Text>
                </View>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>NVDA</Text>
                </View>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>AMD</Text>
                </View>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>SPY</Text>
                </View>
              </View>
              <View style={styles.stockRow}>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>MSFT</Text>
                </View>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>TSLA</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change this later.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ReachableWindows')}
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
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  recommendedBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  demoStocks: {
    marginTop: 12,
  },
  stockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  stockTag: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
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
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
