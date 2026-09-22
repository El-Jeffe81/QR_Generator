declare module "qrcode/lib/browser.js" {
  export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface QRSymbol {
    modules: {
      size: number;
      get(row: number, col: number): number;
    };
    version: number;
  }

  export function create(
    data: string,
    options?: { errorCorrectionLevel?: ErrorCorrectionLevel },
  ): QRSymbol;
}
