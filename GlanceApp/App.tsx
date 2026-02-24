import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AddPortfolioScreen from './src/screens/AddPortfolioScreen';
import SignInScreen from './src/screens/SignInScreen';
import ReachableWindowsScreen from './src/screens/ReachableWindowsScreen';
import FocusScreen from './src/screens/FocusScreen';
import RiskComfortScreen from './src/screens/RiskComfortScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MainTabs from './src/navigation/MainTabs';
import EventDetailScreen from './src/screens/EventDetailScreen';
import EventAnalysisScreen from './src/screens/EventAnalysisScreen';
import EventOptionsScreen from './src/screens/EventOptionsScreen';
import BuildPlanScreen from './src/screens/BuildPlanScreen';
import PlanSavedScreen from './src/screens/PlanSavedScreen';
import StockDetailScreen from './src/screens/StockDetailScreen';
import DailyCheckInScreen from './src/screens/DailyCheckInScreen';
import WeeklyRecapScreen from './src/screens/WeeklyRecapScreen';
import SafeIgnoreScreen from './src/screens/SafeIgnoreScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileRiskScreen from './src/screens/ProfileRiskScreen';
import DigestSettingsScreen from './src/screens/DigestSettingsScreen';
import SourcesBalanceScreen from './src/screens/SourcesBalanceScreen';
import BoundariesScreen from './src/screens/BoundariesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="AddPortfolio" component={AddPortfolioScreen} />
          <Stack.Screen name="ReachableWindows" component={ReachableWindowsScreen} />
          <Stack.Screen name="Focus" component={FocusScreen} />
          <Stack.Screen name="RiskComfort" component={RiskComfortScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="EventAnalysis" component={EventAnalysisScreen} />
          <Stack.Screen name="EventOptions" component={EventOptionsScreen} />
          <Stack.Screen name="BuildPlan" component={BuildPlanScreen} />
          <Stack.Screen name="PlanSaved" component={PlanSavedScreen} />
          <Stack.Screen name="StockDetail" component={StockDetailScreen} />
          <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
          <Stack.Screen name="WeeklyRecap" component={WeeklyRecapScreen} />
          <Stack.Screen name="SafeIgnore" component={SafeIgnoreScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ProfileRisk" component={ProfileRiskScreen} />
          <Stack.Screen name="DigestSettings" component={DigestSettingsScreen} />
          <Stack.Screen name="SourcesBalance" component={SourcesBalanceScreen} />
          <Stack.Screen name="Boundaries" component={BoundariesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
