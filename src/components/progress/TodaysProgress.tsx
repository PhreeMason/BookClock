import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { ThemedText, ThemedView } from '../themed'
import { formatProgressDisplay } from '@/lib/deadlineUtils'

const formatMinutesToTime = (minutes: number): string => {
  return formatProgressDisplay('audio', minutes)
}

type TodaysProgressProps = {
    total: number,
    current: number,
    type?: 'reading' | 'listening'
}

const TodaysProgress: React.FC<TodaysProgressProps> = ({
    total,
    current,
    type = 'reading'
}) => {
  const progressPercentage = (current / total) * 100;
  const isListening = type === 'listening';
  const icon = isListening ? '🎧' : '📖';
  const label = isListening ? "Today's Listening" : "Today's Reading";
  
  const getDisplayValue = () => {
    if (isListening) {
      return `${formatMinutesToTime(current)}/${formatMinutesToTime(total)}`;
    }
    return `${current}/${total}`;
  };
  
  const getRemainingText = () => {
    const remaining = total - current;
    if (isListening) {
      return `${formatMinutesToTime(remaining)} left`;
    }
    return `${remaining} pages left`;
  };
  const shimmerTranslateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerTranslateX, {
        toValue: 40,
        duration: 1800,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerTranslateX]);

  return (
    <ThemedView style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statLabel}>
          <ThemedText style={styles.statIcon}>{icon}</ThemedText>
          <ThemedText style={styles.labelText}>{label}</ThemedText>
        </View>
        <ThemedText style={styles.statValue}>{getDisplayValue()}</ThemedText>
      </View>
      
      <View style={styles.progressBar}>
        <LinearGradient 
          colors={['#E8C2B9', '#B8A9D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progressPercentage}%` }]}
        >
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.6), #B8A9D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </LinearGradient>
      </View>
      
      <View style={styles.statFooter}>
        <ThemedText style={styles.encouragementText}>{isListening ? 'Great pace!' : "You're doing great!"}</ThemedText>
        <ThemedText style={styles.remainingText}>{getRemainingText()}</ThemedText>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: 'rgba(250, 248, 245, 1)', // Linear gradient approximation
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 194, 185, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 18,
  },
  labelText: {
    color: '#2B3D4F',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#8B5A8C',
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(232, 194, 185, 0.2)',
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 20,
  },
  shimmerGradient: {
    flex: 1,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 12,
    color: '#6B7280',
  },
  remainingText: {
    color: '#C8698A',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TodaysProgress