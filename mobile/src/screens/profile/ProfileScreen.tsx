import React from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bookmark, ChevronRight, CloudUpload, FolderOpen, Settings2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

const SETTINGS = [
  'Edit Profile',
  'Notification Preferences',
  'Update Academic Info',
  'Reading Preferences',
  'Help & Support',
] as const;

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuthStore();
  const { program, faculty, yearOfStudy, readingScore, booksRead, hoursRead } = useStudentStore();

  const signOut = () =>
    Alert.alert('Logout', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            {user?.avatar_uri ? (
              <Image source={{ uri: user.avatar_uri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(user?.full_name || 'T')[0]}</Text>
            )}
          </View>
          <Text style={styles.name}>{user?.full_name || 'Tatenda Moyo'}</Text>
          <Text style={styles.handle}>@{user?.student_id || 'T221045B'}</Text>
          <Text numberOfLines={1} style={styles.meta}>{program || 'Software Engineering'} • {yearOfStudy || 'Year 3'}</Text>
          <Text numberOfLines={1} style={styles.meta}>{faculty || user?.department || 'Faculty of Engineering'}</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')} style={styles.quickCard}>
            <View style={styles.quickIconWrap}><Bookmark size={18} color={colors.primary} /></View>
            <Text style={styles.quickTitle}>Saved Reads</Text>
            <Text style={styles.quickText}>Pinned, bookmarked, and reading lists</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Upload')} style={styles.quickCard}>
            <View style={styles.quickIconWrap}><CloudUpload size={18} color={colors.primary} /></View>
            <Text style={styles.quickTitle}>Upload</Text>
            <Text style={styles.quickText}>Share notes and resources with students</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('MyUploads')} style={styles.linkRow}>
          <View style={styles.settingLeft}>
            <FolderOpen size={18} color={colors.primary} />
            <Text style={styles.linkText}>My Uploads</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Reading Stats</Text>
        <View style={styles.statsRow}>
          <StatCard value={`${booksRead}`} label="Completed" />
          <StatCard value={`${readingScore}`} label="Score" />
          <StatCard value={`${hoursRead}h`} label="Hours" />
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsPanel}>
          {SETTINGS.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.settingRow}
              onPress={() => {
                if (item === 'Edit Profile') {
                  navigation.navigate('EditProfile');
                }
              }}
            >
              <View style={styles.settingLeft}>
                <Settings2 size={16} color={colors.textMuted} />
                <Text style={styles.settingText}>{item}</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={signOut} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Settings2 size={16} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <ChevronRight size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 120 },
  title: { ...typography.h1, marginBottom: spacing.lg },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.surface, fontSize: 28, fontWeight: '700' },
  avatarImage: { width: '100%', height: '100%', borderRadius: radius.pill },
  name: { ...typography.h2, marginBottom: spacing.xs },
  handle: { ...typography.caption, marginBottom: spacing.sm },
  meta: { ...typography.body, color: colors.textMuted, marginBottom: 2 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: spacing.xl },
  quickCard: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    padding: 16,
    minHeight: 132,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  quickTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  quickText: { ...typography.caption, lineHeight: 18 },
  linkRow: {
    minHeight: 56,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.xl },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: spacing.xs },
  statLabel: { ...typography.caption, textAlign: 'center' },
  settingsPanel: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  settingRow: {
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  logoutText: { fontSize: 14, fontWeight: '700', color: colors.error },
});
