# Video Downloader

A web-based media downloader built with **yt-dlp**, **FFmpeg** and a FastAPI backend.

**Repository:** https://github.com/Tezzaaaaaa/Video-Downloader  
**GitHub Pages frontend/demo:** https://tezzaaaaaa.github.io/Video-Downloader/

> **Deployment note:** GitHub Pages only serves static files. It cannot run the Python, yt-dlp or FFmpeg backend, so downloading requires the application to be deployed as a server/container. The full application is designed to run as one web service that serves the frontend and API together.

## How it works

1. Paste a public media URL.
2. The backend attempts to extract the media title, thumbnail and available formats.
3. Choose a supported video or MP3 output.
4. The backend downloads and post-processes the media, then returns the result.

Supported websites depend on the installed yt-dlp extractors and can change as websites change. A successful extraction attempt is the practical compatibility test.

## Features

- Web interface served by the application backend
- Metadata extraction and available-format selection
- Video downloads and MP3 audio extraction
- yt-dlp with FFmpeg/FFprobe post-processing
- Browser-compatible request handling, including optional `curl_cffi` support
- Site-specific retry paths for X/Twitter and XHamster when supported by the installed dependencies
- Health-check and API endpoints for deployment monitoring

## Requirements

- Python 3.10 or newer
- `yt-dlp[default,curl-cffi]`
- FFmpeg and FFprobe
- A supported JavaScript runtime for full YouTube support; the included Dockerfile installs Deno

## Run locally

1. Create a virtual environment:

   ```bash
   python -m venv .venv
   ```

2. Activate it:

   ```bash
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:

   ```bash
   python server.py
   ```

5. Open http://localhost:8000

## Docker

Build the image:

```bash
docker build -t video-downloader .
```

Run the container:

```bash
docker run --rm -p 8000:8000 video-downloader
```

## Deployment

The included `Dockerfile` and `render.yaml` describe the Docker-based deployment configuration. Connect the repository to a Docker-capable web-service host and deploy the full application. The frontend and backend should be served from the same origin so the frontend can make same-origin API requests.

- Health check: `GET /health`
- Metadata: `POST /api/info`
- Video: `POST /api/download`
- MP3 audio: `POST /api/audio`

A successful GitHub Pages deployment alone does **not** mean the download backend is running.

## X / Twitter and XHamster

The backend includes site-specific extraction fallback paths:

- X/Twitter URLs are normalized across `x.com`, `twitter.com` and mobile variants, then attempted through yt-dlp-supported extraction paths, with network retries where configured.
- XHamster extraction can retry ordinary requests, IPv4 and browser-impersonation paths when the installed yt-dlp networking dependencies support them.

These retries are best-effort compatibility measures. They do not guarantee extraction; platforms may change their APIs or impose authentication, anti-bot, geographic or age-verification restrictions.

## Privacy, permissions and restrictions

Use the downloader only for media you own or are permitted to download. It does not bypass DRM, private accounts, paywalls, login-only content or other access restrictions. When deploying a public instance, review the host's resource limits, access controls and applicable laws.

## Branding

The `favicon.svg` file is used for the browser-tab icon and the header logo.

## Project components

- `server.py` — web server and API
- `Index.html` — frontend page
- `Dockerfile` — container image configuration
- `render.yaml` — Render deployment configuration
