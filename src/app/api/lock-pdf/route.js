import { NextResponse } from 'next/server';
import init from 'qpdf-wasm';
import path from 'path';
import fs from 'fs';

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

        // Find the wasm path - handle different runtime environments
        const wasmPath = path.join(process.cwd(), 'node_modules', 'qpdf-wasm', 'qpdf.wasm');

        let qpdf;
        try {
            if (fs.existsSync(wasmPath)) {
                console.log('Using local WASM binary');
                const wasmBinary = fs.readFileSync(wasmPath);
                qpdf = await init({ wasmBinary });
            } else {
                console.log('Locating WASM engine...');
                qpdf = await init();
            }
        } catch (initError) {
            console.error('qpdf init error:', initError);
            throw new Error('Failed to initialize PDF protection engine. If you are on Vercel, please wait for the next deployment update.');
        }

        // Write file to virtual FS
        qpdf.FS.writeFile('input.pdf', inputData);

        // Run qpdf to encrypt
        try {
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
            if (!qpdf.FS.analyzePath('output.pdf').exists) {
                throw new Error('Encryption failed. This PDF might already be protected or have restricted permissions.');
            }
        }

        // Read the result
        let outputData;
        try {
            outputData = qpdf.FS.readFile('output.pdf');
        } catch (readError) {
            console.error('qpdf read error:', readError);
            throw new Error('Failed to generate output PDF');
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
        return NextResponse.json({
            error: error.message || 'Failed to process PDF',
        }, { status: 500 });
    }
}
