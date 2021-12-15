import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  "https://mfdjigekncmhpvibryiu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMzMzNTY1MywiZXhwIjoxOTQ4OTExNjUzfQ.v6-1w3xX1v5_iz-s80hKYkIuCv-UVgQnIYIs9nEJupU"
);
