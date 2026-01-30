"use client";
import React, { useState } from 'react';
import { FileText, Plus, Loader2, Bold, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const WritePDF = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [align, setAlign] = useState('left');
    const [bold, setBold] = useState(false);

    const stats = {
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length
    };

    const handleCreate = async () => {
        if (!text) return;
        if (text.length > 50000) {
            setError('Text exceeds 50,000 character limit.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/write-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    align,
                    isBold: bold
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'document.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to generate PDF');
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
                    Create professional PDF documents with live formatting.
                </p>

                <div className="editor-container">
                    <div className="toolbar">
                        <button
                            className={`toolbar-btn ${bold ? 'active' : ''}`}
                            onClick={() => setBold(!bold)}
                        >
                            <Bold size={18} />
                        </button>
                        <div style={{ width: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />
                        <button
                            className={`toolbar-btn ${align === 'left' ? 'active' : ''}`}
                            onClick={() => setAlign('left')}
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            className={`toolbar-btn ${align === 'center' ? 'active' : ''}`}
                            onClick={() => setAlign('center')}
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            className={`toolbar-btn ${align === 'right' ? 'active' : ''}`}
                            onClick={() => setAlign('right')}
                        >
                            <AlignRight size={18} />
                        </button>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing here..."
                        style={{
                            width: '100%',
                            height: '350px',
                            padding: '24px',
                            border: '1px solid var(--border-color)',
                            fontFamily: 'inherit',
                            fontSize: '1.1rem',
                            resize: 'none',
                            outline: 'none',
                            textAlign: align,
                            fontWeight: bold ? 'bold' : 'normal'
                        }}
                    />

                    <div className="editor-stats">
                        <span>{stats.words} Words</span>
                        <span>{stats.chars} Characters</span>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', background: '#fff1f1', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #ffdada' }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={handleCreate}
                    disabled={loading || !text}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    {loading ? 'Generating...' : 'Generate PDF'}
                </button>
            </div>
        </div>
    );
};

export default WritePDF;
