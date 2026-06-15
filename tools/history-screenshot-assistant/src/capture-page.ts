import { chromium, type Browser } from "playwright";

export async function createBrowser() {
  return await chromium.launch({
    headless: true,
  });
}

export async function capturePageScreenshot(input: {
  browser: Browser;
  url: string;
  timeoutMs: number;
}): Promise<Buffer> {
  const page = await input.browser.newPage({
    viewport: {
      width: 1365,
      height: 900,
    },
  });

  try {
    await page.goto(input.url, {
      waitUntil: "domcontentloaded",
      timeout: input.timeoutMs,
    });

    try {
      await page.waitForLoadState("networkidle", {
        timeout: Math.min(10_000, input.timeoutMs),
      });
    } catch {
      // Some pages never become fully idle; capture the loaded DOM anyway.
    }

    return await page.screenshot({
      fullPage: true,
      type: "png",
      timeout: input.timeoutMs,
    });
  } finally {
    await page.close();
  }
}
