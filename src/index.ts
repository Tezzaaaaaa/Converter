import { DurableObject } from "cloudflare:workers";

const PORT = 8000;
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

interface Env {
  VIDEO_DOWNLOADER: DurableObjectNamespace<VideoDownloaderContainer>;
}

export class VideoDownloaderContainer extends DurableObject<Env> {
  private starting: Promise<void> | undefined;

  async fetch(request: Request): Promise<Response> {
    this.starting ??= this.startAndWaitForPort().finally(() => {
      this.starting = undefined;
    });
    await this.starting;

    const url = new URL(request.url);
    url.protocol = "http:";
    url.host = "container";
    const forwarded = new Request(url, request);
    forwarded.headers.delete("host");

    return this.ctx.container!.getTcpPort(PORT).fetch(forwarded);
  }

  private async startAndWaitForPort(): Promise<void> {
    const container = this.ctx.container!;

    if (!container.running) {
      container.start({
        image: container.images.base,
        instance: "lite",
        enableInternet: true,
      });
    }

    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);

    const port = container.getTcpPort(PORT);
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const response = await port.fetch("http://container/health", {
          signal: AbortSignal.timeout(1000),
        });
        await response.body?.cancel();
        if (response.ok) return;
      } catch {
        // The API server may still be starting.
      }
      await scheduler.wait(200);
    }

    throw new Error("Video Downloader container did not become ready on port 8000.");
  }
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return env.VIDEO_DOWNLOADER.getByName("video-downloader").fetch(request);
  },
} satisfies ExportedHandler<Env>;
