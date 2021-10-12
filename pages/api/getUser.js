// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { supabaseClient } from "../../src/utils/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;
  const { data, error } = await supabaseClient
    .from("users")
    .select()
    .eq("id", id);
  res.status(200).json({ data: data || [] });
}
