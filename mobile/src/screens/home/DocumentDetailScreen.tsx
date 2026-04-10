import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentApi from '../../api/documentApi';
import bookmarksApi from '../../api/bookmarksApi';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import * as LucideIcons from 'lucide-react-native';

const { 
  Book, Download, Eye, Bookmark 
} = LucideIcons as any;

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetail'>;

export default function DocumentDetailScreen({ route, navigation }: Props) {
  const { documentId } = route.params;
  const queryClient = useQueryClient();

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentApi.getDocumentById(documentId)
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.getBookmarks
  });

  const isBookmarked = bookmarks?.some((b: any) => b.document_id === documentId);

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarksApi.addBookmark(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      Alert.alert('Success', 'Document bookmarked');
    }
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#185FA5" /></View>;
  if (!doc) return <View style={s.center}><Text>Document not found</Text></View>;

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.category}>{doc.categories?.name}</Text>
        <Text style={s.title}>{doc.title}</Text>
        <View style={s.stats}>
          <View style={s.stat}><Eye {...({ size: 16, color: "#666" } as any)} /><Text style={s.statText}>{doc.view_count}</Text></View>
          <View style={s.stat}><Download {...({ size: 16, color: "#666" } as any)} /><Text style={s.statText}>{doc.download_count}</Text></View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Description</Text>
        <Text style={s.description}>{doc.description || 'No description available.'}</Text>
      </View>

      <View style={s.details}>
        <DetailRow label="Department" value={doc.department || 'General'} />
        <DetailRow label="Academic Year" value={doc.academic_year} />
        <DetailRow label="Semester" value={doc.semester} />
        <DetailRow label="Uploader" value={doc.users?.full_name} />
        <DetailRow label="File Size" value={`${(doc.file_size / 1024 / 1024).toFixed(2)} MB`} />
      </View>

      <View style={s.actions}>
        <TouchableOpacity 
          style={s.readButton} 
          onPress={() => navigation.navigate('PdfReader', { pdfUrl: doc.file_url, title: doc.title })}
        >
          <Book {...({ color: "#fff", size: 20 } as any)} />
          <Text style={s.readButtonText}>Read Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[s.bookmarkButton, isBookmarked && s.bookmarkButtonActive]} 
          onPress={() => bookmarkMutation.mutate()}
          disabled={isBookmarked || bookmarkMutation.isPending}
        >
          <Bookmark {...({ color: isBookmarked ? '#fff' : '#185FA5', size: 20 } as any)} />
          <Text style={[s.bookmarkButtonText, isBookmarked && s.bookmarkButtonTextActive]}>
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <View style={s.detailRow}>
    <Text style={s.detailLabel}>{label}</Text>
    <Text style={s.detailValue}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  category: { color: '#185FA5', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  stats: { flexDirection: 'row' },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { marginLeft: 4, color: '#666', fontSize: 14 },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#444', lineHeight: 24 },
  details: { padding: 24, backgroundColor: '#f9f9f9' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { color: '#666', fontSize: 14 },
  detailValue: { fontWeight: '500', fontSize: 14, color: '#111' },
  actions: { padding: 24, flexDirection: 'row', gap: 12 },
  readButton: { flex: 2, backgroundColor: '#185FA5', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  readButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bookmarkButton: { flex: 1, borderWidth: 2, borderColor: '#185FA5', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bookmarkButtonActive: { backgroundColor: '#185FA5' },
  bookmarkButtonText: { color: '#185FA5', fontSize: 16, fontWeight: 'bold' },
  bookmarkButtonTextActive: { color: '#fff' }
});
