// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { supabaseClient } from "../../src/utils/supabaseClient";

export default async function handler(req, res) {
  const { data, error } = await supabaseClient
    .from("user_streaming")
    .select()
    .neq("token", null)
    .order("id", { ascending: false });
  res.status(200).json({ data: data || [] });
}
