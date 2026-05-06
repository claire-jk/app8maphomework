import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // 如果你完全不想看到這個預設的 Tab Bar，可以加這行：
        // tabBarStyle: { display: 'none' } 
      }}>
      
      {/* 只保留你想要的頁面 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '首頁',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* 隱藏那些自動出現的頁面 */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }} // ⭐ 這行會讓 Explore 消失
      />
      <Tabs.Screen
        name="mapchoose"
        options={{ href: null }} // ⭐ 隱藏 mapchoose
      />
      <Tabs.Screen
        name="inputsearch"
        options={{ href: null }} // ⭐ 隱藏 inputsearch
      />
      <Tabs.Screen
        name="bottomtabnavigator"
        options={{ href: null }} // ⭐ 隱藏你的組件檔案
      />
    </Tabs>
  );
}
