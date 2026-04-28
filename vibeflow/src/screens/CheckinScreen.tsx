import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button } from '../components/Button';

export function CheckinScreen() {
  const [mood, setMood] = useState('');
  
  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <Text className="text-3xl font-bold mb-8 text-foreground text-center leading-tight">
        How are you{"\n"}feeling today?
      </Text>
      
      <View className="bg-card p-8 rounded-3xl border border-border w-full mb-8">
        <Text className="text-lg font-bold text-foreground mb-4">Current Mood</Text>
        <TextInput 
          value={mood}
          onChangeText={setMood}
          placeholder="e.g. A bit tired but okay"
          placeholderTextColor="#A8A29E"
          className="bg-input p-4 rounded-2xl mb-8 text-lg text-foreground font-medium"
        />
        
        <Text className="text-lg font-bold text-foreground mb-4">Energy Level</Text>
        <View className="flex-row justify-between mb-10">
          {[1, 2, 3, 4, 5].map((num) => (
            <View key={num} className="w-12 h-12 rounded-full bg-input items-center justify-center">
              <Text className="text-lg font-bold text-foreground/60">{num}</Text>
            </View>
          ))}
        </View>
        
        <Button title="Analyze My Vibe" variant="dopamine" className="w-full" />
      </View>
    </View>
  );
}
