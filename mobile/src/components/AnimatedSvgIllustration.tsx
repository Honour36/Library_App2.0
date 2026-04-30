import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

type Props = {
  source: number;
  width?: number;
  height?: number;
};

export default function AnimatedSvgIllustration({ source, width = 280, height = 220 }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const uri = useMemo(() => Asset.fromModule(source).uri, [source]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [translateY]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.shadow} />
      <SvgUri uri={uri} width={width} height={height} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    position: 'absolute',
    bottom: 6,
    width: 140,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(26, 35, 126, 0.10)',
  },
});
