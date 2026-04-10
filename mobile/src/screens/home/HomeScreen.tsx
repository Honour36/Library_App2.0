import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import documentApi from '../../api/documentApi';
import DocumentCard from '../../components/DocumentCard';
import * as LucideIcons from 'lucide-react-native';

const { 
  Search, Filter 
} = LucideIcons as any;

export default function HomeScreen({ navigation }: any) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: documentApi.getCategories
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#185FA5" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput style={s.searchInput} placeholder="Search documents..." />
        </View>
        <TouchableOpacity style={s.filterBtn}>
          <Filter size={20} color="#185FA5" />
        </TouchableOpacity>
      </View>

      <View style={s.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity style={[s.catBadge, s.catBadgeActive]}>
            <Text style={[s.catText, s.catTextActive]}>All</Text>
          </TouchableOpacity>
          {categories?.map((cat: any) => (
            <TouchableOpacity key={cat.id} style={s.catBadge}>
              <Text style={s.catText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <DocumentCard 
            document={item} 
            onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })} 
          />
        )}
        ListEmptyComponent={<Text style={s.empty}>No documents found</Text>}
      />
    </View>
  );
}

// Added ScrollView import
import { ScrollView } from 'react-native';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, flexDirection: 'row', gap: 12, backgroundColor: '#fff' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, borderRadius: 12 },
  searchInput: { flex: 1, padding: 12, fontSize: 16 },
  filterBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  categoriesContainer: { paddingVertical: 12, backgroundColor: '#fff' },
  catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  catBadgeActive: { backgroundColor: '#185FA5' },
  catText: { color: '#666', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
