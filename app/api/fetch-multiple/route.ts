import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// API POST /api/fetch-multiple
// Body: { requests: [ { table: "films", ids: [...] }, ... ] }
// Response: { films: [...], episodes: [...], series: [...], errors?: {...} }

export async function POST(req: NextRequest) {
  try {
    const { requests } = await req.json();
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({ error: "Body mal formé : requests[] attendu" }, { status: 400 });
    }

    const allowedTables = ["films", "episodes", "series"];
    const result: Record<string, any[]> = {};
    const errors: Record<string, string> = {};

    await Promise.all(requests.map(async ({ table, ids }) => {
      if (!table || !Array.isArray(ids) || ids.length === 0) {
        errors[table || "unknown"] = "Table ou ids manquants";
        result[table] = [];
        return;
      }
      if (!allowedTables.includes(table)) {
        errors[table] = "Table non autorisée";
        result[table] = [];
        return;
      }
      const { data, error } = await supabase.from(table).select("*").in("id", ids);
      if (error) {
        errors[table] = error.message;
        result[table] = [];
      } else {
        result[table] = data || [];
      }
    }));

    return NextResponse.json({ ...result, errors: Object.keys(errors).length > 0 ? errors : undefined });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur ou JSON invalide" }, { status: 500 });
  }
}