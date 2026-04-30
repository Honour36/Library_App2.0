import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, BookOpen, ChevronDown, FileText, FlaskConical, Grid2X2, List, NotebookPen, Search } from 'lucide-react-native';
import academicApi from '../../api/academicApi';
import documentApi from '../../api/documentApi';
import Skeleton from '../../components/Skeleton';
import SvgIllustration from '../../components/SvgIllustration';
import { getCategoryIllustration, getFacultyShortLabel } from '../../data/academic';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

const CATEGORY_STYLES = {
  'lecture notes': { bg: '#EAF2FF', icon: FileText, label: 'Lecture Notes', band: '#3B6FD4' },
  'past exam papers': { bg: '#FDECEA', icon: NotebookPen, label: 'Past Exam Papers', band: '#D44B3B' },
  'course outline': { bg: '#EEF8ED', icon: BookOpen, label: 'Course Outline', band: '#3BAD6F' },
  articles: { bg: '#FFF5E5', icon: FileText, label: 'Articles', band: '#D4903B' },
  'tutorials & assignments': { bg: '#F1EEFF', icon: NotebookPen, label: 'Tutorials & Assignments', band: '#7B3BD4' },
  'practical guides': { bg: '#E8F8F3', icon: FlaskConical, label: 'Practical Guides', band: '#2FA886' },
  'solutions & model answers': { bg: '#FFF1EC', icon: BookOpen, label: 'Solutions & Model Answers', band: '#E06A4D' },
  'exam timetables': { bg: '#EEF2FF', icon: FileText, label: 'Exam Timetables', band: '#1A2E4A' },
} as const;

function getDocumentVisual(document: any) {
  const categoryName = document.categories?.name || '';
  const rawCategory = `${categoryName || document.department || ''}`.toLowerCase();
  const match = Object.entries(CATEGORY_STYLES).find(([key]) => rawCategory.includes(key));
  return match?.[1] || { bg: 'transparent', icon: BookOpen, label: categoryName || 'General', band: colors.primary };
}

