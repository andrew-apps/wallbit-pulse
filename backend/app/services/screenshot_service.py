from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile


class ScreenshotService:
    async def capture_report(
        self,
        url: str,
        output_path: str | None = None,
        width: int = 1200,
        height: int = 800,
    ) -> str:
        try:
            from playwright.async_api import async_playwright
        except ImportError as exc:
            raise RuntimeError("Playwright is not installed. Run: python -m playwright install chromium") from exc

        if output_path is None:
            tmp = NamedTemporaryFile(delete=False, suffix=".png")
            output_path = tmp.name
            tmp.close()

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            page = await browser.new_page(
                viewport={"width": width, "height": height},
                device_scale_factor=2,
            )
            await page.goto(url, wait_until="networkidle")
            await page.screenshot(path=output_path, full_page=True)
            await browser.close()

        return str(Path(output_path))
