import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const MAX_FILES = 15;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB individual file limit

    try {
        const formData = await req.formData();
        const files = formData.getAll('files');

        if (!files || files.length < 2) {
            return NextResponse.json({ error: 'At least two PDF files are required' }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `Cannot merge more than ${MAX_FILES} files at once` }, { status: 400 });
        }

        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            if (file.type !== 'application/pdf') continue;

            // Safety check for large files
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: `File "${file.name}" exceeds the 10MB limit` }, { status: 400 });
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="merged.pdf"',
            },
        });
    } catch (error) {
        console.error('Error merging PDFs:', error);
        return NextResponse.json({ error: 'Failed to merge PDFs. The file might be corrupted or encrypted.' }, { status: 500 });
    }
}
