/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CONVERTER_TOOLS } from './converters.config.ts';

export interface NavCategoryItem {
  label: string;
  route: string;
  badge?: string;
}

export interface NavCategorySection {
  title: string;
  items: NavCategoryItem[];
}

export interface NavCategory {
  id: string;
  label: string;
  hubRoute: string;
  hubLabel: string;
  sections?: NavCategorySection[];
}

export interface FooterLinkItem {
  label: string;
  route: string;
  external?: boolean;
}

// Dynamically computed tool counts
export const TOTAL_TOOLS_COUNT = Object.keys(CONVERTER_TOOLS).length;

const toolsList = Object.values(CONVERTER_TOOLS);
export const PDF_TOOLS_COUNT = toolsList.filter(t => t.category === 'PDF & Document').length;
export const DEV_TOOLS_COUNT = toolsList.filter(t => t.category === 'Developer').length;
export const UTILITY_TOOLS_COUNT = toolsList.filter(t => t.category === 'Utilities').length;
export const IMAGE_TOOLS_COUNT = toolsList.filter(t => t.category === 'Image').length;
export const MEDIA_TOOLS_COUNT = toolsList.filter(t => t.category === 'Video' || t.category === 'Audio' || t.category === 'GIF').length;

/**
 * Single source of truth for the 6 core navigation pillars.
 * Shared between React Navbar and scripts/prerender.js.
 */
export const PRIMARY_NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'convert',
    label: 'Convert',
    hubRoute: '/tools/',
    hubLabel: `Browse All ${TOTAL_TOOLS_COUNT}+ Converters`
  },
  {
    id: 'pdf-tools',
    label: 'PDF Tools',
    hubRoute: '/pdf-tools/',
    hubLabel: `All ${PDF_TOOLS_COUNT}+ PDF Tools Hub`
  },
  {
    id: 'image-tools',
    label: 'Image Tools',
    hubRoute: '/image-tools/',
    hubLabel: 'Explore All Image Tools'
  },
  {
    id: 'media',
    label: 'Media',
    hubRoute: '/video-tools/',
    hubLabel: 'Media Tools Hub'
  },
  {
    id: 'developer',
    label: 'Developer',
    hubRoute: '/developer-tools/',
    hubLabel: `Explore ${DEV_TOOLS_COUNT}+ Developer Tools`
  },
  {
    id: 'utilities',
    label: 'Utilities',
    hubRoute: '/utilities/',
    hubLabel: `Browse All ${UTILITY_TOOLS_COUNT}+ Utilities`
  }
];

/**
 * Single source of truth for all footer links.
 * Shared between React App footer and scripts/prerender.js.
 */
export const FOOTER_LINKS: FooterLinkItem[] = [
  { label: 'Utilities Hub', route: '/utilities/' },
  { label: 'Developer Tools', route: '/developer-tools/' },
  { label: 'Supported Formats', route: '/supported-formats/' },
  { label: 'File Security', route: '/file-security/' },
  { label: 'Guides & Tutorials', route: '/guides/' },
  { label: 'Changelog', route: '/changelog/' },
  { label: 'About Us', route: '/about/' },
  { label: 'Privacy Policy', route: '/privacy/' },
  { label: 'Terms of Service', route: '/terms/' },
  { label: 'Contact Us', route: '/contact/' },
  { label: 'Disclaimer', route: '/disclaimer/' },
  { label: 'Cookie Policy', route: '/cookie-policy/' }
];
