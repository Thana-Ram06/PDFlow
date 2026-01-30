"use client";
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import WritePDF from '../pages/WritePDF';
import MergePDF from '../pages/MergePDF';
import SplitPDF from '../pages/SplitPDF';
import Tools from '../pages/Tools';

export default function App() {
    const [activeTab, setActiveTab] = useState('Write PDF');
    const [currentPage, setCurrentPage] = useState('Write PDF');

    const handleTabClick = (tab) => {
        setCurrentPage(tab);
        setActiveTab(tab);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setActiveTab(page);
    };

    return (
        <div className="app">
            <Navbar
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onLogoClick={() => handlePageChange('Write PDF')}
            />

            <main className="container main-content">
                {currentPage === 'Write PDF' && <WritePDF />}
                {currentPage === 'Merge PDF' && <MergePDF />}
                {currentPage === 'Split PDF' && <SplitPDF />}
                {currentPage === 'Tools' && <Tools />}
            </main>
        </div>
    );
}
