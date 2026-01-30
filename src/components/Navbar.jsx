"use client";
import React from 'react';
import { FileCode2 } from 'lucide-react';

const Navbar = ({ activeTab, onTabClick, onLogoClick }) => {
    const navItems = ['Write PDF', 'Merge PDF', 'Split PDF', 'Tools'];

    return (
        <nav className="navbar">
            <div className="container nav-inner">
                <button onClick={onLogoClick} className="logo">
                    <FileCode2 size={24} strokeWidth={2.5} />
                    <span>PDFlow</span>
                </button>

                <div className="nav-links">
                    {navItems.map((item) => (
                        <button
                            key={item}
                            className={`nav-item ${activeTab === item ? 'active' : ''}`}
                            onClick={() => onTabClick(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
