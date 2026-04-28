import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'dopamine' | 'serotonin' | 'endorphin' | 'oxytocin';
}

export function Button({ title, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "py-4 px-6 rounded-full items-center justify-center flex-row active:opacity-80";
  
  const variants = {
    primary: "bg-foreground",
    secondary: "bg-transparent border-2 border-border",
    dopamine: "bg-dopamine",
    serotonin: "bg-serotonin",
    endorphin: "bg-endorphin",
    oxytocin: "bg-oxytocin",
  };

  const textStyles = {
    primary: "text-white font-bold text-lg",
    secondary: "text-foreground font-bold text-lg",
    dopamine: "text-white font-bold text-lg tracking-wide",
    serotonin: "text-white font-bold text-lg tracking-wide",
    endorphin: "text-white font-bold text-lg tracking-wide",
    oxytocin: "text-white font-bold text-lg tracking-wide",
  };

  return (
    <TouchableOpacity className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <Text className={textStyles[variant]}>{title}</Text>
    </TouchableOpacity>
  );
}
