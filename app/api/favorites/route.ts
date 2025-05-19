import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET: /api/favorites?userId=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ favorites: data });
}

// POST: /api/favorites
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, movieId } = body;
  if (!userId || !movieId) return NextResponse.json({ error: "Missing userId or movieId" }, { status: 400 });

  const { error } = await supabase
    .from("favorites")
    .insert([{ user_id: userId, movie_id: movieId }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE: /api/favorites
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { userId, movieId } = body;
  if (!userId || !movieId) return NextResponse.json({ error: "Missing userId or movieId" }, { status: 400 });

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}