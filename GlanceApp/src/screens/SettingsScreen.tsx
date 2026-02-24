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

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItem {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Profile',
      items: [
        {
          title: 'Profile & Risk',
          subtitle: 'Windows, focus, risk comfort',
          onPress: () => navigation.navigate('ProfileRisk'),
        },
        {
          title: 'Digest rules',
          subtitle: 'Daily cap, overflow behavior',
          onPress: () => navigation.navigate('DigestSettings'),
        },
      ],
    },
    {
      title: 'Trust',
      items: [
        {
          title: 'Sources & Balance',
          subtitle: 'Preferred sources, opposing-view first',
          onPress: () => navigation.navigate('SourcesBalance'),
        },
      ],
    },
    {
      title: 'Boundaries',
      items: [
        {
          title: 'Not advice, no execution access',
          subtitle: '',
          onPress: () => navigation.navigate('Boundaries'),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          title: 'Privacy → Utility',
          subtitle: 'Permissions vs relevance',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'About Glance',
          subtitle: 'Version, terms',
        },
      ],
    },
  ];

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingCard}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  {item.subtitle !== '' && (
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Glance does not execute trades. Always verify before ordering.
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
    marginBottom: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 10,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 20,
  },
  chevron: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '300',
  },
  disclaimerSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 18,
    textAlign: 'center',
  },
});
