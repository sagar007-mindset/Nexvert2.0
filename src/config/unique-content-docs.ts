/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_DOCS_CONTENT: Record<string, ToolSEOData> = {
  'pdf-merge': {
    h1: 'Merge PDF Files Online (Combine Documents in Order)',
    description: 'Combine multiple PDF documents, statements, or chapters into a single organized PDF with drag-and-drop page sequencing in local browser memory.',
    introParagraph: 'Merge multiple PDF documents into a single unified file. Reorder pages, stitch together reports, invoices, and signed contracts entirely on your device using pdf-lib in your browser with zero server uploads.',
    faqs: [
      {
        question: 'Are my confidential PDF documents uploaded to a remote server?',
        answer: 'No. The merging engine uses pdf-lib compiled for client-side JavaScript execution. Document assembly occurs strictly in your browser’s volatile memory, keeping legal and financial documents 100% private.'
      },
      {
        question: 'Can I re-arrange the order of PDF files before merging?',
        answer: 'Yes! You can drag and drop file cards in your upload queue to set the exact document order before generating the merged PDF.'
      },
      {
        question: 'Does merging preserve bookmarks, hyperlinks, and form fields?',
        answer: 'Standard page structures, embedded fonts, vector artwork, and text content are preserved. Dynamic form fields are safely merged into the target document catalog.'
      }
    ]
  },

  'pdf-split': {
    h1: 'Split PDF Online (Separate Pages & Custom Ranges)',
    description: 'Extract individual pages or split large PDF documents into smaller files by custom page intervals or ranges directly in your browser.',
    introParagraph: 'Break apart multi-page PDFs into separate documents. Extract specific chapters, separate scanned invoice batches, or split every page into its own individual PDF without installing desktop software.',
    faqs: [
      {
        question: 'How do I specify custom page ranges to split?',
        answer: 'You can enter page numbers and comma-separated intervals, such as "1-3, 5, 8-10". The tool extracts the exact pages requested into discrete PDF files.'
      },
      {
        question: 'Can I download all split pages as a single ZIP archive?',
        answer: 'Yes! If you split a large document into multiple files, you can download them all together in a single convenient ZIP archive created locally.'
      },
      {
        question: 'Does splitting a PDF reduce text or image quality?',
        answer: 'No. The split tool performs binary extraction of the underlying PDF page dictionary and stream objects without re-compressing or rasterizing text or images.'
      }
    ]
  },

  'pdf-compressor': {
    h1: 'Compress PDF Online (Reduce Document MB Size)',
    description: 'Shrink PDF file sizes for email and portal submissions by downsampling embedded raster images and removing redundant font tables.',
    introParagraph: 'Large scanned documents often exceed email attachment limits. Our in-browser PDF compressor resamples embedded images, strips duplicate font streams, and cleans up document xref tables without compromising text legibility.',
    faqs: [
      {
        question: 'How does PDF compression reduce file size while keeping text sharp?',
        answer: 'Vector text and fonts take up very little space. Scanned PDFs are large because of heavy embedded raster images. The compressor resamples those images while keeping vector fonts razor-sharp.'
      },
      {
        question: 'What compression levels are available?',
        answer: 'You can choose between Recommended (optimal balance for screen reading), Extreme (maximum size reduction for email), or Low (preserves high-DPI print details).'
      },
      {
        question: 'Is there a limit on how many pages a PDF can have?',
        answer: 'Our client-side engine can process documents with hundreds of pages, limited only by your computer’s available browser memory.'
      }
    ]
  },

  'rotate-pdf': {
    h1: 'Rotate PDF Pages Online (90°, 180°, 270° & Permanent)',
    description: 'Permanently fix upside-down or sideways scanned PDF pages. Rotate specific individual pages or all pages simultaneously.',
    introParagraph: 'Correct orientation issues on scanned legal documents and contracts. Rotate individual pages or all pages at 90-degree increments, saving the orientation permanently in the PDF page dictionary.',
    faqs: [
      {
        question: 'Is the rotation permanent or just a temporary preview?',
        answer: 'The rotation updates the permanent /Rotate attribute in the PDF page dictionary (0, 90, 180, or 270 degrees), ensuring the document opens correctly in Adobe Acrobat and all viewers.'
      },
      {
        question: 'Can I rotate just one upside-down page without affecting the rest?',
        answer: 'Yes. Our visual page grid lets you click individual rotate buttons on specific pages without changing the rest of the document.'
      },
      {
        question: 'Does rotating PDF pages alter document formatting or text?',
        answer: 'No. The underlying content stream coordinates remain intact; only the viewer viewport rotation matrix is updated.'
      }
    ]
  },

  'watermark-pdf': {
    h1: 'Add Watermark to PDF Online (CONFIDENTIAL, DRAFT & Text)',
    description: 'Stamp custom semi-transparent text watermarks, copyright notices, or security stamps across every page of your PDF locally.',
    introParagraph: 'Protect sensitive business proposals and contracts prior to distribution. Add diagonal or horizontal watermarks like "CONFIDENTIAL", "DRAFT", or your company name with custom opacity, color, and font sizing.',
    faqs: [
      {
        question: 'Can I customize the watermark transparency and angle?',
        answer: 'Yes. You can adjust opacity from subtle 15% shading to bold stamps, set rotation angles (e.g. 45 degrees diagonal), and select custom text colors.'
      },
      {
        question: 'Does the watermark appear above or below the document text?',
        answer: 'The watermark is rendered as an overlay content stream with alpha blending, ensuring it remains visible across both text and background graphics without obscuring reading.'
      },
      {
        question: 'Can someone easily remove a stamped PDF watermark?',
        answer: 'The watermark is written directly into each page’s content stream operators, making it impossible to strip without specialized desktop PDF editor software.'
      }
    ]
  },

  'pdf-page-numbers': {
    h1: 'Add Page Numbers to PDF Online (Bates & Header/Footer)',
    description: 'Insert customizable page numbers, Bates stamping, or "Page X of Y" labels into document headers or footers in local browser memory.',
    introParagraph: 'Organize legal briefs, academic dissertations, and multi-page reports. Add clear page numbers in your choice of font, position (bottom center, top right, etc.), and numbering style.',
    faqs: [
      {
        question: 'Can I exclude the first cover page from being numbered?',
        answer: 'Yes! You can toggle "Skip First Page" so cover pages and title sheets remain clean, with page numbering starting on page two.'
      },
      {
        question: 'What page numbering formats are supported?',
        answer: 'You can choose simple numbers ("1, 2, 3"), page count formats ("Page 1 of 12"), or custom prefixes for legal Bates numbering.'
      },
      {
        question: 'Where can page numbers be placed on the page?',
        answer: 'You can place numbers in 6 standard positions: Top Left, Top Center, Top Right, Bottom Left, Bottom Center, or Bottom Right.'
      }
    ]
  },

  'flatten-pdf': {
    h1: 'Flatten PDF Online (Lock Form Fields & Annotations)',
    description: 'Permanently merge interactive form fields, checkboxes, signatures, and annotations into the underlying PDF page canvas.',
    introParagraph: 'Prevent accidental edits to filled forms and contracts. PDF flattening converts interactive form widgets, signatures, and markups into static non-interactive page elements, locking your inputs permanently.',
    faqs: [
      {
        question: 'Why should I flatten a PDF form before sending it to clients?',
        answer: 'Some mobile PDF viewers and web browsers do not display interactive form values correctly. Flattening bakes the values into the page graphics, guaranteeing they appear identically for every recipient.'
      },
      {
        question: 'Can a flattened PDF form be unflattened later?',
        answer: 'No. Flattening permanently converts editable form fields into static vector graphics and text. Always keep a backup copy of your unflattened form if you need to edit it later.'
      },
      {
        question: 'Does flattening PDF forms reduce file size?',
        answer: 'Yes. Stripping interactive AcroForm widget dictionaries and appearance streams often reduces total document byte weight.'
      }
    ]
  },

  'pdf-to-word': {
    h1: 'Convert PDF to Word DOCX Online (Editable Document)',
    description: 'Extract text, formatting, and structural paragraphs from PDF documents into editable Microsoft Word (.docx) files locally.',
    introParagraph: 'Convert PDF reports, agreements, and articles into fully editable Microsoft Word documents. Our client-side parser reconstructs paragraph flows, headings, and character styles into valid DOCX XML packages.',
    faqs: [
      {
        question: 'Can I edit the converted Word document in Microsoft Word and Google Docs?',
        answer: 'Yes! The output is a standard OpenXML (.docx) file fully compatible with Microsoft Word (2007-2024), Office 365, Google Docs, and LibreOffice.'
      },
      {
        question: 'Are tables and text formatting preserved during PDF to Word conversion?',
        answer: 'Yes, paragraph structures, line breaks, bold/italic text styles, and layout geometry are analyzed and mapped into Word OpenXML elements.'
      },
      {
        question: 'Are scanned image PDFs converted into editable Word text?',
        answer: 'If your PDF contains scanned photos of paper rather than selectable text, use our PDF OCR tool first to recognize characters before Word conversion.'
      }
    ]
  },

  'docx-to-pdf': {
    h1: 'Convert Word DOCX to PDF Online (Preserve Formatting)',
    description: 'Transform Microsoft Word documents (.docx) into universal PDF files directly in your browser with intact layout and typography.',
    introParagraph: 'Convert Word files into professional, unalterable PDFs ready for emailing, printing, or digital signatures. Converts DOCX formatting, fonts, and images into clean PDF streams without Microsoft Office installed.',
    faqs: [
      {
        question: 'Do I need Microsoft Office installed on my computer?',
        answer: 'No. The conversion pipeline executes entirely within your browser using OpenXML parsers and PDF generation libraries.'
      },
      {
        question: 'Will fonts and document margins look identical in the output PDF?',
        answer: 'Standard document layouts, margins, tables, and standard fonts render with high visual fidelity according to the OpenXML document specification.'
      },
      {
        question: 'Are my confidential business documents uploaded to a cloud server?',
        answer: 'No. Your .docx file is decoded in browser memory. No proprietary documents or data ever touch external servers.'
      }
    ]
  },

  'pdf-to-jpg': {
    h1: 'Convert PDF Pages to High-Resolution JPG Images Online',
    description: 'Render every page of your PDF document into crisp, high-DPI JPG photographs at 150 DPI or 300 DPI directly in your browser.',
    introParagraph: 'Turn PDF slides, flyers, and document pages into high-resolution JPG images. Our browser-based renderer processes PDF vector and raster instructions via PDF.js, exporting each page as a standalone image.',
    faqs: [
      {
        question: 'What resolution are the rendered JPG pages?',
        answer: 'You can choose between Standard Web (150 DPI) for fast loading and sharing, or High-Resolution Print (300 DPI) for razor-sharp typography and detail.'
      },
      {
        question: 'Can I download all pages as a ZIP file?',
        answer: 'Yes. Multi-page PDFs can be downloaded as an organized ZIP archive containing individually numbered JPG images (e.g., page-1.jpg, page-2.jpg).'
      },
      {
        question: 'Does this tool work on password-protected PDFs?',
        answer: 'If you know the user password, you can enter it in the browser prompt to decrypt and render the pages locally.'
      }
    ]
  },

  'jpg-to-pdf': {
    h1: 'Convert JPG Images to PDF Online (Combine Photos to PDF)',
    description: 'Convert single or multiple JPG and PNG photos into a clean, multi-page PDF document with custom margins and orientation.',
    introParagraph: 'Combine receipts, scanned paperwork, and photographs into a tidy, professional PDF file. Set page orientations (portrait or landscape), customize margins, and reorder images before compiling.',
    faqs: [
      {
        question: 'Can I combine multiple JPG photos into one single PDF?',
        answer: 'Yes! Select multiple photos at once, re-arrange their sequence with drag-and-drop, and compile them into a unified multi-page PDF document.'
      },
      {
        question: 'How do I ensure the PDF fits standard Letter or A4 paper sizes?',
        answer: 'You can select preset paper sizes (US Letter, A4) or choose "Fit to Image" to maintain each photo’s native dimensions without white borders.'
      },
      {
        question: 'Does converting JPG to PDF reduce photo quality?',
        answer: 'No. The original JPEG byte streams are embedded directly into PDF XObject image dictionaries without secondary re-compression, preserving 100% original photo clarity.'
      }
    ]
  },

  'markdown-to-html': {
    h1: 'Convert Markdown to HTML Online (GitHub-Flavored)',
    description: 'Transform Markdown (.md) documents into clean, semantic HTML code with syntax-highlighted code blocks and tables.',
    introParagraph: 'Convert README files, technical documentation, and blog posts from Markdown to clean W3C-compliant HTML. Supports GitHub-Flavored Markdown (GFM) tables, task lists, and fenced code blocks.',
    faqs: [
      {
        question: 'Does this converter support GitHub-Flavored Markdown (GFM)?',
        answer: 'Yes. Extended GFM syntax including autolinks, strikethrough (~~text~~), tables, and interactive task checklists are fully supported.'
      },
      {
        question: 'Can I export both the raw HTML snippet and a full HTML5 document?',
        answer: 'Yes. You can copy the raw snippet to paste into a CMS, or download a complete standalone HTML5 file with standard header tags and CSS styling.'
      },
      {
        question: 'How fast is the Markdown parsing?',
        answer: 'Because parsing runs via a lightweight AST parser in local browser JavaScript, even multi-thousand-line documents convert in single-digit milliseconds.'
      }
    ]
  },

  'html-to-markdown': {
    h1: 'Convert HTML to Markdown Online (Clean Turndown Engine)',
    description: 'Strip messy HTML tags and convert web articles, blog posts, and rich text into clean, portable Markdown syntax.',
    introParagraph: 'Clean up web scrapes, rich text clippings, and CMS content into pristine Markdown. Our converter maps headings, lists, links, blockquotes, and tables into clean CommonMark and GFM formats.',
    faqs: [
      {
        question: 'Does the converter preserve HTML tables and links?',
        answer: 'Yes. HTML tables are transformed into clean Markdown pipe tables, and anchor tags (<a href="...">) become standard [text](url) links.'
      },
      {
        question: 'Are inline CSS styles and JavaScript scripts stripped out?',
        answer: 'Yes. Non-semantic styling, script tags, and class attributes are automatically stripped to leave pure, readable Markdown content.'
      },
      {
        question: 'Can I paste raw HTML or upload .html files directly?',
        answer: 'Both! You can paste copied HTML markup into the editor or upload .html and .htm files for automated conversion.'
      }
    ]
  },

  'create-zip': {
    h1: 'Create ZIP Archive Online (Fast Browser Compression)',
    description: 'Compress and bundle multiple files or folders into a single .zip archive directly in your browser using JSZip.',
    introParagraph: 'Bundle documents, photos, and project assets into a clean ZIP archive to save disk space and simplify file sharing. Compresses files locally using Deflate compression with zero cloud uploads.',
    faqs: [
      {
        question: 'Are my private files uploaded to a remote server to make the ZIP?',
        answer: 'No. Archiving uses the JSZip engine running entirely inside your local browser thread. Your files never leave your computer.'
      },
      {
        question: 'Can I compress different file formats together in the same ZIP?',
        answer: 'Yes! You can mix PDFs, images, text documents, code files, and videos into a single organized archive.'
      },
      {
        question: 'What compression algorithm does the ZIP creator use?',
        answer: 'It uses standard PKWARE Deflate compression at maximum compression level, ensuring 100% compatibility with Windows Explorer, macOS Archive Utility, and Linux.'
      }
    ]
  },

  'extract-zip': {
    h1: 'Extract ZIP Files Online (Unzip Archive in Browser)',
    description: 'Unpack and view contents of .zip files instantly without installing WinRAR or 7-Zip. Preview files and download individually.',
    introParagraph: 'Open and inspect ZIP files without third-party desktop archive tools. View the internal folder hierarchy, preview contained images or text documents, and extract individual files or the entire archive with one click.',
    faqs: [
      {
        question: 'Can I extract individual files without downloading the entire ZIP?',
        answer: 'Yes! Our visual ZIP file explorer lets you click and download specific files without unpacking the rest of the archive.'
      },
      {
        question: 'Does extracting ZIP files work on mobile devices?',
        answer: 'Yes, it works smoothly on iPhones, iPads, and Android phones, providing a native file browsing and unpacking interface.'
      },
      {
        question: 'Are large ZIP archives supported?',
        answer: 'Archives up to 500MB can be decompressed smoothly depending on your device’s available RAM.'
      }
    ]
  },

  'extract-tar': {
    h1: 'Extract TAR & TAR.GZ Archives Online (In-Browser Unpacker)',
    description: 'Unpack Linux and Unix .tar and .tar.gz archives directly in your browser with folder tree navigation and local file extraction.',
    introParagraph: 'Open Linux software archives and developer tarballs on Windows or Mac without terminal commands. Decompresses Gzip layers and extracts tar stream headers locally in your browser.',
    faqs: [
      {
        question: 'What is the difference between a TAR and a ZIP file?',
        answer: 'TAR is a Unix archive container that concatenates files sequentially, while GZIP compresses the tar stream (.tar.gz). ZIP compresses each file individually.'
      },
      {
        question: 'Can this tool handle nested folder structures within the TAR?',
        answer: 'Yes. Directory paths and file permissions stored in the TAR header blocks are parsed and displayed in a hierarchical folder tree.'
      },
      {
        question: 'Is any software installation required to open .tar.gz files?',
        answer: 'None at all. Everything decompresses client-side using JavaScript TypedArrays and WebAssembly decompression streams.'
      }
    ]
  }
};
