import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export function CalendarScreen() {
  const weeks = Array.from({ length: 4 });
  const days = Array.from({ length: 7 });

  const getColor = (val: number) => {
    if (val === 0) return 'bg-input';
    if (val === 1) return 'bg-serotonin/40';
    return 'bg-serotonin';
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-4xl font-bold mb-2 pt-16 text-foreground tracking-tight">Our Vibe Calendar</Text>
      <Text className="text-foreground/60 text-lg mb-10">Track your shared wellness journey.</Text>
      
      <View className="bg-card p-8 rounded-3xl mb-8 border border-border">
        <Text className="font-bold text-xl mb-8 text-center text-foreground">April 2026</Text>
        <View className="flex-row justify-center">
          {weeks.map((_, wIndex) => (
            <View key={wIndex} className="mr-3">
              {days.map((_, dIndex) => (
                <View 
                  key={dIndex} 
                  className={`w-12 h-12 rounded-xl mb-3 ${getColor(Math.floor(Math.random() * 3))}`}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      
      <Text className="font-bold text-2xl mb-6 text-foreground">Milestones</Text>
      <View className="flex-row items-center bg-oxytocin p-6 rounded-3xl">
        <Text className="text-white font-bold text-xl flex-1">7 Day Streak! 🔥</Text>
        <Text className="text-white/80 text-base font-medium">Keep it up!</Text>
      </View>
    </ScrollView>
  );
}
