import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("sandboxes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, location, start_time, end_time, privacy } = body;

    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const { data: sandbox, error } = await supabaseAdmin
      .from("sandboxes")
      .insert({
        title,
        description: description || null,
        location: location || null,
        start_time: start_time || null,
        end_time: end_time || null,
        privacy: privacy || "private",
        owner_id: user.id,
        state: "active",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add creator as participant
    await supabaseAdmin.from("participants").insert({
      sandbox_id: sandbox.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json(sandbox);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
