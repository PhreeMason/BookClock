# Achievement System Documentation

## Overview

The reading app includes a comprehensive achievement system designed to motivate users and track meaningful reading milestones. The system supports multiple achievement categories with a focus on reading consistency and streak tracking.

## Architecture

### Core Components

#### `AchievementCalculator` (`src/services/achievementCalculator.ts`)
- **Purpose**: Centralized calculation logic for all achievement types
- **Key Features**:
  - Efficient streak calculation supporting up to 3 years of data
  - Distinguishes between current vs historical streaks
  - Handles edge cases (gaps, corrections, multiple daily entries)
  - Modular design allowing easy addition of new achievement types

#### `AchievementService` (`src/services/achievementService.ts`)
- **Purpose**: Database management and achievement unlocking
- **Key Features**:
  - Dynamic achievement loading from database
  - Automatic unlock checking and progress tracking
  - No code changes needed when adding new achievements to database
  - Comprehensive progress metadata storage

### Database Schema

#### `achievements` Table
```sql
- id: string (unique identifier)
- title: string (display name)
- description: string (achievement description)
- icon: string (SF Symbol icon name)
- category: string (must be: 'reading', 'consistency', 'volume', 'speed', 'exploration', 'social')
- type: string (must be: 'count', 'streak', 'percentage', 'boolean', 'time_based', 'custom')
- criteria: JSON (achievement criteria and targets)
- color: string (hex color code for UI)
- sort_order: number (display ordering)
- is_active: boolean (whether achievement is active)
```

#### `user_achievements` Table
- Tracks which achievements users have unlocked
- Stores unlock timestamp and progress data

#### `achievement_progress` Table
- Detailed progress tracking for all achievements
- Updated whenever user reading data changes

## Current Achievement Types

### Streak Achievements (Category: 'consistency')

All streak achievements track consecutive days of reading activity and use the user's maximum historical streak for progress calculation.

| Achievement ID | Title | Target (Days) | Color | Icon |
|---------------|-------|---------------|-------|------|
| `consistency_champion` | Consistency Champion | 7 | - | - |
| `dedicated_reader` | Dedicated Reader | 25 | #FF6B6B | book.fill |
| `reading_habit_master` | Reading Habit Master | 50 | #4ECDC4 | trophy.fill |
| `reading_champion` | Reading Champion | 75 | #FFE66D | medal.circle.fill |
| `century_reader` | Century Reader | 100 | #45B7D1 | crown.fill |
| `half_year_scholar` | Half-Year Scholar | 180 | #F7B7A3 | medal.fill |
| `year_long_scholar` | Year-Long Scholar | 365 | #96CEB4 | star.fill |
| `reading_hero` | Reading Hero | 500 | #FF9F1C | shield.fill |
| `reading_myth` | Reading Myth | 750 | #FF6F61 | flame.fill |
| `reading_legend` | Reading Legend | 1000 | #FECA57 | diamond.fill |

#### Streak Calculation Logic

