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
        // Note: qpdf-wasm init might fail in some environments if it can't find the .wasm file
        let qpdf;
        try {
            qpdf = await init();
        } catch (initError) {
            console.error('qpdf init error:', initError);
            throw new Error('Failed to initialize PDF engine');
        }

        // Write file to virtual FS
        qpdf.FS.writeFile('input.pdf', inputData);

        // Run qpdf to encrypt
        try {
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
        } catch (cmdError) {
            console.error('qpdf command error:', cmdError);
            // Even if it throws, it might have finished part of the work, but usually it means failure
            if (!qpdf.FS.analyzePath('output.pdf').exists) {
                throw new Error('Encryption failed. Is the PDF already password protected?');
            }
        }

        // Read the result
        let outputData;
        try {
            outputData = qpdf.FS.readFile('output.pdf');
        } catch (readError) {
            console.error('qpdf read error:', readError);
            throw new Error('Failed to read protected PDF');
        }

        // Clean up virtual FS
        try {
            qpdf.FS.unlink('input.pdf');
            qpdf.FS.unlink('output.pdf');
        } catch (cleanupError) {
            console.warn('qpdf cleanup warning:', cleanupError);
        }

        return new Response(outputData, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="protected.pdf"',
            },
        });
    } catch (error) {
        console.error('Detailed error locking PDF:', error);
        return NextResponse.json({ error: error.message || 'Failed to process PDF' }, { status: 500 });
    }
}
