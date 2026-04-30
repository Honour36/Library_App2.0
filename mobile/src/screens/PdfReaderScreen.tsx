import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { ChevronLeft, Maximize, Minus, Plus, Share2 } from 'lucide-react-native';
import PdfView from '../components/PdfView';
import { useStudentStore } from '../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../theme/designSystem';

export default function PdfReaderScreen({ route, navigation }: any) {
  const { documentId, pdfUrl, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  const sessionStartRef = useRef(Date.now());
  const recordReadingSession = useStudentStore((state) => state.recordReadingSession);

  const isPdf = useMemo(() => {
    const lowerUrl = `${pdfUrl || ''}`.toLowerCase();
    const lowerTitle = `${title || ''}`.toLowerCase();
    return (
      lowerUrl.includes('.pdf') ||
      lowerTitle.endsWith('.pdf') ||
      lowerUrl.includes('application/pdf') ||
      lowerUrl.includes('supabase.co/storage/v1/object/public/documents') // Assume documents are PDF
    );
  }, [pdfUrl, title]);

  useEffect(() => {
    sessionStartRef.current = Date.now();

    return () => {
      const durationSeconds = Math.max(10, Math.round((Date.now() - sessionStartRef.current) / 1000));
      recordReadingSession({ documentId, title, pdfUrl, durationSeconds });
    };
  }, [documentId, pdfUrl, recordReadingSession, title]);

  const handleOpenExternally = async () => {
    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch {
      Alert.alert('Error', 'Unable to open document in browser.');
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={colors.surface} />
        </TouchableOpacity>
        
        <View style={styles.headerMeta}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSubtitle}>
            {totalPages > 0 ? `Page ${currentPage} of ${totalPages}` : 'Loading document...'}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Share2 size={18} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Viewer Area */}
      <View style={styles.viewerWrap}>
        {isPdf ? (
          <PdfView
            url={pdfUrl}
            scale={scale}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setLoading(false);
              setError(null);
            }}
            onPageChanged={(page) => {
              setCurrentPage(page);
            }}
            onError={(err) => {
              console.error('PDF Error:', err);
              setLoading(false);
              // Handle Expo Go gracefully
              if (err?.message?.includes('native module')) {
                setError('PDF viewing requires a development build. Please use the browser fallback below.');
              } else {
                setError('Failed to display PDF. It might be corrupted or inaccessible.');
              }
            }}
          />
        ) : (
          <View style={styles.externalWrap}>
            <Text style={styles.externalTitle}>Non-PDF Document</Text>
            <Text style={styles.externalText}>
              This document type cannot be viewed directly. Please open it in your system browser.
            </Text>
            <TouchableOpacity onPress={handleOpenExternally} style={styles.openButton}>
              <Text style={styles.openButtonText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Controls */}
        {!loading && !error && isPdf && (
          <View style={styles.floatingControls}>
            <TouchableOpacity onPress={zoomOut} style={styles.floatBtn}>
              <Minus size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={resetZoom} style={styles.floatBtn}>
              <Maximize size={18} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={zoomIn} style={styles.floatBtn}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* States Overlays */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Preparing your document...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Oops!</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleOpenExternally} style={styles.errorButton}>
                <Text style={styles.errorButtonText}>Try Browser instead</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Modern Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentPage} <Text style={styles.pageTotal}>/ {totalPages || '?'}</Text>
          </Text>
        </View>
        <Text style={styles.readingMode}>Reading Mode</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1A1A1A' // Dark background for reading
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.md, 
    backgroundColor: colors.primary,
    ...shadows.md
  },
  iconButton: { 
    width: 40, 
    height: 40, 
    borderRadius: radius.pill, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerMeta: { 
    flex: 1, 
    marginHorizontal: spacing.md 
  },
  headerTitle: { 
    color: colors.surface, 
    fontSize: 15, 
    fontWeight: '700' 
  },
  headerSubtitle: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 11, 
    marginTop: 2,
    fontWeight: '500'
  },
  viewerWrap: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
    position: 'relative'
  },
  pdf: { 
    flex: 1, 
    width: '100%',
    backgroundColor: '#F5F5F5' 
  },
  floatingControls: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    zIndex: 10
  },
  floatBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    alignSelf: 'center'
  },
  externalWrap: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: spacing.xxl, 
    gap: spacing.lg 
  },
  externalTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    textAlign: 'center' 
  },
  externalText: { 
    ...typography.body, 
    color: colors.textMuted, 
    textAlign: 'center',
    lineHeight: 24
  },
  openButton: { 
    minWidth: 200, 
    height: 52, 
    borderRadius: radius.md, 
    backgroundColor: colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...shadows.primary
  },
  openButtonText: { 
    color: colors.surface, 
    fontSize: 15, 
    fontWeight: '700' 
  },
  loader: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: spacing.md, 
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 5
  },
  loaderText: { 
    ...typography.label,
    color: colors.primary
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 20
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.xl
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.error
  },
  errorText: { 
    ...typography.body, 
    color: colors.textMuted, 
    textAlign: 'center' 
  },
  errorButton: { 
    width: '100%',
    height: 48, 
    borderRadius: radius.md, 
    backgroundColor: colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  errorButtonText: { 
    color: colors.surface, 
    fontSize: 14, 
    fontWeight: '700' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: spacing.xl, 
    paddingVertical: spacing.md, 
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  pageIndicator: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border
  },
  pageText: { 
    fontSize: 13, 
    fontWeight: '800', 
    color: colors.primary 
  },
  pageTotal: {
    color: colors.textMuted,
    fontWeight: '500'
  },
  readingMode: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1
  }
});
