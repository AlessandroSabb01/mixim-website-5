# Création Virale Motion Studio (review artifact)

Live page: https://claude.ai/artifact/NLJtGQeCneh9ejxNtywKqs (private to Alessandro).

`src/` holds the page source; `python3 build.py` bundles it into `motion-studio.html`, which is what gets published
(Artifact tool, same file path keeps the URL; capabilities `db`, `assets`, `comments`, `downloads`, `user`).

## Data model (artifact database)

| Path | What |
|---|---|
| `projects/{pid}` | name, client, format, duration, status (`briefing` / `review`), `rules` (reread before every pass), `pipeline`, `brief` (from the Brief Builder), updatedAt |
| `projects/{pid}/versions/{vid}` | n, label, kind `video` or `frames`, assetId (review MP4, ≤15 MB), posterAssetId, spriteAssetId + spriteN + spriteFps (timeline filmstrip, one 72×128 thumb per beat), duration, fps, bpm, chapters `[{name,t0,t1}]`, notes, title, master (repo path), downloadName. A `frames` version carries `frames: [{t, assetId, label}]` instead of a video. |
| `projects/{pid}/comments/{cid}` | versionId, t (s), frame, beat, chapter, text, shapes (normalized vector marks: pen / arrow / rect), snapId (270×480 JPEG of the frame with the drawing), status `open` / `in_progress` / `resolved`, requestId, fixedIn (version that should fix it), claudeNote |
| `projects/{pid}/requests/{rid}` | type `corrections` / `brief` / `hooks`, status `sent` → `working` → `preview_ready` → `approved` → `done`, commentIds, note, text (the message Claude received), previewFrames `[{t, assetId, commentId, label}]`, claudeNote, changes, resultVersion. Viral kit: `hooks` (formula ids), `hookOptions` `[{id, name, formula, line, frames:[{assetId,t}], score, rec, note}]`, `hookPick`, `hookNote`, `shots` `[{id, prompt, kind video/image, status requested → quoted → approved → done / skipped, model, credits, assetId, note}]` |
| `styles/{sid}` | The style library: name, recipe (format, duration, styles, energy, music, sfx, trend, captions, hooks, story, beats, brand), posterAssetId, fromName, fromPid, fromVid, createdAt |

## How Claude answers a request (the page's "Send corrections", "Approve", "Generate 30 key frames")

The page posts a comment thread with `sendToClaude`, which wakes the watching session. Then:

1. Read `projects/{pid}` (rules!), the request, and its comments; look at each `snapId` image and `shapes`.
2. Set the request to `working`. Make the change in the film source (`film3/`, music, cues).
3. **Preview, never a render**: grab only the touched moments with `node render.mjs --film film3 --contact --skip-audio --strip a,b,step`,
   cut the frames, upload them as assets, write `previewFrames` + `claudeNote`, status `preview_ready`. Reply on each comment with `claudeNote`.
4. On `APPROVED`: render, encode the review copy (720×1280, ~3 Mbit/s, faststart), poster and filmstrip
   (`fps=2,scale=72:128,tile=Nx1`), upload, add `versions/v{n+1}`, set `fixedIn` on the comments, request `done` + `resultVersion`.
5. A brief: build the film, then post a `frames` version with 30 key frames (one per salient moment) and set the request `preview_ready`.
   The full render waits for approval.

## Viral kit (Hook lab, trend audio, AI footage, captions, style library)

- **Hook lab.** A brief carries `hooks` (formula ids); the "Hook lab" button on a video sends a `hooks` request. Build 5 alternative
  openings (first 2 s) in the film source, grab 3–4 frames each with `tools/keyframes.mjs`, upload them, and write `hookOptions`
  (set `rec: true` on your favourite, `score` 1–10) with status `preview_ready`. Nothing renders until `HOOK PICKED` arrives;
  then build that opening in (a `hooks` request: post `previewFrames`, `preview_ready`, and wait for `APPROVED`).
- **Trend-matched audio.** `brief.trend.on`: check current trending sounds (Higgsfield `tiktok_music_trending`) for tempo, drop
  timing and texture, then synthesize an original score in that style. Never put the trending recording itself in the film.
- **AI footage.** `shots` arrive as `requested`. Quote each one (`model`, `credits` from the Higgsfield quote) and set `quoted`.
  Generate only shots the page marks `approved` (the `FOOTAGE APPROVED` message), upload each result, set `assetId` + `done`.
- **Captions.** `brief.captions`: `wordpop` (default: big beat-synced words, brand colour on the key word), `meme`, `subtitle`, `none`.
- **Style library.** Pages write `styles/{sid}` themselves; "Use this style" loads the recipe into the Brief Builder.

Alessandro confirms fixes in the page (Check fix → Confirm fixed / Reopen); Claude never marks his comments resolved.
