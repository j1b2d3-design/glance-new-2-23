import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

interface FocusScreenProps {
  navigation: any;
}

export default function FocusScreen({ navigation }: FocusScreenProps) {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const sectors = ['Tech', 'Macro', 'Consumer', 'Healthcare', 'Energy', 'Industrials'];
  const topics = ['Earnings', 'Rates', 'Regulation', 'Supply chain', 'Credit', 'Guidance'];

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus</Text>
          <Text style={styles.subtitle}>
            Pick broad areas. Glance will still prioritize by your holdings.
          </Text>
        </View>

        {/* Sectors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sectors</Text>
          <View style={styles.tagsContainer}>
            {sectors.map((sector) => (
              <TouchableOpacity
                key={sector}
                style={[
                  styles.tag,
                  selectedSectors.includes(sector) && styles.tagSelected
                ]}
                onPress={() => toggleSector(sector)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tagText,
                  selectedSectors.includes(sector) && styles.tagTextSelected
                ]}>
                  {sector}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Topics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics</Text>
          <View style={styles.tagsContainer}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic}
                style={[
                  styles.tag,
                  selectedTopics.includes(topic) && styles.tagSelected
                ]}
                onPress={() => toggleTopic(topic)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tagText,
                  selectedTopics.includes(topic) && styles.tagTextSelected
                ]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Too many filters can hide important signals. Start broad, refine later.
          </Text>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('RiskComfort')}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  tagSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#3B82F6',
  },
  tagText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#D1D5DB',
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
