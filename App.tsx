import React, { useState, useCallback } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Google fonts
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';

import { StoreProvider, useStore } from './src/store';
import { TabBar } from './src/components/TabBar';
import { Background } from './src/components/Background';
import { Login } from './src/screens/Login';
import { Today } from './src/screens/Today';
import { Scan } from './src/screens/Scan';
import { Lookmax } from './src/screens/Lookmax';
import { Trend } from './src/screens/Trend';
import { You } from './src/screens/You';
import { Products } from './src/screens/Products';

SplashScreen.preventAutoHideAsync();

type TabKey = 'today' | 'scan' | 'lookmax' | 'trend' | 'you';
type Screen = 'main' | 'products';

const MainApp: React.FC = () => {
  const { authed, mode, setMode } = useStore();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [screen, setScreen] = useState<Screen>('main');

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setMode(tab === 'lookmax' ? 'lookmax' : 'normal');
  };

  if (!authed) return <Login />;

  if (screen === 'products') {
    return <Products onBack={() => setScreen('main')} />;
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'today'   && <Today />}
        {activeTab === 'scan'    && <Scan />}
        {activeTab === 'lookmax' && <Lookmax />}
        {activeTab === 'trend'   && <Trend />}
        {activeTab === 'you'     && (
          <You onProducts={() => setScreen('products')} />
        )}
      </View>

      {/* Custom tab bar */}
      <View style={styles.tabBarContainer}>
        <TabBar
          active={activeTab}
          onChange={handleTabChange}
          mode={mode}
        />
      </View>
    </View>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Italic: CormorantGaramond_400Regular_Italic,
    Inter_400Regular,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <MainApp />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    position: 'relative',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
