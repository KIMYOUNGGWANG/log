import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button } from '../components/Button';

export function InviteScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-4">Invite Your Partner</Text>
      <Text className="text-gray-600 mb-8 text-center">
        Share this code to connect your wellness journey.
      </Text>
      
      <View className="bg-gray-100 p-4 rounded-lg w-full mb-8 items-center">
        <Text className="text-3xl font-mono tracking-widest">VIBE-XYZ</Text>
      </View>
      
      <Button title="Share Invite Code" variant="oxytocin" className="w-full" />
      
      <Text className="text-gray-400 mt-12 mb-4">Or enter a code received</Text>
      <TextInput 
        placeholder="Enter Code" 
        className="border border-gray-300 rounded-lg w-full p-4 mb-4 text-center text-lg"
      />
      <Button title="Join Group" variant="secondary" className="w-full" />
    </View>
  );
}
