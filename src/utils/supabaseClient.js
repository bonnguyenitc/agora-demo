import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  "https://mfdjigekncmhpvibryiu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzQ4MDc1OSwiZXhwIjoxOTQzMDU2NzU5fQ.9ZIhqP7-pN5kWZRU0XF1L6ZBGiS4aW0Wi09PkKEdAdg"
);
