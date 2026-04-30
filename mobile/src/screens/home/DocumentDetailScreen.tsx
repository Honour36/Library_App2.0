import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bookmark, Pin, Star } from 'lucide-react-native';
import bookmarksApi from '../../api/bookmarksApi';
import SvgIllustration from '../../components/SvgIllustration';
import documentApi from '../../api/documentApi';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getCategoryIllustration } from '../../data/academic';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetail'>;

export default function DocumentDetailScreen({ route, navigation }: Props) {
  const { documentId } = route.params;
  const { height } = useWindowDimensions();
  const queryClient = useQueryClient();
  const pinnedBooks = useStudentStore((state) => state.pinnedBooks);
  const togglePinnedBook = useStudentStore((state) => state.togglePinnedBook);
  const registerDocumentView = useStudentStore((state) => state.registerDocumentView);

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentApi.getDocumentById(documentId),
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.getBookmarks,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });

  const isPinned = pinnedBooks.includes(documentId);
  const isBookmarked = (bookmarks || []).some((item: any) => item.document_id === documentId);
  const previewHeight = Math.min(Math.max(height * 0.4, 300), 380);
  const authorName = doc?.author || doc?.users?.full_name || 'Unknown Author';
  const facultyName = doc?.department || doc?.categories?.name || 'Engineering';
  const previewIllustration = getCategoryIllustration(doc?.categories?.name || doc?.department || doc?.title || '');
  const recommendations = useMemo(() => {
    if (!doc || !documents?.length) return [];

    return documents
      .filter((item: any) => item.id !== doc.id)
      .sort((a: any, b: any) => {
        const aScore = Number(a.category_id === doc.category_id) + Number((a.department || '') === (doc.department || ''));
        const bScore = Number(b.category_id === doc.category_id) + Number((b.department || '') === (doc.department || ''));
        return bScore - aScore;
      })
      .slice(0, 5);
  }, [doc, documents]);

  useEffect(() => {
    registerDocumentView(documentId);
  }, [documentId, registerDocumentView]);

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarksApi.addBookmark(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  if (isLoading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!doc) {
    return <View style={styles.loader}><Text>Book not found</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.previewShell, { height: previewHeight }]}>
          <View style={styles.previewBackdrop} />
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>Preview</Text>
          </View>
          <View style={styles.previewArtWrap}>
            <SvgIllustration source={previewIllustration} width={220} height={180} />
          </View>
        </View>

        <Text style={styles.title}>{doc.title}</Text>
        <Text style={styles.author}>{authorName} • {doc.academic_year || '2024'}</Text>
        <Text style={styles.rating}>⭐⭐⭐⭐⭐ 4.7 (124 reviews)</Text>
        <Text style={styles.meta}>Faculty: {facultyName}</Text>
        <Text style={styles.meta}>Program: Computer Science</Text>
        <Text style={styles.description}>{doc.description || 'Description not available.'}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => togglePinnedBook(documentId)} style={[styles.secondaryButton, isPinned && styles.activeButton]}>
            <Pin size={16} color={isPinned ? colors.surface : colors.primary} />
            <Text style={[styles.secondaryButtonText, isPinned && styles.activeButtonText]}>{isPinned ? 'Pinned' : 'Pin'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PdfReader', { documentId: doc.id, pdfUrl: doc.file_url, title: doc.title })} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>📖 Start Reading</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (isBookmarked) return;
            bookmarkMutation.mutate();
          }}
          style={styles.reserveButton}
        >
          <Bookmark size={16} color={colors.surface} />
          <Text style={styles.reserveButtonText}>{isBookmarked ? 'Bookmarked' : 'Reserve Physical Copy'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Reserved', 'Physical copy reserved successfully.')} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Reserve at Library Desk</Text>
        </TouchableOpacity>

        <View style={styles.recommendSection}>
          <Text style={styles.recommendHeading}>Recommended for You</Text>
          <Text style={styles.recommendSubheading}>More resources aligned with this topic and faculty.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendRow}>
            {recommendations.map((item: any, index: number) => {
              const cardTone = getRecommendationTone(index, item.categories?.name || item.department || '');
              const recommendationIllustration = getCategoryIllustration(item.categories?.name || item.department || item.title);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.push('DocumentDetail', { documentId: item.id })}
                  style={styles.recommendCard}
                >
                  <View style={[styles.recommendThumb, { backgroundColor: cardTone.cover }]}>
                    <View style={[styles.recommendBand, { backgroundColor: cardTone.band }]} />
                    <SvgIllustration source={recommendationIllustration} width={100} height={76} />
                  </View>
                  <Text numberOfLines={2} style={styles.recommendTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.recommendAuthor}>
                    {item.author || item.users?.full_name || 'NUST Library'}
                  </Text>
                  <View style={styles.recommendRatingRow}>
                    <Star size={12} color={colors.secondary} fill={colors.secondary} />
                    <Text style={styles.recommendRatingText}>4.{(index % 3) + 6}</Text>
                  </View>
                  <View style={styles.tagWrap}>
                    <Text numberOfLines={1} style={styles.tagText}>
                      {item.categories?.name || item.department || 'General'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getRecommendationTone(index: number, category: string) {
  const label = category.toLowerCase();
  if (label.includes('exam')) return { cover: '#FDECEA', band: '#D44B3B' };
  if (label.includes('article')) return { cover: '#FFF5E5', band: '#D4903B' };
  if (label.includes('guide') || label.includes('practical')) return { cover: '#E8F8F3', band: '#2FA886' };
  if (label.includes('tutorial') || label.includes('assignment')) return { cover: '#F1EEFF', band: '#7B3BD4' };

  const fallback = [
    { cover: '#EAF2FF', band: '#3B6FD4' },
    { cover: '#FFF1EC', band: '#E06A4D' },
    { cover: '#EEF8ED', band: '#3BAD6F' },
    { cover: '#EEF2FF', band: '#1A2E4A' },
    { cover: '#F1EEFF', band: '#7B3BD4' },
  ];

  return fallback[index % fallback.length];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: 120 },
  previewShell: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: '#EEF3FB',
    ...shadows.card,
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EAF0F7',
  },
  previewBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 1,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  previewArtWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h1, marginBottom: spacing.xs },
  author: { ...typography.body, color: colors.textMuted, marginBottom: spacing.sm },
  rating: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  meta: { ...typography.caption, marginBottom: spacing.xs },
  description: { ...typography.body, marginVertical: spacing.lg, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  secondaryButton: { flex: 1, height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  primaryButton: { flex: 2, height: 48, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  activeButton: { backgroundColor: colors.primary },
  activeButtonText: { color: colors.surface },
  reserveButton: { height: 48, borderRadius: radius.sm, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  reserveButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  outlineButton: { height: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  outlineButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  recommendSection: { marginTop: spacing.xl },
  recommendHeading: { ...typography.h2, marginBottom: spacing.xs },
  recommendSubheading: { ...typography.caption, marginBottom: spacing.md },
  recommendRow: { gap: spacing.md, paddingBottom: 4 },
  recommendCard: {
    width: 170,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    padding: 14,
  },
  recommendThumb: {
    height: 104,
    borderRadius: 14,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  recommendBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 18,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  recommendAuthor: {
    ...typography.caption,
    marginBottom: 8,
  },
  recommendRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  recommendRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tagWrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
