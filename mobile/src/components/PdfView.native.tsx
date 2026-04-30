import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants, { ExecutionEnvironment } from 'expo-constants';

interface PdfViewProps {
  url: string;
  scale: number;
  onLoadComplete: (numberOfPages: number) => void;
  onPageChanged: (page: number) => void;
  onError: (error: any) => void;
}

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const PdfView: React.FC<PdfViewProps> = (props) => {
  const { url, scale, onLoadComplete, onPageChanged, onError } = props;

  // 1. If in Expo Go, use WebView (compatible)
  if (isExpoGo) {
    // Android requires Google Docs Viewer to render PDFs in WebView
    const viewerUrl = Platform.OS === 'android' 
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
      : url;

    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          onLoad={() => onLoadComplete(1)} // Dummy call
          onError={onError}
          originWhitelist={['*']}
          scalesPageToFit={true}
        />
      </View>
    );
  }

  // 2. If in Development Build, use premium react-native-pdf
  try {
    const Pdf = require('react-native-pdf').default;
    return (
      <Pdf
        source={{ uri: url, cache: true }}
        scale={scale}
        spacing={10}
        trustAllCerts={false}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onError={onError}
        style={styles.pdf}
      />
    );
  } catch (err) {
    // Final fallback to WebView if something goes wrong with the native module
    return (
      <View style={styles.container}>
        <WebView source={{ uri: url }} style={styles.webview} />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F5'
  },
  webview: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  }
});

export default PdfView;
