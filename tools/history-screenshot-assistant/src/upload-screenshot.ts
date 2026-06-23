import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase.generated";
import type { ToolConfig } from "./config";
import type { HistorySourceJob } from "./query-sources";

export async function optimizeScreenshot(input: {
  pngBuffer: Buffer;
  maxWidth: number;
}): Promise<Buffer> {
  let quality = 82;
  let output = await renderJpeg(input.pngBuffer, input.maxWidth, quality);

  while (output.length > 1_000_000 && quality > 55) {
    quality -= 8;
    output = await renderJpeg(input.pngBuffer, input.maxWidth, quality);
  }

  return output;
}

export async function uploadScreenshot(input: {
  supabase: SupabaseClient<Database>;
  config: ToolConfig;
  source: HistorySourceJob;
  jpegBuffer: Buffer;
}): Promise<string> {
  const path = screenshotPath(input.source);
  const { error } = await input.supabase.storage
    .from(input.config.storageBucket)
    .upload(path, input.jpegBuffer, {
      contentType: "image/jpeg",
      upsert: input.config.force,
    });

  if (error) {
    throw new Error(`Screenshot upload failed: ${error.message}`);
  }

  const { data } = input.supabase.storage
    .from(input.config.storageBucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

function screenshotPath(source: HistorySourceJob) {
  return `history-sources/${source.history_id}/${source.source_id}.jpg`;
}

async function renderJpeg(
  pngBuffer: Buffer,
  maxWidth: number,
  quality: number
) {
  return await sharp(pngBuffer)
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
      mozjpeg: true,
    })
    .toBuffer();
}
