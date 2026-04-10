import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

const { 
  FileText, ChevronRight 
} = LucideIcons as any;

interface Props {
  document: any;
  onPress: () => void;
}

export default function DocumentCard({ document, onPress }: Props) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.iconContainer}>
        <FileText color="#185FA5" size={24} />
      </View>
      <View style={s.content}>
        <Text style={s.title} numberOfLines={1}>{document.title}</Text>
        <Text style={s.subtitle}>{document.categories?.name} • {document.academic_year}</Text>
      </View>
      <ChevronRight color="#ccc" size={20} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666' },
});
