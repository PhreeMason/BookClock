/**
 * Achievement Event Service
 * Singleton service for managing achievement events throughout the app
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ACHIEVEMENT_CONFIGS } from './achievementConfigs';
import { AchievementEventPublisher } from './AchievementEventPublisher';
import { AchievementRegistry } from './AchievementRegistry';

export class AchievementEventService {
    private static instance: AchievementEventService | null = null;
    private eventPublisher: AchievementEventPublisher;
    private registry: AchievementRegistry;
    private isInitialized = false;

    private constructor() {
        this.eventPublisher = new AchievementEventPublisher();
        this.registry = new AchievementRegistry(this.eventPublisher);
    }

    /**
     * Get singleton instance
     */
    static getInstance(): AchievementEventService {
        if (!AchievementEventService.instance) {
            AchievementEventService.instance = new AchievementEventService();
        }
        return AchievementEventService.instance;
    }

    /**
     * Initialize the achievement system
     */
    async initialize(supabaseClient: SupabaseClient, userId: string): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // Load achievement configurations
            this.registry.loadAchievements(ACHIEVEMENT_CONFIGS);

            this.isInitialized = true;
            console.log('Achievement system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize achievement system:', error);
            throw error;
        }
    }

    /**
     * Check if the system is initialized
     */
    isSystemInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Get achievement registry (for testing/debugging)
     */
    getRegistry(): AchievementRegistry {
        return this.registry;
    }

    /**
     * Get event publisher (for testing/debugging)
     */
    getEventPublisher(): AchievementEventPublisher {
        return this.eventPublisher;
    }

    /**
     * Reset singleton (for testing)
     */
    static resetForTesting(): void {
        AchievementEventService.instance = null;
    }
}