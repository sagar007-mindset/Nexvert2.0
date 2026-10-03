/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Unique page copy for text utilities, calculators and generators that previously fell back
// to generic text. Every statement here describes behaviour of the actual tool UI.

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_EXTRA_UTILS_CONTENT: Record<string, ToolSEOData> = {
  'remove-line-breaks': {
    h1: 'Remove Line Breaks from Text',
    description: 'Remove unwanted line breaks from copied PDF or email text — join lines with spaces, keep paragraphs, or use a custom separator.',
    introParagraph: 'Text copied from PDFs, emails and old documents often has a hard line break at the end of every line, which breaks formatting when you paste it elsewhere. This tool removes those breaks instantly. Replace every break with a single space, preserve real paragraph breaks (blank lines) while joining the lines inside each paragraph, or join lines with a custom separator such as a comma. The cleaned text updates as you type and can be copied or downloaded.',
    steps: [
      { title: 'Paste the text', text: 'Paste text with unwanted line breaks into the input box.' },
      { title: 'Choose a mode', text: 'Replace with a single space, preserve paragraphs, or use a custom separator.' },
      { title: 'Copy or download', text: 'Copy the cleaned text or save it as a .txt file.' },
    ],
    faqs: [
      { question: 'How do I keep my paragraphs?', answer: 'Choose Preserve Paragraphs. Lines inside a paragraph are joined, while blank lines between paragraphs are kept.' },
      { question: 'Why does text copied from a PDF have so many line breaks?', answer: 'PDFs store text as positioned lines, not flowing paragraphs, so copying adds a break at the end of every visual line.' },
      { question: 'Can I turn a list into comma-separated values?', answer: 'Yes. Choose Custom Separator and enter a comma (and space) to join the lines.' },
    ],
  },
  'whitespace-remover': {
    h1: 'Whitespace Remover – Remove Extra Spaces',
    description: 'Trim line edges, collapse repeated spaces, remove blank lines and convert tabs to spaces in one click.',
    introParagraph: 'The Whitespace Remover cleans up text with messy spacing — double spaces, trailing spaces, tabs and empty lines — which commonly appear when copying from spreadsheets, PDFs or web pages. Turn on the clean-ups you want: trim spaces at the start and end of lines, collapse consecutive spaces into one, remove blank lines, and convert tabs to spaces. The normalised text is shown instantly and can be copied or downloaded.',
    steps: [
      { title: 'Paste the text', text: 'Paste the text you want to clean.' },
      { title: 'Choose clean-ups', text: 'Enable trimming, collapsing spaces, removing blank lines and tabs-to-spaces as needed.' },
      { title: 'Copy the result', text: 'Copy the cleaned text or download it.' },
    ],
    faqs: [
      { question: 'Will it remove single spaces between words?', answer: 'No. Only repeated spaces are collapsed to one, so words stay separated.' },
      { question: 'Can it clean data pasted from Excel?', answer: 'Yes. Tabs between columns can be converted to spaces and stray blank rows removed.' },
      { question: 'Does it change line breaks?', answer: 'Only blank lines are removed when that option is on. Use Remove Line Breaks to join lines together.' },
    ],
  },
  'text-to-speech': {
    h1: 'Text to Speech – Read Text Aloud Online',
    description: 'Read any text aloud in your browser with a choice of voices and adjustable speed, pitch and volume.',
    introParagraph: 'Text to Speech reads your text aloud using the speech voices built into your browser and operating system. Paste an article, email or study notes, choose a voice and language, and adjust the speaking rate, pitch and volume. It is useful for proofreading by ear, listening while multitasking, language practice and accessibility. Speech is generated on your device by the Web Speech API, so the text is not sent to a cloud service by this site.',
    steps: [
      { title: 'Enter text', text: 'Type or paste the text you want to hear.' },
      { title: 'Choose voice and speed', text: 'Pick a voice and adjust rate, pitch and volume.' },
      { title: 'Press Speak', text: 'Listen, and press Stop at any time.' },
    ],
    faqs: [
      { question: 'Why do the available voices differ between devices?', answer: 'Voices come from your operating system and browser. Windows, macOS, Android and iOS each ship different voices and languages.' },
      { question: 'Can I download the speech as an MP3?', answer: 'No. Browsers do not allow the Web Speech API output to be recorded directly, so the tool plays speech live.' },
      { question: 'Which languages are supported?', answer: 'Any language for which your device has an installed voice. Most systems include English and several other major languages.' },
    ],
  },
  'character-map': {
    h1: 'Unicode Character Map & Symbol Picker',
    description: 'Find and copy currency signs, arrows, maths symbols and punctuation by name or Unicode code point.',
    introParagraph: 'The Character Map helps you find special characters that are not on your keyboard — currency signs like € ₹ ₿, arrows, mathematical operators, typographic punctuation and other symbols. Browse by category or search by name or code point (for example "20AC" for the euro sign), then click a character to copy it. Each symbol shows its Unicode code point (U+20AC) so you can also use it in HTML or code.',
    steps: [
      { title: 'Pick a category or search', text: 'Browse currency, arrows, maths, symbols or punctuation, or search by name or code.' },
      { title: 'Click a character', text: 'The symbol is copied to your clipboard.' },
      { title: 'Paste it', text: 'Paste the symbol into your document, chat or code.' },
    ],
    faqs: [
      { question: 'How do I type the rupee sign ₹?', answer: 'Open the Currency category and click ₹ (U+20B9) to copy it, then paste it where you need it.' },
      { question: 'What is a Unicode code point?', answer: 'The unique number assigned to every character, written as U+ followed by hex digits. In HTML you can write it as &#x20AC;.' },
      { question: 'Will the symbol display everywhere?', answer: 'Common symbols display on all modern devices. Rare characters depend on the fonts installed on the reader’s device.' },
    ],
  },
  'timezone-converter': {
    h1: 'Time Zone Converter',
    description: 'Convert a date and time between world time zones with automatic daylight saving time handling.',
    introParagraph: 'The Time Zone Converter shows what a given date and time in one zone is in another — for scheduling meetings, webinars and calls across countries. Pick the date and time, the source zone (your current zone is preselected) and the target zone. Conversions use the IANA time zone database built into your browser, so daylight saving time changes are applied automatically for the date you choose.',
    steps: [
      { title: 'Set date and time', text: 'Choose the date and time you want to convert.' },
      { title: 'Choose the zones', text: 'Select the source and target time zones.' },
      { title: 'Copy the converted time', text: 'Copy the result to share in an invite or message.' },
    ],
    faqs: [
      { question: 'Does it handle daylight saving time?', answer: 'Yes. The offset for the selected date is used, so summer and winter times are converted correctly.' },
      { question: 'What is the difference between UTC and GMT?', answer: 'For everyday use they show the same time. UTC is the precise scientific standard; GMT is the time zone used in the UK in winter.' },
      { question: 'Why is the offset different from last month?', answer: 'One of the zones has switched between standard and daylight saving time.' },
    ],
  },
  'roman-numeral-converter': {
    h1: 'Roman Numeral Converter',
    description: 'Convert numbers to Roman numerals and Roman numerals back to numbers, from 1 to 3999.',
    introParagraph: 'The Roman Numeral Converter translates between Arabic numbers and Roman numerals in both directions — for example 2024 is MMXXIV. It follows the standard subtractive rules (IV for 4, IX for 9, XL for 40, CM for 900) and supports the classic range of 1 to 3999. Useful for dates on monuments and film credits, book chapters, clock faces, outlines and tattoos.',
    steps: [
      { title: 'Choose a direction', text: 'Number → Roman numeral or Roman numeral → number.' },
      { title: 'Enter the value', text: 'Type a number from 1 to 3999 or a Roman numeral.' },
      { title: 'Copy the result', text: 'Copy the converted value.' },
    ],
    faqs: [
      { question: 'Why only up to 3999?', answer: 'Standard Roman numerals have no symbol above M (1000), and M can repeat at most three times, so 3999 (MMMCMXCIX) is the largest regular value.' },
      { question: 'How is 2026 written?', answer: 'MMXXVI — MM (2000) + XX (20) + VI (6).' },
      { question: 'Is there a Roman numeral for zero?', answer: 'No. The Roman system had no zero.' },
    ],
  },
  'number-to-words': {
    h1: 'Number to Words Converter',
    description: 'Spell out numbers in English words — including cheque amounts in USD, EUR, GBP, INR and PKR.',
    introParagraph: 'Number to Words writes out any number in English words, for example 12,500.50 as "Twelve Thousand Five Hundred Point Five Zero". Currency mode formats amounts the way they are written on cheques, invoices and legal documents in US dollars and cents, euros, pounds and pence, Indian rupees and paise, or Pakistani rupees and paisa. Choose Title Case, lowercase or UPPERCASE output and copy it.',
    steps: [
      { title: 'Enter a number', text: 'Type the number or amount, including decimals if needed.' },
      { title: 'Choose the format', text: 'Select plain numbers or a currency, and the letter case.' },
      { title: 'Copy the words', text: 'Copy the spelled-out text into your cheque, invoice or document.' },
    ],
    faqs: [
      { question: 'How do I write an amount on a cheque?', answer: 'Choose your currency, enter the amount, and copy the result — for example "One Thousand Two Hundred Dollars and Fifty Cents".' },
      { question: 'Does it use the Indian numbering system?', answer: 'The words follow the international system (thousand, million, billion).' },
      { question: 'How large a number can it convert?', answer: 'Numbers into the trillions are supported, which covers invoices and financial documents.' },
    ],
  },
  'age-calculator': {
    h1: 'Age Calculator – Exact Age in Years, Months & Days',
    description: 'Calculate your exact age from your date of birth in years, months, days and total days, plus your next birthday.',
    introParagraph: 'The Age Calculator works out exact age from a date of birth: years, months and days, plus the total number of weeks and days lived and how long until the next birthday. It correctly handles months of different lengths and leap years, which is where mental arithmetic often goes wrong. Useful for forms, eligibility checks, milestones and fun facts.',
    steps: [
      { title: 'Enter the date of birth', text: 'Pick the birth date in the date field.' },
      { title: 'Read the result', text: 'See age in years, months and days, total days and weeks, and the next birthday.' },
      { title: 'Copy it', text: 'Copy the result if you need it for a form or message.' },
    ],
    faqs: [
      { question: 'How is age calculated for leap-day birthdays?', answer: 'Someone born on 29 February gains a year on 1 March in non-leap years, which is the common legal convention.' },
      { question: 'Is the calculation based on my time zone?', answer: 'Yes. Today’s date is taken from your device clock.' },
      { question: 'Can I calculate age at a specific past date?', answer: 'Use the Date Calculator to count the exact years, months and days between any two dates.' },
    ],
  },
  'date-calculator': {
    h1: 'Date Calculator – Days Between Dates',
    description: 'Count the days between two dates, or add and subtract days from a date.',
    introParagraph: 'The Date Calculator has two modes. Date Difference counts the exact number of days (and weeks, months and years) between two dates — for deadlines, notice periods, project durations or countdowns. Add / Subtract Days finds the date a given number of days before or after a start date, such as 90 days from today. Leap years and month lengths are handled automatically.',
    steps: [
      { title: 'Choose a mode', text: 'Date Difference or Add / Subtract Days.' },
      { title: 'Enter the dates or days', text: 'Pick the start and end dates, or a start date and a number of days.' },
      { title: 'Read and copy', text: 'See the result and copy it.' },
    ],
    faqs: [
      { question: 'Does it include the end date?', answer: 'The difference counts the days between the dates (1 January to 31 December is 365 days). Add one if you need to count both start and end days.' },
      { question: 'How many days are in 2024?', answer: '366, because 2024 is a leap year.' },
      { question: 'Can it count business days only?', answer: 'It counts calendar days. Weekends and holidays are included.' },
    ],
  },
  'bmi-calculator': {
    h1: 'BMI Calculator',
    description: 'Calculate Body Mass Index in metric (kg, cm) or imperial (lb, ft/in) units with the WHO weight category.',
    introParagraph: 'The BMI Calculator computes Body Mass Index from height and weight — weight in kilograms divided by height in metres squared — in metric or imperial units, and shows the World Health Organization category: underweight (below 18.5), healthy (18.5–24.9), overweight (25–29.9) or obese (30 and above). For example, 70 kg at 175 cm gives a BMI of 22.9. BMI is a quick screening measure, not a diagnosis.',
    steps: [
      { title: 'Choose units', text: 'Metric (kg, cm) or imperial (lb, ft/in).' },
      { title: 'Enter height and weight', text: 'Type your measurements.' },
      { title: 'See your BMI', text: 'Read the BMI value and its WHO category.' },
    ],
    faqs: [
      { question: 'What is a healthy BMI?', answer: '18.5 to 24.9 for adults, according to the WHO.' },
      { question: 'Is BMI accurate for athletes?', answer: 'Not always. BMI does not distinguish muscle from fat, so muscular people may be classed as overweight.' },
      { question: 'Does BMI apply to children?', answer: 'Children and teens use age- and sex-specific BMI percentiles, so adult categories do not apply.' },
    ],
  },
  'loan-calculator': {
    h1: 'Loan EMI Calculator',
    description: 'Calculate the monthly EMI, total interest and total amount payable for any loan amount, rate and term.',
    introParagraph: 'The Loan EMI Calculator shows the fixed monthly payment (EMI) for a home, car or personal loan using the standard amortisation formula, together with the total interest and total amount you will repay. Enter the loan amount, annual interest rate and term in years — for example 250,000 at 7.5% over 15 years gives an EMI of about 2,318 per month. Change any value to compare offers instantly.',
    steps: [
      { title: 'Enter the loan amount', text: 'Type the principal you plan to borrow.' },
      { title: 'Set rate and term', text: 'Enter the annual interest rate and the number of years.' },
      { title: 'Compare the results', text: 'Read the monthly EMI, total interest and total payable.' },
    ],
    faqs: [
      { question: 'How is EMI calculated?', answer: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the principal, r the monthly interest rate and n the number of monthly payments.' },
      { question: 'Does a longer term reduce the total cost?', answer: 'No. A longer term lowers the monthly EMI but increases the total interest paid.' },
      { question: 'Are fees and insurance included?', answer: 'No. The calculation covers principal and interest only; add lender fees separately.' },
    ],
  },
  'tip-calculator': {
    h1: 'Tip Calculator & Bill Splitter',
    description: 'Work out the tip and split the bill between any number of people with preset or custom tip percentages.',
    introParagraph: 'The Tip Calculator calculates the tip and total for a restaurant bill and splits it evenly between everyone at the table. Enter the bill amount and number of people, then choose 10%, 15%, 18%, 20% or 25% — or type a custom percentage. You see the tip amount, the total and what each person pays, ready to copy into a group chat.',
    steps: [
      { title: 'Enter the bill', text: 'Type the bill amount before tip.' },
      { title: 'Choose tip and people', text: 'Select a tip percentage and the number of people.' },
      { title: 'Split it', text: 'See the tip, total and per-person amount, and copy the split.' },
    ],
    faqs: [
      { question: 'How much should I tip?', answer: 'Customs vary: in the US 15–20% is standard for table service; in many other countries a smaller tip or rounding up is usual.' },
      { question: 'Should the tip be on the amount before tax?', answer: 'Traditionally yes — tip on the pre-tax subtotal — though many people tip on the total for simplicity.' },
      { question: 'How is the per-person amount rounded?', answer: 'It is shown to two decimal places; round up if you are paying in cash.' },
    ],
  },
  'discount-calculator': {
    h1: 'Discount Calculator – Sale Price & Savings',
    description: 'Calculate the final sale price and how much you save, including an extra coupon discount stacked on top.',
    introParagraph: 'The Discount Calculator shows the final price after a percentage discount and how much you save — for example 25% off 120 is 90. It also handles stacked discounts: enter an additional coupon percentage and it is applied to the already-reduced price, which is how most shops calculate "an extra 10% off sale items". Useful for comparing deals and checking prices at checkout.',
    steps: [
      { title: 'Enter the original price', text: 'Type the price before any discount.' },
      { title: 'Add the discounts', text: 'Enter the main discount and any extra coupon percentage.' },
      { title: 'See the final price', text: 'Read the sale price and total savings, and copy them.' },
    ],
    faqs: [
      { question: 'Is 20% + 10% the same as 30% off?', answer: 'No. Stacked discounts multiply: 20% then 10% off is 28% in total, because the second discount applies to the reduced price.' },
      { question: 'How do I calculate a discount percentage?', answer: 'Subtract the sale price from the original price, divide by the original price and multiply by 100.' },
      { question: 'Does it include sales tax?', answer: 'No. Add tax separately, for example with the GST / VAT calculator.' },
    ],
  },
  'gst-calculator': {
    h1: 'GST / VAT Calculator',
    description: 'Add GST/VAT to a net price or extract it from a gross price at 5%, 12%, 18% or 28%.',
    introParagraph: 'The GST Calculator adds tax to a price or extracts tax from a price that already includes it. In exclusive mode, 18% GST on 5,000 is 900, for a total of 5,900. In inclusive mode, the tool works backwards from the total to show the net amount and the tax inside it. Rates of 5%, 12%, 18% (standard) and 28% are available, matching India’s GST slabs, and the same maths applies to VAT and sales tax anywhere.',
    steps: [
      { title: 'Enter the amount', text: 'Type the net or gross amount.' },
      { title: 'Choose exclusive or inclusive', text: 'Add GST to the amount, or extract GST already included in it.' },
      { title: 'Select the rate', text: 'Pick 5%, 12%, 18% or 28% and copy the breakdown.' },
    ],
    faqs: [
      { question: 'How do I remove GST from a price?', answer: 'Choose Inclusive. The net price is the total ÷ (1 + rate); for 18% that is total ÷ 1.18.' },
      { question: 'How is GST split into CGST and SGST?', answer: 'For sales within one Indian state, the GST amount is split equally: at 18%, 9% CGST and 9% SGST.' },
      { question: 'Can I use it for VAT?', answer: 'Yes. The calculation is identical; choose the rate that matches your VAT rate if it is listed.' },
    ],
  },
  'signature-pad': {
    h1: 'Online Signature Maker – Draw Your Signature',
    description: 'Draw a signature with your mouse, finger or stylus and download it as a transparent PNG or a JPEG.',
    introParagraph: 'The Signature Pad lets you draw a handwritten signature and save it as an image for documents, PDFs, contracts and emails. Draw with a mouse, trackpad, finger or stylus, adjust the pen thickness, undo strokes or clear the pad, then download a transparent PNG that sits cleanly on any document, or a JPEG with a white background. The drawing stays in your browser.',
    steps: [
      { title: 'Draw your signature', text: 'Sign on the pad with a mouse, finger or stylus.' },
      { title: 'Adjust', text: 'Change the pen width, undo strokes or clear and start again.' },
      { title: 'Download', text: 'Save a transparent PNG or a white-background JPEG.' },
    ],
    faqs: [
      { question: 'Is an image signature legally binding?', answer: 'In many countries an electronic signature is valid for everyday agreements, but some documents require a certified digital signature. Check the rules for your document.' },
      { question: 'Which format should I choose?', answer: 'Transparent PNG for placing on PDFs and documents; JPEG only if the target does not support transparency.' },
      { question: 'Is my signature stored?', answer: 'No. It exists only in your browser until you download it or close the page.' },
    ],
  },
  'invoice-generator': {
    h1: 'Free Invoice Generator – Download PDF Invoices',
    description: 'Create a professional invoice with your business details, line items and tax, and download it as a PDF.',
    introParagraph: 'The Invoice Generator creates a clean PDF invoice without an account or template software. Fill in the invoice number, issue and due dates, your business name and email, the client’s details and each line item with quantity and rate; the subtotal, tax and total are calculated automatically. Download the invoice as a PDF ready to email. All data stays in your browser.',
    steps: [
      { title: 'Add your and your client’s details', text: 'Enter the invoice number, dates, business and client information.' },
      { title: 'Add line items', text: 'Enter descriptions, quantities and rates, and set the tax rate.' },
      { title: 'Download the PDF', text: 'Save the finished invoice as a PDF.' },
    ],
    faqs: [
      { question: 'What should an invoice include?', answer: 'A unique invoice number, issue and due dates, seller and buyer details, a description of each item or service with quantity and price, tax, and the total due.' },
      { question: 'Is my business data saved?', answer: 'No. Nothing is stored or uploaded, so keep a copy of each PDF you create.' },
      { question: 'Can I use it for VAT or GST invoices?', answer: 'Yes. Enter your tax rate; check your local rules for any extra fields such as a tax registration number.' },
    ],
  },
  'favicon-generator': {
    h1: 'Favicon Generator – Create Favicon PNGs from an Image',
    description: 'Turn a logo into a favicon pack: 16, 32 and 48 px icons, Apple touch icon, Android icons and a web manifest.',
    introParagraph: 'The Favicon Generator converts a square logo or image into the set of icons websites need: favicon PNGs at 16×16, 32×32 and 48×48, a 180×180 Apple touch icon, 192×192 and 512×512 Android Chrome icons, and a site.webmanifest file, packaged together in one ZIP with the HTML tags to paste into your page head. Start from a square image of at least 512×512 px for sharp results. Everything is generated in your browser.',
    steps: [
      { title: 'Upload your logo', text: 'Choose a square PNG, JPG, WEBP or SVG, ideally 512×512 px or larger.' },
      { title: 'Generate the pack', text: 'All icon sizes and the web manifest are created instantly.' },
      { title: 'Download and install', text: 'Download the ZIP, upload the files to your site root and paste the HTML tags into <head>.' },
    ],
    faqs: [
      { question: 'What size should my favicon image be?', answer: 'Start with a square image of at least 512×512 px. The tool scales it down to every required size.' },
      { question: 'Why does Google show a different icon for my site?', answer: 'Google needs a favicon that is a multiple of 48 px and crawlable. After updating, Google can take days or weeks to refresh it in results.' },
      { question: 'Do I still need favicon.ico?', answer: 'Modern browsers use the PNG icons. An .ico file is only needed for very old browsers or tools that request /favicon.ico directly.' },
    ],
  },
  'og-image-generator': {
    h1: 'Open Graph Image Generator (1200×630)',
    description: 'Create a 1200×630 social share image with your title, subtitle and brand for Facebook, LinkedIn, X and WhatsApp.',
    introParagraph: 'The OG Image Generator creates the preview image that appears when your page is shared on Facebook, LinkedIn, X (Twitter), Slack or WhatsApp. Enter a title, subtitle, brand name and tag, pick one of five colour themes, and download a high-resolution 1200×630 PNG — the size recommended for og:image. Add it to your page with an og:image meta tag.',
    steps: [
      { title: 'Write the text', text: 'Enter the title, subtitle, brand and tag.' },
      { title: 'Pick a theme', text: 'Choose Midnight, Slate, Emerald, Amber or Indigo.' },
      { title: 'Download the PNG', text: 'Save the 1200×630 image and reference it in your og:image tag.' },
    ],
    faqs: [
      { question: 'What size should an Open Graph image be?', answer: '1200×630 pixels (a 1.91:1 ratio) works for Facebook, LinkedIn, X and most messaging apps.' },
      { question: 'How do I add it to my website?', answer: 'Upload the PNG and add <meta property="og:image" content="https://your-site.com/og-image.png"> to the page head.' },
      { question: 'Why does Facebook still show the old image?', answer: 'Social networks cache previews. Use Facebook’s Sharing Debugger to force a refresh.' },
    ],
  },
  'placeholder-image': {
    h1: 'Placeholder Image Generator',
    description: 'Create placeholder images of any size and colour with custom text, and download them as PNG, JPEG or WEBP.',
    introParagraph: 'The Placeholder Image Generator makes dummy images for wireframes, mockups and development. Set the width and height, background and text colours, and optional custom text (it defaults to the dimensions, such as "600 × 400"), then download the image as PNG, JPEG or WEBP. Images are drawn on a canvas in your browser, so there is no dependency on external placeholder services.',
    steps: [
      { title: 'Set the size', text: 'Enter the width and height in pixels.' },
      { title: 'Style it', text: 'Choose background and text colours and optional text.' },
      { title: 'Download', text: 'Save it as PNG, JPEG or WEBP.' },
    ],
    faqs: [
      { question: 'What text is shown by default?', answer: 'The image dimensions, for example "600 × 400", so you can see the size at a glance in your layout.' },
      { question: 'Which format should I choose?', answer: 'PNG for crisp text, JPEG or WEBP for smaller files.' },
      { question: 'Is there a maximum size?', answer: 'Very large canvases are limited by the browser; sizes up to several thousand pixels work everywhere.' },
    ],
  },
  'random-picker': {
    h1: 'Random Name Picker & Decision Maker',
    description: 'Pick a random winner or choice from your own list, with the option to remove each picked item.',
    introParagraph: 'The Random Picker chooses one item at random from a list you enter — names for a giveaway, who presents first, what to eat tonight. Enter one option per line and press Pick a Winner. Turn on "Remove picked item" to draw several winners in turn without repeats. The pick uses the browser’s cryptographically secure random generator, so every option has an equal chance.',
    steps: [
      { title: 'Enter your options', text: 'Type or paste one name or choice per line.' },
      { title: 'Pick a winner', text: 'Press Pick a Winner to choose at random.' },
      { title: 'Draw again', text: 'Enable Remove picked item to draw more winners without repeats.' },
    ],
    faqs: [
      { question: 'Is the pick truly random?', answer: 'It uses crypto.getRandomValues(), a cryptographically secure source, so each option has the same probability.' },
      { question: 'Can I use it for giveaways?', answer: 'Yes. Paste the entrant list and, for multiple winners, enable removal so nobody is picked twice.' },
      { question: 'Is my list saved?', answer: 'No. It stays in your browser tab only.' },
    ],
  },
  'dice-roller': {
    h1: 'Online Dice Roller (d4, d6, d8, d10, d12, d20, d100)',
    description: 'Roll one or more virtual dice — d4 to d100 — with an optional modifier and see each roll and the total.',
    introParagraph: 'The Dice Roller rolls virtual dice for board games, tabletop RPGs like Dungeons & Dragons, and classroom probability exercises. Choose the die type (d4, d6, d8, d10, d12, d20 or d100), how many dice to roll and an optional modifier, then roll to see each result and the total — for example 2d6+0. Results come from a cryptographically secure random generator, so the dice are fair.',
    steps: [
      { title: 'Choose the die', text: 'Pick d4, d6, d8, d10, d12, d20 or d100.' },
      { title: 'Set count and modifier', text: 'Enter how many dice to roll and any bonus or penalty.' },
      { title: 'Roll', text: 'See every die, the total, and copy the sum.' },
    ],
    faqs: [
      { question: 'Are the rolls fair?', answer: 'Yes. Each roll uses crypto.getRandomValues() with rejection sampling so every face is equally likely.' },
      { question: 'What does 2d6+3 mean?', answer: 'Roll two six-sided dice and add 3 to the total.' },
      { question: 'Can I roll a d100?', answer: 'Yes. Choose d100 for percentile rolls from 1 to 100.' },
    ],
  },
  'coin-flip': {
    h1: 'Flip a Coin Online – Heads or Tails',
    description: 'Flip a fair virtual coin for heads or tails with an animated toss and a running tally.',
    introParagraph: 'Coin Flip tosses a virtual coin and lands on heads or tails with an exactly 50/50 chance — handy for settling decisions, choosing who goes first, or probability lessons. Each flip uses the browser’s cryptographically secure random generator rather than a predictable formula, so results cannot be anticipated.',
    steps: [
      { title: 'Press Flip Coin', text: 'The coin spins and lands.' },
      { title: 'Read the result', text: 'See heads or tails.' },
      { title: 'Flip again', text: 'Flip as many times as you like.' },
    ],
    faqs: [
      { question: 'Is the virtual coin fair?', answer: 'Yes. Each flip has an exactly equal chance of heads and tails from a cryptographically secure random source.' },
      { question: 'Does the previous result affect the next flip?', answer: 'No. Every flip is independent, just like a real coin.' },
      { question: 'Can I use it for important decisions?', answer: 'It is as fair as a real coin toss — the rest is up to you.' },
    ],
  },
  'random-number': {
    h1: 'Random Number Generator',
    description: 'Generate one or more secure random numbers in any range, sorted or unsorted, with or without duplicates.',
    introParagraph: 'The Random Number Generator produces random integers between a minimum and maximum you choose — for lotteries, raffles, sampling, games and testing. Generate several numbers at once, sort them ascending or descending, and choose "unique numbers only" to prevent duplicates, for example 6 unique numbers from 1 to 49. Numbers come from crypto.getRandomValues(), a cryptographically secure source.',
    steps: [
      { title: 'Set the range', text: 'Enter the minimum and maximum values.' },
      { title: 'Choose count and options', text: 'Pick how many numbers, sorting, and whether they must be unique.' },
      { title: 'Generate', text: 'Press Generate Numbers and copy the results.' },
    ],
    faqs: [
      { question: 'Are the numbers truly random?', answer: 'They come from the browser’s cryptographically secure generator, suitable for fair draws and security-sensitive uses.' },
      { question: 'Are the minimum and maximum included?', answer: 'Yes. Both ends of the range can be drawn.' },
      { question: 'How do I pick lottery numbers?', answer: 'Set the range (for example 1–49), the count (6) and enable unique numbers only.' },
    ],
  },
};
