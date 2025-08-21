/**
 * Achievement Event Publisher
 * Implements the observer pattern for publishing achievement-related events
 */

import { AchievementEvent, AchievementSubscriber, EventType, UnsubscribeFunction } from './types';

export class AchievementEventPublisher {
  private subscribers: Map<EventType, Set<AchievementSubscriber>>;

  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to achievement events
   */
  subscribe(eventType: EventType, subscriber: AchievementSubscriber): UnsubscribeFunction {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const subscriberSet = this.subscribers.get(eventType)!;
    subscriberSet.add(subscriber);

    // Return unsubscribe function
    return () => {
      subscriberSet.delete(subscriber);
      if (subscriberSet.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish(event: AchievementEvent, recordId: string): Promise<void> {
    const subscriberSet = this.subscribers.get(event.type);
    
    if (!subscriberSet || subscriberSet.size === 0) {
      return;
    }

    // Create array of promises for all subscriber handlers
    const handlerPromises = Array.from(subscriberSet).map(async (subscriber) => {
      try {
        await subscriber.handleEvent(event, recordId);
      } catch (error) {
        const subscriberName = subscriber.achievementName || subscriber.achievementId;
        console.error(`Error in achievement subscriber "${subscriberName}" (${subscriber.achievementId}):`, error);
        // Continue processing other subscribers even if one fails
      }
    });

    // Wait for all handlers to complete
    await Promise.all(handlerPromises);
  }

  /**
   * Get the number of subscribers for an event type
   */
  getSubscriberCount(eventType: EventType): number {
    const subscriberSet = this.subscribers.get(eventType);
    return subscriberSet ? subscriberSet.size : 0;
  }

  /**
   * Clear all subscribers (useful for testing and cleanup)
   */
  clearAllSubscribers(): void {
    this.subscribers.clear();
  }

  /**
   * Get all event types that have subscribers
   */
  getActiveEventTypes(): EventType[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Check if there are any subscribers for an event type
   */
  hasSubscribers(eventType: EventType): boolean {
    const subscriberSet = this.subscribers.get(eventType);
    return subscriberSet ? subscriberSet.size > 0 : false;
  }
}