import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ChevronLeft, ImagePlus } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.full_name || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatar_uri || '');
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }

    setSaving(true);
    await updateProfile({ full_name: name.trim(), avatar_uri: avatarUri || undefined });
    setSaving(false);
    Alert.alert('Saved', 'Your profile was updated.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={18} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your display photo and name.</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarShell}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(name || user?.full_name || 'T')[0]}</Text>
            )}
            <View style={styles.avatarBadge}>
              <ImagePlus size={16} color={colors.surface} />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
            {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.caption },
  panel: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarShell: {
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
    ...shadows.card,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: radius.pill },
  avatarText: { color: colors.surface, fontSize: 34, fontWeight: '700' },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.backgroundMuted,
  },
  label: {
    ...typography.caption,
    alignSelf: 'flex-start',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  saveButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
