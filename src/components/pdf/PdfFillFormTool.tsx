/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  FormInput,
  Layers,
  HelpCircle
} from 'lucide-react';
import { formatBytes } from '../../utils/converter';
import { getPdfLib, loadPdfDocument, triggerFileDownload } from './pdfCommon';
import { CONVERTER_TOOLS } from '../../config/converters.config';
import FileUploadBox from '../FileUploadBox';

interface DetectedFormField {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'unknown';
  currentValue: string | boolean;
  options?: string[];
}

export default function PdfFillFormTool() {
  const [file, setFile] = useState<File | null>(null);
  const [realPageCount, setRealPageCount] = useState<number>(0);
  const [formFields, setFormFields] = useState<DetectedFormField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const toolConfig = CONVERTER_TOOLS['fill-pdf-form'];

  const handleSelectFile = async (f: File | null) => {
    setFile(f);
    setErrorMessage(null);
    setResultBlob(null);
    setRealPageCount(0);
    setFormFields([]);
    setFieldValues({});

    if (!f) return;

    setIsScanning(true);
    try {
      const { PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } = await getPdfLib();
      const buf = await f.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const count = doc.getPageCount();
      setRealPageCount(count);

      const detected: DetectedFormField[] = [];
      const valuesMap: Record<string, any> = {};

      try {
        const form = doc.getForm();
        const rawFields = form.getFields();

        for (const field of rawFields) {
          const name = field.getName();

          if (field instanceof PDFTextField) {
            const val = field.getText() || '';
            detected.push({ name, type: 'text', currentValue: val });
            valuesMap[name] = val;
          } else if (field instanceof PDFCheckBox) {
            const checked = field.isChecked();
            detected.push({ name, type: 'checkbox', currentValue: checked });
            valuesMap[name] = checked;
          } else if (field instanceof PDFDropdown) {
            const selected = field.getSelected();
            const opts = field.getOptions();
            const firstVal = selected.length > 0 ? selected[0] : opts[0] || '';
            detected.push({ name, type: 'dropdown', currentValue: firstVal, options: opts });
            valuesMap[name] = firstVal;
          } else if (field instanceof PDFRadioGroup) {
            const selected = field.getSelected() || '';
            const opts = field.getOptions();
            detected.push({ name, type: 'radio', currentValue: selected, options: opts });
            valuesMap[name] = selected;
          } else {
            detected.push({ name, type: 'unknown', currentValue: '' });
          }
        }
      } catch {
        // No form present
      }

      setFormFields(detected);
      setFieldValues(valuesMap);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read PDF form fields.');
    } finally {
      setIsScanning(false);
    }
  };

  const updateFieldValue = (name: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setResultBlob(null);
  };

  const handleSaveFilledPdf = async () => {
    if (!file || formFields.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setResultBlob(null);

    try {
      const { PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } = await getPdfLib();
      const buf = await file.arrayBuffer();
      const doc = await loadPdfDocument(buf);
      const form = doc.getForm();

      for (const fieldInfo of formFields) {
        const val = fieldValues[fieldInfo.name];
        if (val === undefined) continue;

        try {
          const field = form.getField(fieldInfo.name);
          if (field instanceof PDFTextField) {
            field.setText(String(val));
          } else if (field instanceof PDFCheckBox) {
            if (val) {
              field.check();
            } else {
              field.uncheck();
            }
          } else if (field instanceof PDFDropdown) {
            if (val) field.select(String(val));
          } else if (field instanceof PDFRadioGroup) {
            if (val) field.select(String(val));
          }
        } catch {
          // Skip any non-standard fields that throw
        }
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      // The button says "Save & Download", so start the download right away.
      triggerFileDownload(blob, `${file.name.replace(/\.[^/.]+$/, '')}-filled.pdf`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save filled PDF form.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerFileDownload(resultBlob, `${baseName}-filled.pdf`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">

      <FileUploadBox
        config={toolConfig}
        selectedFile={file}
        onFileSelect={handleSelectFile}
        error={errorMessage}
        onError={setErrorMessage}
        title="Select a fillable PDF form"
        subtitle="PDF documents up to 100 MB"
      />

      {file && realPageCount > 0 && !isScanning && (
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                formFields.length > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
              }`}
            >
              Detected Fields: <strong>{formFields.length}</strong>
            </span>
          </div>

          {/* Form Fields Generator */}
          {formFields.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div
                    key={field.name}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block truncate" title={field.name}>
                      {field.name}
                      <span className="text-[10px] font-mono ml-1.5 opacity-60 uppercase">
                        ({field.type})
                      </span>
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={fieldValues[field.name] || ''}
                        onChange={(e) => updateFieldValue(field.name, e.target.value)}
                        placeholder={`Enter ${field.name}`}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}

                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(fieldValues[field.name])}
                          onChange={(e) => updateFieldValue(field.name, e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {fieldValues[field.name] ? 'Checked' : 'Unchecked'}
                        </span>
                      </label>
                    )}

                    {field.type === 'dropdown' && (
                      <select
                        value={fieldValues[field.name] || ''}
                        onChange={(e) => updateFieldValue(field.name, e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'radio' && (
                      <div className="flex flex-wrap gap-3 pt-1">
                        {(field.options || []).map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={field.name}
                              value={opt}
                              checked={fieldValues[field.name] === opt}
                              onChange={() => updateFieldValue(field.name, opt)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveFilledPdf}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <FormInput className="w-4 h-4" />
                  {isProcessing ? 'Saving Filled Form...' : 'Save & Download Filled PDF'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                No fillable form fields found.
              </p>
              <p>
                This PDF document does not contain interactive AcroForm fields (such as text boxes, checkboxes, or radio controls). Scanned documents or flat PDFs cannot be filled with form inputs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Result Card */}
      {resultBlob && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                PDF Form Saved Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                All field values written into document ({formatBytes(resultBlob.size)}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              <Download className="w-4 h-4" /> Download Filled PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
