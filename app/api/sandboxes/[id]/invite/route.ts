import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role = "contributor" } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { id: sandboxId } = params;

    // Look up the user by email via admin API
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: "Failed to look up user" }, { status: 500 });

    const invitee = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!invitee) {
      return NextResponse.json(
        { error: "No account found for that email. They need to sign up first." },
        { status: 404 }
      );
    }

    // Check if already a participant
    const { data: existing } = await supabaseAdmin
      .from("participants")
      .select("id")
      .eq("sandbox_id", sandboxId)
      .eq("user_id", invitee.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already a participant" }, { status: 409 });
    }

    // Add as participant
    const { data, error } = await supabaseAdmin
      .from("participants")
      .insert({ sandbox_id: sandboxId, user_id: invitee.id, role })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, participant: data, email: invitee.email });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
