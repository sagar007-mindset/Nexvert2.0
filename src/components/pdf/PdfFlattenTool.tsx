/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function PdfFlattenTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [fieldCount, setFieldCount] = useState<number>(0);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['flatten-pdf'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setRealPageCount(0);
    setFieldCount(0);
    setFieldNames([]);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      try {
        const form = doc.getForm();
        const fields = form.getFields();
        setFieldCount(fields.length);
        setFieldNames(fields.map((fld) => fld.getName()));
      } catch {
        setFieldCount(0);
        setFieldNames([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document.');
    }
  };

  const handleFlatten = async () => {
    if (!file || realPageCount === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);

      try {
        const form = doc.getForm();
        form.flatten();
      } catch (formErr) {
        // If doc has no AcroForm, nothing to flatten
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to flatten PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-flattened.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to flatten form fields"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Total pages: {realPageCount}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                fieldCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Interactive Form Fields: <strong>{fieldCount}</strong>
            </span>
          </div>

          {/* Form Fields Status Notice */}
          {fieldCount > 0 ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {fieldCount} interactive form {fieldCount === 1 ? 'field' : 'fields'} detected:
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Flattening will bake all current field entries permanently into the PDF page content, locking them against future edits.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fieldNames.slice(0, 15).map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {name || `field_${i + 1}`}
                  </span>
                ))}
                {fieldNames.length > 15 && (
                  <span className="text-[11px] text-slate-500 self-center">
                    +{fieldNames.length - 15} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">No AcroForm interactive fields found.</strong> This document does not appear to contain interactive form inputs. Flattening will ensure all visual elements remain static.
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleFlatten}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? 'Flattening Document...' : 'Flatten & Lock Form Fields'}
            </button>
          </div>
        </div>
      )}

      {/* Result Card */}
      {resultBlob && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                PDF Flattened Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Form fields are now static vector graphics ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Flattened PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
