# Form Architecture

The app uses a modular form architecture for complex multi-step forms.

## Form Components (`src/components/forms/`)

- **`FormProgressBar`** - Visual progress indicator for multi-step forms
- **`StepIndicators`** - Step dots showing current position
- **`FormHeader`** - Header with back/skip navigation
- **`FormatSelector`** - Chip-based format selection (physical/ebook/audio)
- **`SourceSelector`** - Chip-based source selection (ARC/library/personal)
- **`PrioritySelector`** - Card-based priority selection (flexible/strict)
- **`DeadlineFormStep1`** - First step: book details and format
- **`DeadlineFormStep2`** - Second step: deadline, progress, and flexibility settings

## Specialized Input Components (`src/components/progress/`)

- **`ProgressInput`** - Router component for format-specific progress inputs
- **`AudiobookProgressInput`** - Specialized time input for audiobook formats with comprehensive parsing

## Form Utilities (`src/lib/`)

- **`deadlineFormSchema.ts`** - Zod schema and TypeScript types for form validation
- **`deadlineCalculations.ts`** - Utility functions for reading time and pace calculations

## Best Practices for Forms

1. **Component Separation**: Each form step should be a separate component
2. **Schema Centralization**: Define Zod schemas in `src/lib/` for reusability
3. **Utility Extraction**: Move calculation logic to dedicated utility files
4. **Type Safety**: Use TypeScript interfaces for all form data
5. **Consistent Styling**: Reuse form styles across components

## Example Form Implementation

```typescript
// Main form component
import { DeadlineFormStep1, DeadlineFormStep2 } from '@/components/forms';
import { deadlineFormSchema, DeadlineFormData } from '@/lib/deadlineFormSchema';
import { calculateRemaining, getPaceEstimate } from '@/lib/deadlineCalculations';

const MyForm = () => {
  const { control, watch } = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema)
  });
  
  return (
    <View>
      {currentStep === 1 ? (
        <DeadlineFormStep1 
          control={control}
          selectedFormat={format}
          selectedSource={source}
          onFormatChange={handleFormatChange}
          onSourceChange={handleSourceChange}
        />
      ) : (
        <DeadlineFormStep2 
          control={control}
          selectedFormat={format}
          selectedPriority={priority}
          onPriorityChange={handlePriorityChange}
          showDatePicker={showDatePicker}
          onDatePickerToggle={() => setShowDatePicker(true)}
          onDateChange={onDateChange}
          deadline={watchedValues.deadline}
          paceEstimate={paceEstimate}
          watchedValues={watchedValues}
        />
      )}
    </View>
  );
};
```

## Form Step Details

### DeadlineFormStep1
**Props:**
- `control`: React Hook Form control object
- `selectedFormat`: Current format selection ('physical' | 'ebook' | 'audio')
- `selectedSource`: Current source selection ('arc' | 'library' | 'personal')
- `onFormatChange`: Callback for format changes
- `onSourceChange`: Callback for source changes

**Features:**
- Book title input
- Format selection (physical/ebook/audio)
- Source selection (ARC/library/personal)
- Total quantity input (pages for physical/ebook, time for audio)
- Helper text for user guidance

### DeadlineFormStep2
**Props:**
- `control`: React Hook Form control object
- `selectedFormat`: Current format selection ('physical' | 'ebook' | 'audio')
- `selectedPriority`: Current priority selection ('flexible' | 'strict')
- `onPriorityChange`: Callback for priority changes
- `showDatePicker`: Boolean to control date picker visibility
- `onDatePickerToggle`: Callback to toggle date picker
- `onDateChange`: Callback for date selection
- `deadline`: Current deadline date
- `paceEstimate`: Calculated pace estimate string
- `watchedValues`: All form values for summary display

**Features:**
- Deadline date selection with inline picker
- Progress tracking (pages read or minutes listened)
- Deadline flexibility settings
- Author information (optional)
- Real-time pace estimates
- Form summary card

## Adding New Forms

1. Create form schema in `src/lib/`
2. Extract calculation utilities if needed
3. Create form step components in `src/components/forms/`
4. Update `src/components/forms/index.ts` with new exports
5. Implement main form component using the modular pattern 