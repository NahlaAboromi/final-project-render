import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a given DOM element as a full A4 PDF.
 * Automatically handles scaling and pagination.
 *
 * @param {HTMLElement} elementRef - The DOM node to capture.
 * @param {string} filename - The name of the output PDF file.
 */
export const exportElementAsPDF = async (elementRef, filename = 'report.pdf') => {
  try {
    // Wait 0.5s to allow any rendering/layout updates to complete before capturing
    await new Promise((resolve) => setTimeout(resolve, 500));

     // canvas holds screenshot of elementRef
    const canvas = await html2canvas(elementRef, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = { width: canvas.width, height: canvas.height };

    // Create a new A4-sized PDF document with millimeter units
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    // Add the first image page at the top of the PDF
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;  // Move image position up to show next part
      pdf.addPage();    // Add a new page to PDF
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight; // Decrease remaining height by one page
    }

    pdf.save(filename);
  } catch (error) {
    console.error('📄 PDF Export Error:', error);
  }
};
