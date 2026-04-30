import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Download, Eye, FileText, Star } from 'lucide-react-native';
import { colors, radius, shadows, spacing } from '../theme/designSystem';

interface Props {
  document: any;
  onPress: () => void;
  variant?: 'light' | 'dark';
}

export default function DocumentCard({ document, onPress, variant = 'light' }: Props) {
  const dark = variant === 'dark';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, dark && styles.cardDark]}>
      <View style={styles.cover}>
        <FileText size={26} color={colors.primary} />
        <View style={styles.pdfBadge}>
          <Text style={styles.pdfBadgeText}>PDF</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, dark && styles.titleDark]} numberOfLines={2}>
          {document.title}
        </Text>
        <Text style={[styles.subtitle, dark && styles.subtitleDark]} numberOfLines={1}>
          {document.author || document.categories?.name || document.department || 'University Library'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Star size={12} color={colors.accent} fill={colors.accent} />
            <Text style={[styles.metaText, dark && styles.subtitleDark]}>4.7</Text>
          </View>
          <View style={styles.metaItem}>
            <Eye size={12} color={dark ? colors.darkMuted : colors.textMuted} />
            <Text style={[styles.metaText, dark && styles.subtitleDark]}>{document.views || 248}</Text>
          </View>
          <View style={styles.metaItem}>
            <Download size={12} color={dark ? colors.darkMuted : colors.textMuted} />
            <Text style={[styles.metaText, dark && styles.subtitleDark]}>{document.downloads || 91}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sideBadge, dark && styles.sideBadgeDark]}>
        <Text style={[styles.sideBadgeText, dark && styles.sideBadgeTextDark]}>
          {document.academic_year || document.year || '2024'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardDark: {
    backgroundColor: colors.darkSurface,
    borderColor: colors.darkBorder,
  },
  cover: {
    width: 58,
    height: 74,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    position: 'relative',
  },
  pdfBadge: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  pdfBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.surface,
  },
  content: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: colors.darkText,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  subtitleDark: {
    color: colors.darkMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sideBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: '#EFF5FF',
  },
  sideBadgeDark: {
    backgroundColor: '#22304B',
  },
  sideBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  sideBadgeTextDark: {
    color: '#BFD2FF',
  },
});
