/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_UTILS_CONTENT: Record<string, ToolSEOData> = {
  'word-counter': {
    h1: 'Word Counter & Character Counter Online (Live Reading Time)',
    description: 'Count words, characters, sentences, paragraphs, and estimate speech and reading times in real-time with comprehensive text analytics.',
    introParagraph: 'Analyze word counts for academic essays, social media posts, and professional copywriting. Calculates words with and without spaces, reading level metrics, average speaking duration, and keyword density frequencies instantly in your browser.',
    faqs: [
      {
        question: 'How is word count calculated across different languages and hyphenated words?',
        answer: 'The counter uses Unicode word boundary segmentation (Intl.Segmenter), accurately detecting word breaks across English, European compound words, and CJK characters.'
      },
      {
        question: 'How is estimated reading time calculated?',
        answer: 'Reading time is calculated using the standard cognitive reading baseline of 200 to 250 words per minute for adult silent reading, and 130 words per minute for spoken reading.'
      },
      {
        question: 'Is my essay or manuscript text kept confidential?',
        answer: 'Yes, 100%. Analysis happens entirely in your local browser JavaScript runtime. No text is ever transmitted to a server or stored in a database.'
      }
    ]
  },

  'case-converter': {
    h1: 'Text Case Converter Online (UPPERCASE, lowercase & Title Case)',
    description: 'Transform text case between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and Sentence case in one click.',
    introParagraph: 'Fix accidental CAPS LOCK typing or format variable names for code. Converts text into headline-ready Title Case (respecting prepositions and articles) or programming conventions directly in your browser.',
    faqs: [
      {
        question: 'Does Title Case capitalize prepositions and conjunctions?',
        answer: 'Our AP/Chicago-style Title Case rules automatically keep short prepositions and articles (like "and", "the", "in", "of", "to") in lowercase unless they are the first or last word of a title.'
      },
      {
        question: 'What programming naming conventions can I convert between?',
        answer: 'You can convert between camelCase (JavaScript), PascalCase (TypeScript/C#), snake_case (Python), kebab-case (CSS/URLs), and CONSTANT_CASE.'
      },
      {
        question: 'Does the case converter support accented characters and non-Latin scripts?',
        answer: 'Yes! Full Unicode case mapping handles accented characters (e.g., é, ö, ñ, ç) and multi-byte scripts correctly.'
      }
    ]
  },

  'password-generator': {
    h1: 'Strong Password Generator Online (Cryptographically Random)',
    description: 'Generate uncrackable, cryptographically secure random passwords and passphrases using hardware-based CSPRNG entropy.',
    introParagraph: 'Protect your digital accounts against brute-force and dictionary attacks. Generates high-entropy passwords with custom length, uppercase, lowercase, numbers, and special symbols using crypto.getRandomValues().',
    faqs: [
      {
        question: 'Why is crypto.getRandomValues() safer than Math.random() for passwords?',
        answer: 'Math.random() is pseudo-random and predictable. The Web Crypto API uses cryptographically secure pseudo-random number generators (CSPRNG) seeded by physical hardware entropy from your device OS.'
      },
      {
        question: 'Are generated passwords saved or sent over the internet?',
        answer: 'Never. Passwords are generated in your local device memory and exist only on your screen until you copy them. We have zero servers logging generated credentials.'
      },
      {
        question: 'What password length is considered unbreakable today?',
        answer: 'A password with 16 or more mixed characters (letters, numbers, symbols) provides over 95 bits of entropy, which would take quantum supercomputers trillions of years to brute force.'
      }
    ]
  },

  'emi-calculator': {
    h1: 'Loan EMI Calculator Online (Monthly Installment & Interest)',
    description: 'Calculate monthly loan EMIs, total interest payable, and amortization schedules for home loans, car loans, and personal financing.',
    introParagraph: 'Plan loan repayments accurately. Computes equated monthly installments (EMI) using the standard reducing-balance formula, displaying a clear breakdown between principal repayment and interest charges over the loan tenure.',
    faqs: [
      {
        question: 'What mathematical formula calculates loan EMI?',
        answer: 'EMI is computed using EMI = [P x R x (1+R)^N] / [(1+R)^N - 1], where P is Principal, R is monthly interest rate (annual rate/1200), and N is total tenure in months.'
      },
      {
        question: 'Can I see how prepaying principal shortens my loan tenure?',
        answer: 'Yes! The interactive amortization table updates dynamically to demonstrate how extra monthly or annual payments slash total interest payable.'
      },
      {
        question: 'Does this calculator store my loan details or income?',
        answer: 'No. All calculations run client-side in your browser. No financial data or personal numbers are stored or tracked.'
      }
    ]
  },

  'percentage-calculator': {
    h1: 'Percentage Calculator Online (Increase, Decrease & Markup)',
    description: 'Compute percentage differences, percent increases, percent discounts, fractions, and profit margins instantly with clear formulas.',
    introParagraph: 'Solve common percentage math problems without confusion. Calculate what percent X is of Y, find percentage increases or decreases between two values, and compute sales tax and retail markups with step-by-step breakdowns.',
    faqs: [
      {
        question: 'How is percentage increase/decrease calculated?',
        answer: 'The formula is: ((New Value - Old Value) / |Old Value|) * 100. A positive result indicates percentage growth, while a negative result represents a percentage decrease.'
      },
      {
        question: 'Can I calculate reverse percentages (e.g. finding original price before tax)?',
        answer: 'Yes! You can calculate the original pre-discount or pre-tax price from the final amount and percentage rate.'
      },
      {
        question: 'Are calculation results rounded?',
        answer: 'Results are calculated to full double-precision floating-point accuracy and displayed with up to 4 decimal places for accounting precision.'
      }
    ]
  },

  'aspect-ratio-calculator': {
    h1: 'Aspect Ratio Calculator Online (16:9, 4:3, 21:9 & Custom)',
    description: 'Calculate proportional image and video dimensions, find common denominators, and scale resolutions without distortion.',
    introParagraph: 'Size video canvases and graphic assets accurately. Select industry-standard aspect ratios (16:9 widescreen, 4:3 SD, 9:16 mobile, 21:9 ultrawide) or calculate custom proportions from existing pixel dimensions.',
    faqs: [
      {
        question: 'How do you find the simplified aspect ratio of any resolution?',
        answer: 'The calculator finds the Greatest Common Divisor (GCD) using Euclid’s algorithm for both width and height (e.g. 1920x1080 divided by 120 yields exactly 16:9).'
      },
      {
        question: 'What is the standard aspect ratio for YouTube and modern monitors?',
        answer: '16:9 is the universal standard for YouTube, high-definition television, and desktop monitors, with common resolutions of 1920x1080 (1080p) and 3840x2160 (4K).'
      },
      {
        question: 'Can I scale an image to a specific width and calculate the exact height?',
        answer: 'Yes! Enter your desired width and lock the ratio; the matching height is calculated instantly.'
      }
    ]
  },

  'unit-converter': {
    h1: 'Universal Unit Converter Online (Metric, Imperial & Engineering)',
    description: 'Convert between metric and imperial units for length, weight, temperature, speed, area, volume, pressure, and digital storage.',
    introParagraph: 'Convert engineering and everyday units across metric and imperial systems. Features precision conversion coefficients for meters, feet, kilograms, pounds, Celsius, Fahrenheit, and digital megabytes to gigabytes.',
    faqs: [
      {
        question: 'How does the temperature converter calculate Celsius to Fahrenheit?',
        answer: 'Temperature conversions use the standard thermodynamic equation: °F = (°C × 9/5) + 32, and °C = (°F - 32) × 5/9, with Kelvin calculations offset by 273.15.'
      },
      {
        question: 'Are digital storage conversions based on 1000 or 1024 bytes?',
        answer: 'You can toggle between decimal SI units (1 KB = 1,000 bytes) and binary IEC units (1 KiB = 1,024 bytes) to match Windows or macOS reporting.'
      },
      {
        question: 'Can I convert compound units like miles per hour to kilometers per hour?',
        answer: 'Yes! Velocity and speed conversions between mph, km/h, knots, and meters per second are fully supported.'
      }
    ]
  },

  'signature-generator': {
    h1: 'Create Digital Signature Online (Draw & Type e-Signature)',
    description: 'Draw or type smooth handwritten e-signatures with custom ink colors, pen thickness, and export as transparent PNG files.',
    introParagraph: 'Create clean digital signatures for PDFs, agreements, and contracts without scanning paper. Draw smoothly using mouse or touch screens with Bezier curve smoothing, or type your name to generate stylized script signatures.',
    faqs: [
      {
        question: 'Does the exported signature have a transparent background?',
        answer: 'Yes! Signatures are exported as transparent 32-bit PNGs, allowing you to place your signature seamlessly over contracts, PDFs, or Word documents without white box borders.'
      },
      {
        question: 'Is my signature recorded or saved to a database?',
        answer: 'Never. Your signature vector strokes exist only in temporary canvas memory on your device. Once you close or refresh the page, all vector data is completely erased.'
      },
      {
        question: 'Does drawing support touch screens, styluses, and Apple Pencil?',
        answer: 'Yes! The canvas responds to HTML5 PointerEvents, supporting finger touch on phones and iPads as well as pressure-sensitive styluses.'
      }
    ]
  },

  'qr-code-scanner': {
    h1: 'Scan QR Code Online (From Webcam, Camera or Image File)',
    description: 'Scan and read QR codes from your laptop webcam, smartphone camera, or uploaded image files with instant client-side decoding.',
    introParagraph: 'Decode QR codes without downloading external mobile apps. Point your device camera or upload a saved screenshot; the in-browser computer vision library reads the 2D matrix and reveals text, URLs, or Wi-Fi credentials locally.',
    faqs: [
      {
        question: 'Can I scan a QR code from an image or screenshot saved on my computer?',
        answer: 'Yes! You can drag and drop any image file (PNG, JPG, WebP) directly into the scanner to decode it without needing a camera.'
      },
      {
        question: 'Are camera video frames uploaded to a server for processing?',
        answer: 'No. Camera frames are processed frame-by-frame on your device using a compiled WebAssembly QR decoder. Your camera feed never leaves your computer.'
      },
      {
        question: 'Can the scanner open scanned website links automatically?',
        answer: 'For your security against phishing, the scanner reveals the full decoded URL text first, allowing you to inspect the link before deciding to open it.'
      }
    ]
  },

  'duplicate-line-remover': {
    h1: 'Remove Duplicate Lines Online (Deduplicate Lists & Text)',
    description: 'Deduplicate text lists, email addresses, and spreadsheets with case-sensitive or case-insensitive matching and sorting options.',
    introParagraph: 'Clean up mailing lists, keyword arrays, and database records. Strips duplicate entries, removes blank lines, trims leading and trailing whitespace, and reports the exact number of duplicates removed.',
    faqs: [
      {
        question: 'How are duplicate lines identified?',
        answer: 'The algorithm compares string hashes in a HashSet data structure, guaranteeing ultra-fast O(N) deduplication even for lists with hundreds of thousands of entries.'
      },
      {
        question: 'Can I preserve the original chronological line order?',
        answer: 'Yes! You can choose to maintain the original appearance order (keeping the first occurrence) or sort the resulting list alphabetically.'
      },
      {
        question: 'Does the tool support case-insensitive deduplication?',
        answer: 'Yes. You can toggle case sensitivity so that entries like "Apple" and "apple" are treated as identical duplicates.'
      }
    ]
  }
};
