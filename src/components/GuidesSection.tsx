import { useState } from 'react';
import { GUIDES_DATA, GuideArticle } from '../config/guides.config';
import { ArrowLeft, BookOpen, Clock, Calendar, ArrowRight, ShieldCheck, HelpCircle, Share2, Copy, Check, Youtube, ExternalLink } from 'lucide-react';
import { SITE_URL } from '../config/site.config';
import Breadcrumbs from './Breadcrumbs';
import PageH1 from './PageH1';

interface GuidesSectionProps {
  activeGuideSlug?: string | null;
  onNavigate: (path: string) => void;
}

export default function GuidesSection({ activeGuideSlug, onNavigate }: GuidesSectionProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async (title: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If we are looking at a specific guide, render the article view
  if (activeGuideSlug && GUIDES_DATA[activeGuideSlug]) {
    const article = GUIDES_DATA[activeGuideSlug];
    const otherArticles = Object.values(GUIDES_DATA).filter((a) => a.slug !== activeGuideSlug);

    return (
      <div className="w-full max-w-4xl text-left space-y-6" id="article-view">
        {/* Dynamic SEO Tags for individual article page */}

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Guides', href: '/guides/' },
            { label: article.category, href: '/guides/' },
            { label: article.h1 }
          ]}
          onNavigate={onNavigate}
        />

        {/* Back Button */}
        <a
          href="/guides/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/guides/');
          }}
          className="group inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Guides Hub</span>
        </a>

        {/* Article Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
            {/* Header / Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 dark:text-zinc-500 mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                {article.category}
              </span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
            </div>

            {/* H1 Title */}
            <PageH1 className="font-display font-black text-2xl md:text-4xl text-slate-900 dark:text-white leading-tight mb-6">
              {article.h1}
            </PageH1>

            {/* Introductory Excerpt */}
            <p className="text-base md:text-lg text-slate-600 dark:text-zinc-300 font-medium leading-relaxed mb-6 border-l-4 border-red-500 pl-4">
              {article.excerpt}
            </p>

            {/* Social Sharing & Copy Link Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 mb-8 text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-red-500" />
                <span>Found this guide helpful? Share it:</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleShare(article.title, `${SITE_URL}/guides/${article.slug}/`)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${SITE_URL}/guides/${article.slug}/`)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl font-bold flex items-center space-x-1 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8 text-slate-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
              {article.sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  {section.heading && (
                    <h2 className="font-display font-bold text-lg md:text-xl text-slate-800 dark:text-zinc-100 pt-4">
                      {section.heading}
                    </h2>
                  )}
                  {section.text.map((p, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="list-none space-y-2 mt-4 pl-1">
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-xs md:text-sm text-slate-500 dark:text-zinc-450">
                          <span className="text-red-500 font-bold shrink-0 mt-0.5">&bull;</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* FAQs Section */}
            {article.faqs && article.faqs.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                <h3 className="font-display font-bold text-base md:text-lg text-slate-900 dark:text-white">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {article.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/70 dark:border-zinc-800 space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{faq.question}</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author Footer */}
            <div className="border-t border-slate-100 dark:border-zinc-800 mt-10 pt-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                  FC
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Written by Nexvert Editorial</p>
                  <p className="text-[10px] text-slate-400">Published in {article.category}</p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/40 dark:border-emerald-900/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                <span>Verified Guide</span>
              </span>
            </div>
          </article>

          {/* Sidebar recommendations */}
          <aside className="space-y-6">
            <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-150 dark:border-zinc-800/80 rounded-3xl p-6 text-left">
              <h3 className="font-display font-bold text-slate-800 dark:text-zinc-200 text-sm mb-4 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Related Reading</span>
              </h3>
              <div className="space-y-4">
                {otherArticles.map((other) => (
                  <a
                    key={other.slug}
                    href={`/guides/${other.slug}/`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/guides/${other.slug}/`);
                    }}
                    className="group cursor-pointer bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 p-4 rounded-2xl border border-slate-100 hover:border-red-500 dark:border-zinc-800 dark:hover:border-red-950 transition-all shadow-sm block"
                  >
                    <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase block mb-1">
                      {other.category}
                    </span>
                    <h4 className="text-xs md:text-sm font-black text-slate-700 dark:text-zinc-200 leading-snug group-hover:text-red-600 transition-colors">
                      {other.h1}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {other.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400 group-hover:text-red-500 transition-colors">
                      <span>{other.readTime}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Sandbox CTA */}
            {article.relatedToolRoute && (
              <div className="bg-gradient-to-br from-red-600 to-amber-600 rounded-3xl p-6 text-white text-left relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
                <h3 className="font-display font-extrabold text-base mb-2">Try the Converter Tool</h3>
                <p className="text-xs text-white/80 leading-relaxed mb-4">
                  Convert your files locally in your browser with client-side processing.
                </p>
                <a
                  href={article.relatedToolRoute}
                  onClick={(e) => {
                    e.preventDefault();
                    if (article.relatedToolRoute) {
                      onNavigate(article.relatedToolRoute.replace(/^\//, ''));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Official Blog Sidebar Bridge */}
            <div className="p-5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-left space-y-3 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 text-red-500" /> Nexvert Tools Directory
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">
                Put These Guides into Practice
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Explore our full suite of 150+ private in-browser file converters and utilities.
              </p>
              <a
                href="/tools/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/tools');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                <span>Browse All Converters</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Otherwise, render the main /guides hub directory page
  const articlesList = Object.values(GUIDES_DATA);

  return (
    <div className="w-full max-w-4xl text-left space-y-8" id="guides-hub">
      {/* Dynamic SEO Tags for /guides Hub Page */}

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: 'Guides Hub' }]}
        onNavigate={onNavigate}
      />

      {/* Hero Banner / Headline info */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-100/30">
          Knowledge Base &amp; Tutorials
        </span>
        <PageH1 className="font-display font-black text-4xl md:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          File Conversion Guides &amp; Format Insights
        </PageH1>
        <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400">
          Practical tutorials and comparisons to help you choose the right formats, optimize file sizes, and understand in-browser conversion.
        </p>
      </div>

      {/* Main Grid Listing of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articlesList.map((article) => (
          <a
            key={article.slug}
            href={`/guides/${article.slug}/`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(`/guides/${article.slug}/`);
            }}
            className="group cursor-pointer bg-white dark:bg-zinc-900 border border-slate-150 hover:border-red-500 dark:border-zinc-800 dark:hover:border-red-950 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl relative overflow-hidden block"
          >
            {/* Top info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-50/50 dark:bg-red-950/20 px-2.5 py-1 rounded-md">
                  {article.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              <h2 className="font-display font-extrabold text-slate-800 dark:text-white text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                {article.h1}
              </h2>

              <p className="text-xs text-slate-400 dark:text-zinc-450 mt-3 leading-relaxed line-clamp-4">
                {article.excerpt}
              </p>
            </div>

            {/* Footer details */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-zinc-800 mt-6 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-red-500 transition-colors">
              <span>Read Guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>

      {/* Bottom Help & Blog bridge block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-100 dark:bg-zinc-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-black text-slate-800 dark:text-white text-sm">Looking for a specific converter?</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-450 mt-1 leading-relaxed">
                Explore our full directory of document, image, audio, video, and compression tools.
              </p>
            </div>
          </div>

          <a
            href="/tools/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/tools/');
            }}
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 w-fit"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-slate-100 dark:bg-zinc-900/50 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-black text-slate-800 dark:text-white text-sm">Ready to Convert Files?</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-450 mt-1 leading-relaxed">
                Explore our complete directory of private in-browser document, image, audio, and video tools.
              </p>
            </div>
          </div>

          <a
            href="/tools/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/tools');
            }}
            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 text-slate-800 dark:text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 w-fit shadow-sm"
          >
            <span>Browse All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
