declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface MammothOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer | ArrayBuffer;
    path?: string;
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
    convertImage?: any;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: ArrayBuffer } | { path: string },
    options?: MammothOptions
  ): Promise<MammothResult>;

  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: ArrayBuffer } | { path: string }
  ): Promise<MammothResult>;

  const mammoth: {
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
  };

  export default mammoth;
}
