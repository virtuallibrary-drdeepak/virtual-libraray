declare module 'pdf2json' {
  class PDFParser {
    constructor();
    on(event: 'pdfParser_dataError', callback: (errData: { parserError: string }) => void): void;
    on(event: 'pdfParser_dataReady', callback: (pdfData: any) => void): void;
    parseBuffer(buffer: Buffer): void;
  }
  
  export = PDFParser;
}

