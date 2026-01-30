import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const MAX_TEXT_LENGTH = 50000;

    try {
        const { text, align, isBold } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > MAX_TEXT_LENGTH) {
            return NextResponse.json({ error: 'Text is too long (max 50,000 characters)' }, { status: 400 });
        }

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(isBold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman);
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;
        const margin = 50;

        // Basic line handling - in a real app, you'd want a proper wrapper
        const lines = text.split('\n').slice(0, 50); // Limit to first 50 lines for stability

        let currentY = height - margin;

        for (const line of lines) {
            if (currentY < margin) break;

            const textWidth = font.widthOfTextAtSize(line, fontSize);
            let x = margin;

            if (align === 'center') {
                x = (width - textWidth) / 2;
            } else if (align === 'right') {
                x = width - textWidth - margin;
            }

            page.drawText(line, {
                x,
                y: currentY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });

            currentY -= fontSize * 1.5;
        }

        const pdfBytes = await pdfDoc.save();

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="document.pdf"',
            },
        });
    } catch (error) {
        console.error('Error creating PDF:', error);
        return NextResponse.json({ error: 'Failed to create PDF' }, { status: 500 });
    }
}
