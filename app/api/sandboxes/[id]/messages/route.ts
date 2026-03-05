import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({ sandbox_id: params.id, user_id: user.id, content: content.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("sandbox_id", params.id)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
