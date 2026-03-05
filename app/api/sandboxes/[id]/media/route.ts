import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, url, caption } = body;

    const { data: mediaItem, error } = await supabaseAdmin
      .from("media_items")
      .insert({
        sandbox_id: id,
        owner_id: userId,
        type,
        url,
        caption: caption || null,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Media creation error:", error);
      return NextResponse.json({ error: "Failed to create media item" }, { status: 500 });
    }

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: mediaItems, error } = await supabaseAdmin
      .from("media_items")
      .select("*")
      .eq("sandbox_id", id)
      .order("timestamp", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
    }

    return NextResponse.json(mediaItems || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
