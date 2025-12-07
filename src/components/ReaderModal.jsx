import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReaderModal = ({ isOpen, onClose, content }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !content) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.overlay}
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    style={styles.modal}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={styles.header}>
                        <span className="mono">{content.type} // {content.date}</span>
                        <button style={styles.closeBtn} onClick={onClose}>
                            <X size={24} color="var(--color-text)" />
                        </button>
                    </div>

                    <div style={styles.body}>
                        <h1 style={styles.title}>{content.title}</h1>
                        <hr style={styles.divider} />
                        <div style={styles.text}>
                            {/* Priority: Full Text > Body > Excerpt > Description > Text */}
                            <p style={{ whiteSpace: 'pre-wrap' }}>
                                {content.fullText || content.body || content.excerpt || content.description || content.text}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(244, 241, 234, 0.85)', // Matches Architect Background but translucent
        zIndex: 11000, // Above Brand (10000)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
    },
    modal: {
        width: '100%',
        maxWidth: '800px',
        height: '90vh',
        backgroundColor: 'var(--color-bg)', // Unified Sepia
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        padding: '64px',
        position: 'relative',
        border: '1px solid var(--color-border)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
    },
    title: {
        fontSize: '3.5rem', // Big Display Font
        marginBottom: '24px',
        fontFamily: 'var(--font-display)', // Jacquard 12 (or whatever display is set to)
        lineHeight: '1',
    },
    divider: {
        border: 0,
        borderTop: '2px solid var(--color-accent-sage)',
        width: '60px',
        marginBottom: '48px',
    },
    text: {
        fontFamily: 'var(--font-typewriter)', // Special Elite
        fontSize: '1.1rem',
        lineHeight: '1.8',
        color: 'var(--color-text)',
        maxWidth: '65ch',
    },
    simulatedBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginTop: '24px',
    }
};

export default ReaderModal;
