"use client";
import React, { useState } from 'react';
import { Combine, Upload, Loader2, File } from 'lucide-react';

const MergePDF = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        setError('');
    };

    const handleMerge = async () => {
        if (files.length < 2) return;
        if (files.length > 15) {
            setError('Maximum 15 files allowed for merging.');
            return;
        }

        const largeFile = files.find(f => f.size > 10 * 1024 * 1024);
        if (largeFile) {
            setError(`File "${largeFile.name}" exceeds 10MB limit.`);
            return;
        }

        setLoading(true);
        setError('');
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const response = await fetch('/api/merge-pdf', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'merged.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to merge PDFs');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tool-page">
            <div className="primary-action-card">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '-10px', textAlign: 'center', fontWeight: 500 }}>
                    Combine multiple PDF files into a single document instantly.
                </p>

                <label style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }}>
                    <input type="file" multiple accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                    <Upload size={32} color="var(--text-muted)" />
                    <p style={{ fontWeight: 500 }}>Select files or drag and drop</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PDF files only, up to 50MB each</p>
                </label>

                {files.length > 0 && (
                    <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Selected Files ({files.length}):</p>
                        {files.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                <File size={14} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', background: '#fff1f1', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #ffdada', width: '100%' }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={handleMerge}
                    disabled={loading || files.length < 2}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Combine size={20} />}
                    {loading ? 'Merging...' : 'Merge Files'}
                </button>
            </div>
        </div>
    );
};

export default MergePDF;
