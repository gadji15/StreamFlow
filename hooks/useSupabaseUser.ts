import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

export default function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    unsubscribe = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    }).data?.subscription?.unsubscribe;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [supabase]);

  return user;
}