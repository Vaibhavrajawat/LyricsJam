const supabaseUrl = "https://xglcnhlrcvzagrfuivyd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnbGNuaGxyY3Z6YWdyZnVpdnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzQxMjEsImV4cCI6MjA2NjAxMDEyMX0.VUf-aLUojwHsP2uceP5_aB5uk31QFrjUiz0Uprrm8P4";

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized:", supabase);
