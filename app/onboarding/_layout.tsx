import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="segment-selection" />
      <Stack.Screen name="professional-setup" />
      <Stack.Screen name="theme-customization" />
      <Stack.Screen name="password-setup" />
    </Stack>
  );
}
