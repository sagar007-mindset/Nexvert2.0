---
name: convert-audio-and-video
description: Convert between MP4, MOV, WEBM, MP3, WAV and other audio/video formats, trim clips, extract audio from video, and make GIFs. Use for media format and size problems.
---

# Converting audio and video

## Video formats

| Format | Use |
|---|---|
| **MP4** (H.264) | the safe default — plays essentially everywhere |
| **WEBM** (VP9) | smaller at the same quality, web-focused, less universal |
| **MOV** | Apple's container; often just H.264 inside, renamed |

MOV to MP4 is frequently a container change rather than a re-encode, so it is fast and lossless.
Converting *between codecs* always re-encodes and always loses some quality.

## Audio formats

| Format | Use |
|---|---|
| **MP3** | universal compatibility; 192-320 kbps for music, 96-128 kbps for speech |
| **WAV** | uncompressed, large, correct choice for editing and mastering |
| **M4A/AAC** | better than MP3 at the same bitrate; Apple ecosystem default |
| **OGG/Opus** | best quality per byte, excellent for voice, less universal |

Converting MP3 to WAV does not restore quality. It decompresses to a larger file containing
exactly the data the MP3 kept. Useful before editing, pointless for listening.

## Common tasks

**Extracting audio from video.** A lecture, interview or podcast recorded as video becomes a far
smaller audio file. Choose MP3 at 128 kbps for speech.

**Trimming.** Cutting start and end points with a stream copy avoids re-encoding entirely, so
there is no quality loss and it completes almost instantly. Prefer it when you only need to cut.

**Video to GIF.** GIFs are limited to 256 colours and are enormous compared with video. Keep
clips under ~5 seconds, drop the frame rate to 10-15 fps and reduce the dimensions, or the file
will be many megabytes.

**Muting.** Removing an audio track does not require re-encoding the video.

## Expect this to be slow

Video processing is genuinely demanding. A long or high-resolution file can take minutes and
will use substantial memory — more so in a browser than in a native application. Large video
work is more comfortable on a desktop than a phone.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [MOV to MP4](https://nexvert.online/mov-to-mp4/) — usually a fast container change
- [Video to MP3](https://nexvert.online/video-to-mp3/) — extract the audio track
- [Trim video](https://nexvert.online/video-trimmer/) — stream copy, lossless
- [Video to GIF](https://nexvert.online/video-to-gif/) — frame rate and size controls
- [WAV to MP3](https://nexvert.online/wav-to-mp3/) — choose your bitrate
- [Mute video](https://nexvert.online/mute-video/) — drop the audio, no re-encode

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
