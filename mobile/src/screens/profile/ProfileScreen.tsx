import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import bookmarksApi from '../../api/bookmarksApi';
import * as LucideIcons from 'lucide-react-native';

const { 
  LogOut, ChevronRight, Lock, User, FileText, Bookmark 
} = LucideIcons as any;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.getBookmarks
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{getInitials(user?.full_name || '')}</Text>
        </View>
        <Text style={s.name}>{user?.full_name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>{bookmarks?.length || 0}</Text>
          <Text style={s.statLabel}>Saved</Text>
        </View>
        <View style={[s.statItem, s.statBorder]}>
          <Text style={s.statValue}>0</Text>
          <Text style={s.statLabel}>Downloads</Text>
        </View>
        <View style={s.statItem}>
          <Text style={s.statValue}>{user?.department ? 1 : 0}</Text>
          <Text style={s.statLabel}>Department</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Account Settings</Text>
        <MenuButton icon={<User size={20} color="#666" />} label="Edit Profile" />
        <MenuButton icon={<Lock size={20} color="#666" />} label="Change Password" />
        <MenuButton icon={<Bookmark size={20} color="#666" />} label="Saved Documents" />
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.version}>Version 1.0.0 (NUST-BUILD)</Text>
    </ScrollView>
  );
}

const MenuButton = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity style={s.menuItem}>
    <View style={s.menuLeft}>
      {icon}
      <Text style={s.menuLabel}>{label}</Text>
    </View>
    <ChevronRight size={20} color="#ccc" />
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 32, alignItems: 'center', backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#185FA5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: '#eff6ff' },
  roleText: { color: '#185FA5', fontSize: 12, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 1, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f0f0f0' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 16, color: '#333' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40, padding: 16 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#ccc', fontSize: 12, marginBottom: 40 }
});
