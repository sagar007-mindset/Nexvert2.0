import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import { Layers, FileText, Image as ImageIcon, Music, Video, Archive, ArrowRight, CheckCircle2, ShieldCheck, HardDrive, ExternalLink } from 'lucide-react';
import PageH1 from './PageH1';

interface SupportedFormatsPageProps {
  onNavigate: (path: string) => void;
}

export default function SupportedFormatsPage({ onNavigate }: SupportedFormatsPageProps) {
  const formatCategories = [
    {
      id: 'documents',
      name: 'Documents & PDFs',
      icon: <FileText className="w-5 h-5 text-red-500" />,
      description: 'Standard document formats processed in-browser via PDF-lib and WebAssembly canvas text extractors.',
      formats: [
        { ext: 'PDF', name: 'Portable Document Format', mime: 'application/pdf', converterRoute: '/pdf-merge' },
        { ext: 'DOCX', name: 'Microsoft Word Document', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', converterRoute: '/docx-to-pdf' },
        { ext: 'TXT', name: 'Plain Text File', mime: 'text/plain', converterRoute: '/document-converter' },
        { ext: 'EPUB', name: 'Electronic Publication', mime: 'application/epub+zip', converterRoute: '/epub-to-pdf' },
        { ext: 'MOBI', name: 'Mobipocket eBook', mime: 'application/x-mobipocket-ebook', converterRoute: '/ebook-converter' }
      ]
    },
    {
      id: 'images',
      name: 'Images & Photography',
      icon: <ImageIcon className="w-5 h-5 text-amber-500" />,
      description: 'Raster image formats rendered and re-encoded locally using HTML5 Canvas & WebCodecs APIs.',
      formats: [
        { ext: 'JPG / JPEG', name: 'Joint Photographic Experts Group', mime: 'image/jpeg', converterRoute: '/jpg-to-png' },
        { ext: 'PNG', name: 'Portable Network Graphics', mime: 'image/png', converterRoute: '/png-to-jpg' },
        { ext: 'WEBP', name: 'Google Web Picture Format', mime: 'image/webp', converterRoute: '/webp-to-jpg' },
        { ext: 'HEIC / HEIF', name: 'Apple High Efficiency Image', mime: 'image/heic', converterRoute: '/jpg-to-png' },
        { ext: 'GIF', name: 'Graphics Interchange Format', mime: 'image/gif', converterRoute: '/gif-to-mp4' },
        { ext: 'JFIF', name: 'JPEG File Interchange Format', mime: 'image/jfif', converterRoute: '/jfif-to-png' },
        { ext: 'BMP', name: 'Bitmap Image File', mime: 'image/bmp', converterRoute: '/' },
        { ext: 'TIFF', name: 'Tagged Image File Format', mime: 'image/tiff', converterRoute: '/' }
      ]
    },
    {
      id: 'vectors',
      name: 'Vector Graphics',
      icon: <Layers className="w-5 h-5 text-purple-500" />,
      description: 'Scalable vector paths converted to raster bitmaps or scalable vector definitions without pixel loss.',
      formats: [
        { ext: 'SVG', name: 'Scalable Vector Graphics', mime: 'image/svg+xml', converterRoute: '/svg-converter' },
        { ext: 'EPS', name: 'Encapsulated PostScript', mime: 'application/postscript', converterRoute: '/svg-converter' }
      ]
    },
    {
      id: 'audio',
      name: 'Audio Streams',
      icon: <Music className="w-5 h-5 text-emerald-500" />,
      description: 'Digital audio waveforms decoded and re-encoded in client memory with Web Audio and WebAssembly.',
      formats: [
        { ext: 'MP3', name: 'MPEG Audio Layer III', mime: 'audio/mpeg', converterRoute: '/audio-converter' },
        { ext: 'WAV', name: 'Waveform Audio File Format', mime: 'audio/wav', converterRoute: '/audio-converter' },
        { ext: 'AAC', name: 'Advanced Audio Coding', mime: 'audio/aac', converterRoute: '/audio-converter' },
        { ext: 'OGG', name: 'Ogg Vorbis Audio', mime: 'audio/ogg', converterRoute: '/mp3-to-ogg' },
        { ext: 'FLAC', name: 'Free Lossless Audio Codec', mime: 'audio/flac', converterRoute: '/audio-converter' },
        { ext: 'M4A', name: 'MPEG-4 Audio Stream', mime: 'audio/mp4', converterRoute: '/audio-converter' }
      ]
    },
    {
      id: 'video',
      name: 'Video & Animation',
      icon: <Video className="w-5 h-5 text-blue-500" />,
      description: 'Video containers parsed for audio extraction, frame capture, and web format conversion.',
      formats: [
        { ext: 'MP4', name: 'MPEG-4 Part 14 Video', mime: 'video/mp4', converterRoute: '/mp4-to-mp3' },
        { ext: 'WEBM', name: 'WebM Open Media Project', mime: 'video/webm', converterRoute: '/webm-to-gif' },
        { ext: 'MOV', name: 'Apple QuickTime Movie', mime: 'video/quicktime', converterRoute: '/mov-to-mp4' },
        { ext: 'AVI', name: 'Audio Video Interleave', mime: 'video/x-msvideo', converterRoute: '/avi-to-gif' }
      ]
    },
    {
      id: 'archive',
      name: 'Archives & Compression',
      icon: <Archive className="w-5 h-5 text-indigo-500" />,
      description: 'Archive unzipping and compression powered by JSZip and in-memory tar-ball streams.',
      formats: [
        { ext: 'ZIP', name: 'ZIP Compressed Package', mime: 'application/zip', converterRoute: '/extract-archive' },
        { ext: 'TAR', name: 'Tape Archive Stream', mime: 'application/x-tar', converterRoute: '/tar-to-zip' },
        { ext: 'GZ', name: 'Gzip Compressed File', mime: 'application/gzip', converterRoute: '/extract-archive' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Are all listed formats converted locally in my browser?',
      answer: 'Many Nexvert file tools use client-side browser APIs or WebAssembly so the conversion can run on your device. Processing details and limits vary by tool, so review the tool page before using it for sensitive files.'
    },
    {
      question: 'Are there any file size limits for supported formats?',
      answer: 'Because conversions use your device’s system RAM, file size limits depend on your browser and available system memory. Most modern desktop browsers handle files up to 2 GB smoothly.'
    },
    {
      question: 'Do I need to install plugins or software to convert these formats?',
      answer: 'No plugins, extensions, or software installations are required. Nexvert runs natively in Chrome, Safari, Firefox, Edge, and mobile browsers.'
    }
  ];

  return (
    <article className="w-full max-w-4xl mx-auto text-left space-y-8 animate-fadeIn">

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Supported Formats' }]}
        onNavigate={onNavigate}
      />

      {/* Hero Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
          <HardDrive className="w-3.5 h-3.5" /> Technical Format Matrix
        </div>
        <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          Supported File Formats Directory
        </PageH1>
        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Nexvert supports a wide spectrum of digital document, photo, vector, audio, video, and archive formats. All format parsing and re-encoding happen 100% locally in your web browser memory.
        </p>
      </div>

      {/* Format Categories */}
      <div className="space-y-10">
        {formatCategories.map((cat) => (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
              {cat.icon}
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {cat.name}
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
              {cat.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cat.formats.map((fmt, idx) => (
                <a
                  key={idx}
                  href={fmt.converterRoute}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(fmt.converterRoute);
                  }}
                  className="group cursor-pointer p-4 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-900 rounded-2xl transition-all shadow-sm flex flex-col justify-between space-y-2 block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                      .{fmt.ext}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-100 group-hover:text-red-600 transition-colors">
                      {fmt.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {fmt.mime}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Technical Guarantee Box */}
      <div className="p-6 md:p-8 bg-slate-900 text-white rounded-3xl space-y-4 text-left relative overflow-hidden">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-5 h-5" />
          <span>Client-Side Processing for Supported Tools</span>
        </div>
        <h2 className="text-xl font-black font-display text-white">
          Why Local Conversion Matters
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          For tools that use client-side processing, file conversion can happen in your browser without sending the file contents to a remote conversion service. Other site resources and analytics can still use the network, and browser performance varies by device and file type.
        </p>
      </div>

      {/* FAQs */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Frequently Asked Questions About Supported Formats
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
      </div>

      {/* Educational Blog Knowledge Bridge */}
      <div className="p-6 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5 text-red-500" /> Nexvert Guides &amp; Tutorials
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Want to learn more about audio, video, and image codecs?
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Read technical articles on container formats, compression ratios, and web performance in our guides library.
          </p>
        </div>
        <a
          href="/guides/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/guides');
          }}
          className="shrink-0 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
        >
          <span>Explore Guides &amp; Tutorials</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
