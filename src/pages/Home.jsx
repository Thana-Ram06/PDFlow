"use client";
import React from 'react';
import { FileText, Combine, Scissors } from 'lucide-react';

const Home = ({ onNavigate }) => {
    const mainTools = [
        { title: 'Write PDF', desc: 'Create and edit PDF documents with a simple editor.', Icon: FileText },
        { title: 'Merge PDF', desc: 'Combine multiple PDF files into one easily.', Icon: Combine },
        { title: 'Split PDF', desc: 'Separate pages from your PDF file into individual documents.', Icon: Scissors },
    ];

    return (
        <div className="home-page">
            <header className="home-header">
                <h1 style={{ fontSize: '3.5rem', marginBottom: '16px', fontWeight: '800' }}>PDF tools for everyone.</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '64px', maxWidth: '600px', marginInline: 'auto' }}>
                    Simplified PDF editing, merging, and splitting. <br />Professional results with zero friction.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', width: '100%' }}>
                {mainTools.map((tool) => (
                    <div key={tool.title} className="primary-action-card" style={{ padding: '40px', textAlign: 'left', margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'var(--bg-secondary)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            <tool.Icon size={28} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{tool.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{tool.desc}</p>
                        <button
                            className="btn-primary"
                            style={{ alignSelf: 'flex-start', marginTop: '12px', width: '100%', display: 'flex', justifyContent: 'center' }}
                            onClick={() => onNavigate(tool.title)}
                        >
                            Get Started
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
