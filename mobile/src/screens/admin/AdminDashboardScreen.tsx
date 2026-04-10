import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import * as LucideIcons from 'lucide-react-native';

const { 
  Users, FileText, Clock, TrendingUp, CheckCircle, XCircle 
} = LucideIcons as any;

export default function AdminDashboardScreen({ navigation }: any) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats
  });

  const { data: pendingDocs } = useQuery({
    queryKey: ['pending-docs'],
    queryFn: adminApi.getPendingDocuments
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#7c3aed" /></View>;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Admin Panel</Text>
        <Text style={s.subtitle}>Overview of NUST Library</Text>
      </View>

      <View style={s.statsGrid}>
        <StatCard icon={<FileText color="#7c3aed" size={24} />} label="Total Docs" value={stats?.totalDocs || 0} />
        <StatCard icon={<Clock color="#f59e0b" size={24} />} label="Pending" value={stats?.pendingDocs || 0} color="#f59e0b" />
        <StatCard icon={<Users color="#2563eb" size={24} />} label="Total Users" value={stats?.totalUsers || 0} color="#2563eb" />
        <StatCard icon={<TrendingUp color="#10b981" size={24} />} label="Downloads" value={stats?.totalDownloads || 0} color="#10b981" />
      </View>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Pending Approval</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Admin', { screen: 'PendingDocs' })}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {pendingDocs?.slice(0, 3).map((doc: any) => (
          <View key={doc.id} style={s.docCard as any}>
            <View style={s.docInfo}>
              <Text style={s.docTitle}>{doc.title}</Text>
              <Text style={s.docMeta}>{doc.users?.full_name} • {doc.department}</Text>
            </View>
            <View style={s.docActions}>
              <TouchableOpacity style={s.actionBtn}><CheckCircle color="#10b981" size={24} /></TouchableOpacity>
              <TouchableOpacity style={s.actionBtn}><XCircle color="#ef4444" size={24} /></TouchableOpacity>
            </View>
          </View>
        ))}
        {(!pendingDocs || pendingDocs.length === 0) && (
          <Text style={s.emptyText}>No documents pending approval.</Text>
        )}
      </View>
      
      <View style={s.menu}>
        <MenuBtn label="User Management" icon={<Users color="#444" size={20} />} onPress={() => {}} />
        <MenuBtn label="Audit Logs" icon={<FileText color="#444" size={20} />} onPress={() => {}} />
      </View>
    </ScrollView>
  );
}

const StatCard = ({ icon, label, value, color = '#7c3aed' }: any) => (
  <View style={s.statCard}>
    {icon}
    <Text style={[s.statValue, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const MenuBtn = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress}>
    <View style={s.menuLeft}>
      {icon}
      <Text style={s.menuLabel}>{label}</Text>
    </View>
    <CheckCircle size={16} color="#ccc" />
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  statCard: { width: '44%', backgroundColor: '#fff', margin: '3%', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { padding: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  seeAll: { color: '#7c3aed', fontWeight: '500' },
  docCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  docMeta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  docActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 4 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 12 },
  menu: { paddingHorizontal: 24, marginBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#374151' }
});
