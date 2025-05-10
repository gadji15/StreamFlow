import { createClient } from '@supabase/supabase-js'

// Charge les variables d'environnement (il faut les définir dans .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Vous devez définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans votre .env.local'
  )
}

// Crée et exporte le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
