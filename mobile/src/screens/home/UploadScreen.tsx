import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { FileText, UploadCloud } from 'lucide-react-native';
import academicApi from '../../api/academicApi';
import documentApi from '../../api/documentApi';
import Skeleton from '../../components/Skeleton';
import { getOrderedCategoryNames } from '../../data/academic';
import { useAuthStore } from '../../store/authStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

export default function UploadScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [file, setFile] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    faculty: string;
    category_id: string;
    publicationYear: string;
    description: string;
  }>({
    title: '',
    author: '',
    faculty: '',
    category_id: '',
    publicationYear: '',
    description: '',
  });
  const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = useQuery({
    queryKey: ['academic-catalog'],
    queryFn: academicApi.getAcademicCatalog,
  });
  const faculties = useMemo(() => (catalog?.faculties || []).map((item: any) => item.name), [catalog]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: documentApi.getCategories,
  });
  const orderedCategories = useMemo(() => {
    const names = getOrderedCategoryNames(categories);
    return names
      .map((name) => (categories || []).find((item: any) => item.name === name))
      .filter(Boolean);
  }, [categories]);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });

  useEffect(() => {
    if (!faculties.length || formData.faculty) return;
    setFormData((current) => ({ ...current, faculty: faculties[0] }));
  }, [faculties, formData.faculty]);

  const mutation = useMutation({
    mutationFn: (payload: FormData) => documentApi.uploadDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Upload successful', 'Your document was uploaded successfully.');
      setFile(null);
      setConfirmed(false);
      setFormData({
        title: '',
        author: '',
        faculty: faculties[0] || '',
        category_id: '',
        publicationYear: '',
        description: '',
      });
    },
    onError: (error: any) => {
      Alert.alert('Upload failed', error.response?.data?.message || 'Please try again.');
    },
  });

  const myUploads = useMemo(() => (documents || []).filter((item: any) => item.user_id === user?.id).slice(0, 2), [documents, user?.id]);

  const browse = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/epub+zip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
      setFormData((current) => ({
        ...current,
        title: current.title || result.assets[0].name.replace(/\.[^.]+$/, ''),
      }));
    }
  };

  const submit = () => {
    if (!file || !confirmed || !formData.title || !formData.author || !formData.category_id) {
      Alert.alert('Incomplete upload', 'Add a file, fill all required details, and confirm the declaration.');
      return;
    }

    const payload = new FormData();
    payload.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/pdf',
    } as any);
    payload.append('title', formData.title);
    payload.append('author', formData.author);
    payload.append('description', formData.description);
    payload.append('category_id', formData.category_id);
    payload.append('department', formData.faculty);
    payload.append('academic_year', formData.publicationYear);
    payload.append('semester', '1');
    payload.append('user_id', user?.id || '');
    mutation.mutate(payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>⬆️ Upload</Text>
        <Text style={styles.subtitle}>Share academic resources with your fellow NUST students.</Text>

        <TouchableOpacity onPress={browse} style={styles.dropZone}>
          <UploadCloud size={34} color={colors.primary} />
          <Text style={styles.dropTitle}>Drop file here or tap to browse</Text>
          <Text style={styles.dropSubtitle}>Supported: PDF, EPUB, DOCX · Max size: 50MB</Text>
        </TouchableOpacity>

        {file ? (
          <View style={styles.fileCard}>
            <FileText size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMeta}>{((file.size || 0) / 1024 / 1024).toFixed(1)}MB</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>BOOK DETAILS</Text>
        <Field label="Title" value={formData.title} onChangeText={(value) => setFormData((current) => ({ ...current, title: value }))} />
        <Field
          label="Author"
          value={formData.author}
          onChangeText={(value) => setFormData((current) => ({ ...current, author: value }))}
          placeholder="Enter author name"
        />
        {isCatalogLoading ? (
          <FieldSkeleton label="Faculty" />
        ) : isCatalogError ? (
          <Text style={styles.errorText}>Unable to load faculties from the backend.</Text>
        ) : (
          <ChipSelector label="Faculty" value={formData.faculty} options={faculties} onChange={(value) => setFormData((current) => ({ ...current, faculty: value }))} />
        )}
        <ChipSelector label="Category" value={formData.category_id} options={orderedCategories.map((item: any) => item.id)} labels={orderedCategories.reduce((acc: Record<string, string>, item: any) => ({ ...acc, [item.id]: item.name }), {})} onChange={(value) => setFormData((current) => ({ ...current, category_id: value }))} />
        <Field
          label="Publication Year"
          value={formData.publicationYear}
          onChangeText={(value) => setFormData((current) => ({ ...current, publicationYear: value.replace(/[^0-9]/g, '') }))}
          keyboardType="number-pad"
          placeholder="e.g. 2026"
        />

        <Field multiline label="Description" value={formData.description} onChangeText={(value) => setFormData((current) => ({ ...current, description: value }))} />

        <View style={styles.confirmRow}>
          <Switch value={confirmed} onValueChange={setConfirmed} thumbColor={colors.surface} trackColor={{ false: '#CBD5E1', true: colors.secondary }} />
          <Text style={styles.confirmText}>I confirm this content is for academic purposes and I have rights to share it.</Text>
        </View>

        <TouchableOpacity disabled={mutation.isPending || isCatalogLoading || isCatalogError} onPress={submit} style={[styles.submitButton, (mutation.isPending || isCatalogLoading || isCatalogError) && styles.disabledButton]}>
          {mutation.isPending ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitButtonText}>⬆️ SUBMIT</Text>}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>MY UPLOADS</Text>
        <View style={styles.uploadList}>
          {myUploads.length === 0 ? (
            <Text style={styles.emptyText}>No uploads yet.</Text>
          ) : (
            myUploads.map((item: any, index: number) => (
              <View key={item.id} style={styles.uploadRow}>
                <View style={styles.uploadCover} />
                <View>
                  <Text style={styles.uploadTitle}>{item.title}</Text>
                  <Text style={styles.uploadMeta}>{index === 0 ? '✅ Upload successful • 👁️ 234' : '✅ Upload successful'}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldSkeleton({ label }: { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipWrap}>
        <Skeleton style={styles.skeletonChip} />
        <Skeleton style={styles.skeletonChipWide} />
        <Skeleton style={styles.skeletonChip} />
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function ChipSelector({
  label,
  value,
  options,
  onChange,
  labels,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  labels?: Record<string, string>;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipWrap}>
        {options.map((option) => (
          <TouchableOpacity key={option} onPress={() => onChange(option)} style={[styles.chip, value === option && styles.chipActive]}>
            <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{labels?.[option] || option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 120 },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: '#EEF2FF',
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dropTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.xs, textAlign: 'center' },
  dropSubtitle: { ...typography.caption, textAlign: 'center' },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  fileName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  fileMeta: { ...typography.caption, marginTop: spacing.xs },
  sectionTitle: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  label: { ...typography.caption, fontWeight: '700', marginBottom: spacing.sm, color: colors.textPrimary },
  errorText: { ...typography.caption, color: colors.error, marginBottom: spacing.md },
  input: { minHeight: 50, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, fontSize: 14, color: colors.textPrimary },
  textArea: { minHeight: 110, textAlignVertical: 'top', paddingVertical: spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skeletonChip: { width: 110, height: 34, borderRadius: radius.pill },
  skeletonChipWide: { width: '72%', height: 34, borderRadius: radius.pill },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  chipTextActive: { color: colors.surface },
  confirmRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginVertical: spacing.lg },
  confirmText: { flex: 1, ...typography.caption, color: colors.textPrimary },
  submitButton: { height: 50, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  disabledButton: { opacity: 0.5 },
  submitButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  uploadList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  uploadRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  uploadCover: { width: 42, height: 56, borderRadius: radius.sm, backgroundColor: '#E7ECFF' },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  uploadMeta: { ...typography.caption },
  emptyText: { ...typography.caption, padding: spacing.lg },
});
