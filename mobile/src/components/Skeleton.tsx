import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/designSystem';

export default function Skeleton({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 140],
  });

  return (
    <View style={[styles.base, style]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: '#E5EAF3',
    borderRadius: radius.md,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '45%',
    backgroundColor: colors.surface,
    opacity: 0.35,
  },
});
