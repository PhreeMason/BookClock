/**
 * Achievement System Types
 * Core type definitions for the event-driven achievement system
 */

import { Tables, TablesInsert } from '@/types/supabase';

// Event Types
export enum EventType {
  PROGRESS_UPDATED = 'progress_updated',
  DEADLINE_COMPLETED = 'deadline_completed',
  DEADLINE_STARTED = 'deadline_started',
  DAILY_READING_SESSION = 'daily_reading_session',
  DEADLINE_SET_ASIDE = 'deadline_set_aside',
  READING_GOAL_SET = 'reading_goal_set',
  READING_STREAK_UPDATED = 'reading_streak_updated'
}

// Event Data Interfaces
export interface ProgressUpdatedData {
  deadlineId: string;
  format: 'physical' | 'eDeadline' | 'audio';
  progressDelta: number;
  currentProgress: number;
  totalPages: number;
}

export interface DeadlineCompletedData {
  deadlineId: string;
  format: 'physical' | 'eDeadline' | 'audio';
  completedAt: Date;
  totalPages: number;
  readingDurationDays: number;
}

export interface DeadlineStartedData {
  deadlineId: string;
  format: 'physical' | 'eDeadline' | 'audio';
  startedAt: Date;
  totalPages: number;
}

export interface DailyReadingSessionData {
  date: string; // YYYY-MM-DD format
  pagesRead: number;
  deadlinesRead: string[];
  sessionDurationMinutes: number;
}

export interface DeadlineSetAsideData {
  deadlineId: string;
  setAsideAt: Date;
  reason?: string;
}

// Core Event Interface
export interface AchievementEvent<T = any> {
  type: EventType;
  userId: string;
  timestamp: Date;
  data: T;
}

// Achievement Progress
export type AchievementProgress = Tables<'achievement_progress'>;
export type AchievementProgressInsert = TablesInsert<'achievement_progress'>;
export type AchievementProgressUpdate = Partial<AchievementProgressInsert> & { id: string };

// Achievement Configuration
export enum PersistenceType {
  CUMULATIVE = 'cumulative',    // Never resets (e.g., total pages read)
  SNAPSHOT = 'snapshot',        // Point-in-time value (e.g., current streak)
  TEMPORAL = 'temporal'         // Time-based reset (e.g., monthly goals)
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  calculatorFunction: string;
  subscribedEvents: EventType[];
  persistenceStrategy: PersistenceType;
  notificationPriority: 'high' | 'medium' | 'low';
  targetValue: number;
  category: 'volume' | 'consistency' | 'diversity' | 'social' | 'speed';
}

// Type aliases for Supabase tables
export type ReadingDeadline = Tables<'reading_deadlines'>;
export type ReadingDeadlineStatus = Tables<'reading_deadline_status'>;

// Enhanced deadline types for achievement system
export interface ActiveDeadline extends ReadingDeadline {
  reading_deadline_status?: ReadingDeadlineStatus[];
}

export interface CompletedDeadline extends ReadingDeadline {
  completed_at: string; // Ensure it's not null for completed deadlines
  reading_duration_days: number; // Ensure it's not null for completed deadlines
  reading_deadline_status: ReadingDeadlineStatus[];
}

// Achievement Subscriber Interface
export interface AchievementSubscriber {
  achievementId: string;
  achievementName: string;
  subscribedEvents: EventType[];
  
  handleEvent(event: AchievementEvent, recordId: string): Promise<void>;
  checkCriteria(recordId: string): Promise<AchievementProgress>;
}

// Event Publisher Types
export type EventCallback = (event: AchievementEvent) => void | Promise<void>;
export type UnsubscribeFunction = () => void;

// Achievement Notification
export interface AchievementNotification {
  achievementId: string;
  userId: string;
  title: string;
  message: string;
  unlockedAt: Date;
  priority: 'high' | 'medium' | 'low';
}