import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';

export default function SignInScreen({ navigation }: any) {
  const handleAppleSignIn = () => {
    console.log('Apple Sign In pressed');
    navigation.navigate('AddPortfolio');
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    navigation.navigate('AddPortfolio');
  };

  const handleDemoMode = () => {
    console.log('Demo mode pressed');
    navigation.navigate('AddPortfolio');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.content}>
        {/* Header 区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>Sign in to personalize</Text>
          <Text style={styles.subtitle}>
            Connect holdings and preferences so Glance can filter events through your positions.
          </Text>
        </View>

        {/* 按钮区域 */}
        <View style={styles.buttonsContainer}>
          {/* Apple 登录按钮 */}
          <TouchableOpacity 
            style={styles.appleButton}
            onPress={handleAppleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.appleIcon}>􀣺</Text>
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Google 登录按钮 */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* 分隔线 */}
          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo 模式链接 */}
          <TouchableOpacity 
            onPress={handleDemoMode}
            activeOpacity={0.7}
          >
            <Text style={styles.demoLink}>Use demo without sign-in</Text>
          </TouchableOpacity>
        </View>

        {/* Footer 卡片 */}
        <View style={styles.footer}>
          <View style={styles.footerCard}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.footerText}>
              We use your holdings only to rank relevance. You can edit privacy anytime.
            </Text>
          </View>
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
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  
  // Header 样式
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#9CA3AF',
    textAlign: 'left',
  },

  // 按钮容器
  buttonsContainer: {
    marginTop: 20,
  },

  // Apple 按钮
  appleButton: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 8,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Google 按钮
  googleButton: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 分隔线
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2E',
  },
  orText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 12,
  },

  // Demo 链接
  demoLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    marginTop: 8,
  },

  // Footer
  footer: {
    marginTop: 40,
  },
  footerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shieldIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#9CA3AF',
  },
});
