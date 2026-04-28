import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share } from 'react-native';

interface Polaroid {
  id: string;
  photoUrl: string;
  aiCaption: string;
  missionTitle: string;
  uploaderName: string;
  createdAt: string;
}

// Mock data — will be replaced with Firestore Polaroids collection listener
const MOCK_POLAROIDS: Polaroid[] = [
  {
    id: '1',
    photoUrl: 'https://picsum.photos/seed/walk/400/400',
    aiCaption: '빛 속 산책, 세로토닌 충전 완료! 🌿',
    missionTitle: '20분 산책하기',
    uploaderName: 'You',
    createdAt: '오늘',
  },
  {
    id: '2',
    photoUrl: 'https://picsum.photos/seed/tea/400/400',
    aiCaption: '따뜻한 차 한 잔, 우리의 평화 🍵',
    missionTitle: '따뜻한 차 마시기',
    uploaderName: 'Alex',
    createdAt: '어제',
  },
  {
    id: '3',
    photoUrl: 'https://picsum.photos/seed/book/400/400',
    aiCaption: '10페이지 독서, 도파민 충전 📖',
    missionTitle: '책 10페이지 읽기',
    uploaderName: 'You',
    createdAt: '2일 전',
  },
];

function PolaroidCard({ item }: { item: Polaroid }) {
  const handleShare = () => {
    Share.share({
      message: `VibeFlow 미션 완료! "${item.missionTitle}" - ${item.aiCaption}`,
    });
  };

  return (
    <View className="bg-card border border-border rounded-3xl overflow-hidden mb-6">
      {/* Photo with Polaroid frame feel */}
      <View className="p-4 pb-2">
        <Image
          source={{ uri: item.photoUrl }}
          className="w-full h-56 rounded-2xl"
          resizeMode="cover"
        />
      </View>

      {/* Caption area (polaroid white border bottom) */}
      <View className="px-6 pb-6 pt-2">
        <Text className="text-foreground font-bold text-lg leading-tight mb-1">{item.aiCaption}</Text>
        <View className="flex-row justify-between items-center mt-3">
          <View>
            <Text className="text-foreground/40 text-sm font-medium">{item.missionTitle}</Text>
            <Text className="text-foreground/30 text-xs mt-0.5">{item.uploaderName} · {item.createdAt}</Text>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            className="bg-endorphin/10 w-10 h-10 rounded-full items-center justify-center"
          >
            <Text className="text-endorphin text-lg">↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function GalleryScreen() {
  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-4xl font-bold mb-2 pt-16 text-foreground tracking-tight">우리의 스크랩북</Text>
      <Text className="text-foreground/50 text-base mb-8">완료한 미션마다 폴라로이드가 쌓여요 📸</Text>

      {/* Streak Banner */}
      <View className="bg-oxytocin p-6 rounded-3xl mb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-2xl">7일 연속 미션 🔥</Text>
          <Text className="text-white/70 mt-1 text-sm">펫이 레벨업 직전이에요!</Text>
        </View>
        <Text className="text-5xl">🐣</Text>
      </View>

      {/* Polaroid Feed */}
      {MOCK_POLAROIDS.map((item) => (
        <PolaroidCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
