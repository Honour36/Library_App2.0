import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import DocumentDetailScreen from '../screens/home/DocumentDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PendingDocsScreen from '../screens/admin/PendingDocsScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import PdfReaderScreen from '../screens/PdfReaderScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
  DocumentDetail: { documentId: string };
  PdfReader: { pdfUrl: string, title: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  BookmarksTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Library' }} />
    <Tab.Screen name="BookmarksTab" component={BookmarksScreen} options={{ title: 'Saved' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

export default function RootNavigator() {
  const { user, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            {user.role === 'admin' && (
              <Stack.Screen name="Admin" component={AdminDashboardScreen} />
            )}
            <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ headerShown: true, title: 'Document Detail' }} />
            <Stack.Screen name="PdfReader" component={PdfReaderScreen} options={{ headerShown: true, title: 'Reader' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
