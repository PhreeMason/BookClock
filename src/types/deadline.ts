import {
    Tables,
    TablesInsert,
    TablesUpdate
} from '@/types/supabase';

export type ReadingDeadline = Tables<'reading_deadlines'>;
export type ReadingDeadlineInsert = TablesInsert<'reading_deadlines'>;
export type ReadingDeadlineUpdate = TablesUpdate<'reading_deadlines'>;

export type ReadingDeadlineProgressInsert = TablesInsert<'reading_deadline_progress'>;
export type ReadingDeadlineProgress = Tables<'reading_deadline_progress'>;

// Type for reading deadline with progress - matches the actual data structure from useGetDeadlines
export type ReadingDeadlineWithProgress = ReadingDeadline & {
    progress: ReadingDeadlineProgress[];
};

export type ReadingDeadlineInsertWithProgress = ReadingDeadlineInsert & {
    progress?: ReadingDeadlineProgressInsert[];
};
