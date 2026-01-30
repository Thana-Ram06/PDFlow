"use client";
import React, { useState } from 'react';
import { Lock, Upload, Loader2, File } from 'lucide-react';

const Tools = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLock = async () => {
        if (!file || !password) return;
        if (file.size > 20 * 1024 * 1024) {
            setError('File exceeds 20MB limit.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        try {
            const response = await fetch('/api/lock-pdf', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `protected.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to lock PDF');
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
                <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center', fontWeight: 500 }}>
                    Secure and optimize your PDF documents in seconds.
                </p>

                {!file ? (
                    <label style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        width: '100%'
                    }}>
                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                        <Upload size={32} color="var(--text-muted)" />
                        <p style={{ fontWeight: 500 }}>Select file or drag and drop</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PDF files only, up to 100MB</p>
                    </label>
                ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <File size={24} />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                                Set Password:
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', background: '#fff1f1', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #ffdada', width: '100%' }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={handleLock}
                    disabled={loading || !file || !password}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                    {loading ? 'Processing...' : 'Protect PDF'}
                </button>
            </div>
        </div>
    );
};

export default Tools;
