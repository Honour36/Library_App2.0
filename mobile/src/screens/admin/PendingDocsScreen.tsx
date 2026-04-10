import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../../api/adminApi';
import * as LucideIcons from 'lucide-react-native';

const { 
  FileText, Check, X, MessageSquare 
} = LucideIcons as any;

export default function PendingDocsScreen() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState({ visible: false, id: '', reason: '' });

  const { data: pendingDocs, isLoading } = useQuery({
    queryKey: ['pending-docs'],
    queryFn: adminApi.getPendingDocuments
  });

  const approveMutation = useMutation({
    mutationFn: adminApi.approveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-docs'] });
      Alert.alert('Approved', 'Document is now live.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.rejectDocument(rejectModal.id, rejectModal.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-docs'] });
      setRejectModal({ visible: false, id: '', reason: '' });
      Alert.alert('Rejected', 'Uploader will be notified.');
    }
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#7c3aed" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={pendingDocs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <FileText color="#7c3aed" size={24} />
              <View style={s.cardTitleGroup}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.meta}>{item.users?.full_name} • {item.department}</Text>
              </View>
            </View>
            <View style={s.details}>
              <Text style={s.detailText}>Size: {(item.file_size / 1024 / 1024).toFixed(2)} MB</Text>
              <Text style={s.detailText}>Uploaded: {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity 
                style={[s.btn, s.approveBtn]} 
                onPress={() => approveMutation.mutate(item.id)}
                disabled={approveMutation.isPending}
              >
                <Check color="#fff" size={20} />
                <Text style={s.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.btn, s.rejectBtn]} 
                onPress={() => setRejectModal({ visible: true, id: item.id, reason: '' })}
              >
                <X color="#fff" size={20} />
                <Text style={s.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>No pending documents</Text>}
      />

      <Modal visible={rejectModal.visible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Reject Document</Text>
            <Text style={s.modalLabel}>Provide a reason for rejection:</Text>
            <TextInput
              style={s.modalInput}
              multiline
              numberOfLines={4}
              value={rejectModal.reason}
              onChangeText={(v) => setRejectModal({...rejectModal, reason: v})}
              placeholder="e.g. Low quality, wrong category, duplicate..."
            />
            <View style={s.modalActions}>
              <TouchableOpacity 
                style={[s.modalBtn, s.cancelBtn]} 
                onPress={() => setRejectModal({ ...rejectModal, visible: false })}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.modalBtn, s.confirmRejectBtn]} 
                onPress={() => rejectMutation.mutate()}
                disabled={!rejectModal.reason}
              >
                <Text style={s.confirmRejectBtnText}>Reject Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitleGroup: { marginLeft: 12, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  meta: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  details: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailText: { fontSize: 13, color: '#6b7280' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6b7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalLabel: { fontSize: 14, color: '#4b5563', marginBottom: 8 },
  modalInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, textAlignVertical: 'top', height: 100 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6' },
  cancelBtnText: { color: '#4b5563', fontWeight: 'bold' },
  confirmRejectBtn: { backgroundColor: '#ef4444' },
  confirmRejectBtnText: { color: '#fff', fontWeight: 'bold' }
});
