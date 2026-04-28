import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

type HormoneType = 'dopamine' | 'serotonin' | 'endorphin' | 'oxytocin';
type Emotion = 'happy' | 'sad' | 'sleepy' | 'hungry';

interface VibePetProps {
  emotion?: Emotion;
  dominantHormone?: HormoneType;
  speechBubble?: string;
}

const HORMONE_CONFIG: Record<HormoneType, { bg: string; body: string }> = {
  dopamine: { bg: 'bg-dopamine/10', body: 'bg-dopamine' },
  serotonin: { bg: 'bg-serotonin/10', body: 'bg-serotonin' },
  endorphin: { bg: 'bg-endorphin/10', body: 'bg-endorphin' },
  oxytocin: { bg: 'bg-oxytocin/10', body: 'bg-oxytocin' },
};

const EMOTION_FACE: Record<Emotion, string> = {
  happy: '(˶ᵔ ᵕ ᵔ˶)',
  sad: '(｡•́︿•̀｡)',
  sleepy: '(－ω－) zzZ',
  hungry: '( ´•ᯅ•` )',
};

const EMOTION_LABEL: Record<Emotion, string> = {
  happy: '행복해요!',
  sad: '슬퍼요...',
  sleepy: '졸려요... 보고싶었어요',
  hungry: '밥(미션)이 고파요!',
};

export function VibePet({
  emotion = 'happy',
  dominantHormone = 'dopamine',
  speechBubble,
}: VibePetProps) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle floating bob animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Squish on happy emotion
    if (emotion === 'happy') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(squishAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(squishAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [emotion]);

  const { bg, body } = HORMONE_CONFIG[dominantHormone];

  return (
    <View className="items-center py-6">
      {/* Speech Bubble */}
      <View className="bg-card border border-border px-5 py-3 rounded-3xl mb-6 max-w-xs">
        <Text className="text-foreground font-bold text-base text-center">
          {speechBubble ?? EMOTION_LABEL[emotion]}
        </Text>
        {/* Bubble tail */}
        <View className="absolute -bottom-3 self-center w-4 h-4 bg-card border-b border-r border-border rotate-45" />
      </View>

      {/* Pet Body */}
      <Animated.View
        style={{ transform: [{ translateY: bobAnim }, { scale: squishAnim }] }}
        className={`w-36 h-36 rounded-full ${body} items-center justify-center`}
      >
        <View className={`w-28 h-28 rounded-full ${bg} items-center justify-center`}>
          <Text style={{ fontSize: 28 }}>{EMOTION_FACE[emotion]}</Text>
        </View>
      </Animated.View>

      {/* Level Badge */}
      <View className="mt-5 bg-foreground/10 px-4 py-2 rounded-full">
        <Text className="text-foreground/60 font-bold text-sm">레벨 1 · 바이브 씨앗 🌱</Text>
      </View>
    </View>
  );
}
