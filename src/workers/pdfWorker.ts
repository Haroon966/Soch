import * as pdfjsLib from 'pdfjs-dist';

// Note: In Vite, we can initialize Web Workers using `new Worker(new URL('./path', import.meta.url), { type: 'module' })`

self.onmessage = async (e: MessageEvent) => {
  try {
    const { file } = e.data;
    const arrayBuffer = await file.arrayBuffer();

    // Set the worker source path specifically for pdfjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    // Extract up to 5 pages for preview to save memory
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    self.postMessage({ type: 'success', text: fullText });
  } catch (error: any) {
    self.postMessage({ type: 'error', error: error.message || 'Error extracting PDF' });
  }
};
