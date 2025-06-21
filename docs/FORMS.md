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
- **`DeadlineFormStep2`** - Second step: deadline and progress

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
import { calculateRemaining, getReadingEstimate } from '@/lib/deadlineCalculations';

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
          onFormatChange={handleFormatChange}
        />
      ) : (
        <DeadlineFormStep2 
          control={control}
          selectedFormat={format}
          onPriorityChange={handlePriorityChange}
        />
      )}
    </View>
  );
};
```

## Adding New Forms

1. Create form schema in `src/lib/`
2. Extract calculation utilities if needed
3. Create form step components in `src/components/forms/`
4. Update `src/components/forms/index.ts` with new exports
5. Implement main form component using the modular pattern 