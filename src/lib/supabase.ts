import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cdeakrajjmjdrzbcrbjq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZWFrcmFqam1qZHJ6YmNyYmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzkwMDQsImV4cCI6MjA5MTE1NTAwNH0.QUUC0aNPbcg8ov0LAEH16qPUGkypXlo9PvC6B-R9zK8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
