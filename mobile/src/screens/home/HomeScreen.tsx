import React, { useMemo, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, FileText, FlaskConical, GraduationCap, NotebookPen } from 'lucide-react-native';
import AnimatedSvgIllustration from '../../components/AnimatedSvgIllustration';
import documentApi from '../../api/documentApi';
import Skeleton from '../../components/Skeleton';
import { DEFAULT_LIBRARY_CATEGORIES, getCategoryIllustration, getCategorySearchTerm, getOrderedCategoryNames } from '../../data/academic';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

const HERO_SLIDES = [
  {
    key: 'exam-papers',
    title: 'Exam Papers',
    subtitle: 'Prepare for success with high-demand past papers and quick revision sets.',
    cta: 'Browse papers',
    source: require('../../../assets/journey.svg'),
  },
  {
    key: 'study-guides',
    title: 'Study Guides',
    subtitle: 'Guided reading paths to help you move from overview to exam confidence.',
    cta: 'Open guides',
    source: require('../../../assets/reading-glasses.svg'),
  },
  {
    key: 'research-projects',
    title: 'Research Projects',
    subtitle: 'See what students and departments are building across the university.',
    cta: 'Explore research',
    source: require('../../../assets/conversation.svg'),
  },
  {
    key: 'general-books',
    title: 'General Books',
    subtitle: 'Step outside the syllabus and widen your perspective with curated reads.',
    cta: 'View books',
    source: require('../../../assets/lecturer.svg'),
  },
] as const;

