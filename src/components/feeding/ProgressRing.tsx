import React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { Canvas, Path, Skia, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/primitives/Text';
import { useSharedValue, withSpring, useDerivedValue, useAnimatedReaction } from 'react-native-reanimated';

type Props = {
  kcalFed: number;
  kcalTarget: number;
  photoUri?: string | null;
  catName?: string;
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({
  kcalFed,
  kcalTarget,
  photoUri,
  catName = 'your cat',
  size = 240,
  strokeWidth = 14,
}: Props) {
  const { colors } = useTheme();
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => sub.remove();
  }, []);

  const pct = kcalTarget > 0 ? Math.max(0, Math.min(1, kcalFed / kcalTarget)) : 0;
  const progress = useSharedValue(0);
  const [drawPct, setDrawPct] = React.useState(0);

  React.useEffect(() => {
    if (reducedMotion) {
      progress.value = pct;
      setDrawPct(pct);
    } else {
      progress.value = withSpring(pct, { damping: 18, stiffness: 120, mass: 1.2 });
    }
  }, [pct, progress, reducedMotion]);

  useAnimatedReaction(
    () => progress.value,
    (v) => {
      // Sync back to JS at throttled rate
    },
    [progress],
  );

  // Because Skia+Reanimated sharing isn't trivial here, drive with an interval while animating
  React.useEffect(() => {
    if (reducedMotion) return;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      setDrawPct(progress.value);
      if (Math.abs(progress.value - pct) > 0.001) {
        requestAnimationFrame(tick);
      } else {
        setDrawPct(pct);
      }
    };
    requestAnimationFrame(tick);
    return () => {
      mounted = false;
    };
  }, [pct, progress, reducedMotion]);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2 - 4;

  const trackPath = React.useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, cy, r);
    return p;
  }, [cx, cy, r]);

  const progressPath = React.useMemo(() => {
    const p = Skia.Path.Make();
    if (drawPct <= 0) return p;
    const startAngle = -90;
    const sweepAngle = 360 * drawPct;
    const rect = Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2);
    p.addArc(rect, startAngle, sweepAngle);
    return p;
  }, [drawPct, cx, cy, r]);

  const innerPhotoSize = size - strokeWidth * 2 - 18;
  const remaining = Math.max(0, Math.round(kcalTarget - kcalFed));
  const fedRounded = Math.round(kcalFed);
  const pctLabel = Math.round(pct * 100);

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={`${catName} has eaten ${fedRounded} of ${Math.round(kcalTarget)} calories, ${pctLabel} percent.`}
    >
      <Canvas style={{ position: 'absolute', width: size, height: size }}>
        <Path
          path={trackPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={colors.surfaceAlt}
        />
        <Path
          path={progressPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(size, size)}
            colors={[colors.accentDeep, colors.accent]}
          />
          <BlurMask blur={2} style="solid" />
        </Path>
      </Canvas>
      <View
        style={{
          width: innerPhotoSize,
          height: innerPhotoSize,
          borderRadius: innerPhotoSize / 2,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: innerPhotoSize, height: innerPhotoSize }}
            contentFit="cover"
          />
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="displayXL" color={colors.accentDeep}>
              🐾
            </Text>
            <Text variant="bodySm" color={colors.accentDeep}>
              {fedRounded} / {Math.round(kcalTarget)} kcal
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
