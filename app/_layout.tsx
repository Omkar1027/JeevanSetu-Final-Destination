import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationWrapper } from '@/components/NavigationWrapper';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <NavigationWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(doctor)" />
          <Stack.Screen name="(patient)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationWrapper>
    </AuthProvider>
  );
}