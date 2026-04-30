import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, PencilLine, Trash2 } from 'lucide-react-native';
import documentApi from '../../api/documentApi';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

export default function MyUploadsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { title: string; author: string; academic_year: string; description: string }>>({});

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });

  const myUploads = useMemo(
    () => (documents || []).filter((item: any) => item.user_id === user?.id),
    [documents, user?.id]
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title: string; author: string; academic_year: string; description: string } }) =>
      documentApi.updateDocument(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Saved', 'Your upload was updated.');
      setEditingId(null);
    },
    onError: (error: any) => {
      Alert.alert('Update failed', error.response?.data?.message || 'Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Deleted', 'Your upload was deleted.');
    },
    onError: (error: any) => {
      Alert.alert('Delete failed', error.response?.data?.message || 'Please try again.');
    },
  });

  const beginEdit = (item: any) => {
    setEditingId(item.id);
    setDrafts((current) => ({
      ...current,
      [item.id]: {
        title: item.title || '',
        author: item.author || '',
        academic_year: item.academic_year || '',
        description: item.description || '',
      },
    }));
  };

  const saveEdit = (id: string) => {
    const draft = drafts[id];
    if (!draft?.title.trim()) {
      Alert.alert('Missing title', 'Title is required.');
      return;
    }

    updateMutation.mutate({
      id,
      payload: {
        title: draft.title.trim(),
        author: draft.author.trim(),
        academic_year: draft.academic_year.trim(),
        description: draft.description.trim(),
      },
    });
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete upload', 'This will permanently remove the document.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={18} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>My Uploads</Text>
            <Text style={styles.subtitle}>Manage the documents you’ve shared.</Text>
          </View>
        </View>

        {myUploads.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No uploads yet</Text>
            <Text style={styles.emptyText}>Upload notes or guides first, then you can edit or remove them here.</Text>
          </View>
        ) : (
          myUploads.map((item: any) => {
            const isEditing = editingId === item.id;
            const draft = drafts[item.id] || {
              title: item.title || '',
              author: item.author || '',
              academic_year: item.academic_year || '',
              description: item.description || '',
            };

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cover} />
                  <View style={styles.metaWrap}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.author || 'Unknown Author'}</Text>
                    <Text style={styles.cardMeta}>{item.academic_year || 'Year not set'}</Text>
                  </View>
                </View>

                {isEditing ? (
                  <View style={styles.editor}>
                    <Field
                      label="Title"
                      value={draft.title}
                      onChangeText={(value) => updateDraft(setDrafts, item.id, 'title', value)}
                    />
                    <Field
                      label="Author"
                      value={draft.author}
                      onChangeText={(value) => updateDraft(setDrafts, item.id, 'author', value)}
                    />
                    <Field
                      label="Academic Year"
                      value={draft.academic_year}
                      onChangeText={(value) => updateDraft(setDrafts, item.id, 'academic_year', value)}
                    />
                    <Field
                      label="Description"
                      value={draft.description}
                      multiline
                      onChangeText={(value) => updateDraft(setDrafts, item.id, 'description', value)}
                    />

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => setEditingId(null)}
                        style={[styles.button, styles.secondaryButton]}
                      >
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => saveEdit(item.id)}
                        style={[styles.button, styles.primaryButton]}
                      >
                        {updateMutation.isPending && editingId === item.id ? (
                          <ActivityIndicator color={colors.surface} />
                        ) : (
                          <Text style={styles.primaryButtonText}>Save Changes</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.description}>{item.description || 'No description added.'}</Text>
                    <View style={styles.rowActions}>
                      <TouchableOpacity onPress={() => beginEdit(item)} style={styles.inlineAction}>
                        <PencilLine size={16} color={colors.primary} />
                        <Text style={styles.inlineActionText}>Modify</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.inlineAction}>
                        <Trash2 size={16} color={colors.error} />
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

function updateDraft(
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, { title: string; author: string; academic_year: string; description: string }>>>,
  id: string,
  key: 'title' | 'author' | 'academic_year' | 'description',
  value: string
) {
  setDrafts((current) => ({
    ...current,
    [id]: {
      ...(current[id] || { title: '', author: '', academic_year: '', description: '' }),
      [key]: value,
    },
  }));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
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
  emptyState: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: { ...typography.h2, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  cover: {
    width: 62,
    height: 82,
    borderRadius: radius.md,
    backgroundColor: '#EAF0F7',
    ...shadows.card,
  },
  metaWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption, marginBottom: 2 },
  description: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md },
  rowActions: { flexDirection: 'row', gap: spacing.md },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineActionText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  deleteText: { fontSize: 13, fontWeight: '700', color: colors.error },
  editor: { marginTop: spacing.sm },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...typography.caption, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  input: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 96,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
});
