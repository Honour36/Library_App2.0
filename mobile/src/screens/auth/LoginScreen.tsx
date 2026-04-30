import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import authApi from '../../api/authApi';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const EMAIL_REGEX = /^n\d{8}[a-z]@students\.nust\.ac\.zw$/i;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const canSubmit = useMemo(() => EMAIL_REGEX.test(email.trim()) && password.length >= 8, [email, password]);

  const handleLogin = async () => {
    if (!canSubmit) {
      Alert.alert('Invalid login', 'Use your NUST student email and a valid password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      await setAuth(response.user, response.token);
    } catch (error: any) {
      Alert.alert('Login failed', error.response?.data?.message || 'Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <GraduationCap size={34} color={colors.surface} />
            </View>
            <Text style={styles.brand}>NUST Student Library</Text>
            <Text style={styles.heroSubtitle}>Welcome back 👋</Text>
          </View>

          <View style={styles.card}>
            <Field label="Student Email" icon={<Mail size={18} color={colors.textMuted} />}>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="n02428401b@students.nust.ac.zw"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} color={colors.textMuted} />}>
              <TextInput
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            </Field>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity disabled={!canSubmit || loading} onPress={handleLogin} style={[styles.primaryButton, (!canSubmit || loading) && styles.disabledButton]}>
              {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>LOG IN</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.switchButton}>
              <Text style={styles.switchText}>Don&apos;t have an account? <Text style={styles.switchAccent}>Sign Up</Text></Text>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        {icon}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  brand: { ...typography.h1, marginBottom: spacing.xs },
  heroSubtitle: { ...typography.body, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  field: { marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  forgotButton: { alignSelf: 'center', marginBottom: spacing.xl },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  primaryButton: {
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.45 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  switchButton: { alignItems: 'center', marginTop: spacing.lg },
  switchText: { ...typography.caption },
  switchAccent: { color: colors.primary, fontWeight: '700' },

});
