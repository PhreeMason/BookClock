import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@clerk/clerk-expo';
import React from 'react';
import { Image } from 'react-native';

interface UserAvatarProps {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function UserAvatar({ 
  size = 40, 
  backgroundColor = '#667eea',
  textColor = 'white'
}: UserAvatarProps) {
  const { user } = useUser();

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textStyle = {
    color: textColor,
    fontWeight: '600' as const,
    fontSize: size * 0.4, // Scale font size based on avatar size
  };

  return (
    <ThemedView style={avatarStyle}>
      {user?.hasImage && user.imageUrl ? (
        <Image 
          source={{ uri: user.imageUrl }} 
          style={imageStyle}
        />
      ) : (
        <ThemedText style={textStyle}>{getUserInitials()}</ThemedText>
      )}
    </ThemedView>
  );
} 