import React, { useMemo } from 'react';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

type Props = {
  source: number;
  width?: number;
  height?: number;
};

export default function SvgIllustration({ source, width = 120, height = 120 }: Props) {
  const uri = useMemo(() => Asset.fromModule(source).uri, [source]);
  return <SvgUri uri={uri} width={width} height={height} />;
}
