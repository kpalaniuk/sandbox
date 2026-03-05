import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; mediaId: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get the media item to find the storage path
    const { data: media, error: fetchError } = await supabaseAdmin
      .from("media_items")
      .select("*")
      .eq("id", params.mediaId)
      .single();

    if (fetchError || !media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete from storage if it's a real Supabase Storage URL
    if (media.url?.includes("/sandbox-media/")) {
      const path = media.url.split("/sandbox-media/")[1]?.split("?")[0];
      if (path) {
        await supabaseAdmin.storage.from("sandbox-media").remove([decodeURIComponent(path)]);
      }
    }

    // Delete DB record
    const { error } = await supabaseAdmin
      .from("media_items")
      .delete()
      .eq("id", params.mediaId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
