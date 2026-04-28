import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Button } from '../components/Button';
import * as ImagePicker from 'expo-image-picker';

type UploadStatus = 'idle' | 'uploading' | 'success';

export function MissionInboxScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const submitProof = async () => {
    if (!photoUri) {
      Alert.alert('사진 필요', '인증샷을 먼저 찍어주세요!');
      return;
    }
    setUploadStatus('uploading');
    // Simulated upload — Firebase Storage upload to be wired here
    await new Promise((res) => setTimeout(res, 1500));
    setUploadStatus('success');
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-4xl font-bold mb-8 pt-16 text-foreground tracking-tight">Mission Inbox</Text>

      <View className="bg-card p-8 rounded-3xl mb-6 border border-border border-l-8 border-l-dopamine">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-foreground/60 font-bold text-base">From: Alex</Text>
          <Text className="text-sm text-foreground/40 font-medium">2 hours ago</Text>
        </View>
        <Text className="text-3xl font-bold mb-4 text-foreground leading-tight">Go for a 20 min walk</Text>
        <Text className="text-foreground/70 text-lg mb-8 italic">"Let's get some fresh air together even if we are apart!"</Text>

        {/* Photo Zone */}
        {photoUri ? (
          <View className="mb-8">
            <Image
              source={{ uri: photoUri }}
              className="w-full h-56 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity onPress={() => setPhotoUri(null)} className="mt-3 items-center">
              <Text className="text-foreground/40 font-medium text-base">다시 찍기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mb-8">
            <View className="bg-input h-48 rounded-2xl mb-4 items-center justify-center border-2 border-dashed border-foreground/20">
              <Text className="text-foreground/40 font-bold text-lg">인증샷을 추가해주세요 📸</Text>
            </View>
            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={pickFromCamera}
                className="flex-1 bg-dopamine/10 py-4 rounded-2xl items-center"
              >
                <Text className="text-dopamine font-bold text-base">📷 카메라</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickFromGallery}
                className="flex-1 bg-serotonin/10 py-4 rounded-2xl items-center"
              >
                <Text className="text-serotonin font-bold text-base">🖼️ 갤러리</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {uploadStatus === 'success' ? (
          <View className="bg-serotonin/10 p-5 rounded-2xl items-center">
            <Text className="text-serotonin font-bold text-xl">🐣 펫이 기뻐하고 있어요!</Text>
            <Text className="text-foreground/60 mt-2 text-base">AI가 일기를 적는 중...</Text>
          </View>
        ) : (
          <Button
            title={uploadStatus === 'uploading' ? '전송 중...' : '미션 완료 & 펫 먹이기'}
            variant="dopamine"
            onPress={submitProof}
            disabled={uploadStatus === 'uploading'}
          />
        )}
      </View>
    </ScrollView>
  );
}
