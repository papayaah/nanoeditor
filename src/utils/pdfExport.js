import { PDFExporter, pdfDefaultSchemaMappings } from '@blocknote/xl-pdf-exporter';
import * as ReactPDF from '@react-pdf/renderer';

export const exportToPDF = async (editor, filename = 'document') => {
  try {
    // Create the exporter
    const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);
    
    // Convert the blocks to a react-pdf document
    const pdfDocument = await exporter.toReactPDFDocument(editor.document);
    
    // Generate blob for download
    const blob = await ReactPDF.pdf(pdfDocument).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
};
