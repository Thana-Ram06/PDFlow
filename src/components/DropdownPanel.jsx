"use client";
import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

const DropdownPanel = ({ items, onClose, onSelectTool }) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'var(--dropdown-height)', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="dropdown-panel"
        >
            <div className="container dropdown-inner">
                {items.map((item) => {
                    const Icon = LucideIcons[item.icon] || LucideIcons.File;
                    return (
                        <button
                            key={item.id}
                            className="tool-card"
                            onClick={() => {
                                onSelectTool(item);
                                onClose();
                            }}
                        >
                            <Icon className="tool-icon" size={20} />
                            <span className="tool-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default DropdownPanel;
