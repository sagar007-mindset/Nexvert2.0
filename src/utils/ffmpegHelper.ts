/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { FFmpeg } from '@ffmpeg/ffmpeg';

export interface FFmpegLoadProgress {
  received: number;
  total: number;
  ratio: number;
  stage: string;
}

export interface VideoStreamInfo {
  codec: string;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  duration?: number;
  aspectRatio?: string;
}

export interface AudioStreamInfo {
  codec: string;
  channels?: number;
  sampleRate?: number;
  bitrate?: number;
}

export interface VideoMetadata {
  filename: string;
  filesize: number;
  formatName: string;
  duration: number;
  overallBitrate: number;
  video?: VideoStreamInfo;
  audio?: AudioStreamInfo;
  rawJson?: any;
}

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Lazy loads FFmpeg with local core files hosted in /ffmpeg/
 * Reports real download progress for the ~31MB core wasm.
 */
async function loadFFmpegOnce(
  onProgress?: (progress: FFmpegLoadProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      onProgress?.({
        received: 0,
        total: 32500000,
        ratio: 0,
        stage: 'Initializing video engine loader...',
      });

      // Lazy load modules only when requested
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      onProgress?.({
        received: 0,
        total: 32500000,
        ratio: 0.01,
        stage: 'Loading core scripts (~110 KB)...',
      });

      const coreURL = await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript');

      onProgress?.({
        received: 110000,
        total: 32500000,
        ratio: 0.05,
        stage: 'Downloading WebAssembly video engine (~31 MB, one-time local download)...',
      });

      const wasmURL = await toBlobURL(
        '/ffmpeg/ffmpeg-core.wasm',
        'application/wasm',
        true,
        (progressEv) => {
          const received = progressEv.received || 0;
          const total = progressEv.total > 0 ? progressEv.total : 32500000;
          const ratio = Math.min(1, received / total);
          onProgress?.({
            received,
            total,
            ratio,
            stage: `Downloading video engine: ${(received / (1024 * 1024)).toFixed(1)} MB / ${(total / (1024 * 1024)).toFixed(1)} MB (${Math.round(ratio * 100)}%)`,
          });
        }
      );

      onProgress?.({
        received: 32500000,
        total: 32500000,
        ratio: 0.99,
        stage: 'Compiling WebAssembly video engine in browser memory...',
      });

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      onProgress?.({
        received: 32500000,
        total: 32500000,
        ratio: 1,
        stage: 'Video engine ready',
      });

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (err) {
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

/**
 * Loads the video engine, retrying up to twice: the ~31 MB wasm download can fail on flaky
 * mobile or proxy connections, and a retry is far better than a dead tool.
 */
export async function getFFmpeg(
  onProgress?: (progress: FFmpegLoadProgress) => void
): Promise<FFmpeg> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await loadFFmpegOnce(onProgress);
    } catch (err) {
      lastError = err;
      if (attempt < 2) onProgress?.({ received: 0, total: 32500000, ratio: 0, stage: `Connection problem — retrying video engine download (${attempt + 1}/2)...` });
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
}

/**
 * Safely removes a file from ffmpeg's virtual filesystem
 */
export async function safeUnlink(ffmpeg: FFmpeg, path: string) {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // ignore unlink error
  }
}

/**
 * Executes an FFmpeg command with progress tracking and logging
 */
export async function execFFmpeg(
  ffmpeg: FFmpeg,
  args: string[],
  options?: {
    onProgress?: (progress: number, timeSec?: number) => void;
    onLog?: (message: string) => void;
  }
): Promise<number> {
  const handleLog = ({ message }: { message: string }) => {
    if (options?.onLog) {
      options.onLog(message);
    }
  };

  const handleProgress = ({ progress, time }: { progress: number; time: number }) => {
    if (options?.onProgress) {
      // Progress from ffmpeg is 0..1
      options.onProgress(Math.max(0, Math.min(1, progress)), time / 1000000);
    }
  };

  ffmpeg.on('log', handleLog);
  ffmpeg.on('progress', handleProgress);

  try {
    const exitCode = await ffmpeg.exec(args);
    return exitCode;
  } finally {
    ffmpeg.off('log', handleLog);
    ffmpeg.off('progress', handleProgress);
  }
}

/**
 * Fallback metadata reader: `ffmpeg -i file` prints the stream summary to its log. Parse it
 * into the same shape ffprobe's JSON uses so callers don't need to care which path ran.
 */
async function probeFromFfmpegLog(ffmpeg: FFmpeg, inputName: string): Promise<any> {
  const lines: string[] = [];
  await execFFmpeg(ffmpeg, ['-hide_banner', '-i', inputName], { onLog: (m) => lines.push(m) });
  const log = lines.join('\n');

  const toSeconds = (h: string, m: string, s: string) => Number(h) * 3600 + Number(m) * 60 + Number(s);
  const dur = log.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  const bitrate = log.match(/Duration:[^\n]*bitrate:\s*(\d+)\s*kb\/s/);
  const format = log.match(/Input #0,\s*([^,]+(?:,[^,]+)*?),\s*from/);
  const streams: any[] = [];

  const video = log.match(/Stream #\d+:\d+[^:]*:\s*Video:\s*([a-z0-9_]+)[^\n]*/i);
  if (video) {
    const line = video[0];
    const size = line.match(/,\s*(\d{2,5})x(\d{2,5})/);
    const fps = line.match(/([\d.]+)\s*fps/);
    const vbr = line.match(/(\d+)\s*kb\/s/);
    const dar = line.match(/DAR\s*(\d+:\d+)/);
    streams.push({
      codec_type: 'video',
      codec_name: video[1],
      width: size ? Number(size[1]) : undefined,
      height: size ? Number(size[2]) : undefined,
      r_frame_rate: fps ? `${Math.round(Number(fps[1]) * 1000)}/1000` : undefined,
      bit_rate: vbr ? String(Number(vbr[1]) * 1000) : undefined,
      display_aspect_ratio: dar ? dar[1] : undefined,
    });
  }

  const audio = log.match(/Stream #\d+:\d+[^:]*:\s*Audio:\s*([a-z0-9_]+)[^\n]*/i);
  if (audio) {
    const line = audio[0];
    const rate = line.match(/(\d+)\s*Hz/);
    const abr = line.match(/(\d+)\s*kb\/s/);
    const channels = /\bmono\b/.test(line) ? 1 : /\bstereo\b/.test(line) ? 2 : (line.match(/(\d+)\s*channels/) || [])[1];
    streams.push({
      codec_type: 'audio',
      codec_name: audio[1],
      sample_rate: rate ? rate[1] : undefined,
      channels: channels ? Number(channels) : undefined,
      bit_rate: abr ? String(Number(abr[1]) * 1000) : undefined,
    });
  }

  if (!dur && !streams.length) {
    throw new Error('Could not read this file’s metadata. It may be corrupted or use an unsupported container.');
  }

  return {
    format: {
      format_name: format ? format[1] : undefined,
      duration: dur ? String(toSeconds(dur[1], dur[2], dur[3])) : undefined,
      bit_rate: bitrate ? String(Number(bitrate[1]) * 1000) : undefined,
    },
    streams,
  };
}

/**
 * Runs ffprobe and parses video & audio stream metadata
 */
export async function probeVideoFile(
  ffmpeg: FFmpeg,
  file: File
): Promise<VideoMetadata> {
  const { fetchFile } = await import('@ffmpeg/util');
  const inputExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `probe_input_${Date.now()}.${inputExt}`;
  const outputName = `probe_output_${Date.now()}.json`;

  try {
    const fileBytes = await fetchFile(file);
    await ffmpeg.writeFile(inputName, fileBytes);

    // Run ffprobe outputting JSON. ffmpeg.wasm's ffprobe often reports -1 even on success
    // (the core never updates its return code), so trust the output file, not the exit code.
    await ffmpeg.ffprobe([
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      inputName,
      '-o',
      outputName,
    ]);

    let probeData: any;
    try {
      const jsonBytes = await ffmpeg.readFile(outputName);
      const jsonStr = typeof jsonBytes === 'string' ? jsonBytes : new TextDecoder('utf-8').decode(jsonBytes);
      probeData = JSON.parse(jsonStr);
    } catch {
      probeData = await probeFromFfmpegLog(ffmpeg, inputName);
    }

    const format = probeData.format || {};
    const streams: any[] = probeData.streams || [];

    const videoStream = streams.find((s) => s.codec_type === 'video');
    const audioStream = streams.find((s) => s.codec_type === 'audio');

    let fps: number | undefined;
    if (videoStream?.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split('/');
      if (parts.length === 2 && parseFloat(parts[1]) > 0) {
        fps = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) / 100;
      }
    }

    const duration = parseFloat(format.duration || videoStream?.duration || audioStream?.duration || '0');
    const overallBitrate = parseInt(format.bit_rate || '0', 10);

    const metadata: VideoMetadata = {
      filename: file.name,
      filesize: file.size,
      formatName: format.format_long_name || format.format_name || inputExt.toUpperCase(),
      duration: isNaN(duration) ? 0 : duration,
      overallBitrate: isNaN(overallBitrate) ? 0 : overallBitrate,
      video: videoStream
        ? {
            codec: videoStream.codec_name || videoStream.codec_long_name || 'unknown',
            width: videoStream.width,
            height: videoStream.height,
            fps,
            bitrate: videoStream.bit_rate ? parseInt(videoStream.bit_rate, 10) : undefined,
            duration: videoStream.duration ? parseFloat(videoStream.duration) : undefined,
            aspectRatio: videoStream.display_aspect_ratio,
          }
        : undefined,
      audio: audioStream
        ? {
            codec: audioStream.codec_name || audioStream.codec_long_name || 'unknown',
            channels: audioStream.channels,
            sampleRate: audioStream.sample_rate ? parseInt(audioStream.sample_rate, 10) : undefined,
            bitrate: audioStream.bit_rate ? parseInt(audioStream.bit_rate, 10) : undefined,
          }
        : undefined,
      rawJson: probeData,
    };

    return metadata;
  } finally {
    await safeUnlink(ffmpeg, inputName);
    await safeUnlink(ffmpeg, outputName);
  }
}
