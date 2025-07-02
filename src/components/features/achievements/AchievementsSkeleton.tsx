import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function AchievementsSkeleton() {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const SkeletonItem = () => (
    <Animated.View
      style={[
        styles.achievementItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.background },
          ]}
        />
        <View style={styles.content}>
          <View
            style={[
              styles.title,
              { backgroundColor: theme.background },
            ]}
          />
          <View
            style={[
              styles.description,
              { backgroundColor: theme.background },
            ]}
          />
        </View>
      </View>
      <View
        style={[
          styles.progressBar,
          { backgroundColor: theme.background },
        ]}
      />
    </Animated.View>
  );

  const CategorySection = () => (
    <View style={styles.categorySection}>
      <Animated.View
        style={[
          styles.categoryTitle,
          { backgroundColor: theme.background },
          animatedStyle,
        ]}
      />
      {[1, 2, 3].map((index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerTitle,
            { backgroundColor: theme.background },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.headerSubtitle,
            { backgroundColor: theme.background },
            animatedStyle,
          ]}
        />
      </View>
      {[1, 2, 3].map((index) => (
        <CategorySection key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    width: 200,
    height: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerSubtitle: {
    width: 120,
    height: 20,
    borderRadius: 6,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    width: 150,
    height: 24,
    borderRadius: 6,
    marginBottom: 12,
  },
  achievementItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    width: '70%',
    height: 20,
    borderRadius: 6,
    marginBottom: 6,
  },
  description: {
    width: '90%',
    height: 16,
    borderRadius: 4,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
});