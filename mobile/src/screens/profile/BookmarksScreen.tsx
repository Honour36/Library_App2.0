import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import AnimatedSvgIllustration from '../../components/AnimatedSvgIllustration';
import SvgIllustration from '../../components/SvgIllustration';
import bookmarksApi from '../../api/bookmarksApi';
import documentApi from '../../api/documentApi';
import { getCategoryIllustration } from '../../data/academic';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, spacing, typography } from '../../theme/designSystem';

export default function BookmarksScreen({ navigation }: any) {
  const pinnedBooks = useStudentStore((state) => state.pinnedBooks);
  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: bookmarksApi.getBookmarks,
  });
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getDocuments,
  });

  if (bookmarksLoading || documentsLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pinnedDocs = (documents || []).filter((item: any) => pinnedBooks.includes(item.id));
  const bookmarkedDocs = (bookmarks || [])
    .map((item: any) => item.documents)
    .filter(Boolean);
  const savedBooks = Array.from(
    new Map([...pinnedDocs, ...bookmarkedDocs].map((item: any) => [item.id, item])).values()
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Saved</Text>
        {savedBooks.length === 0 ? (
          <View style={styles.heroCard}>
            <AnimatedSvgIllustration source={require('../../../assets/saved00.svg')} width={240} height={200} />
            <Text style={styles.heroTitle}>No saved books</Text>
            <Text style={styles.heroText}>
              Save a book once and it will show up here for quick access later.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'LibraryTab' })} style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start saving a book</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.savedList}>
            <Text style={styles.savedHeading}>Saved Books</Text>
            {savedBooks.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
                style={styles.savedCard}
              >
                <View style={styles.savedThumb}>
                  <SvgIllustration source={getCategoryIllustration(item.categories?.name || item.department || item.title)} width={72} height={54} />
                </View>
                <View style={styles.savedMeta}>
                  <Text numberOfLines={2} style={styles.savedTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.savedSubtitle}>
                    {item.author || item.users?.full_name || 'NUST Library'}
                  </Text>
                  <Text numberOfLines={1} style={styles.savedTag}>
                    {item.categories?.name || item.department || 'Library Item'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: 120 },
  title: { ...typography.h1, marginBottom: spacing.xl },
  heroCard: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  savedList: {
    gap: spacing.md,
  },
  savedHeading: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  savedCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    padding: spacing.md,
  },
  savedThumb: {
    width: 92,
    height: 86,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  savedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  savedSubtitle: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  savedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
