import { useEffect } from 'react';

export const usePdfExport = (editor, isReady, exportPdfRef) => {
  useEffect(() => {
    if (editor && isReady && exportPdfRef) {
      exportPdfRef.current = async (docTitle) => {
        try {
          // Dynamic import to avoid bundling heavy PDF libraries
          const [{ PDFExporter, pdfDefaultSchemaMappings }, ReactPDF] = await Promise.all([
            import('@blocknote/xl-pdf-exporter'),
            import('@react-pdf/renderer')
          ]);

          // Create the PDF exporter
          const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
          
          // Convert the blocks to a react-pdf document
          const pdfDocument = await exporter.toReactPDFDocument(editor.document);
          
          // Use react-pdf to render and download the PDF
          const pdfBlob = await ReactPDF.pdf(pdfDocument).toBlob();
          
          // Create download link with max 3 words in filename
          const shortTitle = docTitle.split(' ').slice(0, 3).join(' ');
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${shortTitle}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('PDF exported successfully');
        } catch (error) {
          console.error('Error exporting to PDF:', error);
          throw error;
        }
      };
    }
  }, [editor, isReady, exportPdfRef]);
};
