
export interface PdfFileView {
  id: number | null;
  title: string;
  pages: PdfPageView[];
}

export interface PdfPageView {
  index: number;
  height: number;
  width: number;
  data: string;
}