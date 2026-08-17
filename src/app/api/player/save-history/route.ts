import { syncHistory } from "@/actions/histories";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const ContentTypeSchema = z.enum(["movie", "tv"]);
const PlayerEventTypeSchema = z.enum(["play", "pause", "seeked", "ended", "timeupdate"]);

/**
 * Schema mirrors UnifiedPlayerEventData + optional `completed` flag.
 * All fields that could be supplied by a browser sendBeacon payload are validated here
 * at the API route level, before the server action is invoked.
 */
const SaveHistoryBodySchema = z.object({
  event: PlayerEventTypeSchema,
  currentTime: z.number().finite().nonnegative(),
  duration: z.number().finite().nonnegative(),
  mediaId: z.union([z.string(), z.number()]),
  mediaType: ContentTypeSchema,
  season: z.number().int().nonnegative().optional(),
  episode: z.number().int().nonnegative().optional(),
  progress: z.number().min(0).max(1).optional(),
  completed: z.boolean().optional(),
});

export const POST = async (request: Request) => {
  try {
    // ── 1. Authentication guard ──────────────────────────────────────────────
    // Verify a valid session exists before doing any further work.
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to save history" },
        { status: 401 },
      );
    }

    // ── 2. Input validation ──────────────────────────────────────────────────
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = SaveHistoryBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
          // Only expose field-level errors in non-production environments
          ...(process.env.NODE_ENV !== "production" && {
            errors: parsed.error.flatten().fieldErrors,
          }),
        },
        { status: 400 },
      );
    }

    // ── 3. Delegate to the server action ────────────────────────────────────
    const { completed, ...historyData } = parsed.data;
    const res = await syncHistory(historyData, completed);

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
};
