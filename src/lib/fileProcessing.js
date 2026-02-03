import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// Note: In Vite, we often need to copy the worker file or point to a CDN
// For simplicity in this dev environment, we'll try CDN first or standard import
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromFile(file) {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return extractTextFromPDF(file);
    } else if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md')) {
        return extractTextFromText(file);
    } else {
        throw new Error('Unsupported file type. Please upload PDF, TXT, or MD files.');
    }
}

async function extractTextFromText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
    }

    return fullText;
}

export function generateFileId() {
    return crypto.randomUUID();
}
