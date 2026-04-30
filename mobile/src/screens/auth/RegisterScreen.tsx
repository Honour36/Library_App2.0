import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, Lock, Mail, User } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import authApi from '../../api/authApi';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^n\d{8}[a-z]@students\.nust\.ac\.zw$/i;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const USERNAME_REGEX = /^[A-Za-z0-9 ]{3,20}$/;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setDraftProfile = useStudentStore((state) => state.setDraftProfile);

  const canSubmit = useMemo(
    () =>
      USERNAME_REGEX.test(username.trim()) &&
      EMAIL_REGEX.test(email.trim()) &&
      PASSWORD_REGEX.test(password) &&
      password === confirmPassword,
    [confirmPassword, email, password, username]
  );

  const register = async () => {
    if (!canSubmit) {
      Alert.alert('Invalid form', 'Check username, email, and password.');
      return;
    }

    setLoading(true);
    try {
      const studentNumber = email.split('@')[0];
      const response = await authApi.register({
        full_name: username.trim(),
        email: email.trim(),
        password,
        student_id: studentNumber,
        role: 'student',
      });
      await setDraftProfile({ username: username.trim() });
      await setAuth(response.user, response.token);
    } catch (error: any) {
      Alert.alert('Sign up failed', error.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <GraduationCap size={32} color={colors.surface} />
            </View>
            <Text style={styles.title}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Field label="Username" icon={<User size={18} color={colors.textMuted} />}>
              <TextInput placeholder="Tatenda Moyo" placeholderTextColor={colors.textMuted} style={styles.input} value={username} onChangeText={setUsername} />
            </Field>
            <Text style={styles.helper}>3-20 chars, no special characters</Text>

            <Field label="Student Email" icon={<Mail size={18} color={colors.textMuted} />}>
                <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="n02428401b@students.nust.ac.zw" placeholderTextColor={colors.textMuted} style={styles.input} value={email} onChangeText={setEmail} />
            </Field>
            <Text style={styles.helper}>Must match NUST email format</Text>

            <Field label="Password" icon={<Lock size={18} color={colors.textMuted} />}>
              <TextInput secureTextEntry placeholder="Minimum 8 chars, 1 uppercase, 1 number" placeholderTextColor={colors.textMuted} style={styles.input} value={password} onChangeText={setPassword} />
            </Field>

            <Field label="Confirm Password" icon={<Lock size={18} color={colors.textMuted} />}>
              <TextInput secureTextEntry placeholder="Repeat password" placeholderTextColor={colors.textMuted} style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />
            </Field>

            <TouchableOpacity disabled={!canSubmit || loading} onPress={register} style={[styles.primaryButton, (!canSubmit || loading) && styles.disabledButton]}>
              {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginAccent}>Login</Text></Text>
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
  content: { padding: spacing.xl, paddingBottom: spacing.hero },
  header: { alignItems: 'center', marginVertical: spacing.xl },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  field: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: spacing.sm },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary },
  helper: { ...typography.caption, color: colors.error, marginTop: -spacing.sm, marginBottom: spacing.md },
  primaryButton: {
    marginTop: spacing.lg,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.45 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: spacing.lg },
  loginText: { ...typography.caption },
  loginAccent: { color: colors.primary, fontWeight: '700' },
});
