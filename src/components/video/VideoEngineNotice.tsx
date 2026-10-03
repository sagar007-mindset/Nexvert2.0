/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cpu, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';
import { FFmpegLoadProgress } from '../../utils/ffmpegHelper';

interface VideoEngineNoticeProps {
  progress?: FFmpegLoadProgress | null;
  isLoading: boolean;
  isReady: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function VideoEngineNotice({
  progress,
  isLoading,
  isReady,
  error,
  onRetry,
}: VideoEngineNoticeProps) {
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-700 dark:text-red-400" />
        <div className="flex-1">
          <p className="font-semibold text-red-700 dark:text-red-300">Video Engine Initialization Failed</p>
          <p className="text-xs text-red-400/90 mt-1 leading-relaxed">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 rounded-lg text-xs font-medium text-red-200 transition-colors"
            >
              Retry Loading Engine
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading && progress) {
    const percent = Math.round(progress.ratio * 100);
    return (
      <div className="bg-white dark:bg-zinc-900/90 border border-amber-500/30 rounded-xl p-5 text-slate-800 dark:text-zinc-200 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Loading WebAssembly Video Engine</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              One-time ~30 MB local download. No files leave your device.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{percent}%</span>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate">{progress.stage}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 mb-6 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          <span>
            Video processing is performed locally via WebAssembly. The engine (~30 MB) loads on first use.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 shrink-0 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Private</span>
        </div>
      </div>
    );
  }

  return null;
}
