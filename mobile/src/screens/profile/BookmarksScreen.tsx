import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookmarksApi from '../../api/bookmarksApi';
import DocumentCard from '../../components/DocumentCard';
import { Swipeable } from 'react-native-gesture-handler';
import * as LucideIcons from 'lucide-react-native';

const { 
  Trash2, BookmarkX 
} = LucideIcons as any;

export default function BookmarksScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.getBookmarks
  });

  const removeMutation = useMutation({
    mutationFn: bookmarksApi.removeBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    }
  });

  const renderRightActions = (id: string) => (
    <TouchableOpacity 
      style={s.deleteAction} 
      onPress={() => removeMutation.mutate(id)}
    >
      <Trash2 color="#fff" size={24} />
      <Text style={s.deleteText}>Remove</Text>
    </TouchableOpacity>
  );

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#185FA5" /></View>;

  if (!data || data.length === 0) {
    return (
      <View style={s.center}>
        <BookmarkX size={64} color="#ccc" />
        <Text style={s.emptyTitle}>No saved documents yet</Text>
        <Text style={s.emptySubtitle}>Documents you bookmark will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <DocumentCard 
              document={item.documents} 
              onPress={() => navigation.navigate('DocumentDetail', { documentId: item.document_id })} 
            />
          </Swipeable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '88%',
    borderRadius: 12,
    marginTop: 0,
    marginLeft: 8,
    marginBottom: 12,
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 4 }
});
