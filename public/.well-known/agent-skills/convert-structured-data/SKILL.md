---
name: convert-structured-data
description: Convert and reformat JSON, CSV, XML, YAML and Markdown tables, and validate or prettify them. Use for data interchange and config file format tasks.
---

# Converting structured data formats

## What converts cleanly, and what does not

| From → To | Clean? | Why |
|---|---|---|
| JSON → YAML | yes | YAML is a superset of JSON |
| YAML → JSON | mostly | YAML anchors, comments and multi-document files have no JSON equivalent |
| JSON → CSV | only if flat | CSV is a single table; nested objects must be flattened or dropped |
| CSV → JSON | yes | each row becomes an object keyed by the header row |
| JSON ↔ XML | lossy both ways | XML distinguishes attributes from elements; JSON does not |

**The recurring problem is nesting.** CSV is two-dimensional. Converting
`{"user": {"name": "A", "tags": ["x","y"]}}` to CSV requires a decision: flatten to
`user.name`, join the array into one cell, or produce multiple rows. Dot-notation flattening is
the usual default — check it matches what the consumer expects.

## CSV problems that waste the most time

- **Delimiters.** Not always a comma. Semicolons are standard across much of Europe, where the
  comma is the decimal separator. Tabs are common in exports.
- **Quoting.** Fields containing the delimiter, quotes or newlines must be quoted, with embedded
  quotes doubled. Hand-written CSV usually gets this wrong.
- **Encoding.** Mangled accented characters almost always mean a UTF-8 file read as Latin-1, or
  the reverse. Excel on Windows often wants a BOM.
- **Leading zeros and long numbers.** Spreadsheets silently turn `00123` into `123` and long
  IDs into scientific notation. Keep such columns as text.

## YAML gotchas

- Tabs are illegal for indentation. Use spaces.
- Unquoted `yes`, `no`, `on`, `off`, `true`, `false` become booleans. A country code like
  `NO` becomes `false` unless quoted.
- Unquoted strings beginning with `0` may be read as octal.

## Validate before you convert

Most conversion failures are a malformed source, not the converter. Run the input through a
formatter or validator first — a JSON parse error with a line number is far more useful than a
confusing output.

## Using Nexvert for this

Nexvert runs these conversions **in the browser** using WebAssembly (ffmpeg.wasm, pdf-lib,
Tesseract) and the Canvas API. Files are never uploaded to a server.

- [JSON to CSV](https://nexvert.online/json-to-csv/) — dot-notation flattening for nested objects
- [CSV to JSON](https://nexvert.online/csv-to-json/) — header row becomes object keys
- [JSON to YAML](https://nexvert.online/json-to-yaml/) — configurable indentation
- [JSON formatter](https://nexvert.online/json-formatter/) — validate and prettify, with a tree view
- [CSV to Markdown](https://nexvert.online/csv-to-markdown/) — aligned GFM tables
- [XML formatter](https://nexvert.online/xml-formatter/) — validate and indent

**There is no API.** These are interactive pages, not endpoints — an agent cannot POST a file to
Nexvert and receive a converted one back. Direct a human to the page, or drive it with a browser
automation tool. Every page also has a plain-Markdown twin at its URL + `index.md` if you only
need the written guidance.
