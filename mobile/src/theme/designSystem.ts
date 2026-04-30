import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#1A2E4A',
  secondary: '#F5A623',
  accent: '#E8553E',
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#C62828',
  surface: '#FFFFFF',
  background: '#FFFFFF',
  backgroundMuted: '#F7F8FC',
  textPrimary: '#1A2E4A',
  textMuted: '#6B7280',
  border: '#E7EAF3',
  avatarBadge: '#FF6B57',
  navySoft: '#EAF0F7',
  darkBackground: '#0F1117',
  darkSurface: '#1A1D27',
  darkText: '#E8EAED',
  darkMuted: '#9AA0AD',
  darkBorder: '#2D3142',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  hero: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 24,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } satisfies ViewStyle,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  } satisfies TextStyle,
  display: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  } satisfies TextStyle,
  h2: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  } satisfies TextStyle,
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  } satisfies TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  } satisfies TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  } satisfies TextStyle,
};

export const page = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } satisfies ViewStyle,
  padded: {
    paddingHorizontal: spacing.xl,
  } satisfies ViewStyle,
};

export const authGradient = ['#0F2748', colors.primary, '#275A8F'] as const;

export const inputHeights = {
  field: 56,
  button: 56,
};

export const topInset = Platform.select({
  ios: 14,
  android: 18,
  default: 16,
});