function getCategoryMeta(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes('exam')) return { icon: NotebookPen, tint: '#FDECE8' };
  if (normalized.includes('lecture')) return { icon: FileText, tint: '#EEF3FB' };
  if (normalized.includes('article')) return { icon: GraduationCap, tint: '#FFF4E1' };
  if (normalized.includes('practical')) return { icon: FlaskConical, tint: '#EFF8F0' };
  if (normalized.includes('tutorial')) return { icon: NotebookPen, tint: '#F1EEFF' };
  if (normalized.includes('solution')) return { icon: BookOpen, tint: '#FFF1EC' };
  if (normalized.includes('outline')) return { icon: BookOpen, tint: '#EEF8ED' };
  return { icon: FileText, tint: '#EEF3FB' };
}

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();
  const {
    program,
    readingProgress,
    searchHistory,
    documentViews,
  } = useStudentStore();
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: documentApi.getCategories,
  });

  const firstName = (user?.full_name || 'Student').trim().split(' ')[0];
  const initials = firstName.charAt(0).toUpperCase() || 'S';
  const safeReadingProgress = useMemo(() => readingProgress || {}, [readingProgress]);
  const safeSearchHistory = useMemo(() => searchHistory || [], [searchHistory]);
  const safeDocumentViews = useMemo(() => documentViews || {}, [documentViews]);
  const inProgressDocs = useMemo(
    () =>
      Object.values(safeReadingProgress)
        .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
        .slice(0, 4),
    [safeReadingProgress]
  );

  const recommended = useMemo(() => {
    const items = documents || [];
    return [...items]
      .sort((a: any, b: any) => {
        const aHaystack = `${a.title} ${a.department || ''} ${a.categories?.name || ''}`.toLowerCase();
        const bHaystack = `${b.title} ${b.department || ''} ${b.categories?.name || ''}`.toLowerCase();
        const aScore = safeSearchHistory.reduce((sum, term) => (aHaystack.includes(term.toLowerCase()) ? sum + 1 : sum), 0);
        const bScore = safeSearchHistory.reduce((sum, term) => (bHaystack.includes(term.toLowerCase()) ? sum + 1 : sum), 0);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [documents, safeSearchHistory]);

  const trending = useMemo(() => {
    const items = documents || [];
    return [...items]
      .sort((a: any, b: any) => (Number(b.views || 0) + (safeDocumentViews[b.id] || 0)) - (Number(a.views || 0) + (safeDocumentViews[a.id] || 0)))
      .slice(0, 3);
  }, [documents, safeDocumentViews]);
  const homeCategories = useMemo(
    () => getOrderedCategoryNames(categories).slice(0, Math.max(getOrderedCategoryNames(categories).length, DEFAULT_LIBRARY_CATEGORIES.length)),
    [categories]
  );

  const cardWidth = Math.max(width - 40, 280);
  const continueCardWidth = Math.max((width - 56) / 2, 148);

  const onHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setActiveSlide(Math.max(0, Math.min(HERO_SLIDES.length - 1, nextIndex)));
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text numberOfLines={1} style={styles.courseLine}>
              {program || user?.department || 'BSc Computer Science'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.avatarButton}>
            <Text style={styles.avatarText}>{initials}</Text>
            <View style={styles.avatarBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={cardWidth}
            snapToAlignment="start"
            showsHorizontalScrollIndicator={false}
            onScroll={onHeroScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.heroRow}
          >
            {HERO_SLIDES.map((slide) => (
              <View key={slide.key} style={[styles.heroCard, { width: cardWidth }]}>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('LibraryTab')} style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>{slide.cta}</Text>
                    <ChevronRight size={16} color={colors.surface} />
                  </TouchableOpacity>
                </View>
                <View style={styles.heroArtWrap}>
                  <AnimatedSvgIllustration source={slide.source} width={160} height={150} />
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>
            {HERO_SLIDES.map((slide, index) => (
              <View key={slide.key} style={[styles.dot, index === activeSlide && styles.dotActive]} />
            ))}
          </View>
        </View>

        <SectionHeading title="Categories" subtitle="Browse by resource type" />
        <View style={styles.categoryGrid}>
          {homeCategories.map((category) => {
            const { icon: Icon, tint } = getCategoryMeta(category);
            return (
              <TouchableOpacity
                key={category}
                onPress={() => navigation.navigate('LibraryTab', { initialQuery: getCategorySearchTerm(category) })}
                style={styles.categoryCard}
              >
                <View style={[styles.categoryIconShell, { backgroundColor: tint }]}>
                  <Icon size={16} color={colors.primary} />
                </View>
                <Text numberOfLines={1} style={styles.categoryLabel}>{category}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionHeading title="Continue Reading" subtitle={inProgressDocs.length ? 'Resume where you left off' : 'Pick a document and start your journey'} />
        {inProgressDocs.length ? (
          <View style={styles.readingGrid}>
            {inProgressDocs.map((item) => (
              <TouchableOpacity
                key={item.documentId}
                onPress={() => navigation.navigate('PdfReader', { documentId: item.documentId, pdfUrl: item.pdfUrl, title: item.title })}
                style={[styles.readingCard, { width: continueCardWidth }]}
              >
                <View style={styles.readingCover}>
                  <AnimatedSvgIllustration source={getCategoryIllustration(item.title)} width={92} height={74} />
                </View>
                <Text numberOfLines={2} style={styles.readingTitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.readingMeta}>{item.minutesSpent} mins spent</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, item.progress)}%` }]} />
                </View>
                <Text style={styles.progressCaption}>{item.progress}% read</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('LibraryTab')} style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active reading yet</Text>
            <Text style={styles.emptyText}>Open lecture notes, articles, or past papers to start tracking progress.</Text>
          </TouchableOpacity>
        )}

        <SectionHeading title="Recommended For You" subtitle={safeSearchHistory.length ? `Based on: ${safeSearchHistory.slice(0, 2).join(', ')}` : 'Recommendations improve as you search'} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryRow}>
          {(recommended.length ? recommended : trending).map((item: any) => (
            <TouchableOpacity key={item.id} onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })} style={styles.discoveryCard}>
              <View style={styles.discoveryArt}>
                <AnimatedSvgIllustration source={getCategoryIllustration(item.categories?.name || item.department || item.title)} width={90} height={68} />
              </View>
              <Text numberOfLines={2} style={styles.discoveryTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.discoveryMeta}>{item.categories?.name || item.department || 'University Library'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeading title="Trending" subtitle="What students are opening most" />
        <View style={styles.trendingPanel}>
          {trending.map((item: any, index: number) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
              style={[styles.trendingRow, index === trending.length - 1 && styles.trendingRowLast]}
            >
              <Text style={styles.trendingRank}>0{index + 1}</Text>
              <View style={styles.trendingMeta}>
                <Text numberOfLines={1} style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingSubtitle}>{Number(item.views || 0) + (safeDocumentViews[item.id] || 0)} views</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function HomeSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Skeleton style={styles.headerSkeleton} />
        <Skeleton style={styles.heroSkeleton} />
        <Skeleton style={styles.sectionSkeleton} />
        <View style={styles.categoryGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} style={styles.categorySkeleton} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.accent,
    marginBottom: 4,
  },
  courseLine: {
    ...typography.body,
    color: colors.textMuted,
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  avatarBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBadge,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  heroWrap: {
    marginBottom: 12,
  },
  heroRow: {
    gap: 12,
  },
  heroCard: {
    minHeight: 220,
    borderRadius: 22,
    backgroundColor: colors.primary,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.card,
  },
  heroTextWrap: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 18,
  },
  heroButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  heroButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  heroArtWrap: {
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: '#D5DBE8',
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.caption,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconShell: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  readingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  readingCard: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    padding: 14,
  },
  readingCover: {
    height: 104,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.card,
  },
  readingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  readingMeta: {
    ...typography.caption,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: '#D9DEEA',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
  },
  progressCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
  },
  discoveryRow: {
    gap: 12,
    paddingBottom: 4,
  },
  discoveryCard: {
    width: 164,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    padding: 14,
  },
  discoveryArt: {
    height: 96,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  discoveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  discoveryMeta: {
    ...typography.caption,
  },
  trendingPanel: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  trendingRowLast: {
    borderBottomWidth: 0,
  },
  trendingRank: {
    width: 28,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  trendingMeta: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  trendingSubtitle: {
    ...typography.caption,
  },
  headerSkeleton: {
    height: 68,
    borderRadius: 18,
    marginBottom: 18,
  },
  heroSkeleton: {
    height: 220,
    borderRadius: 22,
    marginBottom: 22,
  },
  sectionSkeleton: {
    width: 160,
    height: 32,
    borderRadius: 10,
    marginBottom: 12,
  },
  categorySkeleton: {
    width: '47%',
    height: 56,
    borderRadius: 14,
  },
});
