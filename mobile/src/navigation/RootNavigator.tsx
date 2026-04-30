import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { House, LibraryBig, User } from 'lucide-react-native';
import GetStartedScreen from '../screens/auth/GetStartedScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import UploadScreen from '../screens/home/UploadScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';
import MyUploadsScreen from '../screens/profile/MyUploadsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import DocumentDetailScreen from '../screens/home/DocumentDetailScreen';
import PdfReaderScreen from '../screens/PdfReaderScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { useAuthStore } from '../store/authStore';
import { useStudentStore } from '../store/studentStore';
import { colors, radius, shadows } from '../theme/designSystem';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  Upload: undefined;
  Bookmarks: undefined;
  MyUploads: undefined;
  EditProfile: undefined;
  DocumentDetail: { documentId: string };
  PdfReader: { documentId: string; pdfUrl: string; title: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  LibraryTab: { initialQuery?: string } | undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.textPrimary,
    border: colors.border,
  },
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={GetStartedScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

function TabPill({
  label,
  focused,
  icon,
}: {
  label: string;
  focused: boolean;
  icon: React.ReactNode;
}) {
  return (
    <View style={[styles.tabPill, focused && styles.tabPillActive]}>
      {icon}
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <View style={styles.tabsShell}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: Platform.OS === 'ios' ? 18 : 12,
            height: Platform.OS === 'ios' ? 74 : 68,
            paddingHorizontal: 14,
            paddingTop: 12,
            borderTopWidth: 0,
            borderRadius: 24,
            backgroundColor: colors.surface,
            ...shadows.card,
          },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabPill label="Home" focused={focused} icon={<House size={18} color={focused ? colors.surface : colors.textMuted} />} />,
          }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabPill label="Library" focused={focused} icon={<LibraryBig size={18} color={focused ? colors.surface : colors.textMuted} />} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabPill label="Profile" focused={focused} icon={<User size={18} color={focused ? colors.surface : colors.textMuted} />} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function RootNavigator() {
  const { user, loadAuth } = useAuthStore();
  const onboardingComplete = useStudentStore((state) => state.onboardingComplete);
  const hydrateStudent = useStudentStore((state) => state.hydrate);

  useEffect(() => {
    loadAuth();
    hydrateStudent();
  }, [hydrateStudent, loadAuth]);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Upload" component={UploadScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="MyUploads" component={MyUploadsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PdfReader" component={PdfReaderScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabsShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabPill: {
    minWidth: 88,
    height: 42,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.surface,
  },
});
