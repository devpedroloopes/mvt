import { createClient } from '@supabase/supabase-js';

// Substitua pelos dados do seu Supabase
const supabaseUrl = 'https://miacxmyvqaqjdgzpkmts.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pYWN4bXl2cWFxamRnenBrbXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MjcxMzQsImV4cCI6MjA0OTAwMzEzNH0.j38dwR1eSBMN2Orp20Mfgm64LuEWLZ-6GfVbs8GY3Pc';

// Cria o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
