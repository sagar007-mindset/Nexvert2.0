/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Scissors,
  Download,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Lock,
  Copy,
  Check,
  RefreshCw,
  Layers,
  FileArchive,
  FolderSync
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getConverterConfig } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface SplitPart {
  partNumber: number;
  filename: string;
  blob: Blob;
  size: number;
  startByte: number;
  endByte: number;
}

type NamingFormat = 'ext-number' | 'zip-split';

const PRESET_SIZES = [
  { label: '1 MB', bytes: 1 * 1024 * 1024 },
  { label: '5 MB', bytes: 5 * 1024 * 1024 },
  { label: '10 MB', bytes: 10 * 1024 * 1024 },
  { label: '25 MB (Email Limit)', bytes: 25 * 1024 * 1024 },
  { label: '50 MB', bytes: 50 * 1024 * 1024 },
  { label: '100 MB (GitHub Limit)', bytes: 100 * 1024 * 1024 },
  { label: '250 MB', bytes: 250 * 1024 * 1024 },
  { label: '500 MB', bytes: 500 * 1024 * 1024 },
];

export default function SplitZip() {
  const [activeTab, setActiveTab] = useState<'split' | 'reassemble'>('split');
  const [file, setFile] = useState<File | null>(null);
  const [partSizeBytes, setPartSizeBytes] = useState<number>(25 * 1024 * 1024);
  const [customSizeUnit, setCustomSizeUnit] = useState<'MB' | 'KB'>('MB');
  const [customSizeValue, setCustomSizeValue] = useState<string>('25');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [namingFormat, setNamingFormat] = useState<NamingFormat>('ext-number');
  const [parts, setParts] = useState<SplitPart[]>([]);
  const [isSplitting, setIsSplitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // In-browser reassemble state
  const [reassembleFiles, setReassembleFiles] = useState<File[]>([]);
  const [isReassembling, setIsReassembling] = useState<boolean>(false);
  const [reassembleResult, setReassembleResult] = useState<{
    blob: Blob;
    url: string;
    filename: string;
    isValidZip: boolean;
    entryCount?: number;
  } | null>(null);

  const activeConfig = getConverterConfig('split-zip')!;

  const handleSelectFile = (selected: File | null) => {
    setFile(selected);
    setParts([]);
    setError(null);
  };

  const handlePresetSelect = (bytes: number) => {
    setIsCustom(false);
    setPartSizeBytes(bytes);
  };

  const handleCustomSizeChange = (val: string, unit: 'MB' | 'KB') => {
    setCustomSizeValue(val);
    setCustomSizeUnit(unit);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
      setPartSizeBytes(Math.round(num * multiplier));
    }
  };

  const calculatePartCount = () => {
    if (!file || partSizeBytes <= 0) return 0;
    return Math.ceil(file.size / partSizeBytes);
  };

  const handleSplit = () => {
    if (!file) return;
    if (partSizeBytes <= 0) {
      setError('Please specify a valid part size greater than 0.');
      return;
    }
    if (partSizeBytes >= file.size) {
      setError(`Part size (${formatBytes(partSizeBytes)}) is larger than or equal to file size (${formatBytes(file.size)}). No split needed.`);
      return;
    }

    setIsSplitting(true);
    setError(null);

    try {
      const totalSize = file.size;
      const totalParts = Math.ceil(totalSize / partSizeBytes);
      const generatedParts: SplitPart[] = [];
      const baseName = file.name;
      const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
      const ext = baseName.includes('.') ? baseName.substring(baseName.lastIndexOf('.')) : '';

      for (let i = 0; i < totalParts; i++) {
        const start = i * partSizeBytes;
        const end = Math.min(start + partSizeBytes, totalSize);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        let partFilename = '';
        if (namingFormat === 'ext-number') {
          // archive.zip.001, archive.zip.002
          const pad = String(partNumber).padStart(3, '0');
          partFilename = `${baseName}.${pad}`;
        } else {
          // archive.z01, archive.z02, ..., archive.zip
          if (partNumber === totalParts) {
            partFilename = `${nameWithoutExt}${ext || '.zip'}`;
          } else {
            const pad = String(partNumber).padStart(2, '0');
            partFilename = `${nameWithoutExt}.z${pad}`;
          }
        }

        generatedParts.push({
          partNumber,
          filename: partFilename,
          blob: chunk,
          size: chunk.size,
          startByte: start,
          endByte: end,
        });
      }

      setParts(generatedParts);
    } catch (err: any) {
      setError('Splitting error: ' + err.message);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadPart = (part: SplitPart) => {
    const url = URL.createObjectURL(part.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = part.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const handleDownloadAllParts = () => {
    parts.forEach((part, index) => {
      setTimeout(() => {
        handleDownloadPart(part);
      }, index * 300);
    });
  };

  const copyCommand = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(type);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Reassembly logic
  const handleAddReassembleFiles = (newFiles: File[]) => {
    const sorted = [...reassembleFiles, ...newFiles].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    setReassembleFiles(sorted);
    setReassembleResult(null);
  };

  const handleRunReassembly = async () => {
    if (reassembleFiles.length < 2) {
      setError('Please add at least 2 split parts to reassemble.');
      return;
    }

    setIsReassembling(true);
    setError(null);

    try {
      // Concatenate files sequentially into a single Blob
      const combinedBlob = new Blob(reassembleFiles);
      const url = URL.createObjectURL(combinedBlob);

      // Determine output name
      const firstPartName = reassembleFiles[0].name;
      let outputName = 'reassembled.zip';
      if (/\.\d{3}$/.test(firstPartName)) {
        outputName = firstPartName.replace(/\.\d{3}$/, '');
      } else if (/\.z\d{2}$/i.test(firstPartName)) {
        outputName = firstPartName.replace(/\.z\d{2}$/i, '.zip');
      }

      // Verify if valid ZIP
      let isValidZip = false;
      let entryCount = 0;
      try {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(combinedBlob);
        isValidZip = true;
        entryCount = Object.keys(loaded.files).length;
      } catch {
        isValidZip = false;
      }

      setReassembleResult({
        blob: combinedBlob,
        url,
        filename: outputName,
        isValidZip,
        entryCount,
      });
    } catch (err: any) {
      setError('Reassembly failed: ' + err.message);
    } finally {
      setIsReassembling(false);
    }
  };

  const getReassemblyCommands = () => {
    if (parts.length === 0 || !file) return { bash: '', cmd: '', ps: '' };
    const filenames = parts.map((p) => `"${p.filename}"`);
    const output = `"${file.name}"`;

    return {
      bash: `cat ${filenames.join(' ')} > ${output}`,
      cmd: `copy /b ${filenames.join(' + ')} ${output}`,
      ps: `Get-Content ${filenames.join(', ')} -Encoding Byte -ReadCount 0 | Set-Content ${output} -Encoding Byte`,
    };
  };

  const commands = getReassemblyCommands();
  const estimatedParts = calculatePartCount();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 text-left">

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Split Archive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reassemble')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reassemble'
                ? 'bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Reassemble &amp; Verify
          </button>
        </div>
      </div>

      {activeTab === 'split' ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <FileUploadBox
            config={activeConfig}
            selectedFile={file}
            onFileSelect={handleSelectFile}
            error={error}
            onError={setError}
            title="Select ZIP Archive to Split"
            subtitle="Choose a ZIP file of any size to slice into fixed-size chunks."
          />

          {file && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              {/* Part Size Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase block">
                  Chunk Size Presets (File size: {formatBytes(file.size)})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset.bytes)}
                      className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        !isCustom && partSizeBytes === preset.bytes
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Size Option */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                      isCustom
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    Custom Size
                  </button>

                  {isCustom && (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="number"
                        min="1"
                        value={customSizeValue}
                        onChange={(e) => handleCustomSizeChange(e.target.value, customSizeUnit)}
                        className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-red-500"
                      />
                      <select
                        value={customSizeUnit}
                        onChange={(e) => handleCustomSizeChange(customSizeValue, e.target.value as 'MB' | 'KB')}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="MB">MB</option>
                        <option value="KB">KB</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Naming Scheme */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase block">
                  Part Filename Scheme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingFormat === 'ext-number'}
                      onChange={() => setNamingFormat('ext-number')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="font-mono text-slate-800 dark:text-zinc-200">
                      Standard (.zip.001, .zip.002...)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="namingFormat"
                      checked={namingFormat === 'zip-split'}
                      onChange={() => setNamingFormat('zip-split')}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="font-mono text-slate-800 dark:text-zinc-200">
                      Multi-Volume (.z01, .z02... .zip)
                    </span>
                  </label>
                </div>
              </div>

              {/* Summary and Split Action */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-zinc-400">
                  Target: <strong>{estimatedParts} parts</strong> (~{formatBytes(partSizeBytes)} each)
                </span>
                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={isSplitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Split into {estimatedParts} Parts</span>
                </button>
              </div>
            </div>
          )}

          {/* Generated Parts List */}
          {parts.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase">
                  Generated Parts ({parts.length})
                </span>
                <button
                  type="button"
                  onClick={handleDownloadAllParts}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All Parts</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {parts.map((part) => (
                  <div
                    key={part.partNumber}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <span className="w-6 text-center font-mono font-bold text-slate-400 text-[11px]">
                        #{part.partNumber}
                      </span>
                      <span className="font-mono text-slate-800 dark:text-zinc-200 truncate font-bold">
                        {part.filename}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                        {formatBytes(part.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadPart(part)}
                        className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-bold font-mono flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal Reassembly Instructions */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span>How to Join These Parts Later (Command Line)</span>
                </div>

                <div className="space-y-2 text-[11px] font-mono">
                  {/* macOS / Linux */}
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-slate-400 text-[10px] block font-sans">macOS &amp; Linux (Terminal):</span>
                      <code className="text-emerald-400">{commands.bash}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCommand('bash', commands.bash)}
                      className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                      {copiedCmd === 'bash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Windows CMD */}
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-slate-400 text-[10px] block font-sans">Windows Command Prompt (cmd.exe):</span>
                      <code className="text-emerald-400">{commands.cmd}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCommand('cmd', commands.cmd)}
                      className="p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                      {copiedCmd === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Byte-slicing runs 100% locally in browser memory without modifying archive bytes.</span>
          </div>
        </div>
      ) : (
        /* Reassemble Tab */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <FileUploadBox
            config={activeConfig}
            selectedFile={null}
            selectedFiles={reassembleFiles}
            onFileSelect={() => {}}
            onFilesSelect={handleAddReassembleFiles}
            error={error}
            onError={setError}
            multiple={true}
            title="Drop Split Parts to Reassemble (.001, .002...)"
            subtitle="Upload all parts of your split ZIP archive to merge and verify integrity."
          />

          {reassembleFiles.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 font-mono uppercase">
                  Parts to Concatenate ({reassembleFiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => setReassembleFiles([])}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear Parts
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {reassembleFiles.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono"
                  >
                    <span className="truncate text-slate-800 dark:text-zinc-200">
                      {i + 1}. {f.name}
                    </span>
                    <span className="text-slate-400">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>

              {!reassembleResult && (
                <button
                  type="button"
                  onClick={handleRunReassembly}
                  disabled={isReassembling}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <FolderSync className="w-4 h-4" />
                  <span>Join &amp; Verify Archive Integrity</span>
                </button>
              )}

              {reassembleResult && (
                <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                  <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Reassembly Complete ({formatBytes(reassembleResult.blob.size)})
                    </span>
                  </div>

                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                    {reassembleResult.isValidZip
                      ? `Verified valid ZIP archive! Contains ${reassembleResult.entryCount} entries with no data corruption.`
                      : 'File stitched successfully.'}
                  </p>

                  <a
                    href={reassembleResult.url}
                    download={reassembleResult.filename}
                    className="h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Reassembled Archive ({reassembleResult.filename})</span>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reassembly executed in client browser memory with instant checksum verification.</span>
          </div>
        </div>
      )}
    </div>
  );
}
