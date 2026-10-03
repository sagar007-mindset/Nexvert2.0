import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File, Trash2, RefreshCw, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';
import { ConverterToolConfig, validateFileInput } from '../config/converters.config';
import { formatBytes } from '../utils/converter';
import { Analytics } from '../utils/analytics';

interface FileUploadBoxProps {
  config: ConverterToolConfig;
  selectedFile: File | null;
  selectedFiles?: File[];
  onFileSelect: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void;
  error: string | null;
  onError: (error: string | null) => void;
  title?: string;
  subtitle?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export default function FileUploadBox({
  config,
  selectedFile,
  selectedFiles = [],
  onFileSelect,
  onFilesSelect,
  error,
  onError,
  title,
  subtitle,
  multiple = false,
  disabled = false,
}: FileUploadBoxProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    onError(null);

    if (multiple && onFilesSelect) {
      const validList: File[] = [];
      let lastErr: string | null = null;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const validation = validateFileInput(f, config);
        if (validation.isValid) {
          validList.push(f);
        } else {
          lastErr = validation.error;
        }
      }

      if (validList.length > 0) {
        onFilesSelect(validList);
        Analytics.fileSelected({
          toolName: config.title || config.id,
          inputFormat: config.inputFormats[0],
          fileSizeBytes: validList.reduce((acc, f) => acc + f.size, 0)
        });
      } else if (lastErr) {
        onError(lastErr);
        Analytics.conversionFailed({
          toolName: config.title || config.id,
          errorMessage: lastErr
        });
      }
    } else {
      const f = files[0];
      const validation = validateFileInput(f, config);
      if (!validation.isValid) {
        onError(validation.error);
        Analytics.conversionFailed({
          toolName: config.title || config.id,
          errorMessage: validation.error
        });
        return;
      }
      onFileSelect(f);
      Analytics.fileSelected({
        toolName: config.title || config.id,
        inputFormat: config.inputFormats[0],
        fileSizeBytes: f.size
      });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (onFilesSelect) onFilesSelect([]);
    onError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerSelect = () => {
    if (disabled) return;
    Analytics.uploadButtonClicked(config.title || config.id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isMulti = multiple || config.supportsMultipleFiles;
  const hasFiles = isMulti ? selectedFiles.length > 0 : !!selectedFile;

  // Format file extension filter for file input
  const acceptAttr = config.fileExtensions
    .filter((ext) => ext !== '*')
    .join(',');

  return (
    <div className="w-full space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMulti}
        accept={acceptAttr || undefined}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Box / Dropzone */}
      {!hasFiles ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`group relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[150px] sm:min-h-[175px] select-none ${
            isDragActive
              ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20 scale-[1.01] shadow-lg shadow-red-100/50 dark:shadow-none'
              : 'border-slate-250 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-red-400 dark:hover:border-red-900 hover:bg-slate-50/80 dark:hover:bg-zinc-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-2 sm:mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 dark:text-white font-display">
            {title || (isDragActive ? 'Drop files here' : 'Choose files or drag & drop')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 max-w-md leading-relaxed px-1">
            {subtitle || `Upload ${config.inputFormats.join(', ')} files to convert locally inside your browser.`}
          </p>

          {/* Supported Input Badge Footer */}
          <div className="mt-2.5 sm:mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 w-full max-w-sm flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
            <span className="font-semibold text-slate-500 dark:text-zinc-400">Supported:</span>
            {config.inputFormats.slice(0, 6).map((fmt) => (
              <span
                key={fmt}
                className="px-1.5 sm:px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded font-bold uppercase"
              >
                {fmt}
              </span>
            ))}
            {config.inputFormats.length > 6 && (
              <span className="px-1 py-0.5 text-slate-400 dark:text-zinc-500">
                +{config.inputFormats.length - 6} more
              </span>
            )}
          </div>

          {/* Privacy badge */}
          <div className="mt-2 flex items-center justify-center flex-wrap gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-center">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Client-Side Processing — Files stay in your browser for supported tools</span>
          </div>
        </div>
      ) : (
        /* Selected File Card View */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  {isMulti ? `${selectedFiles.length} file(s) selected` : selectedFile?.name}
                </p>
                <p className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                  {isMulti
                    ? formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))
                    : selectedFile && formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={triggerSelect}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer min-h-[36px]"
                title="Replace or add files"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change File</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer min-h-[36px]"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multiple File List Preview if multiple */}
          {isMulti && selectedFiles.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-left">
              {selectedFiles.map((f, idx) => (
                <div
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-950 rounded-lg text-slate-600 dark:text-zinc-300"
                >
                  <span className="truncate max-w-[200px] font-mono">{f.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    {formatBytes(f.size)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message Alert */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2 text-left animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
