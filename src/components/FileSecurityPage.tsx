import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import { ShieldCheck, Lock, HardDrive, Cpu, Terminal, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import PageH1 from './PageH1';

interface FileSecurityPageProps {
  onNavigate: (path: string) => void;
}

export default function FileSecurityPage({ onNavigate }: FileSecurityPageProps) {
  const faqs = [
    {
      question: 'Are files sent to a remote server during conversion?',
      answer: 'For tools that use client-side processing, the file conversion workflow runs in your browser using browser APIs, parsers, and WebAssembly. The exact processing model can vary by tool, so check the tool’s notice before converting sensitive files.'
    },
    {
      question: 'How can I verify whether a tool uploads file data?',
      answer: 'Open your browser’s Developer Tools, select the Network tab, run the conversion, and inspect requests associated with the tool. Normal page resources and analytics may still create network traffic; the relevant question is whether the file-processing workflow sends your file bytes to a remote service.'
    },
    {
      question: 'How long are my files retained in memory?',
      answer: 'Files handled by a client-side tool are kept in browser-managed memory while the page uses them. Browser memory is released according to browser and operating-system behavior when the page is closed or data is no longer referenced.'
    },
    {
      question: 'Does Nexvert work offline?',
      answer: 'Some client-side tools can continue working after the required application assets have loaded, but Nexvert does not promise offline availability for every tool or every browser configuration.'
    }
  ];

  return (
    <article className="w-full max-w-4xl mx-auto text-left space-y-8 animate-fadeIn">

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'File Security & Privacy' }]}
        onNavigate={onNavigate}
      />

      {/* Hero Banner */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
          <ShieldCheck className="w-3.5 h-3.5" /> Technical Security Architecture
        </div>
        <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          File Security &amp; Technical Privacy Model
        </PageH1>
        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Nexvert uses client-side processing for supported tools to reduce the need to send file contents to a remote conversion service.
        </p>
      </div>

      {/* Step-by-Step Data Flow Diagram */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-red-500" />
          <span>The Local Execution Lifecycle (RAM Processing)</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
          Cloud services may process files on remote infrastructure. For supported client-side Nexvert tools, the conversion workflow instead keeps file processing in the browser:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            { step: '01', title: 'File Drop', desc: 'File enters volatile browser memory via File API FileReader.' },
            { step: '02', title: 'Local Decoding', desc: 'Client-side Canvas & document parsers process raw byte streams.' },
            { step: '03', title: 'Transcoding', desc: 'Format re-encoding executes directly in your local browser pipeline.' },
            { step: '04', title: 'Instant Output', desc: 'Resulting file is packaged into a local Blob URL for download.' },
            { step: '05', title: 'Memory Release', desc: 'Original & output buffers are flushed upon download or tab close.' }
          ].map((s, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-mono font-black text-red-600 dark:text-red-400">{s.step}</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud vs Local Comparison */}
      <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Comparison: Cloud Converters vs. Nexvert
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Traditional Cloud Converters
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">×</span> Transmits files over the internet to remote servers.</li>
              <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">×</span> Files may linger in cloud storage or temporary disks.</li>
              <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">×</span> Slow upload/download speeds on large files.</li>
              <li className="flex items-start gap-1.5"><span className="text-red-500 font-bold">×</span> Requires active internet connection for every step.</li>
            </ul>
          </div>

          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl space-y-3">
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Nexvert
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">✓</span> File processing stays local for tools explicitly labeled client-side.</li>
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Processing takes place in browser-managed memory for client-side tools.</li>
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Near-instant conversions without network latency.</li>
              <li className="flex items-start gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Some client-side workflows may continue after required assets have loaded.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security FAQs */}
      <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Security &amp; Privacy Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 pl-5 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
