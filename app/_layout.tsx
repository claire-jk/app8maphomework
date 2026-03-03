// app/_layout.tsx
import { useFonts, ZenKurenaido_400Regular } from '@expo-google-fonts/zen-kurenaido';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ZenKurenaido_400Regular,
  });

  // ⭐ 不要用 AppLoading
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <GluestackUIProvider config={config}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}