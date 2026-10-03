import React, { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { ShieldCheck, Mail, FileText, Lock, AlertCircle, Cookie, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL, MEDIA_EMAIL, SOCIAL_LINKS, CONTACT_FORM_ENDPOINT } from '../config/site.config';
import PageH1 from './PageH1';

export type TrustPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'cookie-policy';

interface TrustPageProps {
  type: TrustPageType;
  onNavigate: (path: string) => void;
}

export default function TrustPage({ type, onNavigate }: TrustPageProps) {
  // Form state for Contact Us page
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // No backend configured: hand the message to the visitor's email client rather than
      // POSTing into the void. A static host may answer a stray POST with a 200, which would
      // show "message sent" for a message nobody ever receives.
      if (!CONTACT_FORM_ENDPOINT) {
        const body = `Name: ${contactName}\nEmail: ${contactEmail}\n\n${contactMessage}`;
        window.location.href =
          `mailto:${SUPPORT_EMAIL}` +
          `?subject=${encodeURIComponent(contactSubject || 'Nexvert enquiry')}` +
          `&body=${encodeURIComponent(body)}`;
        setIsSubmitting(false);
        return;
      }

      const formData = new URLSearchParams({
        'form-name': 'contact',
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
      });

      const res = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setSubmitError(`Failed to send message. Please try again or email us directly at ${SUPPORT_EMAIL}.`);
      }
    } catch (err) {
      setSubmitError(`An unexpected network error occurred. Please contact us directly at ${SUPPORT_EMAIL}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'about':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 mb-3">
                <Info className="w-3.5 h-3.5" /> Company & Mission
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                About Nexvert
              </PageH1>
              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Empowering users worldwide with fast browser-based file transformation utilities and a transparent processing model.
              </p>
            </div>

            <div className="space-y-6 text-sm md:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-3">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Our Core Philosophy</h2>
                <p>
                  At <strong>Nexvert</strong> (hosted at {SITE_URL.replace('https://', '')}), we believe file conversion should never compromise personal privacy or data sovereignty. Traditional online file converters force users to upload sensitive personal documents, family photographs, or confidential business reports to unknown remote servers. This introduces bandwidth friction, security vulnerabilities, and data exposure risks.
                </p>
                <p>
                  Nexvert is designed around browser-based processing, using client-side HTML5 Canvas and other browser APIs for tools that support local file processing. The exact processing model is described on each tool page.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="p-5 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                    Local
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Client-Side Processing</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    For client-side tools, supported file data is parsed in browser memory for the local conversion workflow rather than being uploaded for that processing step.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    0s
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Instant Speed</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Eliminate internet upload and download bottlenecks. Conversions finish in milliseconds.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    Free
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Unlimited Usage</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    No sign-up barriers, mandatory subscriptions, artificial file size limits, or watermarks.
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Supported Technologies</h2>
                <p>
                  Nexvert handles a vast matrix of document, image, audio, video, vector, and archive formats including PDF, DOCX, JPG, PNG, WEBP, HEIC, SVG, MP4, MP3, ZIP, and TAR.
                </p>
              </section>

              {/*
                Visible attribution. The Organization/founder JSON-LD says the same thing, but
                schema alone is a weak signal: Google and answer engines read the About page to
                decide whether a site is a real operation, and an unsigned one reads as anonymous.
              */}
              <section className="space-y-3">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Who builds Nexvert</h2>
                <p>
                  Nexvert is built and maintained by Ayaan, working on it as an independent project
                  rather than on behalf of a company. Development happens in the open on{' '}
                  <a
                    href={SOCIAL_LINKS.github.url}
                    className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                    rel="me noopener"
                    target="_blank"
                  >
                    GitHub
                  </a>
                  , and updates are posted on{' '}
                  <a
                    href={SOCIAL_LINKS.x.url}
                    className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                    rel="me noopener"
                    target="_blank"
                  >
                    X
                  </a>
                  {' '}and{' '}
                  <a
                    href={SOCIAL_LINKS.threads.url}
                    className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                    rel="me noopener"
                    target="_blank"
                  >
                    Threads
                  </a>
                  . Questions, bug reports and feature requests are welcome at{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-red-600 dark:text-red-400 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </section>
            </div>
          </article>
        );

      case 'contact':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 mb-3">
                <Mail className="w-3.5 h-3.5" /> Get in Touch
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                Contact Our Support Team
              </PageH1>
              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Have questions, suggestions, or technical issues? We respond within 24–48 business hours.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900/80 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Delivered!</h3>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto">
                      Thank you for contacting Nexvert. A member of our support team will review your message and reply to <strong>{contactEmail}</strong> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setContactMessage('');
                        setSubmitError(null);
                      }}
                      className="mt-4 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    name="contact"
                    method="POST"
                    onSubmit={handleContactSubmit}
                    className="space-y-4"
                  >
                    <p className="hidden">
                      <label>Don’t fill this out: <input name="bot-field" /></label>
                    </p>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h2>

                    {submitError && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start space-x-2.5 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-11 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Your Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="jane@domain.com"
                          className="w-full h-11 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Feature Request / Bug Report / General Enquiry"
                        className="w-full h-11 px-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please describe your question or issue in detail..."
                        className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all cursor-pointer min-h-[44px]"
                    >
                      {isSubmitting ? 'Sending Message...' : 'Submit Support Message'}
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-zinc-900/60 rounded-3xl border border-slate-200 dark:border-zinc-800 space-y-4 text-xs text-slate-600 dark:text-zinc-400">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Email &amp; Contact Information</h3>
                  <div className="space-y-2">
                    <p><strong>Support Email:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} className="text-red-600 dark:text-red-400 underline font-medium">{SUPPORT_EMAIL}</a></p>
                    <p><strong>Press &amp; Partnerships:</strong> <a href={`mailto:${MEDIA_EMAIL}`} className="text-slate-700 dark:text-zinc-300 underline font-medium">{MEDIA_EMAIL}</a></p>
                    <p><strong>Response Time:</strong> Within 24–48 hours</p>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                  <h3 className="font-bold text-sm">Security &amp; Privacy Assurance</h3>
                  <p>
                    Because conversions are performed locally in your browser, we do not require file attachments or logs to troubleshoot conversion issues. Please do not send sensitive personal document files over email.
                  </p>
                </div>
              </div>
            </div>
          </article>
        );

      case 'privacy':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 mb-3">
                <Lock className="w-3.5 h-3.5" /> Privacy First
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                Privacy Policy
              </PageH1>
              <p className="text-xs text-slate-400 mt-2">
                Last Updated: July 20, 2026
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">1. Introduction</h2>
                <p>
                  {SITE_NAME} ("we", "us", or "our") respects the privacy of our visitors and users ("you"). This Privacy Policy outlines how your information is handled when you visit and use our web application at <strong>{SITE_URL}</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">2. Absolute Data Privacy (No Server Uploads)</h2>
                <p>
                  Unlike standard cloud file conversion websites, {SITE_NAME} relies exclusively on <strong>client-side execution</strong>. When you select or drag a file (PDF, DOCX, PNG, JPG, WEBP, HEIC, SVG, audio, or video) into our website:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your file remains inside your browser memory (RAM) on your local device.</li>
                  <li>No file content, metadata, or pixel payload is ever transmitted over the internet to our servers or any third-party cloud.</li>
                  <li>We do not store, log, inspect, or retain your files under any circumstances.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">3. Information We Collect</h2>
                <p>
                  We strive to collect as little personal data as possible:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Client-Side Local Storage:</strong> We use your browser local storage to persist non-sensitive user interface preferences (such as dark mode toggle and optional local sandbox session credits).</li>
                  <li><strong>Standard Web Server Logs:</strong> Basic non-identifiable web server request logs (IP address, user agent, requested URL path) may be temporarily processed by infrastructure providers to prevent abuse and DDoS attacks.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">4. Advertising and Third-Party Analytics</h2>
                <p>
                  To keep {SITE_NAME} 100% free for everyone, we may display contextually relevant advertisements served through Google AdSense or similar networks. These third-party vendors may use non-sensitive cookies or web beacons to serve ads based on user visits to this and other websites. Users may opt out of personalized advertising by visiting Google Ads Settings.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">5. GDPR & CCPA Compliance</h2>
                <p>
                  Because we do not store or collect personal user files or personal data profiles on our servers, your data protection rights under GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act) are inherently respected by architecture design.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">6. Contact Information</h2>
                <p>
                  If you have questions regarding this Privacy Policy, please email us at <strong>{SUPPORT_EMAIL}</strong>.
                </p>
              </section>
            </div>
          </article>
        );

      case 'terms':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 mb-3">
                <FileText className="w-3.5 h-3.5" /> Legal Agreement
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                Terms of Service
              </PageH1>
              <p className="text-xs text-slate-400 mt-2">
                Last Updated: July 20, 2026
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using <strong>{SITE_URL}</strong> ("Website"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of our service immediately.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">2. Description of Service</h2>
                <p>
                  {SITE_NAME} provides free, web-based file transformation and optimization tools operating locally within the user's web browser. We reserve the right to modify, suspend, or discontinue any tool or feature at any time without prior notice.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">3. User Conduct & Acceptable Use</h2>
                <p>You agree not to use the Website to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Process files that violate applicable national or international laws.</li>
                  <li>Attempt to reverse-engineer, exploit, or disrupt the website code or infrastructure.</li>
                  <li>Use automated bots or scripts to flood or abuse the service endpoints.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">4. Intellectual Property</h2>
                <p>
                  All code, branding, layouts, graphics, and interface assets on {SITE_NAME} are protected by intellectual property rights. Users retain full ownership of all personal files converted using our local tools.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">5. Disclaimer of Warranties & Limitation of Liability</h2>
                <p>
                  The Website and its conversion tools are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. {SITE_NAME} shall not be liable for any data loss, corrupt downloads, or indirect damages arising from the use of our services.
                </p>
              </section>
            </div>
          </article>
        );

      case 'disclaimer':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 mb-3">
                <AlertCircle className="w-3.5 h-3.5" /> Notice & Disclaimer
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                General Disclaimer
              </PageH1>
              <p className="text-xs text-slate-400 mt-2">
                Last Updated: July 20, 2026
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">1. General Information Purpose</h2>
                <p>
                  All tools, guides, and information provided on <strong>{SITE_URL}</strong> are offered for general informational and utility purposes only. While we aim for pixel-perfect conversions and file stability, we make no guarantees regarding absolute fidelity across all custom document structures or file specifications.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">2. User Responsibility & File Backups</h2>
                <p>
                  Because all processing takes place locally in your web browser, users are solely responsible for maintaining backup copies of their original files before conversion. {SITE_NAME} is not responsible for missing or improperly formatted output files resulting from browser crashes or system memory limitations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">3. Third-Party Links & Software</h2>
                <p>
                  Our site may contain links to external resource guides or third-party documentation. We do not control or assume responsibility for the content, privacy policies, or practices of external websites.
                </p>
              </section>
            </div>
          </article>
        );

      case 'cookie-policy':
        return (
          <article className="space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 mb-3">
                <Cookie className="w-3.5 h-3.5" /> Browser Storage
              </span>
              <PageH1 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                Cookie & Storage Policy
              </PageH1>
              <p className="text-xs text-slate-400 mt-2">
                Last Updated: July 20, 2026
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">1. What Are Cookies and Local Storage?</h2>
                <p>
                  Cookies and local browser storage are small text fragments saved on your computer or mobile device when you browse websites. They allow web applications to remember your visual choices and preferences between sessions.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">2. How We Use Local Storage</h2>
                <p>
                  {SITE_NAME} avoids intrusive tracking cookies. We utilize standard <code>localStorage</code> strictly for functional application state:
                </p>
                <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-mono space-y-2 my-2">
                  <p><strong>ic_dark_mode:</strong> Stores your dark/light theme preference (true/false).</p>
                  <p><strong>ic_current_user:</strong> Stores your optional local sandbox login profile.</p>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">3. Managing and Clearing Cookies</h2>
                <p>
                  You can clear or disable local storage and cookies at any time through your browser settings (Chrome, Firefox, Safari, Edge). Clearing local storage will simply reset your theme preference to light mode without affecting file conversion capabilities.
                </p>
              </section>
            </div>
          </article>
        );

      default:
        return null;
    }
  };

  const getBreadcrumbLabel = () => {
    switch (type) {
      case 'about': return 'About Us';
      case 'contact': return 'Contact Us';
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms of Service';
      case 'disclaimer': return 'Disclaimer';
      case 'cookie-policy': return 'Cookie Policy';
      default: return 'Information';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs
        items={[{ label: getBreadcrumbLabel() }]}
        onNavigate={onNavigate}
      />

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-sm">
        {renderContent()}

        {/* Bottom Navigation Links among Trust Pages */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/about');
              }}
              className="hover:text-red-500 transition-colors"
            >
              About Us
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/contact');
              }}
              className="hover:text-red-500 transition-colors"
            >
              Contact
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/privacy');
              }}
              className="hover:text-red-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/terms');
              }}
              className="hover:text-red-500 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/disclaimer"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/disclaimer');
              }}
              className="hover:text-red-500 transition-colors"
            >
              Disclaimer
            </a>
            <a
              href="/cookie-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/cookie-policy');
              }}
              className="hover:text-red-500 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-bold"
          >
            Back to Converter Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
