/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Lazy-loaded so the ~350 KB of per-page copy (intro, steps, FAQs for every tool) is not part
// of the main bundle. The same text is already in the pre-rendered HTML, and React keeps that
// markup in place until this chunk has loaded, so nothing changes on screen.

import SEOHead from './SEOHead';
import ToolPageContent from './ToolPageContent';
import { getPageContent, toolNameFromTitle } from '../config/page-content';

interface ToolPageSectionProps {
  path: string;
  canonicalPath?: string;
  title: string;
  description: string;
  toolTitle?: string;
  toolCategory?: string;
  /** Image landing pages manage their own SEOHead (landing-specific title/description). */
  withSeo?: boolean;
}

export default function ToolPageSection({ path, canonicalPath, title, description, toolTitle, toolCategory, withSeo = true }: ToolPageSectionProps) {
  const content = getPageContent(path, title, description);
  if (!content) return null;
  return (
    <>
      {withSeo && (
        // Re-emits the page's structured data including the FAQ and HowTo entries.
        <SEOHead
          title={title}
          description={description}
          path={canonicalPath || path}
          faqs={content.faqs}
          steps={content.steps}
          breadcrumbName={toolNameFromTitle(title)}
          toolCategory={toolCategory}
        />
      )}
      <ToolPageContent content={content} toolName={toolNameFromTitle(toolTitle || title)} />
    </>
  );
}
