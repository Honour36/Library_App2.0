import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AnimatedSvgIllustration from '../../components/AnimatedSvgIllustration';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { colors, radius, spacing, typography } from '../../theme/designSystem';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function GetStartedScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.eyebrow}>NUST Reader</Text>
          <AnimatedSvgIllustration source={require('../../../assets/get-started.svg')} width={290} height={240} />
          <Text style={styles.quote}>&quot;Study in Other Ways&quot;</Text>
          <Text style={styles.subtitle}>
            Start with a quick setup, then move straight into your student reading journey.
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Register')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  heroCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  quote: {
    ...typography.h1,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: spacing.xl,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
