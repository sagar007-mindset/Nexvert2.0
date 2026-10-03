/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode2,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Tag,
  User,
  Calendar,
  Compass
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

export default function PdfMetadataEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [creator, setCreator] = useState('');
  const [producer, setProducer] = useState('');
  const [creationDate, setCreationDate] = useState<string | null>(null);
  const [modificationDate, setModificationDate] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['pdf-metadata-editor'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setRealPageCount(0);

    if (!f) return;

    try {
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      setTitle(doc.getTitle() || '');
      setAuthor(doc.getAuthor() || '');
      setSubject(doc.getSubject() || '');
      setKeywords(doc.getKeywords() || '');
      setCreator(doc.getCreator() || '');
      setProducer(doc.getProducer() || '');

      const cDate = doc.getCreationDate();
      setCreationDate(cDate ? cDate.toLocaleString() : 'Not specified');

      const mDate = doc.getModificationDate();
      setModificationDate(mDate ? mDate.toLocaleString() : 'Not specified');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF document metadata.');
    }
  };

  const handleSaveMetadata = async () => {
    if (!file || realPageCount === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);

      doc.setTitle(title.trim());
      doc.setAuthor(author.trim());
      doc.setSubject(subject.trim());
      const kwList = keywords.split(/[,;\n]+/).map((k) => k.trim()).filter(Boolean);
      doc.setKeywords(kwList);
      doc.setCreator(creator.trim());
      doc.setProducer(producer.trim());
      doc.setModificationDate(new Date());

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update PDF metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-updated-metadata.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a PDF to inspect and edit metadata"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500">
                {formatBytes(file.size)} • Total pages: {realPageCount}
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Created: {creationDate}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-500" /> Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Financial Statement"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" /> Subject / Description
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Business operations summary"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. finance, quarterly, report, 2026"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Application / Creator
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="e.g. InDesign / Word"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                PDF Producer
              </label>
              <input
                type="text"
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                placeholder="e.g. Adobe PDF Library"
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveMetadata}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <FileCode2 className="w-4 h-4" />
              {isProcessing ? 'Saving Metadata...' : 'Save & Update Metadata'}
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
                Metadata Updated Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                All document properties saved ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Updated PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
