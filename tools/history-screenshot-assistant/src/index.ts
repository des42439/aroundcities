import { createBrowser, capturePageScreenshot } from "./capture-page";
import { createSupabaseAdmin, loadConfig } from "./config";
import { querySources } from "./query-sources";
import {
  optimizeScreenshot,
  uploadScreenshot,
} from "./upload-screenshot";
import {
  markScreenshotCompleted,
  markScreenshotFailed,
  updateHistoryStatusIfReady,
} from "./update-source";

type Summary = {
  processed: number;
  completed: number;
  failed: number;
  movedToPendingReview: Set<string>;
};

async function main() {
  const config = loadConfig();
  const supabase = createSupabaseAdmin(config);
  const sources = await querySources(supabase, config);
  const summary: Summary = {
    processed: 0,
    completed: 0,
    failed: 0,
    movedToPendingReview: new Set<string>(),
  };

  console.log(`Found ${sources.length} source${sources.length === 1 ? "" : "s"} to process.`);

  if (config.dryRun) {
    for (const [index, source] of sources.entries()) {
      console.log(
        `[${index + 1}/${sources.length}] Would capture: ${source.source_title || source.source_url}`
      );
      console.log(`    ${source.source_url}`);
    }
    console.log("Dry run complete. No pages opened, uploads made, or rows updated.");
    return;
  }

  if (!sources.length) {
    printSummary(summary);
    return;
  }

  const browser = await createBrowser();

  try {
    for (const [index, source] of sources.entries()) {
      summary.processed += 1;
      console.log(
        `[${index + 1}/${sources.length}] Capturing: ${source.source_title || source.source_url}`
      );
      console.log(`    ${source.source_url}`);

      try {
        const pngBuffer = await capturePageScreenshot({
          browser,
          url: source.source_url,
          timeoutMs: config.screenshotTimeoutMs,
        });
        const jpegBuffer = await optimizeScreenshot({
          pngBuffer,
          maxWidth: config.maxScreenshotWidth,
        });
        const publicUrl = await uploadScreenshot({
          supabase,
          config,
          source,
          jpegBuffer,
        });

        await markScreenshotCompleted({
          supabase,
          sourceId: source.source_id,
          screenshotUrl: publicUrl,
        });

        summary.completed += 1;
        console.log(`Success: uploaded screenshot (${Math.round(jpegBuffer.length / 1024)} KB)`);

        const moved = await updateHistoryStatusIfReady({
          supabase,
          historyId: source.history_id,
        });

        if (moved) {
          summary.movedToPendingReview.add(source.history_id);
          console.log("History record moved to pending_review.");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown screenshot error.";
        summary.failed += 1;
        console.log(`Failed: ${message}`);

        try {
          await markScreenshotFailed({
            supabase,
            sourceId: source.source_id,
            errorMessage: message,
          });
        } catch (updateError) {
          console.log(
            `Failed to save error status: ${
              updateError instanceof Error
                ? updateError.message
                : "Unknown database update error."
            }`
          );
        }
      }
    }
  } finally {
    await browser.close();
  }

  printSummary(summary);
}

function printSummary(summary: Summary) {
  console.log("");
  console.log("Summary:");
  console.log(`Processed: ${summary.processed}`);
  console.log(`Completed: ${summary.completed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(
    `History records moved to pending_review: ${summary.movedToPendingReview.size}`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
