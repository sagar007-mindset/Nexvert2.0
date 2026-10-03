/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Unique page copy for archive, developer and OCR tools that previously fell back to
// generic text. Every statement here describes behaviour of the actual tool UI.

import { ToolSEOData } from './unique-content-images';

export const UNIQUE_EXTRA_DEV_CONTENT: Record<string, ToolSEOData> = {
  'bulk-file-zipper': {
    h1: 'Bulk File Zipper – Put Many Files into One ZIP',
    description: 'Drop any number of files into your browser and download them as a single compressed ZIP archive.',
    introParagraph: 'The Bulk File Zipper packs many files of any type into one ZIP archive so they are easier to email, upload or back up. Select or drag in documents, photos, spreadsheets or source files, review the list, and download a single DEFLATE-compressed .zip. Everything happens in your browser with the JSZip library, so the files are never sent to a server. Text, CSV and uncompressed formats shrink considerably, while already-compressed files such as JPG, MP4 or other ZIPs stay roughly the same size.',
    steps: [
      { title: 'Add your files', text: 'Click the upload area or drag any mix of files onto it. You can add more files before creating the archive.' },
      { title: 'Review the list', text: 'Check the file names and total size, and remove anything you do not want to include.' },
      { title: 'Download the ZIP', text: 'Create the archive and save one .zip file that opens on Windows, macOS, Linux, Android and iOS.' },
    ],
    faqs: [
      { question: 'Is there a limit on how many files I can zip?', answer: 'There is no fixed file count. The practical limit is your device’s memory, because the archive is built in the browser; each file can be up to 500 MB.' },
      { question: 'Will zipping make my photos or videos smaller?', answer: 'Only slightly. JPG, PNG, MP4 and MP3 are already compressed, so ZIP mainly saves space on text, documents, CSV and uncompressed files.' },
      { question: 'Are my files uploaded anywhere?', answer: 'No. The ZIP is generated locally with JavaScript and downloaded directly from your browser’s memory.' },
    ],
  },
  'split-zip': {
    h1: 'Split ZIP Files into Smaller Parts',
    description: 'Split a large ZIP or any file into fixed-size parts (1 MB to 500 MB) and rejoin them later — all in your browser.',
    introParagraph: 'Split ZIP cuts a large archive into equal-sized parts so it fits email attachment limits, FAT32 drives, upload caps or chat apps. Choose a preset part size — 1, 5, 10, 25, 50, 100, 250 or 500 MB — or enter a custom size, then pick a naming scheme: standard numbered parts (archive.zip.001, .002…) or multi-volume names (archive.z01, .z02… .zip). The second tab, Reassemble & Verify, joins the parts back into the original file in the right order. Splitting is a byte-level cut, so the joined file is identical to the original.',
    steps: [
      { title: 'Choose the file', text: 'Upload the ZIP (or any large file) you want to split.' },
      { title: 'Pick a part size and naming', text: 'Select a preset such as 25 MB for email, or set a custom size, and choose .zip.001 or .z01 style names.' },
      { title: 'Download the parts', text: 'Split the file and download each part. Use Reassemble & Verify to join them again later.' },
    ],
    faqs: [
      { question: 'How do I open the split parts?', answer: 'Use the Reassemble & Verify tab to join them back into the original file, or 7-Zip on Windows (open the .001 file). The parts must all be present and unchanged.' },
      { question: 'What part size should I use for email?', answer: 'Most email providers cap attachments at 20–25 MB, so choose the 25 MB preset for Gmail or 20 MB (custom) for Outlook.' },
      { question: 'Does splitting damage or recompress the archive?', answer: 'No. The file is cut into byte ranges without recompression, so joining the parts restores an exact copy.' },
    ],
  },
  'tar-to-zip': {
    h1: 'Convert TAR to ZIP Online',
    description: 'Convert .tar and .tar.gz (.tgz) archives into ZIP files that open natively on Windows and macOS.',
    introParagraph: 'TAR archives are common on Linux and in software downloads, but Windows cannot always open them without extra software. This converter reads a .tar, .tar.gz or .tgz archive in your browser, keeps the folder structure and file names, and repacks everything into a standard ZIP. Gzip-compressed TAR files are decompressed automatically. Symbolic links and device files, which ZIP cannot represent, are skipped; regular files and folders are converted exactly.',
    steps: [
      { title: 'Upload the TAR archive', text: 'Choose a .tar, .tar.gz or .tgz file. Compressed archives are unpacked automatically.' },
      { title: 'Convert', text: 'The tool reads every entry, keeps the paths, and writes them into a new ZIP archive.' },
      { title: 'Download the ZIP', text: 'Save the .zip file and open it with the built-in extractor on Windows or macOS.' },
    ],
    faqs: [
      { question: 'Can it convert .tar.gz and .tgz files?', answer: 'Yes. Gzip-compressed TAR archives are detected by their file signature and decompressed in the browser before conversion.' },
      { question: 'Are folders and long file names kept?', answer: 'Yes. Folder paths, including long names stored with GNU or PAX headers, are preserved in the ZIP.' },
      { question: 'What happens to file permissions and symlinks?', answer: 'ZIP does not store Unix permissions or symbolic links the way TAR does, so regular files and folders are converted and symlinks are skipped.' },
    ],
  },
  'zip-to-tar': {
    h1: 'Convert ZIP to TAR Online',
    description: 'Repack a ZIP archive as a standard uncompressed POSIX (ustar) TAR file for Linux, Docker and build tools.',
    introParagraph: 'ZIP to TAR unpacks a ZIP archive in your browser and writes the same files and folders into a POSIX ustar TAR archive — the format expected by tar on Linux and macOS, Docker build contexts and many deployment scripts. File names and folder structure are preserved, and names longer than 100 characters are stored with PAX headers so nothing is truncated. The output is an uncompressed .tar; compress it with gzip afterwards if you need a .tar.gz.',
    steps: [
      { title: 'Upload the ZIP', text: 'Select the .zip archive you want to convert.' },
      { title: 'Convert to TAR', text: 'Every file and folder is read from the ZIP and written into a ustar TAR archive.' },
      { title: 'Download the .tar', text: 'Save the result and extract it with tar -xf archive.tar or any archive manager.' },
    ],
    faqs: [
      { question: 'Is the TAR file compressed?', answer: 'No. The output is a plain .tar, which is usually slightly larger than the ZIP. Run gzip on it if you need a .tar.gz.' },
      { question: 'Will long file paths be cut off?', answer: 'No. Paths over 100 bytes are written with a PAX extended header, which modern tar implementations read correctly.' },
      { question: 'Does it work with password-protected ZIPs?', answer: 'No. Encrypted ZIP entries cannot be read in the browser without the password, so remove the password first.' },
    ],
  },
  'create-archive': {
    h1: 'Create a ZIP Archive with Folders',
    description: 'Build a ZIP file from files you choose, organised into folders, directly in your browser.',
    introParagraph: 'The ZIP Archive Creator lets you assemble a ZIP file the way you want it organised. Add files, arrange them into folders, and download a compressed archive that keeps that structure when it is extracted. It is useful for packaging project deliverables, sending a set of documents in one attachment, or preparing uploads for sites that accept a single ZIP. The archive is generated locally with JSZip, so your files never leave your device.',
    steps: [
      { title: 'Add files', text: 'Choose or drag in the files you want to include.' },
      { title: 'Organise folders', text: 'Place files into folders so the extracted archive has a clean structure.' },
      { title: 'Download', text: 'Generate the ZIP and save it to your device.' },
    ],
    faqs: [
      { question: 'Will the folder structure be kept when someone unzips it?', answer: 'Yes. Folder paths are stored in the ZIP, so extracting it recreates the same folders.' },
      { question: 'What compression does it use?', answer: 'Standard DEFLATE compression, which every operating system and archive tool can open.' },
      { question: 'Can I add more files after creating the archive?', answer: 'Add all files before generating. To change the contents, update the list and generate a new ZIP.' },
    ],
  },
  'json-minifier': {
    h1: 'JSON Minifier – Compress JSON Online',
    description: 'Remove all whitespace and line breaks from JSON to make it as small as possible, with instant validation.',
    introParagraph: 'The JSON Minifier strips spaces, tabs and line breaks from JSON while keeping the data identical, producing the smallest valid representation. Minified JSON loads faster in API responses, fits in environment variables and config fields, and reduces storage. The input is parsed first, so invalid JSON is reported with an error instead of being silently corrupted. Output appears as you type and can be copied with one click.',
    steps: [
      { title: 'Paste JSON', text: 'Paste formatted JSON into the input box or load the sample.' },
      { title: 'Check the result', text: 'The minified JSON appears instantly; any syntax error is shown instead.' },
      { title: 'Copy', text: 'Copy the single-line JSON into your code, API payload or config file.' },
    ],
    faqs: [
      { question: 'Does minifying change the data?', answer: 'No. Only insignificant whitespace is removed. Keys, values, order and types stay exactly the same.' },
      { question: 'How much smaller will my JSON get?', answer: 'Typically 10–30% for indented JSON, depending on nesting depth and indentation size.' },
      { question: 'Can I turn minified JSON back into readable JSON?', answer: 'Yes — paste it into the JSON Formatter to indent it again with 2 spaces, 4 spaces or tabs.' },
    ],
  },
  'json-to-xml': {
    h1: 'Convert JSON to XML Online',
    description: 'Convert JSON objects and arrays into well-formed XML elements instantly in your browser.',
    introParagraph: 'JSON to XML turns JSON data into XML for systems that still expect XML — SOAP services, RSS feeds, legacy enterprise integrations and some configuration formats. Object keys become element names, nested objects become child elements, and arrays become repeated elements. The JSON is validated first, and the converted XML updates as you type so you can adjust the input and see the result immediately.',
    steps: [
      { title: 'Paste JSON', text: 'Enter or paste the JSON you want to convert.' },
      { title: 'Review the XML', text: 'Well-formed XML appears in the output panel instantly.' },
      { title: 'Copy the result', text: 'Copy the XML into your application, feed or request body.' },
    ],
    faqs: [
      { question: 'How are JSON arrays converted?', answer: 'Each array item becomes a repeated element with the same tag name, which is the usual way to express lists in XML.' },
      { question: 'What if a JSON key is not a valid XML tag name?', answer: 'XML element names cannot start with a digit or contain spaces, so rename such keys in the JSON before converting.' },
      { question: 'Is my data sent to a server?', answer: 'No. Parsing and conversion run entirely in your browser.' },
    ],
  },
  'xml-to-json': {
    h1: 'Convert XML to JSON Online',
    description: 'Parse XML documents into clean JSON with attributes and nested elements preserved.',
    introParagraph: 'XML to JSON converts XML documents — API responses, RSS feeds, sitemaps, config files — into JSON that is easy to use in JavaScript and modern APIs. Nested elements become nested objects, repeated elements become arrays, and attributes are kept alongside element values. The browser’s built-in XML parser validates the document, so malformed XML produces a clear error rather than partial output.',
    steps: [
      { title: 'Paste XML', text: 'Paste an XML document or load the sample.' },
      { title: 'Convert to JSON', text: 'Click Convert to JSON to parse the XML and build the JSON structure.' },
      { title: 'Copy or save', text: 'Copy the JSON or save it as a .json file.' },
    ],
    faqs: [
      { question: 'Are XML attributes preserved?', answer: 'Yes. Attributes are included in the JSON output together with the element’s text and children.' },
      { question: 'Why did I get a parse error?', answer: 'The XML is not well-formed — usually an unclosed tag, an unescaped & character, or more than one root element.' },
      { question: 'Can it convert large XML files?', answer: 'Yes, within your browser’s memory. Files of several megabytes convert in a second or two.' },
    ],
  },
  'json-to-yaml': {
    h1: 'Convert JSON to YAML Online',
    description: 'Convert JSON into clean, readable YAML for Kubernetes, Docker Compose, CI pipelines and config files.',
    introParagraph: 'JSON to YAML rewrites JSON data as YAML, the format used by Kubernetes manifests, Docker Compose, GitHub Actions, Ansible and many configuration files. YAML is easier to read and comment, and every JSON document has an exact YAML equivalent. Choose 2-space, 4-space or tab indentation; the output updates instantly and the input is validated so errors are caught before you paste YAML into a deployment.',
    steps: [
      { title: 'Paste JSON', text: 'Paste the JSON object or array you want to convert.' },
      { title: 'Choose indentation', text: 'Select 2 spaces (most common for YAML), 4 spaces or tabs.' },
      { title: 'Copy the YAML', text: 'Copy the result into your .yml or .yaml file.' },
    ],
    faqs: [
      { question: 'Is YAML output always equivalent to the JSON?', answer: 'Yes. YAML is a superset of JSON, so the converted document describes exactly the same data.' },
      { question: 'Which indentation should I use?', answer: 'Two spaces is the convention for Kubernetes, Docker Compose and GitHub Actions. YAML does not allow tabs for indentation in most parsers, so prefer spaces.' },
      { question: 'Are strings quoted?', answer: 'Only when needed — for example strings that look like numbers, booleans or contain special characters — so the YAML stays readable.' },
    ],
  },
  'yaml-to-json': {
    h1: 'Convert YAML to JSON Online',
    description: 'Parse YAML files into formatted JSON and catch YAML syntax errors instantly.',
    introParagraph: 'YAML to JSON parses YAML — Kubernetes manifests, Docker Compose files, OpenAPI specs, CI configs — and outputs formatted JSON that APIs and JavaScript code can consume directly. Because YAML is indentation-sensitive, the converter doubles as a validator: a misplaced space or tab produces a clear error with the problem location instead of wrong data.',
    steps: [
      { title: 'Paste YAML', text: 'Paste your YAML document or load the sample.' },
      { title: 'Convert', text: 'Click Convert to JSON to parse the YAML.' },
      { title: 'Copy or save', text: 'Copy the formatted JSON or save it as a file.' },
    ],
    faqs: [
      { question: 'Can this validate my YAML?', answer: 'Yes. If the YAML has indentation or syntax errors, the parser reports them instead of producing JSON.' },
      { question: 'Does it support multiple YAML documents separated by ---?', answer: 'Convert one document at a time; split multi-document files at the --- separators first.' },
      { question: 'Are YAML comments kept?', answer: 'No. JSON has no comment syntax, so comments are dropped during conversion.' },
    ],
  },
  'json-diff': {
    h1: 'JSON Diff – Compare Two JSON Files',
    description: 'Compare two JSON documents and see added, removed and changed keys and values side by side.',
    introParagraph: 'JSON Diff compares two JSON documents structurally, not line by line, so differences in key order or formatting do not create noise. Paste the original on the left and the modified version on the right to see which keys were added, removed or changed, including inside nested objects and arrays. It is useful for reviewing API response changes, config drift between environments, and test fixture updates.',
    steps: [
      { title: 'Paste the original JSON', text: 'Put the first version in the left box.' },
      { title: 'Paste the modified JSON', text: 'Put the second version in the right box.' },
      { title: 'Review the differences', text: 'Added, removed and changed paths are highlighted automatically.' },
    ],
    faqs: [
      { question: 'Does key order matter?', answer: 'No. Objects are compared by key, so reordered keys with the same values are treated as equal.' },
      { question: 'Can it compare nested objects and arrays?', answer: 'Yes. The comparison walks the whole structure and reports differences by their path.' },
      { question: 'What if one side is invalid JSON?', answer: 'The tool shows a parse error for that side so you can fix it before comparing.' },
    ],
  },
  'base64-to-image': {
    h1: 'Base64 to Image Converter',
    description: 'Decode a Base64 string or data URI into a viewable, downloadable PNG, JPG, WEBP or SVG image.',
    introParagraph: 'Base64 to Image decodes Base64 text back into the original image. Paste either a full data URI (data:image/png;base64,…) or a raw Base64 string; the tool detects the image type, shows a preview with its dimensions, and lets you download it as a file. It is handy when debugging email templates, inspecting images embedded in CSS or JSON, or recovering an image from an API response.',
    steps: [
      { title: 'Paste the Base64 string', text: 'Paste a data URI or raw Base64 text into the input box.' },
      { title: 'Preview', text: 'The decoded image and its dimensions appear instantly.' },
      { title: 'Download', text: 'Save the image in its original format.' },
    ],
    faqs: [
      { question: 'Do I need the data:image/... prefix?', answer: 'No. Raw Base64 works too; the image type is detected from the decoded bytes.' },
      { question: 'Why does my string not decode?', answer: 'It may be truncated, contain line breaks or spaces from copying, or not be an image. Remove whitespace and make sure the whole string was copied.' },
      { question: 'Is the image uploaded to decode it?', answer: 'No. Decoding uses the browser’s built-in Base64 functions on your device.' },
    ],
  },
  'image-to-base64': {
    h1: 'Image to Base64 Converter',
    description: 'Convert PNG, JPG, WEBP, GIF, SVG or BMP images to Base64 data URIs, HTML img tags or CSS backgrounds.',
    introParagraph: 'Image to Base64 encodes an image file as Base64 text so it can be embedded directly in HTML, CSS, JSON or email templates without a separate file request. After choosing an image you get four ready-to-copy formats: the full data URI, the raw Base64 string, an HTML <img> tag and a CSS background-image declaration, plus a preview with the image’s dimensions and size. Base64 is about 33% larger than the original file, so it is best for small icons and logos.',
    steps: [
      { title: 'Choose an image', text: 'Select a PNG, JPG, WEBP, GIF, SVG or BMP file.' },
      { title: 'Pick the output format', text: 'Copy the data URI, raw Base64, <img> tag or CSS background snippet.' },
      { title: 'Paste it into your code', text: 'Embed the snippet in your HTML, stylesheet or JSON.' },
    ],
    faqs: [
      { question: 'Why is the Base64 text bigger than my image?', answer: 'Base64 represents every 3 bytes with 4 characters, so encoded images are about 33% larger. Use it for small assets only.' },
      { question: 'When should I embed images as Base64?', answer: 'For small icons, email signatures, or single-file HTML where avoiding an extra HTTP request matters. Large photos are better served as normal files.' },
      { question: 'Is my image uploaded?', answer: 'No. The file is read with the FileReader API on your device.' },
    ],
  },
  'url-encode': {
    h1: 'URL Encoder & Decoder',
    description: 'Percent-encode or decode URLs and query parameters, as a component or a full URL.',
    introParagraph: 'The URL Encoder converts special characters such as spaces, &, ?, = and non-English letters into percent-encoded form (%20, %26…) so they can be safely placed in URLs and query strings, and decodes encoded URLs back into readable text. Component mode encodes everything that is not safe inside a single parameter (like encodeURIComponent); Full URL mode keeps the URL’s structure characters such as :, / and ? intact (like encodeURI).',
    steps: [
      { title: 'Choose Encode or Decode', text: 'Select the direction you need.' },
      { title: 'Pick Component or Full URL', text: 'Use Component for a single query value and Full URL for a whole address.' },
      { title: 'Copy the result', text: 'The output updates as you type — copy it into your link or code.' },
    ],
    faqs: [
      { question: 'What is the difference between Component and Full URL?', answer: 'Component encodes reserved characters like / ? & = so a value can sit inside a query string. Full URL leaves them alone so the address still works.' },
      { question: 'Why is a space encoded as %20 and not +?', answer: '%20 is the standard percent-encoding for URLs. The + form is only used in HTML form submissions (application/x-www-form-urlencoded).' },
      { question: 'Why does decoding show an error?', answer: 'The text contains a % sign that is not followed by two hex digits, which is not valid percent-encoding.' },
    ],
  },
  'html-entity-encode': {
    h1: 'HTML Entity Encoder & Decoder',
    description: 'Escape <, >, & and quotes into HTML entities, or unescape entities back to plain characters.',
    introParagraph: 'The HTML Entity Encoder escapes characters that have special meaning in HTML — < > & " \' — into entities like &lt; and &amp;, so code samples and user text display literally instead of being interpreted as markup. Unescape mode does the reverse, turning entity-encoded text back into readable characters. Escaping user-supplied text is also a basic defence against HTML injection in templates.',
    steps: [
      { title: 'Choose Escape or Unescape', text: 'Pick whether to encode characters or decode entities.' },
      { title: 'Paste your text', text: 'Enter HTML, code or text in the input box.' },
      { title: 'Copy the output', text: 'The converted text appears instantly and can be copied.' },
    ],
    faqs: [
      { question: 'Which characters are escaped?', answer: 'The five HTML-significant characters: < > & " and \'. This is enough to display text safely inside HTML content and attributes.' },
      { question: 'Is escaping enough to prevent XSS?', answer: 'It protects text placed inside HTML content and quoted attributes. JavaScript, URL and CSS contexts need their own escaping rules.' },
      { question: 'Can it decode named entities like &nbsp; or &copy;?', answer: 'Yes. Unescape mode uses the browser’s HTML parser, which understands named and numeric entities.' },
    ],
  },
  'sha1-generator': {
    h1: 'SHA-1 Hash Generator',
    description: 'Generate SHA-1 hashes of text or files in hex and Base64 using the browser’s Web Crypto API.',
    introParagraph: 'The SHA-1 Hash Generator computes the 160-bit SHA-1 digest of text or of any file you choose, shown as a 40-character hexadecimal string and in Base64. Hashing uses the browser’s native Web Crypto API, so even large files are hashed quickly without uploading them. SHA-1 is still used for Git object IDs and legacy checksums, but it is no longer collision-resistant, so use SHA-256 for security-sensitive purposes.',
    steps: [
      { title: 'Choose text or file input', text: 'Type text, or switch to File Input to hash a file.' },
      { title: 'Get the hash', text: 'The SHA-1 digest appears instantly in hex and Base64.' },
      { title: 'Copy or compare', text: 'Copy the hash or compare it with a published checksum.' },
    ],
    faqs: [
      { question: 'Is SHA-1 secure?', answer: 'Not for signatures or certificates — practical collision attacks exist. It remains fine for non-security checksums and compatibility with older systems.' },
      { question: 'Why does my hash differ from another tool?', answer: 'Hashes change with any difference in input, including a trailing newline, different line endings or text encoding. This tool hashes UTF-8 text exactly as typed.' },
      { question: 'Are files uploaded to be hashed?', answer: 'No. The file is read and hashed locally with Web Crypto.' },
    ],
  },
  'sha512-generator': {
    h1: 'SHA-512 Hash Generator',
    description: 'Compute SHA-512 hashes of text or files locally in hex and Base64 with the Web Crypto API.',
    introParagraph: 'The SHA-512 Hash Generator produces the 512-bit SHA-2 digest of any text or file, displayed as a 128-character hex string and in Base64. SHA-512 is used for file integrity verification, password-hashing schemes and digital signatures, and is often faster than SHA-256 on 64-bit processors. All hashing runs through the browser’s native Web Crypto API on your device.',
    steps: [
      { title: 'Enter text or pick a file', text: 'Type or paste text, or switch to File Input.' },
      { title: 'Read the digest', text: 'The SHA-512 hash appears in hex and Base64.' },
      { title: 'Copy it', text: 'Copy the value for verification, documentation or code.' },
    ],
    faqs: [
      { question: 'What is the difference between SHA-256 and SHA-512?', answer: 'Both are SHA-2 hashes. SHA-512 produces a longer 512-bit digest and is often faster on 64-bit CPUs; SHA-256 is more widely used in certificates and blockchains.' },
      { question: 'Can SHA-512 be reversed?', answer: 'No. Hash functions are one-way; the only way to find the input is to guess it.' },
      { question: 'Is it safe to hash confidential files here?', answer: 'Yes. Files are hashed on your device and are not transmitted.' },
    ],
  },
  'file-checksum': {
    h1: 'File Checksum Verifier (SHA-256, SHA-1, SHA-512, MD5)',
    description: 'Hash a file or text and compare it against an expected checksum to verify downloads.',
    introParagraph: 'The File Checksum Verifier checks that a downloaded file is intact and has not been tampered with. Choose the file, and the tool computes its SHA-256, SHA-1, SHA-512 and MD5 checksums; paste the checksum published by the software vendor into the verification box to get an instant match or mismatch. Hashing happens entirely in your browser, so large ISO images and installers are never uploaded.',
    steps: [
      { title: 'Select the file', text: 'Switch to File Input and choose the downloaded file (or type text).' },
      { title: 'Paste the expected checksum', text: 'Copy the SHA-256, SHA-1, SHA-512 or MD5 value from the download page.' },
      { title: 'Check the result', text: 'The tool shows whether the computed hash matches.' },
    ],
    faqs: [
      { question: 'Which checksum should I compare?', answer: 'Use whichever the publisher lists — SHA-256 is the most common today. The tool calculates all supported algorithms so you can match any of them.' },
      { question: 'What does a mismatch mean?', answer: 'The file differs from the original: the download may be incomplete or corrupted, or it is not the file the publisher released. Download it again from the official source.' },
      { question: 'Is uppercase vs lowercase important?', answer: 'No. Hex checksums are compared case-insensitively.' },
    ],
  },
  'html-formatter': {
    h1: 'HTML Formatter & Beautifier',
    description: 'Indent and tidy messy or minified HTML with 2-space, 4-space or tab indentation.',
    introParagraph: 'The HTML Formatter re-indents HTML so the nesting of elements is easy to read. Paste minified or messy markup — from a CMS, email builder or browser DevTools — and get consistently indented code with each block element on its own line. Choose 2 spaces, 4 spaces or tabs. Formatting only changes whitespace between tags, so the rendered page looks the same.',
    steps: [
      { title: 'Paste HTML', text: 'Paste the markup or load the sample.' },
      { title: 'Choose indentation', text: 'Select 2 spaces, 4 spaces or tabs.' },
      { title: 'Copy the formatted HTML', text: 'The beautified code appears instantly, ready to copy.' },
    ],
    faqs: [
      { question: 'Will formatting change how my page looks?', answer: 'Normally no. Only whitespace between tags changes; content inside <pre> and <textarea> is left alone.' },
      { question: 'Does it fix invalid HTML?', answer: 'It re-indents what you give it but does not repair missing closing tags. Unbalanced tags will show up as odd indentation.' },
      { question: 'Can it format inline CSS and JavaScript?', answer: 'Yes. Embedded <style> and <script> blocks are indented as well.' },
    ],
  },
  'css-formatter': {
    h1: 'CSS Formatter & Beautifier',
    description: 'Beautify minified CSS into readable, indented rules with one declaration per line.',
    introParagraph: 'The CSS Formatter turns compressed or messy stylesheets into readable CSS: each selector on its own line, one property per line, and consistent indentation using 2 spaces, 4 spaces or tabs. It is useful when inspecting a minified stylesheet from a website, cleaning up generated CSS, or preparing code for review. Only whitespace is changed, so the styles behave exactly the same.',
    steps: [
      { title: 'Paste CSS', text: 'Paste the stylesheet or load the sample.' },
      { title: 'Pick indentation', text: 'Choose 2 spaces, 4 spaces or tabs.' },
      { title: 'Copy', text: 'Copy the formatted CSS into your editor.' },
    ],
    faqs: [
      { question: 'Does it support media queries and nested rules?', answer: 'Yes. @media, @supports and @keyframes blocks are indented correctly.' },
      { question: 'Will it add missing semicolons?', answer: 'No. It formats what is there; a missing semicolon before the closing brace is valid CSS and is left as is.' },
      { question: 'How do I minify it again?', answer: 'Use the CSS Minifier to remove the whitespace for production.' },
    ],
  },
  'css-minifier': {
    h1: 'CSS Minifier – Compress CSS Online',
    description: 'Minify CSS by removing comments, whitespace and line breaks to reduce stylesheet size.',
    introParagraph: 'The CSS Minifier shrinks stylesheets for production by removing comments, indentation, line breaks and unnecessary spaces around braces, colons and semicolons. Smaller CSS downloads faster and blocks rendering for less time, which helps Core Web Vitals. The rules themselves are not changed, so the page renders identically.',
    steps: [
      { title: 'Paste your CSS', text: 'Paste the stylesheet you want to compress.' },
      { title: 'Minify', text: 'The minified CSS appears instantly.' },
      { title: 'Copy to production', text: 'Copy the result into your .min.css file or inline <style> block.' },
    ],
    faqs: [
      { question: 'How much smaller will my CSS be?', answer: 'Usually 15–30% before gzip, depending on how many comments and how much indentation the original has.' },
      { question: 'Is minified CSS safe to use?', answer: 'Yes. Only characters that browsers ignore are removed.' },
      { question: 'Does it remove unused CSS?', answer: 'No. Removing unused selectors requires analysing your HTML; this tool only removes whitespace and comments.' },
    ],
  },
  'js-formatter': {
    h1: 'JavaScript Formatter & Beautifier',
    description: 'Beautify minified or messy JavaScript with consistent indentation, line breaks and spacing.',
    introParagraph: 'The JavaScript Formatter makes minified or poorly formatted code readable again. It adds line breaks after statements, indents blocks consistently with 2 spaces, 4 spaces or tabs, and normalises spacing around operators and braces. It is useful for reading third-party scripts, debugging production bundles, or tidying snippets before sharing. Formatting does not change what the code does.',
    steps: [
      { title: 'Paste JavaScript', text: 'Paste the code or load the sample.' },
      { title: 'Choose indentation', text: 'Pick 2 spaces, 4 spaces or tabs.' },
      { title: 'Copy the result', text: 'The formatted code appears instantly.' },
    ],
    faqs: [
      { question: 'Can it restore original variable names from minified code?', answer: 'No. Minifiers rename variables permanently; formatting restores structure and indentation, not names.' },
      { question: 'Does it support TypeScript and JSX?', answer: 'It formats standard JavaScript syntax; most TypeScript and simple JSX format correctly, but complex type annotations may not.' },
      { question: 'Will my code run differently after formatting?', answer: 'No. Only whitespace and line breaks change.' },
    ],
  },
  'xml-formatter': {
    h1: 'XML Formatter & Pretty Printer',
    description: 'Indent and pretty-print XML documents for readability with configurable indentation.',
    introParagraph: 'The XML Formatter pretty-prints XML so that each element sits on its own line, indented according to its depth. Paste single-line or messy XML — SOAP messages, sitemaps, RSS feeds, Android layouts, config files — and choose 2 spaces, 4 spaces or tabs. Attribute values and text content are kept exactly as they are.',
    steps: [
      { title: 'Paste XML', text: 'Paste the XML document or load the sample.' },
      { title: 'Pick indentation', text: 'Choose 2 spaces, 4 spaces or tabs.' },
      { title: 'Copy', text: 'Copy the formatted XML.' },
    ],
    faqs: [
      { question: 'Does it validate the XML?', answer: 'Malformed XML, such as unclosed tags, produces uneven output. Use XML to JSON for a strict parse that reports errors.' },
      { question: 'Are comments and CDATA kept?', answer: 'Yes. Comments and CDATA sections are preserved and indented with the surrounding elements.' },
      { question: 'Can I format large sitemaps?', answer: 'Yes. Files of several megabytes format in the browser in about a second.' },
    ],
  },
  'random-string': {
    h1: 'Random String Generator',
    description: 'Generate cryptographically secure random strings — alphanumeric, hex, numeric, Base64 or custom characters.',
    introParagraph: 'The Random String Generator creates unpredictable strings for API keys, tokens, invite codes, test data and salts. Choose the length (4 to 256 characters), how many strings to generate, and the character set: alphanumeric, hexadecimal, numeric, Base64 or your own custom characters. Values come from the browser’s crypto.getRandomValues(), a cryptographically secure random source, and never leave your device.',
    steps: [
      { title: 'Choose a character set', text: 'Pick alphanumeric, hex, numeric, Base64 or custom.' },
      { title: 'Set length and count', text: 'Use the sliders to choose string length and how many to create.' },
      { title: 'Copy or download', text: 'Copy one string, copy all, or download them as a .txt file.' },
    ],
    faqs: [
      { question: 'Are these strings secure enough for API keys?', answer: 'Yes. They use the Web Crypto random generator. A 32-character alphanumeric string has about 190 bits of entropy.' },
      { question: 'Are generated strings stored anywhere?', answer: 'No. They exist only in your browser tab until you close or regenerate.' },
      { question: 'Can I avoid confusing characters like 0 and O?', answer: 'Use the Custom character set and list only the characters you want.' },
    ],
  },
  'lorem-ipsum': {
    h1: 'Lorem Ipsum Generator',
    description: 'Generate lorem ipsum placeholder text by paragraphs, sentences or words for designs and mockups.',
    introParagraph: 'The Lorem Ipsum Generator produces classic placeholder text for website mockups, print layouts and UI prototypes. Choose paragraphs, sentences or words, set how many you need, and decide whether the text starts with the traditional "Lorem ipsum dolor sit amet". Copy individual blocks, copy everything, or download it as a text file.',
    steps: [
      { title: 'Choose the unit', text: 'Select paragraphs, sentences or words.' },
      { title: 'Set the amount', text: 'Use the slider to choose how much text to generate.' },
      { title: 'Copy it', text: 'Copy the text into your design or download a .txt file.' },
    ],
    faqs: [
      { question: 'What is lorem ipsum?', answer: 'Scrambled Latin derived from Cicero’s "De finibus bonorum et malorum", used since the 1500s as neutral filler text so layouts can be judged without readable content distracting from the design.' },
      { question: 'Can I start without "Lorem ipsum dolor sit amet"?', answer: 'Yes. Untick the start option to begin with random sentences.' },
      { question: 'Is the text random every time?', answer: 'Yes. Click Regenerate for a new variation.' },
    ],
  },
  'text-diff': {
    h1: 'Text Diff – Compare Two Texts Online',
    description: 'Compare two versions of text or code and highlight differences by line, word or character.',
    introParagraph: 'Text Diff shows exactly what changed between two versions of a document, contract, essay or code snippet. Paste the original and the revised text, then choose line, word or character comparison. Additions and deletions are highlighted so edits are easy to review. The comparison uses a standard diff algorithm and runs in your browser, which makes it safe for confidential documents.',
    steps: [
      { title: 'Paste both versions', text: 'Put the original text on the left and the changed text on the right.' },
      { title: 'Choose diff mode', text: 'Compare by lines for code, by words for prose, or by characters for small edits.' },
      { title: 'Review the changes', text: 'Added text is highlighted in green and removed text in red.' },
    ],
    faqs: [
      { question: 'Which mode should I use?', answer: 'Lines for source code and lists, words for articles and contracts, characters for spotting typos.' },
      { question: 'Does whitespace count as a difference?', answer: 'Yes. Extra spaces and line breaks are reported, which is useful for code but may add noise in prose.' },
      { question: 'Is my text stored?', answer: 'No. Both texts stay in your browser and are cleared when you leave the page.' },
    ],
  },
  'timestamp-converter': {
    h1: 'Unix Timestamp Converter',
    description: 'Convert Unix epoch timestamps to human-readable dates in any time zone, and dates back to timestamps.',
    introParagraph: 'The Unix Timestamp Converter translates epoch time — the number of seconds (or milliseconds) since 1 January 1970 UTC — into readable dates, and back. Enter a timestamp to see it as ISO 8601, UTC and local time in the time zone you choose, or set the current time with one click. Developers use it to read log files, debug API responses and check token expiry times.',
    steps: [
      { title: 'Enter a timestamp or date', text: 'Type an epoch value in seconds or milliseconds, or use Set Current Time.' },
      { title: 'Pick a time zone', text: 'Choose the zone to display the local time in.' },
      { title: 'Copy the format you need', text: 'Copy the ISO, UTC, local or epoch value.' },
    ],
    faqs: [
      { question: 'Seconds or milliseconds?', answer: 'A 10-digit value is seconds and a 13-digit value is milliseconds. JavaScript Date uses milliseconds; most Unix tools and APIs use seconds.' },
      { question: 'What is timestamp 0?', answer: '1 January 1970 at 00:00:00 UTC, the Unix epoch.' },
      { question: 'What is the year 2038 problem?', answer: 'Systems that store timestamps as signed 32-bit integers overflow on 19 January 2038. JavaScript and this tool use 64-bit numbers, so they are not affected.' },
    ],
  },
  'cron-parser': {
    h1: 'Cron Expression Parser – Explain Cron in Plain English',
    description: 'Translate cron expressions into plain English and check schedules like */15 * * * * instantly.',
    introParagraph: 'The Cron Expression Parser explains what a cron schedule means in plain English — for example "*/15 * * * *" becomes "Every 15 minutes". Paste an expression from a crontab, Kubernetes CronJob, GitHub Actions workflow or cloud scheduler to confirm it runs when you expect, or start from presets such as every hour, daily at midnight, weekdays at 9 AM or weekly on Sunday.',
    steps: [
      { title: 'Enter a cron expression', text: 'Type the five fields: minute, hour, day of month, month and day of week.' },
      { title: 'Read the explanation', text: 'The schedule is described in plain English as you type.' },
      { title: 'Use a preset', text: 'Click a preset to start from a common schedule and adjust it.' },
    ],
    faqs: [
      { question: 'What do the five cron fields mean?', answer: 'In order: minute (0–59), hour (0–23), day of month (1–31), month (1–12) and day of week (0–6, Sunday = 0).' },
      { question: 'What does */15 mean?', answer: '"Every 15 units" of that field — in the minute field it runs at :00, :15, :30 and :45.' },
      { question: 'Which time zone does cron use?', answer: 'The server or scheduler’s time zone, usually UTC in cloud services. Check your platform’s settings.' },
    ],
  },
  'number-base-converter': {
    h1: 'Number Base Converter – Binary, Hex, Decimal, Octal',
    description: 'Convert numbers between binary, octal, decimal and hexadecimal instantly.',
    introParagraph: 'The Number Base Converter translates a number between the four bases programmers use most: decimal (base 10), hexadecimal (base 16), binary (base 2) and octal (base 8). Type a value, choose which base it is written in, and see all four representations at once — for example 255 is FF in hex, 11111111 in binary and 377 in octal. Useful for colour codes, bit masks, file permissions and low-level debugging.',
    steps: [
      { title: 'Enter a number', text: 'Type the value you want to convert.' },
      { title: 'Select its base', text: 'Choose Dec, Hex, Bin or Oct to tell the tool how to read the input.' },
      { title: 'Copy the result', text: 'All four bases are shown together.' },
    ],
    faqs: [
      { question: 'Does it handle large numbers?', answer: 'Yes. Values are converted with arbitrary-precision BigInt arithmetic, so large integers keep every digit.' },
      { question: 'Can I enter hex with a 0x prefix?', answer: 'Enter the digits without the prefix and select Hex as the input base.' },
      { question: 'What is octal used for?', answer: 'Mostly Unix file permissions, such as 755 or 644.' },
    ],
  },
  slugify: {
    h1: 'URL Slug Generator',
    description: 'Turn titles and headlines into clean, lowercase, SEO-friendly URL slugs with hyphens or underscores.',
    introParagraph: 'The Slug Generator converts a page title or headline into a URL-safe slug: lowercase, accents removed, punctuation stripped and words joined with hyphens (or underscores). "Hello World! Test" becomes "hello-world-test". Clean slugs make URLs readable for people and search engines, and are required by most CMSs and static-site generators.',
    steps: [
      { title: 'Paste a title', text: 'Type or paste the headline you want to convert.' },
      { title: 'Choose a separator', text: 'Use hyphens (recommended for SEO) or underscores.' },
      { title: 'Copy the slug', text: 'Copy it into your CMS, file name or route.' },
    ],
    faqs: [
      { question: 'Hyphens or underscores?', answer: 'Hyphens. Google treats hyphens as word separators, while underscores can join words together.' },
      { question: 'What happens to accented letters?', answer: 'They are converted to plain ASCII, so "Café" becomes "cafe".' },
      { question: 'How long should a slug be?', answer: 'Short and descriptive — three to five meaningful words is ideal.' },
    ],
  },
  'query-string-parser': {
    h1: 'URL Query String Parser & Builder',
    description: 'Parse URL query parameters into an editable key-value table and rebuild the URL.',
    introParagraph: 'The Query String Parser breaks a URL’s query string into readable key-value pairs, decoding percent-encoded values along the way. Edit values, add or remove parameters, and copy the rebuilt URL with correct encoding. It is handy for debugging tracking links, API requests, UTM parameters and redirect URLs.',
    steps: [
      { title: 'Paste a URL', text: 'Paste a full URL or just the query string.' },
      { title: 'Edit parameters', text: 'Change keys or values, add parameters or delete them.' },
      { title: 'Copy the new URL', text: 'Copy the rebuilt, correctly encoded URL.' },
    ],
    faqs: [
      { question: 'Are encoded values decoded?', answer: 'Yes. Values like %20 are shown as readable text and re-encoded when the URL is rebuilt.' },
      { question: 'What about repeated keys?', answer: 'Each occurrence is listed separately, so parameters such as tag=a&tag=b are preserved.' },
      { question: 'Can I build a URL from scratch?', answer: 'Yes. Clear the input and add parameters one by one.' },
    ],
  },
  'color-converter': {
    h1: 'Color Converter – HEX, RGB, HSL, HSV & CMYK',
    description: 'Convert colours between HEX, RGB, HSL, HSV and CMYK with a live swatch and copy-ready CSS.',
    introParagraph: 'The Color Converter translates a colour between the formats used in web design, apps and print: HEX (#dc2626), RGB (rgb(220, 38, 38)), HSL, HSV and CMYK. Pick a colour with the colour picker or type a HEX value, and every format updates with a live swatch and one-click copy. CMYK values are a mathematical conversion for reference; exact print colours depend on the printer’s colour profile.',
    steps: [
      { title: 'Choose a colour', text: 'Use the picker or type a HEX code.' },
      { title: 'See every format', text: 'HEX, RGB, HSL, HSV and CMYK update instantly.' },
      { title: 'Copy', text: 'Copy the value or CSS you need.' },
    ],
    faqs: [
      { question: 'Why do CMYK values differ from my printer’s?', answer: 'Real CMYK depends on ink and paper profiles. This is the standard device-independent formula, useful as a starting point.' },
      { question: 'When should I use HSL instead of HEX?', answer: 'HSL makes it easy to create lighter, darker or less saturated variations of a colour by changing one number.' },
      { question: 'Does it support transparency?', answer: 'Use 8-digit HEX or rgba() in your CSS for alpha; the converter works with opaque colours.' },
    ],
  },
  'color-palette-extractor': {
    h1: 'Color Palette Extractor – Get Colours from an Image',
    description: 'Extract the dominant colours of any image as HEX codes or CSS variables using k-means clustering.',
    introParagraph: 'The Color Palette Extractor finds the dominant colours in a photo, logo or screenshot. It samples the image’s pixels and groups similar colours with k-means clustering, then shows each colour with its HEX code and the share of the image it covers. Copy individual HEX codes or the whole palette as CSS custom properties to use in a website theme, brand guide or design system. The image is analysed in your browser and never uploaded.',
    steps: [
      { title: 'Upload an image', text: 'Choose a PNG, JPG, WEBP, GIF, BMP or SVG.' },
      { title: 'Review the palette', text: 'Dominant colours appear with HEX codes and percentages.' },
      { title: 'Export', text: 'Copy single HEX values or all colours as CSS variables.' },
    ],
    faqs: [
      { question: 'How are the colours chosen?', answer: 'Pixels are grouped by similarity with k-means clustering; each group’s average colour becomes a palette entry, ordered by how much of the image it covers.' },
      { question: 'Why does the palette change slightly each run?', answer: 'K-means starts from sampled points, so near-identical shades can merge differently. The dominant colours stay the same.' },
      { question: 'Can I use it for brand colours from a logo?', answer: 'Yes. Logos with flat colours give very accurate results.' },
    ],
  },
  'contrast-checker': {
    h1: 'WCAG Color Contrast Checker',
    description: 'Check the contrast ratio between text and background colours against WCAG 2.1 AA and AAA.',
    introParagraph: 'The Contrast Checker calculates the contrast ratio between a text colour and a background colour using the WCAG 2.1 formula and shows whether it passes AA and AAA for normal and large text. For example, white text on #dc2626 red scores about 4.8:1, which passes AA for normal text but not AAA. A live preview shows real text and a button in your colours, and Swap reverses foreground and background.',
    steps: [
      { title: 'Set the text colour', text: 'Pick or type the foreground colour.' },
      { title: 'Set the background colour', text: 'Pick or type the background colour.' },
      { title: 'Read the result', text: 'See the ratio and AA/AAA pass or fail for normal and large text.' },
    ],
    faqs: [
      { question: 'What contrast ratio do I need?', answer: 'WCAG AA requires 4.5:1 for normal text and 3:1 for large text (24 px, or 18.66 px bold). AAA requires 7:1 and 4.5:1.' },
      { question: 'Does contrast affect SEO?', answer: 'Not directly, but accessible, readable pages keep visitors longer and are required by accessibility laws in many countries.' },
      { question: 'Does it support transparent colours?', answer: 'Enter the final visible colour; transparency must be blended with the background first.' },
    ],
  },
  'gradient-generator': {
    h1: 'CSS Gradient Generator',
    description: 'Design linear and radial CSS gradients visually with colour stops and angle control, then copy the CSS.',
    introParagraph: 'The CSS Gradient Generator lets you build a gradient visually and copy the finished CSS. Choose linear or radial, set the angle, and add, recolour, move or delete colour stops while a large preview updates live. The generated background declaration is shown below the preview and can be copied with one click. Gradients made in CSS are resolution-independent and weigh nothing compared with image backgrounds.',
    steps: [
      { title: 'Choose the type', text: 'Select a linear or radial gradient and set the angle.' },
      { title: 'Edit colour stops', text: 'Change colours and positions, or add and remove stops.' },
      { title: 'Copy the CSS', text: 'Copy the background declaration into your stylesheet.' },
    ],
    faqs: [
      { question: 'Do CSS gradients work in all browsers?', answer: 'Yes. linear-gradient() and radial-gradient() are supported by every modern browser without prefixes.' },
      { question: 'How many colour stops can I use?', answer: 'As many as you like; most designs use two to four.' },
      { question: 'Can I use the gradient on text?', answer: 'Yes — apply it as the background and add background-clip: text and color: transparent in your CSS.' },
    ],
  },
  'pdf-ocr': {
    h1: 'PDF OCR – Extract Text from Scanned PDFs',
    description: 'Recognise text in scanned or image-based PDFs with OCR in English, Spanish, French, German, Italian or Portuguese.',
    introParagraph: 'PDF OCR turns scanned documents and image-only PDFs into searchable, copyable text. Each page is rendered in your browser with pdf.js and read by the Tesseract OCR engine, so confidential contracts, invoices and records never leave your device. Choose the document language — English, Spanish, French, German, Italian or Portuguese — process all pages or a custom page range, then view the text page by page or download everything as a .txt file. Clear, high-resolution scans give the best accuracy.',
    steps: [
      { title: 'Upload the PDF', text: 'Choose a scanned or image-based PDF.' },
      { title: 'Choose language and pages', text: 'Select the document language and all pages or a page range.' },
      { title: 'Run OCR and download', text: 'Start recognition, review the text for each page, and download it as .txt.' },
    ],
    faqs: [
      { question: 'How accurate is the OCR?', answer: 'Clean printed text at 300 DPI is usually recognised with over 95% accuracy. Handwriting, low-resolution photos and skewed scans reduce accuracy.' },
      { question: 'Why does the first run take longer?', answer: 'The OCR engine and language data (about 2–3 MB per language) download once and are then cached by your browser.' },
      { question: 'Does it work on PDFs that already contain text?', answer: 'Yes, but for PDFs with a real text layer, copying the text directly or using a PDF-to-text tool is faster and exact.' },
    ],
  },
};
