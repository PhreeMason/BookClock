import { supabase } from "@/lib/supabase"
import { UserResource } from '@clerk/types'


export async function checkAndCreateProfile(user: UserResource) {
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.username,
          full_name: user.fullName,
          avatar_url: user.imageUrl,
        })
    }
  }