// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { supabaseClient } from "../../src/utils/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;
  const { data, error } = await supabaseClient
    .from(WEDDINGS)
    .select()
    .eq("id", id);
  const { data: data1, error: error1 } = await supabaseClient
    .from(CHANNELS)
    .select()
    .eq("wedding_id", id);
  res.status(200).json({ data: { wedding: data?.[0], channels: data1 } });
}
