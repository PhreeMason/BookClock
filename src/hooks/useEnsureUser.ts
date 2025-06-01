import { checkAndCreateProfile } from '@/services/user';
import { useUser } from '@clerk/clerk-expo';
import { useMutation } from '@tanstack/react-query';

export function useEnsureProfile() {
    const { user, isLoaded } = useUser()

    return useMutation({
        mutationFn: async () => {
            if (!user || !isLoaded)return null;
            return checkAndCreateProfile(user)
        },
    })
}

