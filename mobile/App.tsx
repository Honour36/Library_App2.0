import React from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/designSystem';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
