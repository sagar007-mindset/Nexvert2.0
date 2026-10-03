/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Type,
  ArrowRightLeft,
  Calculator,
  Sparkles,
  Smile,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import PageH1 from '../PageH1';

interface UtilitiesHubProps {
  onNavigate: (path: string) => void;
}

export default function UtilitiesHub({ onNavigate }: UtilitiesHubProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    {
      id: 'text',
      name: 'Text Utilities',
      icon: Type,
      description: 'Clean, format, count, and manipulate text strings instantly.',
      tools: [
        { id: 'word-counter', name: 'Word Counter', desc: 'Count words, characters, reading time, and speaking time.' },
        { id: 'remove-duplicate-lines', name: 'Remove Duplicate Lines', desc: 'Deduplicate lines with case-sensitivity and sorting.' },
        { id: 'sort-lines', name: 'Sort Lines', desc: 'Alphabetical, reverse, length-based, or natural line sorting.' },
        { id: 'find-and-replace', name: 'Find and Replace', desc: 'Fast text replacement with Regex and match counters.' },
        { id: 'text-repeater', name: 'Text Repeater', desc: 'Repeat text strings N times with custom delimiters.' },
        { id: 'reverse-text', name: 'Reverse Text', desc: 'Reverse characters, words, or whole lines instantly.' },
        { id: 'remove-line-breaks', name: 'Remove Line Breaks', desc: 'Strip breaks and normalize paragraphs to single line.' },
        { id: 'whitespace-remover', name: 'Whitespace Remover', desc: 'Eliminate leading, trailing, or double whitespace.' },
        { id: 'text-to-speech', name: 'Text to Speech', desc: 'Listen to text with pitch, rate, and voice controls.' },
        { id: 'character-map', name: 'Character Map', desc: 'Explore Unicode symbols, arrows, currency, and emojis.' }
      ]
    },
    {
      id: 'converters',
      name: 'Conversion Tools',
      icon: ArrowRightLeft,
      description: 'Accurate unit, timezone, roman numeral, and number-to-words converters.',
      tools: [
        { id: 'unit-converter', name: 'Unit Converter', desc: 'Convert length, weight, temperature, speed, data & more.' },
        { id: 'timezone-converter', name: 'Timezone Converter', desc: 'Compare live local times across worldwide timezones.' },
        { id: 'roman-numeral-converter', name: 'Roman Numeral Converter', desc: 'Convert Arabic numbers (1-3999) to Roman numerals.' },
        { id: 'number-to-words', name: 'Number to Words', desc: 'Spell out numbers in English words for checks & legal docs.' }
      ]
    },
    {
      id: 'calculators',
      name: 'Calculators',
      icon: Calculator,
      description: 'Instant mathematical, financial, health, and date calculators.',
      tools: [
        { id: 'percentage-calculator', name: 'Percentage Calculator', desc: 'Calculate percentage of, percentage change, and discounts.' },
        { id: 'age-calculator', name: 'Age Calculator', desc: 'Calculate exact chronological age in years, months, and days.' },
        { id: 'date-calculator', name: 'Date Calculator', desc: 'Find duration between dates or add/subtract days.' },
        { id: 'bmi-calculator', name: 'BMI Calculator', desc: 'Calculate Body Mass Index and healthy weight ranges.' },
        { id: 'loan-calculator', name: 'Loan Calculator', desc: 'Calculate monthly EMI payments and total interest.' },
        { id: 'tip-calculator', name: 'Tip Calculator', desc: 'Split bills and calculate exact tips per person.' },
        { id: 'discount-calculator', name: 'Discount Calculator', desc: 'Find final price after sales percentages and coupons.' },
        { id: 'aspect-ratio-calculator', name: 'Aspect Ratio Calculator', desc: 'Calculate 16:9, 4:3, 1:1, or custom aspect dimensions.' },
        { id: 'gst-calculator', name: 'GST Calculator', desc: 'Calculate inclusive or exclusive Goods & Services Tax.' }
      ]
    },
    {
      id: 'generators',
      name: 'Generators',
      icon: Sparkles,
      description: 'Generate signatures, invoices, favicons, OG social cards, and placeholders.',
      tools: [
        { id: 'signature-pad', name: 'Signature Pad', desc: 'Draw smooth digital signatures and export transparent PNGs.' },
        { id: 'invoice-generator', name: 'Invoice Generator', desc: 'Create clean invoice documents and download real PDFs.' },
        { id: 'favicon-generator', name: 'Favicon Generator', desc: 'Generate multi-resolution icons (16px to 512px) in a ZIP.' },
        { id: 'og-image-generator', name: 'OG Image Generator', desc: 'Create high-res 1200x630 social sharing preview banners.' },
        { id: 'placeholder-image', name: 'Placeholder Image', desc: 'Generate custom dimension placeholder graphics.' }
      ]
    },
    {
      id: 'fun',
      name: 'Fun & Random',
      icon: Smile,
      description: 'Cryptographically random decision makers, dice, coins, and numbers.',
      tools: [
        { id: 'random-picker', name: 'Random Picker', desc: 'Pick random winners or items from custom lists.' },
        { id: 'dice-roller', name: 'Dice Roller', desc: 'Roll d4, d6, d8, d10, d12, d20, and d100 with modifiers.' },
        { id: 'coin-flip', name: 'Coin Flip', desc: 'Realistic 3D coin toss with heads/tails probability tracker.' },
        { id: 'random-number', name: 'Random Number', desc: 'Generate cryptographically secure random numbers.' }
      ]
    }
  ];

  const filteredCategories = categories
    .filter((cat) => activeCategory === 'all' || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(search.toLowerCase()) ||
          tool.desc.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter((cat) => cat.tools.length > 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
          <Wrench className="w-3.5 h-3.5" />
          <span>Pure In-Browser Client Utilities</span>
        </div>
        <PageH1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display">
          Online Utilities &amp; Calculators
        </PageH1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
          Fast, private, client-side tools for text manipulation, calculations, unit conversions, image generation, and random selection. Zero uploads, zero delays.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all 32 utilities..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
            }`}
          >
            All (32)
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-10">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {cat.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => onNavigate(`/${tool.id}/`)}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500/80 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                      <span>Launch Tool</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
