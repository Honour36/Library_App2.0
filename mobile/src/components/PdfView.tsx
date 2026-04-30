import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme/designSystem';

interface PdfViewProps {
  url: string;
  scale: number;
  onLoadComplete: (numberOfPages: number) => void;
  onPageChanged: (page: number) => void;
  onError: (error: any) => void;
}

const PdfView: React.FC<PdfViewProps> = ({ url, onLoadComplete, onError }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web Preview</Text>
      <Text style={styles.subtitle}>
        Direct PDF rendering is not supported on web. 
      </Text>
      <iframe 
        src={url} 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="PDF Viewer"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl
  }
});

export default PdfView;
