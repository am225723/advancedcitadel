import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brywmjhsrnebfmhrhlmi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeXdtamhzcm5lYmZtaHJobG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTQzNjQsImV4cCI6MjA3NTE5MDM2NH0.K6PpEHaJc3SGpmH-GrAM8OEQwdoIn_h62vT6HV8yJIg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);