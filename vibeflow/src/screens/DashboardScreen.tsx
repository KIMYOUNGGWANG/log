import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { VibePet } from '../components/VibePet';

export function DashboardScreen() {
  // Will be replaced with real Firebase call (syncWidgetState)
  const mockPetState = {
    emotion: 'happy' as const,
    dominantHormone: 'serotonin' as const,
    speechBubble: '같이 있어서 너무 좋아요! 💚',
    level: 1,
    xp: 30,
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-10">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-4xl font-bold text-foreground tracking-tight">VibeFlow</Text>
            <Text className="text-foreground/50 text-base mt-1">오늘도 함께해서 좋아요 ✨</Text>
          </View>
          <View className="bg-endorphin/10 w-12 h-12 rounded-full items-center justify-center">
            <Text className="text-2xl">🔔</Text>
          </View>
        </View>

        {/* Vibe Pet (T4) */}
        <View className="bg-card rounded-3xl border border-border mt-8 overflow-hidden">
          <VibePet
            emotion={mockPetState.emotion}
            dominantHormone={mockPetState.dominantHormone}
            speechBubble={mockPetState.speechBubble}
          />
          {/* XP Bar */}
          <View className="px-8 pb-8">
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground/50 font-bold text-sm">성장 경험치</Text>
              <Text className="text-foreground/50 font-bold text-sm">{mockPetState.xp} / 100 XP</Text>
            </View>
            <View className="bg-input h-3 rounded-full overflow-hidden">
              <View
                className="h-3 rounded-full bg-serotonin"
                style={{ width: `${mockPetState.xp}%` }}
              />
            </View>
          </View>
        </View>

        {/* Quick Check-In Banner */}
        <View className="bg-dopamine mt-6 p-6 rounded-3xl flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-xl">지금 기분은요?</Text>
            <Text className="text-white/70 mt-1 text-sm">체크인 하면 펫이 밥을 먹어요!</Text>
          </View>
          <Text className="text-white text-4xl">→</Text>
        </View>

        {/* Pending Missions */}
        <Text className="text-2xl font-bold mt-8 mb-4 text-foreground">대기 중인 미션</Text>
        <View className="bg-card p-6 rounded-3xl border border-border border-l-8 border-l-serotonin flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="font-bold text-xl text-foreground">20분 산책하기</Text>
            <Text className="text-foreground/50 mt-1 text-base">Alex가 보낸 미션 · 2시간 전</Text>
          </View>
          <View className="bg-serotonin w-12 h-12 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-xl">→</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