**Current Streak** (used by `consistency_champion`):
- Counts consecutive days from today backwards
- Stops at first gap in reading activity
- Allows for today to not have reading yet (doesn't break on first day)

**Historical Max Streak** (used by milestone achievements):
- Calculates the longest consecutive reading streak ever achieved
- Scans all reading dates chronologically
- More forgiving for achievement unlocking (uses best performance)

### Other Achievement Categories

The system architecture supports additional achievement types:

- **Reading Goals** (`ambitious_reader`, `page_turner`)
- **Format Exploration** (`format_explorer`)
- **Speed Reading** (`speed_reader`)
- **Audio Listening** (`marathon_listener`)
- **Library Usage** (`library_warrior`)
- **Early Completion** (`early_finisher`)

## Adding New Achievements

### 1. Database Migration

Create new achievement records in the `achievements` table:

```sql
INSERT INTO achievements (id, title, description, icon, category, type, criteria, color, sort_order, is_active) 
VALUES 
('new_achievement_id', 'Achievement Title', 'Description text', 'icon.name', 'consistency', 'streak', 
 '{"target": 50, "type": "max_streak"}', '#FF6B6B', 200, true);
```

### 2. Calculator Implementation

Add the achievement case to `AchievementCalculator`:

```typescript
// In calculateProgress() switch statement
case 'new_achievement_id':
    return this.calculateNewAchievement(criteria);

// Add calculation method
private calculateNewAchievement(criteria: any): AchievementProgress {
    const target = criteria.target || 50;
    // Implement calculation logic
    return {
        current: calculatedValue,
        max: target,
        percentage: Math.min((calculatedValue / target) * 100, 100),
        achieved: calculatedValue >= target
    };
}
```

### 3. Testing

Create comprehensive tests covering:

```typescript
describe('New Achievement Tests', () => {
    it('should achieve target when criteria met', () => {
        // Test achievement unlock conditions
    });
    
    it('should handle edge cases', () => {
        // Test gaps, corrections, boundary conditions
    });
    
    it('should work with sample data', () => {
        // Test with real user data
    });
});
```

## Performance Considerations

### Streak Calculation Optimization

- **Efficient Date Processing**: Uses dayjs for fast date operations
- **Limited History**: Checks up to 3 years (1095 days) for current streak
- **Set-based Lookups**: Uses Set for O(1) date existence checks
- **Single Pass Algorithm**: Calculates both current and max streaks in one iteration

### Database Efficiency

- **Batch Updates**: Achievement progress updated in batches
- **Lazy Loading**: Achievements loaded only when needed
- **Cached Calculations**: Results cached during user session

## Testing Strategy

### Unit Tests (`achievementCalculator.test.ts`)
- Individual achievement calculation testing
- Edge case coverage (gaps, single days, no data)
- Achievement progression verification
- Mock data scenarios

### Integration Tests (`achievementCalculator.sampleData.test.ts`)
- Real sample data validation
- Streak detection accuracy
- Cross-achievement consistency
- Reading activity pattern analysis

### Test Data Requirements

All achievement tests should include:
- ✅ Target achievement scenarios
- ✅ Near-miss scenarios (target - 1)
- ✅ Edge cases (no data, gaps, corrections)
- ✅ Sample data validation
- ✅ Performance verification

## Troubleshooting

### Common Issues

**Achievement Not Unlocking**
1. Check database constraints (category, type values)
2. Verify achievement calculation logic
3. Confirm progress data is recent enough
4. Check for calculation errors in logs

**Performance Issues**
1. Verify streak calculation isn't processing too much historical data
2. Check for inefficient database queries
3. Monitor achievement service update frequency

**Test Failures**
1. Ensure sample data is current and valid
2. Check for timezone-related date issues
3. Verify mock data matches expected format

## Future Enhancements

### Planned Achievement Categories

- **Social Achievements**: Friend interactions, recommendations
- **Goal Achievement**: Custom reading targets, monthly goals
- **Exploration Achievements**: Genre diversity, author discovery
- **Speed Achievements**: Reading velocity milestones

### System Improvements

- **Real-time Updates**: Live achievement unlocking notifications
- **Leaderboards**: Community achievement comparison
- **Custom Achievements**: User-defined achievement targets
- **Achievement Analytics**: Progress insights and trends

## Code Examples

### Adding a New Streak Achievement

```typescript
// 1. Add to switch statement
case 'reading_master':
    return this.calculateReadingMaster(criteria);

// 2. Implement calculation
private calculateReadingMaster(criteria: any): AchievementProgress {
    const target = criteria.target || 200;
    const { maxStreak } = this.calculateReadingStreak();
    const current = Math.min(maxStreak, target);
    
    return {
        current,
        max: target,
        percentage: Math.min((current / target) * 100, 100),
        achieved: current >= target
    };
}

// 3. Add database record
INSERT INTO achievements (id, title, description, icon, category, type, criteria, color, sort_order, is_active) 
VALUES ('reading_master', 'Reading Master', 'Achieve 200 consecutive days of reading', 
        'star.circle.fill', 'consistency', 'streak', '{"target": 200, "type": "max_streak"}', 
        '#9B59B6', 135, true);
```

### Testing New Achievement

```typescript
it('should achieve reading master at 200 days', () => {
    const readingDates = Array.from({ length: 200 }, (_, i) => 
        dayjs().subtract(199 - i, 'day').format('YYYY-MM-DD')
    );
    
    const context = createMockContext(readingDates);
    const calculator = new AchievementCalculator(context);
    const achievement = createMockAchievement('reading_master', 200);
    
    const result = calculator.calculateProgress(achievement);
    
    expect(result.achieved).toBe(true);
    expect(result.current).toBe(200);
    expect(result.percentage).toBe(100);
});
```