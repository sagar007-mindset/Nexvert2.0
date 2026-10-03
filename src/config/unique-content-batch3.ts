/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_BATCH3_CONTENT: Record<string, ToolSEOData> = {
  'gif-splitter': {
    h1: 'Free GIF Frame Splitter – Decompile Animated GIFs into Individual PNG Frames',
    description: 'Decompile animated GIF files into individual full-resolution PNG image frames with precise disposal handling and optional ZIP export in your browser.',
    introParagraph: 'The GIF Frame Splitter decompiles animated GIF89a graphic files into sequential individual image frames directly inside your browser. Animated GIFs consist of a stream of bitmap blocks paired with Graphic Control Extensions that govern frame delay intervals, transparency indices, and disposal methods such as restore to background or restore to previous frame. Our client-side decompiler decodes the raw LZW compressed byte stream, reconstructs the full canvas composite state for each distinct frame tick, and renders each isolated step to an uncompressed 2D canvas context. This enables you to export individual frames as crisp 32-bit PNG images or package the entire animation sequence into a single ZIP archive. Common applications include extracting specific keyframes or reference poses from animations, analyzing micro-interactions in UI animation mockups, and repairing damaged animated assets. Keep in mind that processing exceptionally long animated GIFs containing hundreds of frames at high pixel resolutions requires adequate available device RAM, as rendering large uncompressed canvas bitmaps simultaneously in memory can encounter browser tab resource limits.',
    steps: [
      {
        title: 'Upload Animated GIF',
        text: 'Select or drag your animated GIF file into the canvas decompiler to parse its internal graphic control extension blocks and frame count.'
      },
      {
        title: 'Preview and Select Frames',
        text: 'Inspect the generated timeline of sequential frame thumbnails, check frame delay timings in milliseconds, and select individual frames or the complete sequence.'
      },
      {
        title: 'Export as PNG or ZIP',
        text: 'Download selected frames directly as high-resolution PNG images or click Export All to package the complete numbered frame sequence into a clean ZIP archive.'
      }
    ],
    faqs: [
      {
        question: 'How does the splitter resolve GIF disposal methods to prevent transparency ghosting?',
        answer: 'GIF animations often optimize file sizes by only redrawing changed pixels from frame to frame using disposal methods like "Restore to Background" or "Do Not Dispose". Our engine renders frames against a composite virtual canvas that accurately preserves prior frame states, preventing the ghosting or transparent pixel artifacting that happens when naive extractors isolate raw delta frames.'
      },
      {
        question: 'Are extracted frames saved with transparent backgrounds?',
        answer: 'Yes. If your source GIF incorporates transparency flags in its palette descriptor, the extracted PNG files retain exact 8-bit alpha transparency channels, making them ready for immediate compositing into design tools or video editors.'
      },
      {
        question: 'Is there a limit on how many frames can be split at once?',
        answer: 'You can decompile standard GIF animations containing up to 300 to 500 frames smoothly on modern devices. Extremely long animations at 1080p resolution may take several seconds as each frame is synthesized into uncompressed canvas memory.'
      }
    ]
  },

  'docx-to-html': {
    h1: 'Convert DOCX to Clean HTML – Extract Word Document Styles and Semantic Markup',
    description: 'Transform Microsoft Word DOCX files into clean, semantic HTML5 markup with embedded images, clean headings, and zero proprietary schema clutter.',
    introParagraph: 'The DOCX to HTML converter translates Microsoft Word OpenXML documents (.docx) into standards-compliant, semantic HTML5 markup entirely within your browser memory. Word documents are zipped archive packages containing complex Office Open XML structures such as word/document.xml, style definitions, and embedded media assets. Rather than generating bloated proprietary markup filled with MsoNormal classes and XML namespaces like traditional desktop export functions, this converter parses semantic structures to produce clean tags including paragraphs, heading levels one through six, bulleted and numbered lists, tabular data grids, and blockquotes. Embedded document illustrations, diagrams, and photos are extracted and converted into responsive base64 data URIs or clean image references. Web developers, technical writers, and content management teams use this utility to ingest Word manuscripts into CMS publishing platforms, blogs, and documentation sites without spending hours stripping Microsoft styling artifacts. Note that complex multi-column section breaks, WordArt shapes, and floating desktop text boxes are simplified into sequential web flow blocks to ensure clean responsive display across all devices.',
    steps: [
      {
        title: 'Select Word Document',
        text: 'Drag and drop your DOCX file into the converter to de-package its internal OpenXML document archive and style hierarchies.'
      },
      {
        title: 'Configure Formatting Preferences',
        text: 'Choose your desired output styling mode, select whether to embed images as inline base64 strings, and preview the live HTML rendered output.'
      },
      {
        title: 'Copy or Download Clean HTML',
        text: 'Copy the generated semantic HTML markup directly to your clipboard or download the complete .html file for deployment to your website or CMS.'
      }
    ],
    faqs: [
      {
        question: 'How does this converter handle images embedded inside the DOCX document?',
        answer: 'Embedded graphics stored in the word/media folder of the DOCX package are extracted and automatically converted into inline base64-encoded data URIs within standard <img> tags, allowing the resulting HTML file to render images self-contained without needing external image hosting.'
      },
      {
        question: 'Does the output HTML contain proprietary Microsoft Word CSS classes?',
        answer: 'No. The conversion engine intentionally strips proprietary MsoListParagraph, MsoNormal, and v:shape markup, producing clean, semantic HTML5 elements that seamlessly inherit your website or publishing platform stylesheet rules.'
      },
      {
        question: 'Can Word tables with merged cells and borders be converted accurately?',
        answer: 'Yes. Word table XML structures are mapped to semantic <table>, <thead>, <tbody>, <tr>, and <td> elements, preserving column spans (colspan) and row spans (rowspan) so tabular data remains intact.'
      }
    ]
  },

  'docx-to-markdown': {
    h1: 'Convert DOCX to Markdown – Transform Word Documents into GitHub-Flavored Markdown',
    description: 'Convert Microsoft Word DOCX documents into clean GitHub Flavored Markdown (GFM) with formatted tables, code blocks, lists, and headings.',
    introParagraph: 'The DOCX to Markdown converter converts Microsoft Word documents into lightweight, human-readable Markdown (.md) conforming to CommonMark and GitHub Flavored Markdown specifications. Technical documentation teams, software engineers, and static site developers frequently receive editorial copy, product requirement briefs, or knowledge base articles formatted in Microsoft Word that must be committed into Git repositories for tools like Docusaurus, Hugo, Jekyll, or Astro. This client-side utility parses the underlying Office Open XML paragraph styles, mapping document headings to standard hash syntax (#, ##, ###), inline emphasis to asterisks, ordered and unordered lists to indented Markdown list trees, and tabular grids to pipe table syntax (| Column | Column |). Hyperlinks and blockquotes are preserved cleanly. A natural technical boundary of Markdown conversion is that complex Word design layouts—such as floating text sidebars, background shading tints, and nested shape graphics—cannot be expressed in standard plain text Markdown syntax and are stripped to maintain clean semantic documentation standards.',
    steps: [
      {
        title: 'Drop DOCX Document',
        text: 'Upload your Word .docx file to initiate instant client-side XML schema extraction and structure parsing.'
      },
      {
        title: 'Inspect Rendered Markdown',
        text: 'Review the live split-screen preview showing the raw Markdown syntax alongside its rendered visual documentation output.'
      },
      {
        title: 'Export Markdown File',
        text: 'Copy the formatted Markdown text to your clipboard or download the ready-to-commit .md file directly into your documentation repository.'
      }
    ],
    faqs: [
      {
        question: 'How are complex Word tables converted into Markdown format?',
        answer: 'Tables are converted into standard GitHub Flavored Markdown pipe table syntax (| Header | Header |), with automatic column alignment markers (:---, :---:) based on the original cell alignment settings in the source Word document.'
      },
      {
        question: 'Are inline links, footnotes, and code formatting preserved?',
        answer: 'Yes. Hyperlinks are translated to [Link Text](URL) format, inline code spans formatted with Courier or Consolas fonts are enclosed in backticks, and bullet structures maintain proper indentation levels.'
      },
      {
        question: 'What happens to embedded Word graphics during Markdown conversion?',
        answer: 'Because pure Markdown files are plain text, embedded images are extracted and referenced with standard markdown image tags. You can download the extracted images separately alongside your generated Markdown document.'
      }
    ]
  },

  'docx-to-text': {
    h1: 'Convert DOCX to Plain Text – Extract Unformatted Raw Text from Word Documents',
    description: 'Extract pure, unformatted UTF-8 plain text from Microsoft Word DOCX files with zero binary overhead, layout tags, or metadata clutter.',
    introParagraph: 'The DOCX to Plain Text converter extracts raw, unformatted text strings from Microsoft Word OpenXML documents (.docx) without transmitting file data across the internet. Word files are complex composite packages containing heavy XML headers, font tables, revision tracking histories, and layout schemas that prevent straightforward text extraction via traditional command-line utilities. This tool reads the inner word/document.xml payload, traversing paragraph and text run nodes (w:p and w:r/w:t) to compile a continuous UTF-8 plain text stream while preserving logical paragraph breaks and bullet item separations. It is an indispensable utility for data scientists curating clean text training datasets for natural language processing models, developers creating full-text search indexes, legal researchers performing keyword regex searches across deposition drafts, and copywriters needing clean copy stripped of conflicting fonts. Limitations to consider are that visual tabular layouts will be serialized as sequential text rows separated by tabs or spaces, and embedded image figures cannot yield text unless processed through optical character recognition.',
    steps: [
      {
        title: 'Select Word File',
        text: 'Upload any .docx file into the browser extractor to unpack paragraph XML nodes in memory.'
      },
      {
        title: 'Configure Line Break Formatting',
        text: 'Choose whether to preserve double paragraph breaks, normalize white space, or insert tab delimiters between table columns.'
      },
      {
        title: 'Extract Text Stream',
        text: 'Click to copy the pristine unformatted text directly to your clipboard or download a clean, universal .txt document.'
      }
    ],
    faqs: [
      {
        question: 'Does this text extractor capture headers, footers, and footnotes from the Word file?',
        answer: 'You can toggle whether to include secondary OpenXML streams such as header.xml, footer.xml, and footnotes.xml in the extracted text body or restrict output strictly to the primary document narrative body.'
      },
      {
        question: 'Are international characters and non-Latin alphabets supported?',
        answer: 'Yes. The extraction engine decodes text using universal UTF-8 character encoding, ensuring accented characters, Cyrillic, Greek, Arabic, Chinese, Japanese, and Korean glyphs are extracted accurately without corrupted symbol replacements.'
      },
      {
        question: 'Can this tool extract text from older .doc binary files?',
        answer: 'This utility is specifically optimized for modern .docx (XML-based) formats. Legacy binary .doc files created in Word 97–2003 must first be saved or converted to .docx before processing in modern browser OpenXML parsers.'
      }
    ]
  },

  'markdown-to-pdf': {
    h1: 'Convert Markdown to PDF – Render Formatted Documents with Clean Typography',
    description: 'Transform Markdown files and CommonMark text into beautifully formatted, paginated PDF documents with custom typography and styling in your browser.',
    introParagraph: 'The Markdown to PDF converter transforms CommonMark and GitHub Flavored Markdown files (.md) into publication-grade, paginated PDF documents directly inside your web browser. Authors, software developers, technical documentation writers, and academic researchers rely on Markdown for its lightweight, distraction-free syntax, but delivering reports to executives, clients, or print publishers demands polished PDF formatting. This browser-based compiler parses Markdown tokens including headings, bold/italic runs, nested lists, blockquotes, syntax-highlighted code blocks, and data tables, rendering them through a high-precision vector layout engine. The tool dynamically computes pagination, applies proportional margins, embeds clean standard typography, and generates selectable vector text rather than blurry rasterized bitmaps. You would use this utility to generate clean project release notes, client invoices, cheat sheets, academic summaries, or engineering proposals without installing heavyweight desktop toolchains like Pandoc or LaTeX. Limitations include constrained support for arbitrary local desktop font files and automated table splitting across page breaks if a single table cell contains exceptionally long text.',
    steps: [
      {
        title: 'Input Markdown Source',
        text: 'Paste raw Markdown text into the editor or upload an existing .md file to generate an instantaneous visual layout preview.'
      },
      {
        title: 'Adjust Page and Style Options',
        text: 'Select your preferred paper size (A4 or US Letter), margin spacing, font family, and code block color theme.'
      },
      {
        title: 'Generate Paginated PDF',
        text: 'Click Convert to compile the document into a high-resolution, vector-rendered PDF document and initiate instant download.'
      }
    ],
    faqs: [
      {
        question: 'Can I force manual page breaks in my Markdown before converting to PDF?',
        answer: 'Yes. You can insert an HTML page break tag like <div style="page-break-after: always;"></div> or a standard horizontal rule tag between sections to instruct the PDF pagination engine to begin a fresh page.'
      },
      {
        question: 'Are code blocks rendered with monospace fonts and background contrast?',
        answer: 'Yes. Fenced code blocks are styled with clean monospace typography, rounded contrast containers, and horizontal scroll or wrap rules to ensure syntax remains clean and legible in the compiled PDF.'
      },
      {
        question: 'Will hyperlinks in the Markdown document remain clickable in the output PDF?',
        answer: 'Yes. The vector PDF compiler preserves valid URI annotations, ensuring that all markdown links ([Anchor Text](https://...)) remain interactive and clickable in standard PDF viewers.'
      }
    ]
  },

  'csv-to-markdown': {
    h1: 'Convert CSV to Markdown Table – Format Comma-Separated Data into ASCII Tables',
    description: 'Convert raw CSV, TSV, or spreadsheet data into aligned GitHub Flavored Markdown tables with customizable column alignments and instant copy.',
    introParagraph: 'The CSV to Markdown Table converter formats comma-separated values (CSV), tab-separated data (TSV), and pasted spreadsheet matrices into clean, visually aligned GitHub Flavored Markdown tables. When discussing pull requests on GitHub, drafting technical documentation in Markdown wikis, or writing developer blog posts, embedding raw CSV records produces illegible blocks of text. This tool parses delimited text records, identifies header fields, calculates optimal padding widths for each vertical column, and constructs a structured ASCII grid using pipe (|) dividers and alignment dashes (:---, :---:, ---:). Users can configure column justification to align numerical metrics to the right while keeping descriptive text left-aligned. It is ideal for software engineers documenting API payload schemas, data analysts sharing benchmark metrics in team chat, and technical writers preparing documentation. A practical consideration is that extremely wide datasets containing dozens of columns can become unwieldy to read on narrow mobile screens, and cells containing raw newline breaks must be sanitized to prevent breaking Markdown row structures.',
    steps: [
      {
        title: 'Paste or Upload CSV Data',
        text: 'Paste raw delimited text into the input pane or drop a .csv file to automatically detect column boundaries and delimiters.'
      },
      {
        title: 'Set Column Alignments',
        text: 'Configure alignment preferences (left, center, or right) for individual columns and toggle whether the first line represents a header row.'
      },
      {
        title: 'Copy Markdown Table Syntax',
        text: 'Review the aligned ASCII table preview and click Copy Table to transfer the formatted Markdown code directly into your clipboard.'
      }
    ],
    faqs: [
      {
        question: 'How does the tool handle commas or quotation marks inside cell text?',
        answer: 'The parser complies with RFC 4180 specifications, correctly handling escaped quotation marks and commas wrapped in quotes so that complex data fields remain within a single table column rather than splitting incorrectly.'
      },
      {
        question: 'Can I convert tab-separated (TSV) data copied straight from Microsoft Excel or Google Sheets?',
        answer: 'Yes. The auto-detection algorithm recognizes tab delimiters, allowing you to copy any range of cells directly from an open spreadsheet and paste them into the tool to generate a pristine Markdown table.'
      },
      {
        question: 'What happens if a cell contains a pipe character (|)?',
        answer: 'Pipe characters within data cells are automatically escaped with a backslash (\\|) to prevent Markdown rendering engines from misinterpreting them as structural table column dividers.'
      }
    ]
  },

  'html-to-text': {
    h1: 'Convert HTML to Plain Text – Strip Markup and Extract Clean Text Content',
    description: 'Strip HTML tags, inline scripts, and CSS styling to extract clean, readable plain text from webpage source code and email templates in your browser.',
    introParagraph: 'The HTML to Plain Text converter strips tags, stylesheet definitions, and client scripts from HTML markup to produce readable, unformatted plain text. Modern web pages and HTML email templates are cluttered with nested div containers, inline CSS styles, tracking pixels, and script tags that obscure the actual informational content. This utility parses the Document Object Model tree, strips <script>, <style>, <noscript>, and SVG graphics elements entirely, decodes all HTML entity codes (such as &amp;, &quot;, &lt;, &gt;, and &nbsp;), and intelligently converts structural block elements into natural paragraph breaks. It is extensively utilized by email developers creating required multipart/alternative plain text versions of promotional newsletters, web scrapers cleaning harvested articles for machine learning pipelines, and content editors extracting copy from web designs. Limitations include the fact that complex CSS positioning, floating elements, and flexbox multi-column visual layouts are flattened into sequential top-to-bottom text streams.',
    steps: [
      {
        title: 'Input HTML Code or File',
        text: 'Paste your raw HTML markup into the input editor or upload an .html source file to parse its DOM tree in memory.'
      },
      {
        title: 'Choose Formatting Rules',
        text: 'Select formatting options such as preserving link URLs in parentheses, formatting list bullets with dashes, and trimming extra white space.'
      },
      {
        title: 'Retrieve Clean Plain Text',
        text: 'Review the stripped plain text in the output console and click Copy to Clipboard or download the resulting .txt file.'
      }
    ],
    faqs: [
      {
        question: 'Does this tool preserve the destinations of hyperlinks in the text output?',
        answer: 'You can enable the "Include Link URLs" toggle to format anchors as "Anchor Text (https://example.com/)", ensuring critical resource links remain accessible even when converted to pure plain text.'
      },
      {
        question: 'Are tracking scripts, analytics tags, and inline CSS completely eliminated?',
        answer: 'Yes. The parser removes all <script>, <style>, <header>, <footer>, and <nav> blocks before text extraction, guaranteeing that JavaScript tracking code and CSS stylesheets never appear in your plain text output.'
      },
      {
        question: 'How are HTML tables translated into plain text?',
        answer: 'Table rows (<tr>) are converted to distinct lines, and table cells (<td>, <th>) are separated by tabs or spaces, preserving column relationships in a readable ASCII layout.'
      }
    ]
  },

  'epub-to-text': {
    h1: 'Convert EPUB to Plain Text – Extract Unformatted Book Chapters from E-Books',
    description: 'Decompile non-DRM EPUB e-books to extract raw, readable chapter text and complete manuscripts into a universal plain text document.',
    introParagraph: 'The EPUB to Plain Text converter unpacks non-encrypted digital books (.epub) and extracts their full narrative text content into a single, clean plain text (.txt) file. EPUB is an open e-book standard based on a zipped Open Container Format containing XML package manifests, CSS stylesheets, XHTML chapter files, and embedded fonts. Reading or processing these publications in custom software, terminal environments, or assistive screen-reading tools often requires stripping away the complex web markup hierarchy. This tool reads the internal OPF package manifest, follows the publication reading order defined in the spine, decodes each sequential chapter document, and strips HTML markup while retaining natural chapter demarcations and paragraph rhythms. It is ideal for academic researchers analyzing word frequency across literary corpuses, students preparing digital books for text-to-speech audio synthesis, and readers using distraction-free terminal text viewers. A major limitation is that commercial EPUB publications protected by DRM encryption (such as Adobe ADEPT or Apple FairPlay) cannot be decompressed and must be decrypted prior to conversion.',
    steps: [
      {
        title: 'Upload EPUB File',
        text: 'Select your non-DRM .epub e-book file to unpack its internal ZIP container and inspect publication metadata.'
      },
      {
        title: 'Verify Chapter Reading Order',
        text: 'Review the detected spine chapters and choose whether to insert custom divider banners between consecutive book sections.'
      },
      {
        title: 'Download Unified Text File',
        text: 'Click Convert to compile the entire narrative into a single UTF-8 encoded .txt manuscript ready for immediate reading or analysis.'
      }
    ],
    faqs: [
      {
        question: 'Can this tool convert copy-protected (DRM) EPUB books purchased from major retailers?',
        answer: 'No. The converter runs strictly client-side and does not possess encryption bypass keys. It only processes DRM-free, open-access, public domain, or self-authored EPUB publications.'
      },
      {
        question: 'Are chapter titles and headings preserved in the extracted text?',
        answer: 'Yes. Chapter titles defined in the book table of contents and heading tags (<h1>, <h2>) are preserved with clear spacing or divider markers to maintain structural readability across the text file.'
      },
      {
        question: 'How does the tool handle footnotes and endnotes within e-book chapters?',
        answer: 'Footnote text is extracted in sequential reading order. Depending on your configuration, inline reference notes can be placed directly after their parent paragraphs or collected at the end of each respective chapter section.'
      }
    ]
  },

  'epub-to-html': {
    h1: 'Convert EPUB to HTML – Extract and View E-Book Chapters in Web Format',
    description: 'Transform unencrypted EPUB e-books into clean, responsive HTML documents with preserved styling and embedded chapter graphics in your browser.',
    introParagraph: 'The EPUB to HTML converter decompiles electronic publication archives (.epub) and synthesizes their contents into clean, standalone HTML web pages that can be opened in any desktop or mobile browser. While EPUB is the prevailing standard for e-readers, opening an e-book file on a desktop workstation typically requires installing specialized reading software such as Calibre or Apple Books. This client-side utility extracts XHTML chapter documents, internal style definitions, and embedded artwork from the EPUB container, assembling them into a unified, responsive web document complete with an interactive table of contents. Educators use this tool to publish open textbooks directly to class websites, writers convert manuscript drafts into web-friendly proofs, and archivists preserve digital literature in universal open web standards. Limitations include fixed-layout EPUB3 files with complex coordinate positioning that may scale differently in desktop browsers, as well as DRM-encrypted commercial files which cannot be decrypted.',
    steps: [
      {
        title: 'Load EPUB Publication',
        text: 'Upload your non-DRM .epub file into the browser workspace to decompress its internal package container and media assets.'
      },
      {
        title: 'Configure Web Display Options',
        text: 'Choose between a single continuous scrollable web page or a chapter-based layout with a collapsible navigation sidebar.'
      },
      {
        title: 'Save Standalone HTML Document',
        text: 'Download the compiled HTML file with embedded base64 image assets for offline reading or upload to your web server.'
      }
    ],
    faqs: [
      {
        question: 'Do images and illustrations inside the EPUB remain visible in the converted HTML?',
        answer: 'Yes. The converter extracts all image assets from the e-book package and converts them into inline data URIs or embeds them into a self-contained HTML bundle, ensuring illustrations, diagrams, and cover art render properly.'
      },
      {
        question: 'Can I read the converted HTML book offline without an internet connection?',
        answer: 'Yes. The resulting HTML document is entirely self-contained, incorporating all chapter text, CSS styling rules, and visual graphics so you can open and read the book locally in any web browser while completely offline.'
      },
      {
        question: 'Is the original table of contents preserved as clickable links?',
        answer: 'Yes. The internal navigation document (toc.ncx or nav.xhtml) is converted into a semantic HTML navigation menu with anchor links allowing instant jumping to any chapter or section.'
      }
    ]
  },

  'resize-pdf': {
    h1: 'Free PDF Page Resizer – Change PDF Page Dimensions to Standard Formats',
    description: 'Resize PDF page dimensions to standard ISO and North American formats like A4, Letter, and Legal with proportional vector scaling in your browser.',
    introParagraph: 'The PDF Page Resizer adjusts the physical page dimensions and bounding box definitions (MediaBox, CropBox, and BleedBox) of PDF documents without rasterizing text or vector artwork. PDF files authored in different software often use inconsistent page geometries or non-standard dimensions that cause errors when sent to commercial printing presses or formatted for government document filing. This tool modifies the PDF dictionary objects to scale or pad page boundaries to universal standards including ISO 216 sizes (A4, A3, A5) and North American standards (US Letter, Legal, Tabloid). You can choose between proportional scaling with white margin padding to preserve original aspect ratios or content refitting. Because modifications occur directly on internal PDF transformation matrices, text remains crisp, fonts stay embedded, and vector graphics never lose fidelity. It is ideal for administrative assistants preparing documents for overseas offices, researchers standardizing conference submissions, and graphic designers adjusting document print bounds. Keep in mind that documents with extremely tight margins may experience slight white borders when proportionally scaled to different aspect ratios.',
    steps: [
      {
        title: 'Import PDF Document',
        text: 'Upload your PDF document to inspect its current page dimensions, aspect ratios, and total page count in points and millimeters.'
      },
      {
        title: 'Select Target Dimension Standard',
        text: 'Choose a target size preset such as A4, US Letter, or Custom, and select your scaling preference (fit with margins or scale to fill).'
      },
      {
        title: 'Apply and Download Resized PDF',
        text: 'Click Resize to calculate updated page bounding boxes in client memory and download your standardized PDF document immediately.'
      }
    ],
    faqs: [
      {
        question: 'Does resizing a PDF reduce the sharpness or resolution of text and graphics?',
        answer: 'No. The tool applies mathematical coordinate scaling to vector paths and font glyphs rather than converting pages into pixelated bitmap images, meaning text remains perfectly sharp and selectable at any zoom level.'
      },
      {
        question: 'Can I resize a document that contains mixed portrait and landscape page orientations?',
        answer: 'Yes. The resizer automatically detects the orientation of each individual page and applies the chosen dimensions accordingly, ensuring landscape pages remain landscape while scaling to your selected target format.'
      },
      {
        question: 'What is the difference between A4 and US Letter sizes when resizing?',
        answer: 'A4 measures 210 x 297 mm (narrower and taller), while US Letter measures 215.9 x 279.4 mm (wider and shorter). When converting between them, proportional scaling adds minor white padding to the top/bottom or sides to prevent content distortion.'
      }
    ]
  },

  'crop-pdf': {
    h1: 'Free PDF Page Cropper – Crop PDF Margins and Trim Page Boundaries',
    description: 'Crop unwanted margins, scanner border artifacts, and printer marks from PDF pages with interactive visual crop handles in your browser.',
    introParagraph: 'The PDF Page Cropper adjusts visible page boundaries across PDF documents to eliminate excessive white margins, scanner dark borders, printer crop marks, and unwanted headers or footers. When documents are scanned from physical paper or exported from desktop publishing software with wide bleeds, reading them on mobile tablets, laptops, or e-ink readers results in wasted screen space and microscopic text. This browser utility recalculates the CropBox and MediaBox coordinates of the PDF page tree, trimming the active viewing viewport to your exact specified coordinates. You can crop individual pages visually with interactive drag handles or apply uniform numeric margin cuts across an entire multi-page document. Crucially, because this tool modifies internal PDF coordinate limits rather than taking screenshots, all underlying vector lines, typography, and searchable text layers remain completely intact. Limitations include the fact that underlying content outside the CropBox is masked rather than permanently destroyed, meaning users needing complete redaction of confidential data should use specialized redaction tools.',
    steps: [
      {
        title: 'Upload PDF to Crop',
        text: 'Drag your PDF file into the visual cropper interface to render interactive bounding box previews on the canvas.'
      },
      {
        title: 'Adjust Cropping Bounding Box',
        text: 'Use the on-screen drag handles to frame the desired page area or enter exact margin trim values in millimeters or points.'
      },
      {
        title: 'Apply Crop and Export',
        text: 'Choose whether to apply the crop to the current page, all pages, or odd/even pages, then download your neatly trimmed PDF.'
      }
    ],
    faqs: [
      {
        question: 'Does cropping a PDF remove the cropped content permanently for security purposes?',
        answer: 'No. Standard PDF cropping modifies the visible viewing rectangle (CropBox). The underlying data streams outside the crop rectangle remain inside the PDF file structure. If you need to permanently sanitize confidential text, use a dedicated redaction tool.'
      },
      {
        question: 'Can I apply different crop margins to alternating odd and even pages?',
        answer: 'Yes. For book scans and bound booklets where inner spine margins alternate with outer margins, you can configure asymmetrical crop coordinates for odd and even pages independently.'
      },
      {
        question: 'Will cropping a PDF reduce its file size?',
        answer: 'Because cropping adjusts coordinate metadata rather than discarding uncompressed embedded assets, the file size will remain largely unchanged. To reduce file size after cropping, run the document through a PDF compressor.'
      }
    ]
  },

  'organize-pdf': {
    h1: 'Free PDF Page Organizer – Reorder, Rotate, and Rearrange PDF Pages',
    description: 'Reorder, rotate, duplicate, and delete pages in your PDF documents with an interactive visual thumbnail workspace directly in your browser.',
    introParagraph: 'The PDF Page Organizer provides a visual drag-and-drop workspace to restructure the page hierarchy of any PDF document directly inside your web browser. In office environments, legal practices, and academic workflows, multi-page PDFs are frequently assembled with inverted scanned pages, out-of-sequence appendixes, or accidental duplicate sheets. This tool renders interactive thumbnail previews of every page in your document, allowing you to drag pages into logical order, rotate upside-down or sideways pages by 90, 180, or 270 degrees, duplicate critical reference sheets, and delete unneeded pages with a single click. By manipulating internal PDF page dictionary tree references directly in client memory without re-encoding vector content, the organization process finishes in seconds with zero loss in document visual quality or text searchability. A technical constraint is that password-protected PDF documents with active owner security locks forbidding page assembly must be unlocked before their page trees can be rearranged.',
    steps: [
      {
        title: 'Open PDF Document',
        text: 'Upload your PDF to render a responsive visual grid of high-resolution page thumbnails in your browser.'
      },
      {
        title: 'Rearrange and Rotate Pages',
        text: 'Drag thumbnails to reorder pages sequentially, click rotation arrows to fix orientation, or click the trash icon to remove unwanted pages.'
      },
      {
        title: 'Save Reorganized PDF',
        text: 'Click Save to compile the updated page tree in browser memory and download your perfectly sequenced PDF document.'
      }
    ],
    faqs: [
      {
        question: 'Can I rotate individual pages without rotating the entire document?',
        answer: 'Yes. Each thumbnail card features dedicated 90-degree clockwise and counter-clockwise rotation buttons, allowing you to rotate single landscape tables or misaligned scans while keeping the rest of the document in portrait orientation.'
      },
      {
        question: 'Does reorganizing pages damage bookmarks or interactive links?',
        answer: 'Page content and internal links that point to specific page numbers are preserved; however, hierarchical outline bookmarks pointing to shifted page indices are automatically updated to match the new page structure.'
      },
      {
        question: 'How many pages can this organizer handle simultaneously without crashing?',
        answer: 'Our client-side engine uses lazy-loaded thumbnail rendering, allowing documents containing up to 200 to 300 pages to be reorganized smoothly on standard laptops without exhausting browser memory.'
      }
    ]
  },

  'pdf-page-remover': {
    h1: 'Free Remove Pages from PDF Tool – Delete Unwanted Pages and Rebuild Document',
    description: 'Delete specific pages, blank sheets, or page ranges from PDF files with visual thumbnail selection or numeric range input in your browser.',
    introParagraph: 'The PDF Page Remover allows users to prune unneeded, blank, confidential, or extraneous pages from PDF files with complete data privacy. Office scanners routinely inject accidental blank sheets, while legal disclosures or vendor contracts often include internal cover pages or outdated riders that should not be shared with external partners. This tool lets you delete unwanted pages either by clicking on visual page thumbnails or by entering numeric page lists and ranges (such as "1, 4-7, 12"). The underlying PDF generation engine traverses the document catalog, rebuilds the page tree array with the specified pages omitted, re-indexes the cross-reference table, and purges unreferenced font and image objects. The entire process runs locally in your browser RAM, guaranteeing that sensitive business records and personal tax filings never touch a third-party server. Limitations include encrypted PDFs with owner permission restrictions that prohibit document assembly or content extraction.',
    steps: [
      {
        title: 'Upload PDF Document',
        text: 'Drag your PDF file into the workspace to display page count and render thumbnail previews for visual review.'
      },
      {
        title: 'Select Pages to Remove',
        text: 'Click individual page cards to flag them for deletion or type specific page numbers and continuous ranges into the input field.'
      },
      {
        title: 'Download Clean PDF',
        text: 'Click Remove Pages to construct an updated PDF document with the selected pages permanently omitted and initiate immediate download.'
      }
    ],
    faqs: [
      {
        question: 'Can I remove multiple non-consecutive pages in a single operation?',
        answer: 'Yes. You can combine comma-separated single numbers and hyphenated ranges (e.g., "1, 3, 5-8, 14") to remove multiple disparate pages across the document in one pass.'
      },
      {
        question: 'Does removing pages decrease the total file size of the PDF?',
        answer: 'Yes. When pages are removed, any unique embedded photos, vector graphics, or font subsets that belonged exclusively to those deleted pages are purged from the file, resulting in a lighter PDF.'
      },
      {
        question: 'Can I undo page deletion if I make a mistake before downloading?',
        answer: 'Yes. Pages flagged for removal are highlighted visually in the interface, and you can uncheck them at any point before clicking the final Download button.'
      }
    ]
  },

  'extract-pages-from-pdf': {
    h1: 'Free Extract Pages from PDF Tool – Save Selected Pages as a New PDF',
    description: 'Extract specific pages, chapters, or page spans from larger PDF documents into a standalone, independent PDF file in your browser.',
    introParagraph: 'The Extract Pages from PDF tool isolates specific pages or continuous page ranges from multi-page documents and packages them into a fresh, standalone PDF file. Corporate annual reports, legal discovery filings, and academic textbooks often span hundreds of pages when you only require a single two-page financial statement, an isolated contract exhibit, or a specific syllabus chapter to share with colleagues. This client-side utility extracts selected page nodes along with all prerequisite font dictionaries, color spaces, and graphical content streams, creating an independent document that opens reliably in any PDF viewer. Because the extraction engine runs 100% inside your web browser using WebAssembly, confidential tax documents, medical charts, and proprietary contracts remain strictly private on your device. Keep in mind that if the original PDF contains global document outline bookmarks, bookmarks that target pages outside your extracted range will be pruned to ensure the new document outline remains valid.',
    steps: [
      {
        title: 'Load Source PDF',
        text: 'Select your PDF file to analyze its internal page structure and preview all available pages in the extraction workspace.'
      },
      {
        title: 'Specify Pages to Extract',
        text: 'Select thumbnails interactively or type target page numbers (e.g., "3-5, 9, 12") into the page selector field.'
      },
      {
        title: 'Generate Isolated PDF',
        text: 'Click Extract to construct your new focused PDF document containing only the chosen pages and trigger instant download.'
      }
    ],
    faqs: [
      {
        question: 'Will text in the extracted PDF remain searchable and copyable?',
        answer: 'Yes. The extraction engine copies exact vector content streams and embedded font glyph mappings, ensuring text remains 100% searchable, selectable, and copyable in your new PDF.'
      },
      {
        question: 'Can I extract each page into a separate individual single-page PDF file?',
        answer: 'Yes. The tool features a "Split into Single Pages" option that exports every page as its own individual PDF file and bundles them into a convenient ZIP archive for download.'
      },
      {
        question: 'Does extracting pages affect the original PDF on my computer?',
        answer: 'No. The source PDF file stored on your computer remains untouched. The tool operates on an in-memory copy and produces a new, separate PDF file for download.'
      }
    ]
  },

  'extract-pdf-pages': {
    h1: 'Extract PDF Pages Free – Select, Separate, and Export Custom PDF Pages',
    description: 'Separate and export custom page subsets, odd or even pages, and specific sections from multi-page PDFs with instant local processing.',
    introParagraph: 'The Extract PDF Pages tool provides an intuitive, high-speed utility for isolating and exporting custom page groupings from large PDF documents without network uploads. Designed with rapid presets for isolating odd pages, even pages, custom page brackets, or individual sheets, it solves common document management bottlenecks such as preparing double-sided manual printing runs from single-pass scanner feeds, splitting multi-invoice batches into discrete billing records, or saving isolated schematics from heavy technical manuals. The client-side engine traverses the PDF object dictionary, copying only the required page leaf nodes and their referenced font assets into a new catalog tree. This preserves vector clarity and original visual resolution while keeping sensitive corporate files secure inside your browser memory. Limitations include documents secured with password encryption restricting document assembly, which must be unlocked prior to page separation.',
    steps: [
      {
        title: 'Drop PDF File',
        text: 'Upload your multi-page PDF into the browser to initialize instant page inventory analysis and thumbnail indexing.'
      },
      {
        title: 'Apply Selection Presets',
        text: 'Click quick preset filters (Odd Pages, Even Pages, First 10 Pages) or click on individual thumbnail cards to curate your export list.'
      },
      {
        title: 'Export Selected Page Subset',
        text: 'Click Export to assemble the selected pages into a clean, independent PDF document ready for immediate download and sharing.'
      }
    ],
    faqs: [
      {
        question: 'How do I extract all odd or even pages for double-sided manual printing?',
        answer: 'Click the "Select Odd" or "Select Even" button in the toolbar to automatically highlight alternating pages across the entire document in one click, then export the filtered set to print.'
      },
      {
        question: 'Does this tool support extracting pages from large PDF documents over 100 MB?',
        answer: 'Yes. Because processing executes directly in your browser using local device memory rather than uploading across the network, large documents up to 500 MB can be processed smoothly on modern machines.'
      },
      {
        question: 'Are interactive form fields and digital annotations preserved on the extracted pages?',
        answer: 'Yes. Form fields, annotations, text notes, and hyperlinks located on the selected pages are preserved in the extracted PDF output.'
      }
    ]
  },

  'remove-pdf-pages': {
    h1: 'Remove PDF Pages Free – Delete Unwanted Pages and Rebuild Clean PDF',
    description: 'Quickly remove unwanted pages, duplicate scans, and outdated cover sheets from PDF files with visual confirmation and complete privacy.',
    introParagraph: 'The Remove PDF Pages tool offers a streamlined, secure solution for deleting unwanted pages from PDF documents directly on your device. Whether sanitizing scanned loan applications by deleting redundant disclosure notices, removing blank separator pages produced by high-speed document feeders, or discarding preliminary drafts from an architectural review set, this utility makes page removal effortless. You can visually inspect every page via responsive thumbnail previews, click to flag pages for removal, or input exact page index strings. The client-side parser reconstructs the PDF cross-reference index (xref) and cleans the root catalog to ensure the output file opens smoothly in Adobe Acrobat, Apple Preview, and modern web browsers without broken object references. Crucially, your confidential files never cross the network, guaranteeing total confidentiality for legal, financial, and medical documents. Note that if a PDF carries a cryptographic digital signature, removing pages will invalidate that signature hash.',
    steps: [
      {
        title: 'Import Target PDF',
        text: 'Select your PDF document to load its page inventory and render visual thumbnail cards on your screen.'
      },
      {
        title: 'Mark Pages for Deletion',
        text: 'Click the delete icon on any thumbnail card or enter comma-delimited page numbers to mark unwanted pages.'
      },
      {
        title: 'Recompile and Download',
        text: 'Click Apply Changes to rebuild the PDF page tree without the marked pages and trigger an instant download.'
      }
    ],
    faqs: [
      {
        question: 'What happens to digital signatures when pages are removed from a PDF?',
        answer: 'Removing pages alters the byte structure of the document, which will intentionally invalidate any existing cryptographic digital signatures or certificate seals applied to the original file.'
      },
      {
        question: 'Can I preview pages in full resolution before confirming their removal?',
        answer: 'Yes. Clicking the magnifying glass icon on any page thumbnail opens a full-screen zoom preview so you can verify page contents before marking them for deletion.'
      },
      {
        question: 'Is it possible to delete all blank pages automatically?',
        answer: 'You can use the "Detect Blank Pages" feature to automatically scan page contents and highlight pages with zero text characters and negligible vector paths for rapid deletion.'
      }
    ]
  },

  'add-page-numbers': {
    h1: 'Add Page Numbers to PDF Free – Stamp Sequential Numbering and Pagination',
    description: 'Stamp customized sequential page numbers, Bates stamping, and footer pagination onto PDF files with precise font and placement controls.',
    introParagraph: 'The Add Page Numbers tool stamps custom sequential pagination and Bates-style tracking numbers onto existing PDF documents directly inside your browser. Multi-page reports, legal exhibit bundles, academic theses, and government filings require consistent, professional pagination for reference and citation. This client-side utility lets you position page numbers across six standard locations (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right), choose from classic typographic font families (Helvetica, Times, Courier), set font size, customize text colors, and configure custom numbering format templates (such as "Page {n} of {total}", "{n} / {total}", or Bates prefixes like "EXHIBIT-A-{n}"). You can also define start page offsets to leave title pages or cover sheets unnumbered. The pagination engine overlays crisp vector glyphs onto existing PDF content streams without recompressing or degrading underlying page artwork. Limitations include potential visual overlap if stamping onto documents that already contain dense, unpadded edge-to-edge footer graphics.',
    steps: [
      {
        title: 'Upload PDF Document',
        text: 'Import your PDF file to analyze page geometries and configure stamp positioning coordinates.'
      },
      {
        title: 'Customize Numbering Format & Style',
        text: 'Select page alignment, font family, font size, margin offsets, starting page index, and numbering string template.'
      },
      {
        title: 'Stamp and Download PDF',
        text: 'Click Stamp Page Numbers to render the pagination overlays onto all pages in browser memory and save the updated PDF.'
      }
    ],
    faqs: [
      {
        question: 'Can I skip numbering on the cover page and start numbering on page 2 as "Page 1"?',
        answer: 'Yes. You can set the "Start From Page" setting to page 2 and configure the initial numbering digit to 1, leaving your title or cover page completely unnumbered.'
      },
      {
        question: 'Does this tool support Bates numbering formats for legal filings?',
        answer: 'Yes. You can customize the numbering template with alphanumeric prefixes and padded digits, such as "STATE-v-DOE-0000{n}", to generate standardized Bates stamps for litigation discovery.'
      },
      {
        question: 'Will stamping page numbers alter or compress the existing text and images in my PDF?',
        answer: 'No. The pagination engine injects new vector text streams as an independent visual layer on top of each page, leaving all underlying photos, diagrams, and text layers completely untouched.'
      }
    ]
  },

  'pdf-metadata-editor': {
    h1: 'PDF Metadata Editor Free – View and Edit Title, Author, and Subject Tags',
    description: 'View, edit, and sanitize internal PDF metadata including Title, Author, Subject, Keywords, and Creator tags directly in your browser.',
    introParagraph: 'The PDF Metadata Editor allows users to inspect, update, and sanitize the internal document information dictionary (/Info) and XMP (Extensible Metadata Platform) XML streams embedded within PDF files. PDF documents automatically record identifying metadata during authoring, including computer user names, organization titles, author names, software build versions, creation timestamps, and camera details. In legal discovery, academic double-blind peer review, and corporate communications, publishing documents with outdated or revealing metadata creates confidentiality risks and professional embarrassment. This browser tool exposes all metadata properties in an editable interface, letting you update the document Title, Author, Subject, and Keywords, or completely scrub all identifying tags with a single click. Because processing occurs strictly client-side, your document bytes are rewritten in local memory without leaving your computer. Limitations to keep in mind are that cryptographically locked or certified PDF files will have their digital seal broken if internal metadata streams are rewritten.',
    steps: [
      {
        title: 'Load PDF File',
        text: 'Drop your PDF document into the editor to inspect both classic /Info dictionary properties and embedded XMP metadata packets.'
      },
      {
        title: 'Edit or Scrub Metadata Fields',
        text: 'Type new values for Document Title, Author, Subject, and Keywords, or click "Wipe All Metadata" to strip all identifying tags.'
      },
      {
        title: 'Save Updated PDF',
        text: 'Click Save Metadata to write the updated information dictionaries directly to the PDF file structure and download the sanitized file.'
      }
    ],
    faqs: [
      {
        question: 'Why does my PDF viewer display an old document title even after I rename the file?',
        answer: 'PDF viewers prioritize the internal "Title" metadata tag embedded inside the document dictionary over the external file name. Updating the Title property in this tool fixes the title bar display in web browsers and PDF readers.'
      },
      {
        question: 'Can I completely scrub my personal name and computer username before publishing a paper?',
        answer: 'Yes. Clicking "Wipe All Metadata" clears the Author, Creator, Producer, and modification history fields, ensuring peer reviewers or readers cannot inspect author identity traces.'
      },
      {
        question: 'Does editing metadata modify or re-encode the actual text and images in the PDF?',
        answer: 'No. The editor exclusively modifies the document catalog information objects and XMP metadata stream, leaving all page content, fonts, and embedded images completely unaltered.'
      }
    ]
  },

  'fill-pdf-form': {
    h1: 'Fill PDF Form Fields Free – Interactive AcroForm & Form Field Editor',
    description: 'Fill out interactive PDF forms, check boxes, select dropdowns, and flatten filled form fields directly inside your browser with total privacy.',
    introParagraph: 'The Fill PDF Form Fields tool enables users to complete interactive PDF forms (AcroForms) directly within their web browser without installing heavy commercial desktop software. Whether filing government tax forms, completing employee onboarding paperwork, signing medical history questionnaires, or submitting rental lease applications, handling PDF forms is a routine requirement. This client-side utility identifies interactive form elements—including single-line text inputs, multi-line text boxes, checkbox toggles, radio button clusters, and dropdown select menus—allowing you to click, type, and complete documents smoothly. Once filled, you can save the document as an active editable form for future updates or flatten form fields into permanent vector text to prevent recipients from tampering with submitted values. Because all processing executes in browser memory, your confidential identification numbers, financial details, and medical records remain strictly private. Limitations include dynamic XML Forms Architecture (XFA) forms, which require Adobe proprietary rendering engines and cannot be processed in standard web canvas viewers.',
    steps: [
      {
        title: 'Upload Interactive PDF Form',
        text: 'Select your PDF form document to parse its internal AcroForm field definitions and highlight fillable form inputs.'
      },
      {
        title: 'Complete Form Fields',
        text: 'Click directly on highlighted fields to type text, check boxes, select options from dropdown menus, or sign signature areas.'
      },
      {
        title: 'Save Editable or Flattened PDF',
        text: 'Choose whether to download the completed PDF as an editable form or click Flatten Form to permanently burn responses into page graphics.'
      }
    ],
    faqs: [
      {
        question: 'What is the difference between saving an editable form and flattening a form?',
        answer: 'Saving an editable form keeps form fields active so you or the recipient can modify values later. Flattening converts form entries into permanent, un-editable page text and graphics, which is standard practice when submitting official legal or financial applications.'
      },
      {
        question: 'Can this tool fill dynamic Adobe LiveCycle (XFA) forms?',
        answer: 'This tool supports standard ISO 32000 AcroForms, which represent the vast majority of web forms. Proprietary dynamic XFA forms created with Adobe LiveCycle require specialized Adobe software and cannot be rendered in standard HTML5 canvas environments.'
      },
      {
        question: 'Are my typed form values secure and protected from server logging?',
        answer: 'Yes. The form filler runs 100% locally in your browser memory via client-side JavaScript. Zero form field values, Social Security numbers, addresses, or signatures are ever transmitted to external servers.'
      }
    ]
  },

  'zip-viewer': {
    h1: 'Free ZIP Viewer – Inspect Central Directory Records and Archive Contents',
    description: 'Inspect ZIP archive file structures, browse folder hierarchies, verify CRC-32 checksums, and extract single files without unzipping locally.',
    introParagraph: 'The Free ZIP Viewer inspects the contents of compressed ZIP archives directly in your web browser without requiring extraction to your local hard drive. ZIP archives contain an End of Central Directory (EOCD) record at the tail of the file that indexes every compressed member file, its directory hierarchy, compressed byte weight, uncompressed size, and CRC-32 integrity checksum. This tool reads the central directory header, rendering a fast, navigable folder tree that lets you explore nested directories, inspect individual file properties, check compression efficiency ratios, and extract isolated files on demand. It is an invaluable utility when you need to retrieve a single configuration file from a large multi-megabyte bundle, verify archive integrity before storing, or inspect untrusted archives safely without risking disk execution of hidden scripts. Keep in mind that password-encrypted ZIP files using WinZip AES-256 encryption can have their file names inspected, but extracting individual file data payloads requires supplying the correct archive decryption passphrase.',
    steps: [
      {
        title: 'Select ZIP Archive',
        text: 'Drag your .zip file into the viewer interface to read its central directory record and parse the internal file manifest.'
      },
      {
        title: 'Navigate Archive Hierarchy',
        text: 'Explore folders, inspect uncompressed file sizes, check compression ratios, and view file timestamps in the interactive directory tree.'
      },
      {
        title: 'Preview or Extract Individual Files',
        text: 'Click on any individual file to preview text and images directly in the browser or extract that specific file without unzipping the full bundle.'
      }
    ],
    faqs: [
      {
        question: 'Can I extract a single file from a large ZIP archive without unzipping everything?',
        answer: 'Yes. The viewer decompresses member files individually on demand, allowing you to download a single needed image, document, or code file instantly without consuming disk space to unpack the entire archive.'
      },
      {
        question: 'How does CRC-32 checksum verification help identify corrupt downloads?',
        answer: 'Every file entry in a valid ZIP archive includes a 32-bit cyclic redundancy check (CRC-32) checksum calculated by the compression program. The viewer recalculates this checksum during inspection; a mismatch immediately alerts you that the archive was corrupted during download.'
      },
      {
        question: 'Can I inspect password-protected ZIP archives?',
        answer: 'Yes. Standard ZIP structures allow viewing the list of file names and directory trees even if the contents are encrypted. To decompress and preview the actual data streams of encrypted files, you will be prompted to enter the archive password.'
      }
    ]
  }
};
