
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack.Screen 
        name="(home)" 
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
