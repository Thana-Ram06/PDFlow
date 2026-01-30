import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const pageIndex = parseInt(formData.get('pageIndex') || '0');

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Valid PDF file is required' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File is too large (max 20MB)' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        const totalPages = pdf.getPageCount();
        if (pageIndex < 0 || pageIndex >= totalPages) {
            return NextResponse.json({ error: `Invalid page index. Total pages: ${totalPages}` }, { status: 400 });
        }

        const splitPdf = await PDFDocument.create();
        const [copiedPage] = await splitPdf.copyPages(pdf, [pageIndex]);
        splitPdf.addPage(copiedPage);

        const pdfBytes = await splitPdf.save();

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="split_page_${pageIndex + 1}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error splitting PDF:', error);
        return NextResponse.json({ error: 'Failed to split PDF. The file might be corrupted or protected.' }, { status: 500 });
    }
}
