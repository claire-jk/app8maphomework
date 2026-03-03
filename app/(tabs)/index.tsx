// app/index.tsx
import React from 'react';
import BottomTabNavigator from './bottomtabnavigator'; // 確認路徑正確

export default function App() {
  // ❌ 不需要再包 GluestackUIProvider 或 SafeAreaProvider
  return <BottomTabNavigator />;
}