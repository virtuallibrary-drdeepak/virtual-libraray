// Meta Pixel (Facebook Pixel) type declarations
declare global {
  interface Window {
    fbq?: (action: string, eventName: string, data?: any, options?: any) => void;
    _fbq?: any;
    __vlMetaPixelLog?: (event: string, details?: unknown, level?: 'debug' | 'info' | 'warn' | 'error') => void;
  }
}

export {};
