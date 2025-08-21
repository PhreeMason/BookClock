/**
 * Achievement Registry
 * Manages registration and organization of achievements with event publisher integration
 */

import { 
  AchievementConfig, 
  EventType, 
  UnsubscribeFunction 
} from './types';
import { AchievementEventPublisher } from './AchievementEventPublisher';
import { MetadataAchievementSubscriber } from './MetadataAchievementSubscriber';

interface RegistryEntry {
  config: AchievementConfig;
  subscriber: MetadataAchievementSubscriber;
  unsubscribeFunctions: UnsubscribeFunction[];
}

export class AchievementRegistry {
  private achievements: Map<string, RegistryEntry>;
  private eventPublisher: AchievementEventPublisher;

  constructor(eventPublisher: AchievementEventPublisher) {
    this.achievements = new Map();
    this.eventPublisher = eventPublisher;
  }

  /**
   * Register a new achievement
   */
  register(config: AchievementConfig): void {
    if (this.achievements.has(config.id)) {
      throw new Error(`Achievement with ID ${config.id} is already registered`);
    }

    // Create subscriber for this achievement
    const subscriber = new MetadataAchievementSubscriber(config);

    // Subscribe to all events this achievement is interested in
    const unsubscribeFunctions: UnsubscribeFunction[] = [];
    for (const eventType of config.subscribedEvents) {
      const unsubscribe = this.eventPublisher.subscribe(eventType, subscriber);
      unsubscribeFunctions.push(unsubscribe);
    }

    // Store the entry
    this.achievements.set(config.id, {
      config,
      subscriber,
      unsubscribeFunctions
    });
  }

  /**
   * Unregister an achievement
   */
  unregister(achievementId: string): void {
    const entry = this.achievements.get(achievementId);
    if (!entry) {
      return; // Achievement doesn't exist, nothing to do
    }

    // Unsubscribe from all events
    for (const unsubscribe of entry.unsubscribeFunctions) {
      unsubscribe();
    }

    // Remove from registry
    this.achievements.delete(achievementId);
  }

  /**
   * Get achievement configuration by ID
   */
  getAchievement(achievementId: string): AchievementConfig | undefined {
    const entry = this.achievements.get(achievementId);
    return entry ? { ...entry.config } : undefined;
  }

  /**
   * Get all registered achievements
   */
  getAllAchievements(): AchievementConfig[] {
    return Array.from(this.achievements.values()).map(entry => ({ ...entry.config }));
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementConfig['category']): AchievementConfig[] {
    return this.getAllAchievements().filter(achievement => achievement.category === category);
  }

  /**
   * Get achievements that subscribe to a specific event type
   */
  getAchievementsByEventType(eventType: EventType): AchievementConfig[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.subscribedEvents.includes(eventType)
    );
  }

  /**
   * Get achievements by notification priority
   */
  getAchievementsByPriority(priority: 'high' | 'medium' | 'low'): AchievementConfig[] {
    return this.getAllAchievements().filter(achievement => 
      achievement.notificationPriority === priority
    );
  }

  /**
   * Load multiple achievements at once
   */
  loadAchievements(achievements: AchievementConfig[]): void {
    for (const achievement of achievements) {
      try {
        // Skip if already registered
        if (this.achievements.has(achievement.id)) {
          console.warn(`Achievement ${achievement.id} already registered, skipping`);
          continue;
        }

        this.register(achievement);
      } catch (error) {
        console.error(`Failed to register achievement ${achievement.id}:`, error);
      }
    }
  }

  /**
   * Clear all registered achievements
   */
  clearAll(): void {
    // Unregister all achievements
    for (const achievementId of this.achievements.keys()) {
      this.unregister(achievementId);
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalAchievements: number;
    achievementsByCategory: Record<string, number>;
    achievementsByPriority: Record<string, number>;
    eventSubscriptions: Record<string, number>;
  } {
    const achievements = this.getAllAchievements();
    
    // Count by category
    const achievementsByCategory: Record<string, number> = {};
    for (const achievement of achievements) {
      achievementsByCategory[achievement.category] = (achievementsByCategory[achievement.category] || 0) + 1;
    }

    // Count by priority
    const achievementsByPriority: Record<string, number> = {};
    for (const achievement of achievements) {
      achievementsByPriority[achievement.notificationPriority] = 
        (achievementsByPriority[achievement.notificationPriority] || 0) + 1;
    }

    // Count event subscriptions
    const eventSubscriptions: Record<string, number> = {};
    for (const eventType of Object.values(EventType)) {
      eventSubscriptions[eventType] = this.eventPublisher.getSubscriberCount(eventType);
    }

    return {
      totalAchievements: achievements.length,
      achievementsByCategory,
      achievementsByPriority,
      eventSubscriptions
    };
  }

  /**
   * Check if an achievement is registered
   */
  isRegistered(achievementId: string): boolean {
    return this.achievements.has(achievementId);
  }

  /**
   * Get the subscriber instance for an achievement (useful for testing)
   */
  getSubscriber(achievementId: string): MetadataAchievementSubscriber | undefined {
    const entry = this.achievements.get(achievementId);
    return entry?.subscriber;
  }

  /**
   * Get all achievement IDs
   */
  getAchievementIds(): string[] {
    return Array.from(this.achievements.keys());
  }

  /**
   * Update an achievement configuration (unregister and re-register)
   */
  updateAchievement(config: AchievementConfig): void {
    if (this.achievements.has(config.id)) {
      this.unregister(config.id);
    }
    this.register(config);
  }

  /**
   * Bulk update achievements
   */
  updateAchievements(achievements: AchievementConfig[]): void {
    for (const achievement of achievements) {
      try {
        this.updateAchievement(achievement);
      } catch (error) {
        console.error(`Failed to update achievement ${achievement.id}:`, error);
      }
    }
  }
}