import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qhlxmdbvvqelgbyzpugt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobHhtZGJ2dnFlbGdieXpwdWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDQzNjIsImV4cCI6MjA5MjI4MDM2Mn0.0m75h76gjrkR9zADCrkw-0zsibI4qXGhM8PzlZdkSgk';

export const supabase = createClient(supabaseUrl, supabaseKey);
