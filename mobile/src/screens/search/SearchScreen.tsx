import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { Search as SearchIcon, Clock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import documentApi from '../../api/documentApi';
import DocumentCard from '../../components/DocumentCard';
import { useStudentStore } from '../../store/studentStore';

const FILTERS = ['All', 'Past papers', 'Notes', 'Tutorials', 'Textbooks'];

export default function SearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const recentSearches = useStudentStore((state) => state.searchHistory);
  const trackSearchTerm = useStudentStore((state) => state.trackSearchTerm);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments
  });

  const filteredDocs = useMemo(() => {
    let filtered = documents || [];
    if (activeFilter !== 'All') {
      filtered = filtered.filter((doc: any) => 
        doc.categories?.name?.toLowerCase().includes(activeFilter.toLowerCase().replace('docs', ''))
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((doc: any) => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [documents, searchQuery, activeFilter]);

  useEffect(() => {
    if (searchQuery.trim().length < 3) return;

    const timer = setTimeout(() => {
      trackSearchTerm(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, trackSearchTerm]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={s.header}>
        <Text style={s.title}>Search</Text>
        <Text style={s.subtitle}>{documents?.length || 0} documents available</Text>
        
        <View style={s.searchBar}>
          <SearchIcon size={18} color="#555" />
          <TextInput 
            style={s.input}
            placeholder="data structures, law, thermodynamics..."
            placeholderTextColor="#555"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={s.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[s.filterPill, activeFilter === filter ? s.filterActive : s.filterInactive]}
            >
              <Text style={[s.filterText, activeFilter === filter && s.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.content}>
        {searchQuery.length > 0 && (
          <Text style={s.sectionLabel}>{filteredDocs.length} images for &quot;{searchQuery}&quot;</Text>
        )}

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" style={{ marginTop: 40 }} />
        ) : (
          <View style={s.docList}>
            {filteredDocs.map((item: any) => (
              <DocumentCard 
                key={item.id}
                document={item}
                variant="dark"
                onPress={() => {
                  if (searchQuery.trim()) {
                    trackSearchTerm(searchQuery);
                  }
                  navigation.navigate('DocumentDetail', { documentId: item.id });
                }}
              />
            ))}
            
            {filteredDocs.length === 0 && searchQuery.length > 0 && (
              <View style={s.noResult}>
                <View style={s.nrIcon}>
                  <SearchIcon size={24} color="#555" />
                </View>
                <Text style={s.nrTitle}>No results found</Text>
                <Text style={s.nrSub}>Try different keywords or check for typos.</Text>
              </View>
            )}
          </View>
        )}

        {!searchQuery && (
          <>
            <Text style={s.sectionLabel}>Recent searches</Text>
            <View style={s.recentChips}>
              {recentSearches.map(term => (
                <TouchableOpacity key={term} style={s.recentChip} onPress={() => setSearchQuery(term)}>
                  <Clock size={12} color="#555" />
                  <Text style={s.recentText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { paddingHorizontal: 18, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    backgroundColor: '#242424', 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    height: 48, 
    marginTop: 18,
    borderWidth: 0.5,
    borderColor: '#333'
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  clearText: { color: '#3B82F6', fontSize: 13, fontWeight: '500' },
  
  filterScroll: { paddingHorizontal: 18, gap: 8, paddingVertical: 15 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterActive: { backgroundColor: '#2B6CB0' },
  filterInactive: { backgroundColor: '#242424', borderWidth: 0.5, borderColor: '#333' },
  filterText: { color: '#888', fontSize: 12, fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  
  content: { flex: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#555', paddingHorizontal: 18, marginTop: 10, marginBottom: 15, letterSpacing: 0.6, textTransform: 'uppercase' },
  docList: { paddingHorizontal: 0, gap: 10 },
  
  noResult: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  nrIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  nrTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  nrSub: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 20 },
  
  recentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18 },
  recentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#242424', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 0.5, borderColor: '#2E2E2E' },
  recentText: { color: '#888', fontSize: 12 }
});
