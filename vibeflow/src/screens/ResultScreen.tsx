import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../components/Button';

export function ResultScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 pt-16 items-center">
        <Text className="text-3xl font-bold mb-2 text-foreground tracking-tight">Your Prescription</Text>
        
        <View className="bg-card w-full p-8 rounded-3xl mt-8 border border-border border-t-8 border-t-serotonin">
          <Text className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-4">Diagnosis</Text>
          <Text className="text-4xl font-bold mb-6 text-foreground leading-tight">Serotonin Needed</Text>
          <Text className="text-foreground/70 text-lg leading-relaxed mb-10">
            It sounds like you've had a busy and overwhelming day. Let's slow down and focus on peace and mindfulness to replenish your serotonin levels.
          </Text>
          
          <Text className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-6">Suggested Missions</Text>
          
          <View className="bg-input p-5 rounded-2xl mb-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-bold text-lg text-foreground">10 minutes of meditation</Text>
            </View>
            <Button title="Do This" variant="serotonin" style={{ paddingVertical: 10, paddingHorizontal: 20 }} />
          </View>
          
          <View className="bg-input p-5 rounded-2xl mb-8 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="font-bold text-lg text-foreground">Drink a warm cup of tea</Text>
            </View>
            <Button title="Do This" variant="serotonin" style={{ paddingVertical: 10, paddingHorizontal: 20 }} />
          </View>
        </View>
        
        <Button title="Share to Partner" variant="secondary" className="w-full mt-8" />
      </View>
    </ScrollView>
  );
}
