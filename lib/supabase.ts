import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);