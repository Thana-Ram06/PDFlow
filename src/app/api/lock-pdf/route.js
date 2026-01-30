import { NextResponse } from 'next/server';
import init from 'qpdf-wasm';

export async function POST(req) {
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const password = formData.get('password');

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Valid PDF file is required' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File is too large (max 20MB)' }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const inputData = new Uint8Array(arrayBuffer);

        // Initialize qpdf-wasm
        const qpdf = await init();

        // Write file to virtual FS
        qpdf.FS.writeFile('input.pdf', inputData);

        // Run qpdf to encrypt
        // Command: qpdf input.pdf output.pdf --encrypt user-password owner-password 256 --
        qpdf.callMain([
            'input.pdf',
            'output.pdf',
            '--encrypt',
            password,
            password,
            '256',
            '--'
        ]);

        // Read the result
        const outputData = qpdf.FS.readFile('output.pdf');

        // Clean up virtual FS
        qpdf.FS.unlink('input.pdf');
        qpdf.FS.unlink('output.pdf');

        return new Response(outputData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="protected.pdf"',
            },
        });
    } catch (error) {
        console.error('Error locking PDF:', error);
        return NextResponse.json({ error: 'Failed to process PDF. Make sure it isn\'t already protected.' }, { status: 500 });
    }
}
