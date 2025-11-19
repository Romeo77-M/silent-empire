import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportAsPDF = async (element: HTMLElement, filename: string) => {
    if (!element) {
        throw new Error("Element to capture is not available.");
    }

    const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#0C0E12',
        useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
};
