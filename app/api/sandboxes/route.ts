import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, privacy, start_time, end_time, location } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create sandbox
    const { data: sandbox, error: sandboxError } = await supabaseAdmin
      .from("sandboxes")
      .insert({
        title,
        description: description || null,
        owner_id: userId,
        privacy: privacy || "private",
        start_time: start_time || null,
        end_time: end_time || null,
        location: location || null,
        state: "active",
      })
      .select()
      .single();

    if (sandboxError) {
      console.error("Sandbox creation error:", sandboxError);
      return NextResponse.json({ error: "Failed to create sandbox" }, { status: 500 });
    }

    // Add creator as owner participant
    const { error: participantError } = await supabaseAdmin
      .from("participants")
      .insert({
        sandbox_id: sandbox.id,
        user_id: userId,
        role: "owner",
      });

    if (participantError) {
      console.error("Participant creation error:", participantError);
      // Sandbox created but participant failed - could clean up or continue
    }

    return NextResponse.json({ id: sandbox.id, ...sandbox });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sandboxes where user is a participant
    const { data: participants } = await supabaseAdmin
      .from("participants")
      .select("sandbox_id")
      .eq("user_id", userId);

    if (!participants || participants.length === 0) {
      return NextResponse.json([]);
    }

    const sandboxIds = participants.map((p) => p.sandbox_id);

    const { data: sandboxes, error } = await supabaseAdmin
      .from("sandboxes")
      .select("*")
      .in("id", sandboxIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch sandboxes" }, { status: 500 });
    }

    return NextResponse.json(sandboxes || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