function getCleanTitle(title: string) {
  return title
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/_/g, ' ')
    .replace(/\(\d+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function LibraryScreen({ navigation, route }: any) {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [gridMode, setGridMode] = useState(false);
  const pinnedBooks = useStudentStore((state) => state.pinnedBooks);
  const togglePinnedBook = useStudentStore((state) => state.togglePinnedBook);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });
  const { data: catalog, isLoading: isCatalogLoading } = useQuery({
    queryKey: ['academic-catalog'],
    queryFn: academicApi.getAcademicCatalog,
  });

  const faculties = useMemo(() => catalog?.faculties.map((item: any) => item.name) || [], [catalog]);

  const results = useMemo(() => {
    let next = documents || [];
    if (selectedFaculty !== 'All') {
      const shortFaculty = getFacultyShortLabel(selectedFaculty).toLowerCase();
      next = next.filter((doc: any) =>
        `${doc.department || ''} ${doc.categories?.name || ''}`.toLowerCase().includes(shortFaculty)
      );
    }
    if (query.trim()) {
      const needle = query.toLowerCase();
      next = next.filter((doc: any) =>
        `${doc.title} ${doc.author || ''} ${doc.department || ''} ${doc.categories?.name || ''}`.toLowerCase().includes(needle)
      );
    }
    return [...next].sort((a: any, b: any) => Number(pinnedBooks.includes(b.id)) - Number(pinnedBooks.includes(a.id)));
  }, [documents, pinnedBooks, query, selectedFaculty]);

  const listCardWidth = width - 32;
  const gridCardWidth = Math.max((width - 42) / 2, 160);

  useEffect(() => {
    const initialQuery = route?.params?.initialQuery;
    if (initialQuery) {
      setQuery(initialQuery);
      setSelectedFaculty('All');
      navigation.setParams?.({ initialQuery: undefined });
    }
  }, [navigation, route?.params?.initialQuery]);

  if (isLoading || isCatalogLoading) {
    return <LibrarySkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>

      <View style={styles.searchShell}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search books, authors..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip label="All" active={selectedFaculty === 'All'} onPress={() => setSelectedFaculty('All')} />
        {faculties.map((item: string) => (
          <FilterChip
            key={item}
            label={getFacultyShortLabel(item)}
            active={selectedFaculty === item}
            onPress={() => setSelectedFaculty(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.sortChip}>
          <Text style={styles.sortText}>Sort: Newest</Text>
          <ChevronDown size={16} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.toggleWrap}>
          <TouchableOpacity onPress={() => setGridMode(true)} style={[styles.toggleButton, gridMode && styles.toggleButtonActive]}>
            <Grid2X2 size={16} color={gridMode ? colors.surface : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGridMode(false)} style={[styles.toggleButton, !gridMode && styles.toggleButtonActive]}>
            <List size={16} color={!gridMode ? colors.surface : colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Results ({results.length} books)</Text>

        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <BookOpen size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No books found in {selectedFaculty === 'All' ? 'this selection' : getFacultyShortLabel(selectedFaculty)}</Text>
            <Text style={styles.emptyText}>Try a different category or search by title.</Text>
            <TouchableOpacity onPress={() => setSelectedFaculty('All')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Browse All Books</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={gridMode ? styles.grid : styles.list}>
            {results.map((book: any) => {
              const pinned = pinnedBooks.includes(book.id);
              const visual = getDocumentVisual(book);
              const author = book.author || book.users?.full_name || 'NUST Library';
              const year = book.academic_year || book.year || '2024';
              const title = getCleanTitle(book.title || 'Untitled');
              const illustrationSource = getCategoryIllustration(visual.label);

              return (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => navigation.navigate('DocumentDetail', { documentId: book.id })}
                  style={[
                    gridMode ? styles.gridCard : styles.listCard,
                    { width: gridMode ? gridCardWidth : listCardWidth },
                    shadows.card,
                  ]}
                >
                  {gridMode ? (
                    <>
                      <View style={[styles.gridCover, { backgroundColor: visual.band }]}>
                        <TouchableOpacity
                          onPress={(event) => {
                            event.stopPropagation();
                            togglePinnedBook(book.id);
                          }}
                          style={[styles.gridBookmark, pinned && styles.gridBookmarkActive]}
                        >
                          <Bookmark size={15} color={colors.surface} fill={pinned ? colors.surface : 'none'} />
                        </TouchableOpacity>
                        <SvgIllustration source={illustrationSource} width={82} height={62} />
                      </View>

                      <View style={styles.gridMeta}>
                        <Text style={styles.gridTitle} numberOfLines={1}>{title}</Text>
                        <Text style={styles.gridAuthor} numberOfLines={1}>By {author}</Text>
                        <Text style={styles.gridStats} numberOfLines={1}>{visual.label} • {year}</Text>
                        <View style={styles.gridFooter}>
                          <Text style={styles.gridReadLink}>Read</Text>
                          <ChevronDown size={14} color={colors.primary} style={styles.gridReadIcon} />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={[styles.cover, { backgroundColor: visual.bg }]}>
                        <SvgIllustration source={illustrationSource} width={70} height={54} />
                        <Text style={styles.coverLabel}>{visual.label}</Text>
                      </View>

                      <View style={styles.bookMeta}>
                        <Text style={styles.bookTitle} numberOfLines={2}>{title}</Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>By {author}</Text>
                        <Text style={styles.bookStats} numberOfLines={1}>{visual.label} • {year}</Text>

                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            onPress={(event) => {
                              event.stopPropagation();
                              navigation.navigate('PdfReader', { documentId: book.id, pdfUrl: book.file_url, title });
                            }}
                            style={styles.readButton}
                          >
                            <Text style={styles.readButtonText}>Read</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(event) => {
                              event.stopPropagation();
                              togglePinnedBook(book.id);
                            }}
                            style={[styles.saveButton, pinned && styles.saveButtonActive]}
                          >
                            <Bookmark size={15} color={pinned ? colors.surface : colors.primary} fill={pinned ? colors.primary : 'none'} />
                            <Text style={[styles.saveButtonText, pinned && styles.saveButtonTextActive]}>{pinned ? 'Saved' : 'Save'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LibrarySkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Skeleton style={styles.headerSkeleton} />
      </View>
      <Skeleton style={styles.searchSkeleton} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} style={styles.filterSkeleton} />
        ))}
      </ScrollView>
      <View style={styles.content}>
        <Skeleton style={styles.resultsSkeleton} />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} style={styles.cardSkeleton} />
        ))}
      </View>
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  headerSkeleton: { width: 112, height: 28, borderRadius: radius.sm },
  title: { ...typography.h1 },
  searchShell: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
  },
  searchSkeleton: { marginHorizontal: 16, height: 52, borderRadius: 14 },
  searchInput: { flex: 1, height: 52, fontSize: 14, color: colors.textPrimary },
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18, gap: 8 },
  filterSkeleton: { width: 104, height: 36, borderRadius: radius.pill },
  filterChip: {
    height: 36,
    maxWidth: 176,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  filterChipTextActive: { color: colors.surface },
  controls: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortChip: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  sortText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  toggleButtonActive: { backgroundColor: colors.primary },
  content: { paddingHorizontal: 16, paddingBottom: 140 },
  resultsSkeleton: { width: 140, height: 14, borderRadius: radius.sm, marginBottom: spacing.md },
  cardSkeleton: { height: 168, borderRadius: 18, marginBottom: spacing.md },
  sectionTitle: { ...typography.label, marginBottom: spacing.md },
  list: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  listCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  gridCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cover: {
    width: 84,
    minWidth: 84,
    height: 108,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    padding: 10,
  },
  coverLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  gridCover: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridBookmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  gridBookmarkActive: {
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  gridMeta: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gridAuthor: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  gridStats: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  gridReadLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  gridReadIcon: {
    transform: [{ rotate: '-90deg' }],
  },
  bookMeta: { flex: 1, justifyContent: 'space-between' },
  bookTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  bookAuthor: { ...typography.caption, marginBottom: 6 },
  bookStats: { ...typography.caption, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  readButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButtonText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveButtonActive: {
    backgroundColor: colors.primary,
  },
  saveButtonText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  saveButtonTextActive: { color: colors.surface },
  emptyState: {
    borderRadius: 20,
    backgroundColor: colors.backgroundMuted,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadows.card,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
});
