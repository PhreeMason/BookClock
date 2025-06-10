import { useEffect } from 'react';

export const useSyncAudioPercentage = ({ setValue, watch }: {
    setValue: any;
    watch: (name: string) => any;
}) => {

    const hours = watch('hours');
    const minutes = watch('minutes');
    const currentHours = watch('currentHours');
    const currentMinutes = watch('currentMinutes');

    useEffect(() => {
        const totalMinutes = (parseInt(hours || '0', 10) * 60) + parseInt(minutes || '0', 10);
        const newCurrentMinutes = (parseInt(currentHours || '0', 10) * 60) + parseInt(currentMinutes || '0', 10);

        // Avoid division by zero
        const percentage = totalMinutes > 0
            ? Math.round((newCurrentMinutes / totalMinutes) * 100)
            : 0;

        setValue('currentPercentage', percentage);
    }, [hours, minutes, currentHours, currentMinutes, setValue]);
};

